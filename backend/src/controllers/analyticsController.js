import Order from "../models/order.js";
import mongoose from "mongoose";
import Catering from "../models/catering.js";
import Branch from "../models/branch.js";
import User from "../models/user.js";


export const revenueSummary = async(req,res) =>{
  try {
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);

    const todayAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: todayDate }, "payment.paid": true } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" }, orderCount: { $sum: 1 } } }
    ]);

    const yesterdayAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: yesterdayDate, $lt: todayDate }, "payment.paid": true } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" }, orderCount: { $sum: 1 } } }
    ]);

    return res.json({
      today: todayAgg[0] || { totalRevenue: 0, orderCount: 0 },
      yesterday: yesterdayAgg[0] || { totalRevenue: 0, orderCount: 0 }
    });
    //return res.json({totay:todayAgg[0]});
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const revenuePerCatering = async (req,res) =>{
   try {
        const days =parseInt(req.query.days)||30;
        const start= new Date();
        start.setDate(start.getDate()-days);

        const agg = await Order.aggregate([
        { $match: { createdAt: { $gte: start }, "payment.paid": true } },
        { $group: { _id: "$cateringId", revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $lookup: { from: "caterings", localField: "_id", foreignField: "_id", as: "catering" } },
        { $unwind: "$catering" },
        { $project: { cateringId: "$_id", revenue: 1, orders:1, name: "$catering.name", logo: "$catering.logo" } },
        { $sort: { revenue: -1 } }
        ]);

        res.json(agg);
    
   } catch (error) {
       return res.status(500).json({message:"Server Error",error:error.message});
   }
};

export const topDishes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const days = parseInt(req.query.period) || 30;
    const start = new Date(); start.setDate(start.getDate() - days);

    const agg = await Order.aggregate([
      { $match: { createdAt: { $gte: start }, "payment.paid": true } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", count: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { dish: "$_id", count:1, revenue:1 } }
    ]);
    return res.json(agg);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const mostActiveCatering = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 1;
    const start = new Date(); start.setDate(start.getDate() - days);

    const agg = await Order.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: "$cateringId", orders: { $sum: 1 } } },
      { $sort: { orders: -1 } },
      { $limit: 1 },
      { $lookup: { from: "caterings", localField: "_id", foreignField: "_id", as: "catering" } },
      { $unwind: "$catering" },
      { $project: { orders:1, name: "$catering.name", logo: "$catering.logo" } }
    ]);
    return res.json(agg[0] || null);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const getRevenueForPeriod = async (startDate, endDate) => {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
         "payment.paid": true 
      },
    },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  return result.length > 0 ? Number(result[0].total) : 0;
};


const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
};

