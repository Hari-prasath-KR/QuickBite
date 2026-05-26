import React, { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Users,
  MapPin,
  Clock,
  Printer,
  Search,
  Building,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Package,
  TrendingDown,
  Info,
  Calendar
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import toast from "react-hot-toast";

// Navbar component for header
function AnalyticsNavbar({ onPrint }) {
  return (
    <div className="navbar bg-gradient-to-br from-green-500 via-green-400 to-yellow-200 shadow-lg overflow-visible">
      <div className="flex-1">
        <span className="btn btn-ghost text-2xl text-white select-none hover:bg-transparent font-black tracking-tight">
          Catering Analytics Portal
        </span>
      </div>
      <div className="flex-none">
        <button
          onClick={onPrint}
          className="btn btn-sm bg-white/20 hover:bg-white/35 text-white border-none rounded-xl flex items-center gap-2 font-bold transition-all shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Export Report
        </button>
      </div>
    </div>
  );
}

function ManageAnalysis() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [timeFilter, setTimeFilter] = useState("30days"); // today, 7days, 30days, 90days, all, custom-date
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]); // YYYY-MM-DD
  const [branchFilter, setBranchFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch orders and inventory in parallel
      const [ordersRes, inventoryRes] = await Promise.all([
        api.get("/catering-admin/orders"),
        api.get("/catering-admin/inventory")
      ]);

      setOrders(ordersRes.data);
      setInventory(inventoryRes.data);
    } catch (err) {
      console.error("Failed to fetch analytics details:", err);
      setError("Unable to load analytics details. Please verify connections and try again.");
      toast.error("Failed to load catering analytics.");
    } finally {
      setLoading(false);
    }
  };

  // Get unique branches directly from orders population for filtering
  const branchesList = useMemo(() => {
    const unique = [];
    const map = new Map();
    orders.forEach(o => {
      if (o.branchId && !map.has(o.branchId._id)) {
        map.set(o.branchId._id, true);
        unique.push(o.branchId);
      }
    });
    return unique;
  }, [orders]);

  // Apply time filters
  const timeFilteredOrders = useMemo(() => {
    if (!orders) return [];
    const now = new Date();
    const cutoffDate = new Date();

    if (timeFilter === "today") {
      const todayStr = now.toDateString();
      return orders.filter(order => new Date(order.createdAt).toDateString() === todayStr);
    } else if (timeFilter === "custom-date") {
      if (!customDate) return [];
      const targetStr = new Date(customDate).toDateString();
      return orders.filter(order => new Date(order.createdAt).toDateString() === targetStr);
    } else if (timeFilter === "7days") {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeFilter === "30days") {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (timeFilter === "90days") {
      cutoffDate.setDate(now.getDate() - 90);
    } else {
      return orders; // All time
    }

    return orders.filter(order => new Date(order.createdAt) >= cutoffDate);
  }, [orders, timeFilter, customDate]);

  // Apply branch filter to orders
  const finalFilteredOrders = useMemo(() => {
    let result = timeFilteredOrders;
    if (branchFilter !== "all") {
      result = result.filter(order => order.branchId && order.branchId._id === branchFilter);
    }
    return result;
  }, [timeFilteredOrders, branchFilter]);

  // Apply search query to list of orders
  const searchedOrders = useMemo(() => {
    if (!searchQuery.trim()) return finalFilteredOrders;
    const query = searchQuery.toLowerCase().trim();
    return finalFilteredOrders.filter(o => {
      const orderToken = o.tokenNumber ? o.tokenNumber.toLowerCase() : "";
      const customerName = o.customerName ? o.customerName.toLowerCase() : "";
      const userName = o.userId && o.userId.name ? o.userId.name.toLowerCase() : "";
      const userEmail = o.userId && o.userId.email ? o.userId.email.toLowerCase() : "";
      const branchName = o.branchId && o.branchId.name ? o.branchId.name.toLowerCase() : "";
      const paymentMethod = o.payment && o.payment.method ? o.payment.method.toLowerCase() : "";

      return (
        orderToken.includes(query) ||
        customerName.includes(query) ||
        userName.includes(query) ||
        userEmail.includes(query) ||
        branchName.includes(query) ||
        paymentMethod.includes(query)
      );
    });
  }, [finalFilteredOrders, searchQuery]);

  // Apply branch filter to inventory
  const filteredInventory = useMemo(() => {
    if (branchFilter === "all") return inventory;
    return inventory.filter(item => item.branchId && item.branchId._id === branchFilter);
  }, [inventory, branchFilter]);

  // 1) KPI Calculations
  const kpis = useMemo(() => {
    // Total Revenue from completed or preparing orders (excluding cancelled)
    const validOrders = finalFilteredOrders.filter(o => o.status !== "cancelled" && o.status !== "cancelled");
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = finalFilteredOrders.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    const cancelledCount = finalFilteredOrders.filter(
      o => o.status.toLowerCase() === "cancelled" || o.status.toLowerCase() === "canceled"
    ).length;
    const cancellationRate = totalOrdersCount > 0 ? (cancelledCount / totalOrdersCount) * 100 : 0;

    return {
      revenue: totalRevenue,
      ordersCount: totalOrdersCount,
      aov: averageOrderValue,
      cancelledCount,
      cancellationRate
    };
  }, [finalFilteredOrders]);

  // 2) Day-by-Day or Hour-by-Hour Sales Trend (Morphed Chart)
  const salesTrendData = useMemo(() => {
    const groups = {};
    const now = new Date();

    // Peak Load hourly analysis for Today or Select Date
    if (timeFilter === "today" || timeFilter === "custom-date") {
      const intervals = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
      intervals.forEach(slot => {
        groups[slot] = { date: slot, revenue: 0, orders: 0 };
      });

      finalFilteredOrders.forEach(o => {
        const hr = new Date(o.createdAt).getHours();
        let matchedSlot = "08:00";
        if (hr >= 22) matchedSlot = "22:00";
        else if (hr >= 20) matchedSlot = "20:00";
        else if (hr >= 18) matchedSlot = "18:00";
        else if (hr >= 16) matchedSlot = "16:00";
        else if (hr >= 14) matchedSlot = "14:00";
        else if (hr >= 12) matchedSlot = "12:00";
        else if (hr >= 10) matchedSlot = "10:00";
        else matchedSlot = "08:00";

        if (o.status !== "cancelled") {
          groups[matchedSlot].revenue += o.total;
        }
        groups[matchedSlot].orders += 1;
      });

      return Object.values(groups);
    }

    // Standard daily aggregation for date ranges (7/30/90 days / All time)
    let daysLimit = 30;
    if (timeFilter === "7days") daysLimit = 7;
    else if (timeFilter === "90days") daysLimit = 90;
    else if (timeFilter === "all") daysLimit = 30; // fallback default range

    if (timeFilter !== "all") {
      for (let i = daysLimit - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        groups[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      }
    }

    finalFilteredOrders.forEach(o => {
      const d = new Date(o.createdAt);
      const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      
      if (groups[dateStr]) {
        if (o.status !== "cancelled") {
          groups[dateStr].revenue += o.total;
        }
        groups[dateStr].orders += 1;
      } else if (timeFilter === "all") {
        if (!groups[dateStr]) {
          groups[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
        }
        if (o.status !== "cancelled") {
          groups[dateStr].revenue += o.total;
        }
        groups[dateStr].orders += 1;
      }
    });

    return Object.values(groups);
  }, [finalFilteredOrders, timeFilter]);

  // 3) Branch Comparisons (Bar Chart)
  const branchComparisonData = useMemo(() => {
    const stats = {};
    timeFilteredOrders.forEach(o => {
      if (!o.branchId) return;
      const bId = o.branchId._id;
      const bName = o.branchId.name;

      if (!stats[bId]) {
        stats[bId] = { name: bName, revenue: 0, orders: 0 };
      }
      if (o.status !== "cancelled") {
        stats[bId].revenue += o.total;
      }
      stats[bId].orders += 1;
    });

    return Object.values(stats);
  }, [timeFilteredOrders]);

  // 4) Order status distribution donut chart
  const statusDistributionData = useMemo(() => {
    const counts = { completed: 0, preparing: 0, pending: 0, cancelled: 0 };
    
    finalFilteredOrders.forEach(o => {
      const status = o.status ? o.status.toLowerCase() : "pending";
      if (status === "completed") counts.completed++;
      else if (status === "preparing") counts.preparing++;
      else if (status === "pending") counts.pending++;
      else if (status === "cancelled" || status === "canceled") counts.cancelled++;
    });

    return [
      { name: "Completed", value: counts.completed, color: "#10B981" },
      { name: "Preparing", value: counts.preparing, color: "#F59E0B" },
      { name: "Pending", value: counts.pending, color: "#3B82F6" },
      { name: "Cancelled", value: counts.cancelled, color: "#EF4444" }
    ].filter(item => item.value > 0);
  }, [finalFilteredOrders]);

  // 5) Low and Out of Stock Trackers
  const outOfStockItems = useMemo(() => {
    return filteredInventory.filter(item => item.quantity === 0);
  }, [filteredInventory]);

  const lowStockItems = useMemo(() => {
    return filteredInventory.filter(item => item.quantity > 0 && item.quantity < 10);
  }, [filteredInventory]);

  // Printing Report summary handler
  const handlePrint = () => {
    window.print();
  };

  const timeFilterLabel = useMemo(() => {
    if (timeFilter === "today") return "Today's Summary";
    if (timeFilter === "custom-date") return `Date: ${new Date(customDate).toLocaleDateString("en-IN")}`;
    if (timeFilter === "7days") return "Last 7 Days";
    if (timeFilter === "30days") return "Last 30 Days";
    if (timeFilter === "90days") return "Last 90 Days";
    return "All Time Summary";
  }, [timeFilter, customDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="font-extrabold text-slate-800 text-lg">Gathering catering intelligence details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex items-center justify-center p-8">
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-10 max-w-md w-full shadow-2xl text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Operation Failure</h2>
          <p className="text-slate-700 font-medium mb-6">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-md"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col print:bg-white print:from-white print:to-white">
      {/* Header Navbar */}
      <div className="fixed top-0 left-64 right-0 z-40 print:hidden">
        <AnalyticsNavbar onPrint={handlePrint} />
      </div>

      {/* Main Container */}
      <div className="pt-20 p-8 space-y-8 flex-1 print:pt-0 print:p-0">
        <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 transition-all duration-500 print:bg-white print:border-none print:shadow-none print:p-0">
          
          {/* Dashboard Header Control Center */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-slate-200/50 pb-6 print:hidden">
            <div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                Catering Intelligence Portal
              </h2>
              <p className="text-slate-700 text-sm font-semibold mt-1">
                Deep analytics, trends, operational performance counters, and inventory health metrics.
              </p>
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Branch Filter dropdown */}
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-sm">
                <Building className="w-4 h-4 text-emerald-600" />
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Branches</option>
                  {branchesList.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Timeframe selector */}
              <div className="flex flex-wrap items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-slate-200/80 p-1 rounded-xl shadow-sm">
                {[
                  { id: "today", label: "Today" },
                  { id: "7days", label: "7 Days" },
                  { id: "30days", label: "30 Days" },
                  { id: "90days", label: "90 Days" },
                  { id: "all", label: "All Time" },
                  { id: "custom-date", label: "Select Date" }
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeFilter(tf.id)}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                      timeFilter === tf.id
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-slate-700 hover:bg-emerald-500/10 hover:text-emerald-700"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Picker (shows when Select Date is clicked) */}
              {timeFilter === "custom-date" && (
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-sm">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none focus:ring-0 select-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* PRINT-ONLY HEADER */}
          <div className="hidden print:block mb-8">
            <h1 className="text-3xl font-bold text-black text-center uppercase tracking-wider">Catering Operations Report Summary</h1>
            <p className="text-center text-gray-500 text-sm mt-1">Generated on: {new Date().toLocaleDateString("en-IN")} | Filter: {timeFilterLabel}</p>
            <div className="border-b-2 border-black mt-4"></div>
          </div>

          {/* 1) Metrics Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Total Revenue */}
            <div className="bg-white/70 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm hover:scale-[1.01] transition-all flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Sales Revenue</p>
                <h3 className="text-2xl font-black text-slate-900">₹{kpis.revenue.toLocaleString("en-IN")}</h3>
                <p className="text-[10px] text-slate-500 font-semibold inline-flex items-center gap-1">
                  <Info className="w-3 h-3 text-emerald-500" /> Completed & active orders
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white/70 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm hover:scale-[1.01] transition-all flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Orders Volume</p>
                <h3 className="text-2xl font-black text-slate-900">{kpis.ordersCount.toLocaleString()}</h3>
                <p className="text-[10px] text-slate-500 font-semibold">Incoming customer traffic</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                <ShoppingBag className="w-8 h-8" />
              </div>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="bg-white/70 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm hover:scale-[1.01] transition-all flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Order Value</p>
                <h3 className="text-2xl font-black text-slate-900">₹{Math.round(kpis.aov).toLocaleString("en-IN")}</h3>
                <p className="text-[10px] text-slate-500 font-semibold">Average spend per checkout</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>

            {/* Cancellation Rate */}
            <div className={`bg-white/70 backdrop-blur-md border p-6 rounded-2xl shadow-sm hover:scale-[1.01] transition-all flex items-center justify-between ${
              kpis.cancellationRate > 10 ? "border-rose-400 bg-rose-50/20" : "border-white/60"
            }`}>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Order Cancellation Rate</p>
                <h3 className={`text-2xl font-black ${kpis.cancellationRate > 10 ? "text-rose-600" : "text-slate-900"}`}>
                  {kpis.cancellationRate.toFixed(1)}%
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold">
                  {kpis.cancelledCount} orders cancelled by staff
                </p>
              </div>
              <div className={`p-3 rounded-2xl ${kpis.cancellationRate > 10 ? "bg-rose-500/10 text-rose-600" : "bg-purple-500/10 text-purple-600"}`}>
                {kpis.cancellationRate > 10 ? <AlertTriangle className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
              </div>
            </div>

          </div>

          {/* 2) Charts Row (Recharts Visualizations) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Sales Trend Area Chart */}
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 flex flex-col justify-between min-h-[350px]">
              <div>
                <h4 className="font-extrabold text-slate-800 text-base mb-1">
                  📈 {timeFilter === "today" || timeFilter === "custom-date" ? "Hourly Kitchen Load Peak Trend" : "Day-by-Day Sales Revenue Trend"}
                </h4>
                <p className="text-slate-500 text-xs font-semibold mb-4">
                  {timeFilter === "today" || timeFilter === "custom-date" 
                    ? "Hour-by-hour distribution showing breakfast, lunch, and dinner peaks." 
                    : "Trajectory of gross sales revenue and incoming demand."}
                </p>
              </div>
              <div className="w-full h-64 flex-1">
                {salesTrendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-sm">
                    No transaction entries recorded in this timeframe.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: "bold", fill: "#475569" }} />
                      <YAxis tick={{ fontSize: 10, fontWeight: "bold", fill: "#475569" }} />
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Order status distribution PieChart */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 flex flex-col justify-between min-h-[350px]">
              <div>
                <h4 className="font-extrabold text-slate-800 text-base mb-1">🍩 Order Fulfillment Status Distribution</h4>
                <p className="text-slate-500 text-xs font-semibold mb-4">Breakdown of order processing metrics and cancellation counters.</p>
              </div>
              <div className="w-full h-52 flex-1 flex flex-col justify-center items-center">
                {statusDistributionData.length === 0 ? (
                  <div className="text-slate-400 font-semibold text-sm">
                    No status distribution data logged.
                  </div>
                ) : (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} orders`, "Count"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Active Legends */}
                    <div className="absolute flex flex-col gap-1 items-start text-xs font-bold text-slate-700 right-0">
                      {statusDistributionData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                          <span>{d.name}: {d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 3) Branch Comparisons and Inventory warnings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Side-by-side Branch Performance Bar Chart */}
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 flex flex-col justify-between min-h-[350px]">
              <div>
                <h4 className="font-extrabold text-slate-800 text-base mb-1">📊 Branch Comparison Metrics</h4>
                <p className="text-slate-500 text-xs font-semibold mb-4">Comparative breakdown of gross sales across campus branches.</p>
              </div>
              <div className="w-full h-64 flex-1">
                {branchComparisonData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-sm">
                    No operational data logged.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchComparisonData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: "bold", fill: "#475569" }} />
                      <YAxis tick={{ fontSize: 10, fontWeight: "bold", fill: "#475569" }} />
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Gross Sales"]} />
                      <Legend />
                      <Bar dataKey="revenue" name="Sales (₹)" fill="#10B981" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="orders" name="Orders Volume" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Inventory Status (Low/Out of Stock) */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 flex flex-col justify-between min-h-[350px]">
              <div className="border-b border-slate-100 pb-3 mb-3">
                <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Inventory Health Alerts
                </h4>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">Dishes currently low or out of stock across branches.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[250px] pr-1">
                {/* Out of Stock Section */}
                <div>
                  <h5 className="text-xs font-black text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                    Delisted / Out of Stock ({outOfStockItems.length})
                  </h5>
                  {outOfStockItems.length === 0 ? (
                    <p className="text-slate-400 font-bold text-xs pl-3">All ingredients and stock active.</p>
                  ) : (
                    <div className="space-y-1.5 pl-2">
                      {outOfStockItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-rose-500/5 border border-rose-500/20 p-2 rounded-xl text-xs font-bold text-slate-700">
                          <span className="truncate max-w-[150px]">{item.menuItemId?.name}</span>
                          <span className="text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider shadow-sm truncate max-w-[100px]">
                            {item.branchId?.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Low Stock Section */}
                <div>
                  <h5 className="text-xs font-black text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Low Stock Alert ({lowStockItems.length})
                  </h5>
                  {lowStockItems.length === 0 ? (
                    <p className="text-slate-400 font-bold text-xs pl-3">No low stock warnings.</p>
                  ) : (
                    <div className="space-y-1.5 pl-2">
                      {lowStockItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-amber-500/5 border border-amber-500/20 p-2 rounded-xl text-xs font-bold text-slate-700">
                          <div className="flex flex-col">
                            <span className="truncate max-w-[150px]">{item.menuItemId?.name}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Qty: {item.quantity} remaining</span>
                          </div>
                          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider shadow-sm truncate max-w-[100px]">
                            {item.branchId?.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* 4) Recent Orders Ledger Table */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 print:hidden">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-extrabold text-slate-800 text-base">📄 Recent Orders Ledger</h4>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">Active logs of recent customer transactions and payment states.</p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search token, branch, or payment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-green-500 shadow-sm transition"
                />
              </div>
            </div>

            {searchedOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold text-sm">
                No orders match your active search terms or filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full text-slate-800">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th>Token</th>
                      <th>Customer Name</th>
                      <th>Branch</th>
                      <th>Fulfillment</th>
                      <th>Payment</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchedOrders.slice(0, 10).map((order) => {
                      const payMethod = order.payment?.method || "Cash";
                      const isPaid = order.payment?.paid;
                      const orderStatus = order.status ? order.status.toLowerCase() : "pending";

                      return (
                        <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50/45 transition">
                          {/* Token Number */}
                          <td className="font-black text-xs text-slate-900 tracking-wider">
                            {order.tokenNumber || `TK-${order._id.substring(order._id.length - 4).toUpperCase()}`}
                          </td>

                          {/* Customer Name */}
                          <td className="font-bold text-xs text-slate-700">
                            {order.customerName || order.userId?.name || "Guest Checkout"}
                            {order.table && <span className="text-[10px] text-slate-400 block mt-0.5">Table: {order.table}</span>}
                          </td>

                          {/* Branch Name */}
                          <td className="font-extrabold text-xs text-slate-650">
                            {order.branchId?.name || "Unassigned"}
                          </td>

                          {/* Order Status Badge */}
                          <td>
                            <span className={`px-2.5 py-1 text-[10px] font-black tracking-wider uppercase rounded-full shadow-sm inline-flex items-center gap-1
                              ${
                                orderStatus === "completed"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : orderStatus === "preparing"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : orderStatus === "cancelled" || orderStatus === "canceled"
                                  ? "bg-rose-100 text-rose-800 border border-rose-250"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}>
                              {orderStatus === "completed" ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : orderStatus === "cancelled" || orderStatus === "canceled" ? (
                                <XCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              {orderStatus}
                            </span>
                          </td>

                          {/* Payment status and type */}
                          <td className="text-xs">
                            <div className="font-black text-slate-800">{payMethod}</div>
                            <span className={`text-[10px] font-bold block mt-0.5 ${isPaid ? "text-emerald-600" : "text-rose-500"}`}>
                              {isPaid ? "✓ Paid" : "✗ Unpaid"}
                            </span>
                          </td>

                          {/* Order Grand Total */}
                          <td className="text-right font-black text-xs text-slate-900">
                            ₹{order.total.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ManageAnalysis;
