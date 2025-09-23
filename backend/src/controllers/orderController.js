import Order from "../models/order.js";

// ➕ Add a new order
export const addOrder = async (req, res) => {
  try {
    const { userId, cateringId, branchId, items, total, status, payment } = req.body;
    if (!userId || !cateringId || !items || items.length === 0 || !total) {
      return res.status(400).json({ message: "userId, cateringId, items[], and total are required" });
    }
    const newOrder = new Order({
      userId,
      cateringId,
      branchId: branchId || null,
      items,
      total,
      status: status || "pending",
      payment: {
        method: "Online", // force online
        razorpayOrderId: payment?.razorpayOrderId || null,
        razorpayPaymentId: payment?.razorpayPaymentId || null,
        paid: payment?.paid || false,
      }
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