export const getIncomeSummary = async (req, res) => {
  try {
    const now = new Date();

    // --- Today ---
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // --- Yesterday ---
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // --- This Week (start from Monday) ---
    const dayOfWeek = (now.getDay() + 6) % 7; // makes Monday=0
    const thisWeekStart = new Date(todayStart);
    thisWeekStart.setDate(thisWeekStart.getDate() - dayOfWeek);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1); // one ms before this week start

    // --- This Month ---
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setMilliseconds(-1);

    const [
      todayRevenue, yesterdayRevenue, thisWeekRevenue,
      lastWeekRevenue, thisMonthRevenue, lastMonthRevenue,
    ] = await Promise.all([
      getRevenueForPeriod(todayStart, todayEnd),
      getRevenueForPeriod(yesterdayStart, yesterdayEnd),
      getRevenueForPeriod(thisWeekStart, todayEnd),
      getRevenueForPeriod(lastWeekStart, lastWeekEnd),
      getRevenueForPeriod(thisMonthStart, todayEnd),
      getRevenueForPeriod(lastMonthStart, lastMonthEnd),
    ]);

    res.json({
      today: {
        amount: todayRevenue,
        percentageChange: calculatePercentageChange(todayRevenue, yesterdayRevenue),
      },
      weekly: {
        amount: thisWeekRevenue,
        percentageChange: calculatePercentageChange(thisWeekRevenue, lastWeekRevenue),
      },
      monthly: {
        amount: thisMonthRevenue,
        percentageChange: calculatePercentageChange(thisMonthRevenue, lastMonthRevenue),
      },
    });
  } catch (err) {
    console.error("Error in income summary:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


// Get analytics for a particular catering
export const getCateringAnalytics = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid catering ID" });
  }

  try {
    // Fetch catering info
      const catering = await Catering.findById(id)
      .populate("admin", "name email") // populate admin details
      .lean();

    if (!catering) return res.status(404).json({ message: "Catering not found" });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - 7);
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(todayStart);
    monthStart.setMonth(todayStart.getMonth() - 1);
    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(monthStart.getMonth() - 1);

    const calcPercentage = (current, previous) =>
      previous ? ((current - previous) / previous * 100).toFixed(2) : 0;

    // Revenue aggregations
    const revenueToday = await Order.aggregate([
      { $match: { cateringId: new mongoose.Types.ObjectId(id), createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const revenueYesterday = await Order.aggregate([
      { $match: { cateringId:new  mongoose.Types.ObjectId(id), createdAt: { $gte: yesterdayStart, $lt: todayStart } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const revenueWeek = await Order.aggregate([
      { $match: { cateringId:new mongoose.Types.ObjectId(id), createdAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const revenueLastWeek = await Order.aggregate([
      { $match: { cateringId:new mongoose.Types.ObjectId(id), createdAt: { $gte: lastWeekStart, $lt: weekStart } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const revenueMonth = await Order.aggregate([
      { $match: { cateringId:new mongoose.Types.ObjectId(id), createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const revenueLastMonth = await Order.aggregate([
      { $match: { cateringId:new mongoose.Types.ObjectId(id), createdAt: { $gte: lastMonthStart, $lt: monthStart } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const revenue = {
      today: {
        amount: revenueToday[0]?.total || 0,
        percentageChange: calcPercentage(revenueToday[0]?.total || 0, revenueYesterday[0]?.total || 0)
      },
      weekly: {
        amount: revenueWeek[0]?.total || 0,
        percentageChange: calcPercentage(revenueWeek[0]?.total || 0, revenueLastWeek[0]?.total || 0)
      },
      monthly: {
        amount: revenueMonth[0]?.total || 0,
        percentageChange: calcPercentage(revenueMonth[0]?.total || 0, revenueLastMonth[0]?.total || 0)
      }
    };

    // Top 5 dishes
    const topDishes = await Order.aggregate([
      { $match: { cateringId:new mongoose.Types.ObjectId(id) } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", count: { $sum: "$items.quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { dish: "$_id", count: 1, _id: 0 } }
    ]);

    // Branches & revenue
    const branches = await Branch.find({ cateringId: id }).lean();
    const branchesWithRevenue = await Promise.all(
      branches.map(async (branch) => {
        const branchRevenueAgg = await Order.aggregate([
          { $match: { cateringId:new mongoose.Types.ObjectId(id), branchId: branch._id } },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        return {
          ...branch,
          revenue: branchRevenueAgg[0]?.total || 0
        };
      })
    );

    // Prepare Pie chart data (top 6 + Other)
    const sortedBranches = branchesWithRevenue.sort((a, b) => b.revenue - a.revenue);
    const topBranches = sortedBranches.slice(0, 4);
    const otherRevenue = sortedBranches.slice(4).reduce((sum, b) => sum + b.revenue, 0);
    const branchesPie = otherRevenue > 0 ? [...topBranches, { name: "Other", revenue: otherRevenue }] : topBranches;

    // Send response
    res.json({
      catering,
      analytics: {
        revenue,
        topDishes,
        branches: branchesWithRevenue,
        branchesPie
      }
    });

  } catch (err) {
    console.error("Error fetching catering analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
};
