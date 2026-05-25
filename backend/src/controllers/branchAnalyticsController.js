// controllers/staffController.js
import Order from "../models/order.js";
import mongoose from "mongoose";

export const getStaffDashboard = async (req, res) => {
  try {
    const branchId = req.params.branchId;

    if (!branchId) {
      return res.status(400).json({ msg: "branchId required" });
    }

    const branchObjectId = new mongoose.Types.ObjectId(branchId);

    // -----------------------------------------
    // 1) TOTAL EARNINGS + IN-PROGRESS COUNT
    // -----------------------------------------
    const [statsAgg] = await Order.aggregate([
      { $match: { branchId: branchObjectId } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$total" },
          inProgressCount: {
            $sum: {
              $cond: [
                { $in: ["$status", ["pending", "preparing"]] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = {
      totalEarnings: statsAgg?.totalEarnings || 0,
      inProgress: statsAgg?.inProgressCount || 0
    };

    // -----------------------------------------
    // 2) RECENT ORDERS (LATEST 10)
    // -----------------------------------------
   // --- inside getStaffDashboard ---
const recentOrdersRaw = await Order.find({
  branchId: branchObjectId,
  // Exclude completed / cancelled orders (case-insensitive approach)
  status: { $nin: ["completed", "cancelled", "Completed", "Cancelled"] }
})
  .sort({ createdAt: -1 })
  .limit(10)
  .populate("userId", "name")
  .lean();


    const recentOrders = recentOrdersRaw.map(o => ({
      _id: o._id,
      name: o.customerName || o.userId?.name || "Guest",
      items: o.items,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      payment: o.payment,
      table: o.table,
      customerName: o.customerName || o.userId?.name || "Guest"
    }));

    // -----------------------------------------
    // 3) POPULAR DISHES (TOP 6 BY QUANTITY)
    // -----------------------------------------
    const popularDishes = await Order.aggregate([
      { $match: { branchId: branchObjectId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.itemId",
          name: { $first: "$items.name" },
          totalQty: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: 6 },
      {
        $project: {
          _id: 0,
          name: 1,
          orders: "$totalQty"
        }
      }
    ]);

    // -----------------------------------------
    // FINAL RESPONSE
    // -----------------------------------------
    res.json({
      stats,
      recentOrders,
      popularDishes
    });

  } catch (err) {
    console.error("getStaffDashboard error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
