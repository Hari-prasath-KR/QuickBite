import Order from "../models/order.js";
import Branch from "../models/branch.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Helper to get a fresh Razorpay instance dynamically
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret"
  });
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
        paid: payment?.paid || false,
      }
    });

    // If paid immediately, let's generate the token number based on the pre-saved order ID
    if (newOrder.payment.paid) {
      newOrder.tokenNumber = `TK-${newOrder._id.toString().slice(-4).toUpperCase()}`;
    }

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

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("userId", "name");

    if (!updatedOrder) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const io = req.app.get("io");
    io.emit("orderUpdated", {
      orderId: updatedOrder._id.toString(),
      status: updatedOrder.status,
      branchId: updatedOrder.branchId.toString()
    });

    res.json({
      msg: "Status updated successfully",
      order: updatedOrder
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
    const { method } = req.body || {};
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.payment.paid = true;
    if (method) {
      order.payment.method = method;
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

