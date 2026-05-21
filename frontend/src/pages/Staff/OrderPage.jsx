import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import StaffNavbar from "../../components/StaffNavbar";
import BottomNav from "./BottomNav";
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHourglassHalf, 
  FaUser, 
  FaUtensils, 
  FaSearch, 
  FaSync, 
  FaEllipsisV,
  FaArrowRight,
  FaBan
} from "react-icons/fa";
import { MdOutlineReorder } from "react-icons/md";

// Status helpers
const getStatusLabel = (status) => {
  const s = String(status).toLowerCase();
  if (s === "pending") return "Pending";
  if (s === "in progress" || s === "preparing") return "In Progress";
  if (s === "ready for service" || s === "ready") return "Ready for Service";
  if (s === "completed") return "Completed";
  if (s === "cancelled") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusColor = (status) => {
  const s = String(status).toLowerCase();
  if (s === "pending") return "bg-rose-100 text-rose-800 border-rose-250";
  if (s === "in progress" || s === "preparing") return "bg-amber-100 text-amber-800 border-amber-250";
  if (s === "ready for service" || s === "ready") return "bg-sky-100 text-sky-800 border-sky-200";
  if (s === "completed") return "bg-emerald-100 text-emerald-800 border-emerald-250";
  if (s === "cancelled") return "bg-slate-100 text-slate-800 border-slate-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

// Order Details Modal Component
const OrderDetailModal = ({ order, onClose, onStatusUpdated }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    "pending",
    "in progress",
    "ready for service",
    "completed",
    "cancelled"
  ];

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await axios.put(
        `http://localhost:5001/api/order/${order._id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(`Order status updated to ${getStatusLabel(newStatus)}`);
      if (onStatusUpdated) onStatusUpdated(order._id, newStatus);
      onClose();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 border border-white/30 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden flex flex-col transition-all">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black">Order Details</h3>
            <p className="text-xs text-green-100 mt-1 font-semibold">ID: {order._id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-green-200 font-bold text-2xl outline-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Customer / Order Info */}
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Customer</p>
              <p className="text-md font-bold text-slate-800">{order.userId?.name || "Guest User"}</p>
              <p className="text-xs text-slate-500 font-semibold">{order.userId?.email || ""}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Time</p>
              <p className="text-sm font-bold text-slate-700">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3">Items Ordered</h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div>
                    <p className="font-extrabold text-slate-800 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500 font-semibold">₹{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-md">x{item.quantity}</span>
                    <span className="font-black text-emerald-600 text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Section */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-4">
            <span className="text-md font-extrabold text-slate-800">Total Amount:</span>
            <span className="text-2xl font-black text-emerald-600">₹{order.total.toFixed(2)}</span>
          </div>

          {/* Status Update Control */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="block text-sm font-black text-slate-800 uppercase tracking-widest">Update Order Status</label>
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-green-400"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleUpdate}
                disabled={updating || newStatus === order.status}
                className={`px-6 py-3 font-bold text-white rounded-2xl transition duration-300 shadow-sm active:scale-95 ${
                  newStatus === order.status ? "bg-slate-300 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function OrderPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchProfileAndOrders();
  }, []);

  // Poll for new orders every 15 seconds
  useEffect(() => {
    if (!user?.branchId) return;
    const interval = setInterval(() => {
      fetchOrdersSilently();
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchProfileAndOrders = async () => {
    setLoading(true);
    try {
      const userRes = await axios.get("http://localhost:5001/api/auth/profile", { withCredentials: true });
      const u = userRes.data.data || userRes.data;
      setUser(u);
      
      if (u.branchId) {
        const orderRes = await axios.get(`http://localhost:5001/api/order/branch/${u.branchId}/today`, { withCredentials: true });
        setOrders(orderRes.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load today's orders.");
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    if (!user?.branchId) return;
    setRefreshing(true);
    try {
      const orderRes = await axios.get(`http://localhost:5001/api/order/branch/${user.branchId}/today`, { withCredentials: true });
      setOrders(orderRes.data);
      toast.success("Orders list updated!");
    } catch (err) {
      console.error("Error refreshing orders:", err);
      toast.error("Failed to refresh orders.");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchOrdersSilently = async () => {
    if (!user?.branchId) return;
    try {
      const orderRes = await axios.get(`http://localhost:5001/api/order/branch/${user.branchId}/today`, { withCredentials: true });
      setOrders(orderRes.data);
    } catch (err) {
      console.error("Silent refresh error:", err);
    }
  };

  const handleQuickStatusUpdate = async (orderId, currentStatus, action) => {
    let nextStatus = currentStatus;
    const s = String(currentStatus).toLowerCase();
    
    if (action === "next") {
      if (s === "pending") nextStatus = "in progress";
      else if (s === "in progress" || s === "preparing") nextStatus = "ready for service";
      else if (s === "ready for service" || s === "ready") nextStatus = "completed";
    } else if (action === "cancel") {
      if (!window.confirm("Are you sure you want to cancel this order?")) return;
      nextStatus = "cancelled";
    }

    try {
      await axios.put(
        `http://localhost:5001/api/order/${orderId}/status`,
        { status: nextStatus },
        { withCredentials: true }
      );
      toast.success(`Order marked as ${getStatusLabel(nextStatus)}`);
      
      // Update state locally
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: nextStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleModalStatusUpdated = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Compute stats for today
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => String(o.status).toLowerCase() === "pending").length;
  const preparingCount = orders.filter((o) => ["in progress", "preparing"].includes(String(o.status).toLowerCase())).length;
  const readyCount = orders.filter((o) => ["ready for service", "ready"].includes(String(o.status).toLowerCase())).length;
  const completedCount = orders.filter((o) => String(o.status).toLowerCase() === "completed").length;
  const cancelledCount = orders.filter((o) => String(o.status).toLowerCase() === "cancelled").length;

  // Filtering & Searching Logic
  const filteredOrders = orders.filter((order) => {
    const label = getStatusLabel(order.status);
    const matchesStatus = statusFilter === "All" || label === statusFilter;
    
    const custName = String(order.userId?.name || "").toLowerCase();
    const tableNum = String(order.table || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = 
      custName.includes(query) || 
      tableNum.includes(query) ||
      order.items.some((item) => String(item.name).toLowerCase().includes(query));
      
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white text-gray-800 font-sans flex flex-col">
      <StaffNavbar />

      <main className="flex-1 pt-24 pb-28 px-4 sm:px-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Header Block */}
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white/45 backdrop-blur-md border border-white/35 rounded-3xl p-6 shadow-xl">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <MdOutlineReorder className="text-green-600" /> Today's Orders
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Live dashboard for all branch order workflows
            </p>
          </div>
          <button
            onClick={refreshOrders}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold text-sm rounded-2xl shadow-sm transition active:scale-95"
          >
            <FaSync className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent mb-4"></div>
            <p className="text-lg font-black text-slate-700">Loading today's orders...</p>
          </div>
        ) : (
          <>
            {/* Live Stats Summary Row (Clickable Filters) */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <button
                onClick={() => setStatusFilter("All")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "All" 
                    ? "bg-white border-slate-400 ring-2 ring-slate-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total</span>
                <span className="text-2xl font-black text-slate-800">{totalCount}</span>
              </button>

              <button
                onClick={() => setStatusFilter("Pending")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "Pending" 
                    ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-rose-500">Pending</span>
                <span className="text-2xl font-black text-rose-700">{pendingCount}</span>
              </button>

              <button
                onClick={() => setStatusFilter("In Progress")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "In Progress" 
                    ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">Preparing</span>
                <span className="text-2xl font-black text-amber-700">{preparingCount}</span>
              </button>

              <button
                onClick={() => setStatusFilter("Ready for Service")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "Ready for Service" 
                    ? "bg-sky-50 border-sky-300 ring-2 ring-sky-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-sky-500">Ready</span>
                <span className="text-2xl font-black text-sky-700">{readyCount}</span>
              </button>

              <button
                onClick={() => setStatusFilter("Completed")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "Completed" 
                    ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-emerald-500">Completed</span>
                <span className="text-2xl font-black text-emerald-700">{completedCount}</span>
              </button>

              <button
                onClick={() => setStatusFilter("Cancelled")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "Cancelled" 
                    ? "bg-slate-100 border-slate-300 ring-2 ring-slate-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Cancelled</span>
                <span className="text-2xl font-black text-slate-700">{cancelledCount}</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="relative bg-white/45 backdrop-blur-md border border-white/35 rounded-2xl p-4 shadow-lg flex items-center">
              <FaSearch className="absolute left-7 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search by customer name, table number, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/70 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Main Orders Board Grid */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 transition-all">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span>🍽️</span> {statusFilter === "All" ? "All" : statusFilter} Orders ({filteredOrders.length})
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full shadow-sm"></div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">📜</p>
                  <p className="text-lg font-black text-slate-600">No orders match the current criteria.</p>
                  <p className="text-sm font-semibold text-slate-400 mt-1">Try resetting the status filter or search query</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOrders.map((order) => {
                    const statusVal = String(order.status).toLowerCase();
                    const isDoneOrCancelled = ["completed", "cancelled"].includes(statusVal);
                    
                    return (
                      <div 
                        key={order._id}
                        className="bg-white/60 hover:bg-white border border-white/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative"
                      >
                        {/* Time & Price Badge */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <h3 className="text-lg font-black text-slate-800 mt-1">{order.userId?.name || "Guest"}</h3>
                            {order.table && (
                              <p className="text-xs font-semibold text-slate-500">Table: {order.table}</p>
                            )}
                          </div>
                          <span className={`px-2.5 py-1 text-[10px] font-black tracking-wider uppercase rounded-full shadow-sm border ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        {/* Items Checklist */}
                        <div className="py-3 border-y border-slate-100/60 my-2 space-y-1.5 flex-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm text-slate-700 font-semibold">
                              <span className="truncate pr-2">{item.name}</span>
                              <span className="text-xs font-black text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md shrink-0">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Total Value */}
                        <div className="flex justify-between items-center py-2 mb-4">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</span>
                          <span className="text-lg font-black text-emerald-600">₹{order.total.toFixed(2)}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-sm"
                            title="View Full Details"
                          >
                            <FaEllipsisV className="text-xs" />
                          </button>

                          {!isDoneOrCancelled && (
                            <>
                              <button
                                onClick={() => handleQuickStatusUpdate(order._id, order.status, "cancel")}
                                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                                title="Cancel Order"
                              >
                                <FaBan className="text-[10px]" /> Cancel
                              </button>

                              <button
                                onClick={() => handleQuickStatusUpdate(order._id, order.status, "next")}
                                className="flex-[2] py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                              >
                                {statusVal === "pending" && (
                                  <>👩‍🍳 Cook</>
                                )}
                                {(statusVal === "in progress" || statusVal === "preparing") && (
                                  <>🔔 Mark Ready</>
                                )}
                                {(statusVal === "ready for service" || statusVal === "ready") && (
                                  <>✅ Complete</>
                                )}
                                <FaArrowRight className="text-[9px]" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <BottomNav />

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={handleModalStatusUpdated}
        />
      )}
    </div>
  );
}

export default OrderPage;
