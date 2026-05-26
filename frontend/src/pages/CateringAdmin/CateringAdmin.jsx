import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import api from "../../utils/api";
import {
  Building,
  Users,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  Utensils,
  ChevronRight,
  CheckCircle2,
  Power,
  XCircle,
  Plus,
  ArrowRight,
  CheckCircle,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

const CateringAdmin = () => {
  const navigate = useNavigate();

  const [catering, setCatering] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingBranch, setTogglingBranch] = useState(null); // stores branch ID being updated

  useEffect(() => {
    fetchDashboardDetails();
  }, []);

  const fetchDashboardDetails = async () => {
    try {
      setLoading(true);
      // Fetch basic analytics, orders list, staff, and inventory in parallel
      const [analyticsRes, ordersRes, staffRes, inventoryRes] = await Promise.all([
        api.get("/catering-admin/analytics?branchId=all"),
        api.get("/catering-admin/orders"),
        api.get("/catering-admin/branches/staff"),
        api.get("/catering-admin/inventory")
      ]);

      setCatering(analyticsRes.data.catering);
      setAnalytics(analyticsRes.data.analytics);
      setOrders(ordersRes.data);
      setStaff(staffRes.data);
      setInventory(inventoryRes.data);
    } catch (err) {
      console.error("Dashboard data fetching failed:", err);
      toast.error("Failed to load dashboard operational details.");
    } finally {
      setLoading(false);
    }
  };

  // 1) Quick Toggling of Branch Status (Active/Inactive)
  const handleToggleBranchStatus = async (branch) => {
    const newStatus = branch.status === "Active" ? "Inactive" : "Active";
    try {
      setTogglingBranch(branch._id);
      
      // Hit the branch update PUT endpoint
      await api.put(`/catering-admin/branches/${branch._id}`, {
        name: branch.name,
        location: branch.location,
        status: newStatus
      });

      toast.success(`${branch.name} is now ${newStatus}!`);
      
      // Update local state in place instantly
      setAnalytics(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          branches: prev.branches.map(b => b._id === branch._id ? { ...b, status: newStatus } : b)
        };
      });
    } catch (err) {
      console.error("Failed to update branch status:", err);
      toast.error("Could not update branch status. Please try again.");
    } finally {
      setTogglingBranch(null);
    }
  };

  // 2) Live Orders Queue: orders in pending or preparing state
  const activeOrders = useMemo(() => {
    return orders.filter(o => 
      o.status.toLowerCase() === "pending" || o.status.toLowerCase() === "preparing"
    );
  }, [orders]);

  // 3) Payment Settlement Breakdown (Cash vs Wallet vs Online/Razorpay)
  const paymentBreakdown = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== "cancelled");
    const counts = { Cash: 0, Wallet: 0, Online: 0 };
    
    validOrders.forEach(o => {
      const method = o.payment?.method || "Cash";
      if (method === "Wallet") counts.Wallet += o.total;
      else if (method === "Online" || method === "Razorpay") counts.Online += o.total;
      else counts.Cash += o.total;
    });

    return [
      { name: "💵 Counter Cash", value: counts.Cash, color: "#10B981" },
      { name: "✓ Campus Wallet", value: counts.Wallet, color: "#3B82F6" },
      { name: "💳 Razorpay Online", value: counts.Online, color: "#F59E0B" }
    ].filter(item => item.value > 0);
  }, [orders]);

  // 4) Urgent Low/Out-of-Stock warnings
  const urgentLowStock = useMemo(() => {
    return inventory.filter(item => item.quantity <= 5).slice(0, 4);
  }, [inventory]);

  // 5) Branch-to-Staff mappings count
  const branchStaffCounts = useMemo(() => {
    const counts = {};
    staff.forEach(s => {
      if (s.branchId) {
        const bId = s.branchId._id;
        counts[bId] = (counts[bId] || 0) + 1;
      }
    });
    return counts;
  }, [staff]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="font-extrabold text-slate-800 text-lg">Initializing POS Control Center...</p>
        </div>
      </div>
    );
  }

  if (!catering) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex items-center justify-center p-8">
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-10 max-w-md w-full shadow-2xl text-center">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Company Not Configured</h2>
          <p className="text-slate-700 font-medium mb-6">This catering company does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex">
      <main className="flex-1 p-8 pt-0 space-y-8">
        
        {/* HERO BANNER SECTION (Preserved) */}
        <div
          className="bg-cover bg-center h-52 md:h-72 flex items-center rounded-b-3xl shadow-lg"
          style={{
            backgroundImage: `url("/Gemini_Generated_Image_ay0h6xay0h6xay0h.png")`
          }}
        >
          <div className="bg-black/50 w-full h-full rounded-b-3xl flex items-center px-12">
            <img
              src={catering.logo || "/default-logo.png"}
              className="h-36 w-36 rounded-full border-4 border-white mr-6 object-cover shadow"
              alt="Logo"
            />
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-extrabold">{catering.name}</h2>
              <p className="mt-2 text-lg md:text-xl max-w-2xl font-medium">{catering.description}</p>
            </div>
          </div>
        </div>

        {/* OVERHAULED OPERATIONAL PANEL BELOW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2/3 COLUMN: Branch Directory & Live Cooking Queue */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live Branch Status Hub */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-600" />
                    Branch Operations Control
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">Toggle campus branches active or inactive in real-time.</p>
                </div>
                <button
                  onClick={() => navigate("/catering/branches")}
                  className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-lg"
                >
                  Manage Directory
                </button>
              </div>

              {analytics.branches.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-bold text-sm bg-white/40 rounded-2xl border border-dashed border-slate-200">
                  No campus branches registered. Click "Manage Directory" to add one!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analytics.branches.map((branch) => {
                    const isActive = branch.status === "Active";
                    const staffCount = branchStaffCounts[branch._id] || 0;

                    return (
                      <div
                        key={branch._id}
                        className={`bg-white/50 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex flex-col justify-between shadow-sm transition-all duration-300 relative ${
                          !isActive && "opacity-75"
                        }`}
                      >
                        {/* Branch info */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-extrabold text-sm text-slate-900">{branch.name}</h4>
                            <span
                              className={`px-2 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-full shadow-sm ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {branch.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold truncate">
                            📍 {branch.location || "Campus Hub"}
                          </p>
                          <p className="text-[11px] text-slate-550 font-bold flex items-center gap-1.5 pt-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {staffCount} active staff members
                          </p>
                        </div>

                        {/* Quick Toggle Button */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold">Kitchen Access</span>
                          <button
                            onClick={() => handleToggleBranchStatus(branch)}
                            disabled={togglingBranch === branch._id}
                            className={`btn btn-xs rounded-xl flex items-center gap-1 font-extrabold shadow-sm active:scale-95 transition-all text-[10px] ${
                              isActive
                                ? "bg-rose-500 hover:bg-rose-600 text-white border-none"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                            }`}
                          >
                            {togglingBranch === branch._id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : isActive ? (
                              <>
                                <Power className="w-3 h-3" /> Stop Kitchen
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3" /> Run Kitchen
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Cooking Queue (Real-Time Kitchen View) */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Kitchen Cooking Queue
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">Orders currently pending or preparing across kitchens.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-xs font-black rounded-full border border-emerald-200">
                  {activeOrders.length} Cooking
                </span>
              </div>

              {activeOrders.length === 0 ? (
                <div className="text-center py-12 bg-white/40 rounded-2xl border border-dashed border-slate-200">
                  <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-2 animate-bounce" />
                  <p className="text-slate-400 font-black text-sm">No active cooking loads. Clean kitchens!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {activeOrders.map((order) => {
                    const elapsed = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                    const orderStatus = order.status ? order.status.toLowerCase() : "pending";

                    return (
                      <div
                        key={order._id}
                        className="bg-white/50 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:scale-[1.005] transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-slate-900 tracking-wider">
                              {order.tokenNumber || `TK-${order._id.slice(-4).toUpperCase()}`}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">•</span>
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                              {order.branchId?.name || "Kitchen"}
                            </span>
                          </div>
                          
                          {/* Dish Items summary */}
                          <p className="text-xs font-bold text-slate-700 truncate max-w-[300px]">
                            {order.items.map(item => `${item.name} (x${item.quantity})`).join(", ")}
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-[10px] font-semibold text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> {elapsed} mins ago
                            </span>
                            <span>•</span>
                            <span>Table: {order.table || "Self-Pickup"}</span>
                          </div>
                        </div>

                        {/* Order status indicators */}
                        <div className="text-right flex flex-col items-end gap-1.5">
                          <span className="text-xs font-black text-slate-900">₹{order.total}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-full shadow-sm ${
                            orderStatus === "preparing"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}>
                            {orderStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 1/3 COLUMN: Financial reconciliations & Urgent warnings */}
          <div className="space-y-8">
            
            {/* Reconciliations & Payment settlements breakdown */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[350px]">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Daily Settlements
                </h3>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">Settled income categorized by counter payment methods.</p>
              </div>

              <div className="w-full h-44 flex items-center justify-center relative mt-3">
                {paymentBreakdown.length === 0 ? (
                  <p className="text-slate-400 font-bold text-xs">No daily settlements processed.</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {paymentBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total */}
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Settled</span>
                      <span className="text-lg font-black text-slate-900">
                        ₹{orders.filter(o => o.status !== "cancelled" && o.payment?.paid).reduce((sum, o) => sum + o.total, 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Legends list */}
              {paymentBreakdown.length > 0 && (
                <div className="grid grid-cols-1 gap-2 pt-4 border-t border-slate-100 text-xs font-bold text-slate-700">
                  {paymentBreakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span>{item.name}</span>
                      </div>
                      <span>₹{item.value.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inventory Alerts Panel */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[300px]">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Urgent Menu Refills
                </h3>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">Branch menu items that are dangerously low in stock.</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mt-4 max-h-[160px] pr-1">
                {urgentLowStock.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 font-bold text-xs">
                    ✓ All inventory and branch stock healthy.
                  </div>
                ) : (
                  urgentLowStock.map((item, idx) => {
                    const isZero = item.quantity === 0;

                    return (
                      <div
                        key={idx}
                        className={`p-2.5 border rounded-xl text-xs font-bold text-slate-700 flex justify-between items-center ${
                          isZero
                            ? "bg-rose-500/5 border-rose-500/20"
                            : "bg-amber-505/5 border-amber-500/20"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="truncate max-w-[140px] text-slate-900 font-extrabold">{item.menuItemId?.name}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">📍 {item.branchId?.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase ${
                          isZero
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          Qty: {item.quantity}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={() => navigate("/catering/menu")}
                className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:scale-[1.01] transition-all flex items-center justify-center gap-1"
              >
                Go Update Menu Stock <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
        
      </main>
    </div>
  );
};

export default CateringAdmin;
