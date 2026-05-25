import Order from "../models/order.js";
import Branch from "../models/branch.js";
import User from "../models/user.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Helper to get a fresh Razorpay instance dynamically
import { BranchMenuItem } from "../models/menuItem.js";

// Helper to get a fresh Razorpay instance dynamically
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret"
  });
};

// Helper to validate and deduct menu item stock for a branch
const validateAndDeductStock = async (branchId, items) => {
  if (!branchId || !items || items.length === 0) return { success: true };

  // 1) Validate stock for all items
  const assignments = [];
  for (const item of items) {
    const branchItem = await BranchMenuItem.findOne({
      branchId,
      menuItemId: item.itemId
    });

    if (!branchItem || !branchItem.isAvailable) {
      return {
        success: false,
        message: `"${item.name}" is currently not available.`
      };
    }

    if (branchItem.quantity < item.quantity) {
      return {
        success: false,
        message: `Only ${branchItem.quantity} of "${item.name}" is available.`
      };
    }
    assignments.push({ branchItem, quantityOrdered: item.quantity });
  }

  // 2) Deduct stock and save
  for (const { branchItem, quantityOrdered } of assignments) {
    branchItem.quantity = Math.max(0, branchItem.quantity - quantityOrdered);
    if (branchItem.quantity === 0) {
      branchItem.isAvailable = false; // Mark stock out if quantity becomes 0
    }
    await branchItem.save();
  }

  return { success: true };
};


// ➕ Add a new order (simple direct method)
export const addOrder = async (req, res) => {
  try {
    const { userId, cateringId, branchId, items, total, status, payment, table, customerName } = req.body;
    if (!cateringId || !items || items.length === 0 || !total) {
      return res.status(400).json({ message: "cateringId, items[], and total are required" });
    }

    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (branch && branch.status === "Inactive") {
        return res.status(400).json({ message: "This branch is currently offline or under maintenance break and is not accepting online orders." });
      }
    }

    // Verify and deduct stock for each item in the order
    if (branchId) {
      const stockResult = await validateAndDeductStock(branchId, items);
      if (!stockResult.success) {
        return res.status(400).json({ message: stockResult.message });
      }
    }
    
    // Handle secure wallet checkout deduction
    let finalPaymentPaid = payment?.paid || false;
    if (payment?.method === "Wallet") {
      if (!userId) {
        return res.status(400).json({ message: "User ID is required for wallet payments." });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      const grandTotal = total * 1.05; // grand total includes 5% GST
      if ((user.walletBalance || 0) < grandTotal) {
        return res.status(400).json({ message: "Insufficient wallet balance." });
      }
      // Deduct balance securely
      user.walletBalance = Number((user.walletBalance - grandTotal).toFixed(2));
      await user.save();
      finalPaymentPaid = true;
    }

    // We create the order first to get its _id, so we can generate a valid, unique token number
    const newOrder = new Order({
      userId: userId || null,
      cateringId,
      branchId: branchId || null,
      items,
      total,
      status: status || "pending",
      table: table || "",
      customerName: customerName || "",
      payment: {
        method: payment?.method || "Online",
        razorpayOrderId: payment?.razorpayOrderId || null,
        razorpayPaymentId: payment?.razorpayPaymentId || null,
        paid: finalPaymentPaid,
      }
    });

    // Always generate the token number based on the order ID to support unpaid Cash/PayLater slips
    newOrder.tokenNumber = `TK-${newOrder._id.toString().slice(-4).toUpperCase()}`;

    const savedOrder = await newOrder.save();
    
    // Populate details just in case
    const populated = await Order.findById(savedOrder._id)
      .populate("userId", "name email")
      .populate("items.itemId", "name price");

    // Emit event via socket.io for real-time dashboard updates!
    const io = req.app.get("io");
    if (io) {
      io.emit("orderCreated", {
        orderId: savedOrder._id.toString(),
        branchId: savedOrder.branchId?.toString()
      });
    }

    res.status(201).json(populated || savedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 💳 Create a Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body; // in Paise (e.g. 500.00 Rs = 50000 paise)
  if (!amount) {
    return res.status(400).json({ message: "Amount is required" });
  }

  try {
    // If key is a placeholder or not present, skip trying to connect to prevent slow response
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId || keyId === "rzp_test_placeholder_key") {
      throw new Error("Placeholder keys configured. Falling back to Mock Mode.");
    }

    const options = {
      amount: Math.round(amount),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);
    res.status(201).json({ ...order, key_id: process.env.RAZORPAY_KEY_ID, isMock: false });
  } catch (error) {
    console.warn("⚠️ Razorpay API failure or placeholder key used, falling back to Sandbox Mock Mode:", error.message || error);
    const mockOrder = {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(amount),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
      isMock: true
    };
    res.status(201).json(mockOrder);
  }
};

// 🔒 Verify Razorpay Payment and Save Order
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      userId,
      cateringId,
      branchId,
      items,
      total,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!userId || !cateringId || !items || items.length === 0 || !total) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (branch && branch.status === "Inactive") {
        return res.status(400).json({ message: "This branch is currently offline or under maintenance break and is not accepting online orders." });
      }
    }

    // Verify and deduct stock for each item in the order
    if (branchId) {
      const stockResult = await validateAndDeductStock(branchId, items);
      if (!stockResult.success) {
        return res.status(400).json({ message: stockResult.message });
      }
    }

    const isMock = razorpay_order_id && (razorpay_order_id.startsWith("order_mock_") || razorpay_signature === "mock_signature_approved");
    let isVerified = false;

    if (isMock) {
      isVerified = true;
      console.log(`✅ Sandbox Mock payment approved for order ${razorpay_order_id}`);
    } else {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const shasum = crypto.createHmac("sha256", keySecret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest("hex");
      isVerified = digest === razorpay_signature;
    }

    if (!isVerified) {
      return res.status(400).json({ message: "Transaction signature verification failed" });
    }

    const newOrder = new Order({
      userId,
      cateringId,
      branchId: branchId || null,
      items,
      total,
      status: "pending",
      payment: {
        method: "Online",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paid: true,
      }
    });

    newOrder.tokenNumber = `TK-${newOrder._id.toString().slice(-4).toUpperCase()}`;

    const savedOrder = await newOrder.save();

    // Fetch details to return complete receipt info
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("cateringId", "name logo")
      .populate("branchId", "name location")
      .populate("items.itemId", "name price");

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("🔥 Razorpay Verification Error:", error);
    res.status(500).json({ message: "Payment Verification Failed", error: error.message });
  }
};

