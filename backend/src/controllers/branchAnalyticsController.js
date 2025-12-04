// controllers/staffController.js
import Order from "../models/order.js";
import User from "../models/user.js";
import mongoose from "mongoose";

export const getStaffDashboard = async (req, res) => {
  try {
    // Option A: branch from authenticated user
    //const branchId = req.user?.branchId;
    // Option B: if you used param (uncomment below)
    const branchId = req.params.branchId;

    if (!branchId) return res.status(400).json({ msg: "branchId required" });

     const branchObjectId = new mongoose.Types.ObjectId(branchId);

    // 1) Total earnings (all time) and inProgress count
    const [earningsAgg] = await Order.aggregate([
      { $match: { branchId: branchObjectId } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$total" },
          inProgressCount: {
            $sum: {
              $cond: [
                { $in: ["$status", ["pending", "in-progress", "ready", "preparing"]] }, // statuses to treat as in-progress
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = {
      totalEarnings: earningsAgg?.totalEarnings || 0,
      inProgress: earningsAgg?.inProgressCount || 0
    };

    // 2) Recent orders (latest 10)
    const recentOrdersRaw = await Order.find({ branchId:branchObjectId  })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name')
      .lean();

    const recentOrders = recentOrdersRaw.map(o => ({
      name: o.userId?.name || "Guest",
      items: (o.items || []).reduce((s, it) => s + (it.qty || 1), 0),
      table: o.table || null,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt
    }));

    // 3) Popular dishes - top 6 by qty
    const popularPipeline = [
      { $match: { branchId: branchObjectId} },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.dishId", // or "$items.name" if you don't have dishId
          name: { $first: "$items.name" },
          totalQty: { $sum: "$items.qty" }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, name: 1, orders: "$totalQty" } }
    ];

    const popularDishes = await Order.aggregate(popularPipeline);

    // Final response
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