// 📦 Bulk insert orders
export const addOrdersBulk = async (req, res) => {
  try {
    const orders = req.body;
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ message: "An array of orders is required" });
    }

    const formattedOrders = orders.map(o => ({
      ...o,
      payment: {
        method: "Online",
        razorpayOrderId: o.payment?.razorpayOrderId || null,
        razorpayPaymentId: o.payment?.razorpayPaymentId || null,
        paid: o.payment?.paid || false,
      }
    }));

    const savedOrders = await Order.insertMany(formattedOrders);
    res.status(201).json(savedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📜 Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("cateringId", "name")
      .populate("branchId", "name location")
      .populate("items.itemId", "name price");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📜 Get current customer's orders
export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("cateringId", "name logo")
      .populate("branchId", "name location")
      .populate("items.itemId", "name price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const oldStatus = order.status;
    const isCancelled = String(status).toLowerCase() === "cancelled" || String(status).toLowerCase() === "canceled";
    const wasAlreadyCancelled = String(oldStatus).toLowerCase() === "cancelled" || String(oldStatus).toLowerCase() === "canceled";

    order.status = status;

    // Refund 150% to user wallet if the order is cancelled, paid, and was not already cancelled
    if (isCancelled && !wasAlreadyCancelled && order.payment?.paid && order.userId) {
      const refundAmount = Number((order.total * 1.05 * 1.50).toFixed(2));
      const user = await User.findById(order.userId);
      if (user) {
        user.walletBalance = Number(((user.walletBalance || 0) + refundAmount).toFixed(2));
        await user.save();
        console.log(`[Wallet Refund] Credited 150% refund (${refundAmount}) to user ${user._id} for cancelled order ${order._id}`);
      }
    }

    const savedOrder = await order.save();
    const populated = await Order.findById(savedOrder._id).populate("userId", "name");

    const io = req.app.get("io");
    if (io) {
      io.emit("orderUpdated", {
        orderId: savedOrder._id.toString(),
        status: savedOrder.status,
        branchId: savedOrder.branchId?.toString()
      });
    }

    res.json({
      msg: "Status updated successfully",
      order: populated || savedOrder
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getBranchOrdersToday = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { date } = req.query;

    let start, end;
    if (date) {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    const orders = await Order.find({
      branchId,
      createdAt: { $gte: start, $lte: end }
    })
      .populate("userId", "name email")
      .populate("items.itemId", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("getBranchOrdersToday error:", error);
    res.status(500).json({ message: "Failed to fetch today's orders", error: error.message });
  }
};

// 💳 Mark Cash Payment as Successful and Generate Token
export const markPaymentSuccess = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { method, razorpayOrderId, razorpayPaymentId } = req.body || {};
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.payment.paid = true;
    if (method) {
      order.payment.method = method;
    }
    if (razorpayOrderId) {
      order.payment.razorpayOrderId = razorpayOrderId;
    }
    if (razorpayPaymentId) {
      order.payment.razorpayPaymentId = razorpayPaymentId;
    }
    order.tokenNumber = `TK-${order._id.toString().slice(-4).toUpperCase()}`;
    const saved = await order.save();

    const populated = await Order.findById(saved._id)
      .populate("userId", "name email")
      .populate("items.itemId", "name price");

    const io = req.app.get("io");
    if (io) {
      io.emit("orderUpdated", {
        orderId: saved._id.toString(),
        status: saved.status,
        branchId: saved.branchId?.toString(),
        paymentPaid: true,
        tokenNumber: saved.tokenNumber,
        paymentMethod: saved.payment?.method
      });
    }

    res.json(populated || saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

