import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

// Offline Order Modal Component
const OfflineOrderModal = ({ user, onClose, onOrderCreated }) => {
  const [step, setStep] = useState(1); // 1: Items & details, 2: Payment, 3: Success Receipt
  const [customerName, setCustomerName] = useState("");
  const [table, setTable] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState({}); // { itemId: quantity }
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Cash, Online (Scanner)
  const [createdOrder, setCreatedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load branch menu items on mount
  useEffect(() => {
    if (user?.branchId) {
      fetchBranchMenu();
    }
  }, [user]);

  const fetchBranchMenu = async () => {
    setLoadingMenu(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/menu/branch/${user.branchId}`, { withCredentials: true });
      setMenuItems(res.data);
    } catch (err) {
      console.error("Error fetching branch menu:", err);
      toast.error("Failed to load menu items.");
    } finally {
      setLoadingMenu(false);
    }
  };

  // Get unique categories from menu items
  const categories = ["All", ...new Set(menuItems.map(item => item.menuItemId?.category).filter(Boolean))];

  // Filtered menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.menuItemId?.category === selectedCategory;
    const matchesSearch = item.menuItemId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (itemId) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  // Calculations
  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  
  const subtotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const dish = menuItems.find(item => item.menuItemId?._id === itemId || item._id === itemId);
    const price = dish?.price || 0;
    return sum + (price * qty);
  }, 0);

  const gst = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal + gst;

  const handlePlaceOrder = async () => {
    if (cartItemsCount === 0) {
      toast.error("Please add at least one item to cart.");
      return;
    }
    
    setSubmitting(true);
    try {
      const items = Object.entries(cart).map(([itemId, quantity]) => {
        const dish = menuItems.find(item => item.menuItemId?._id === itemId || item._id === itemId);
        return {
          itemId: dish?.menuItemId?._id || itemId,
          name: dish?.menuItemId?.name || "Unknown Item",
          price: dish?.price || 0,
          quantity
        };
      });

      const orderData = {
        cateringId: user.cateringId,
        branchId: user.branchId,
        items,
        total: grandTotal,
        status: "pending",
        table,
        customerName: customerName || "Guest Customer",
        payment: {
          method: paymentMethod,
          paid: paymentMethod === "Online"
        }
      };

      const res = await axios.post("http://localhost:5001/api/order/", orderData, { withCredentials: true });
      setCreatedOrder(res.data);
      
      if (onOrderCreated) {
        onOrderCreated(res.data);
      }
      
      setStep(3); // Go to success receipt screen
      toast.success("Order created successfully!");
    } catch (err) {
      console.error("Error creating offline order:", err);
      toast.error("Failed to place offline order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn text-gray-800">
      <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col transition-all h-[90vh]">
        <style>{`
          @keyframes scan {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          .animate-scanner {
            position: absolute;
            animation: scan 2.5s linear infinite;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-black">New Offline Order</h3>
            <p className="text-xs text-green-100 mt-1 font-semibold">Catering POS Terminal • {user?.name || "Staff"}</p>
          </div>
          {step !== 3 && (
            <button 
              onClick={onClose} 
              className="text-white hover:text-green-200 font-bold text-2xl outline-none"
            >
              &times;
            </button>
          )}
        </div>

        {/* Steps Progress Indicator */}
        {step !== 3 && (
          <div className="bg-slate-100/80 border-b border-slate-200 py-3 px-6 flex justify-center items-center gap-8 shrink-0 text-sm font-bold text-gray-500">
            <span className={`flex items-center gap-2 ${step === 1 ? "text-green-700" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"}`}>1</span>
              Customer & Menu
            </span>
            <div className="w-16 h-0.5 bg-slate-200"></div>
            <span className={`flex items-center gap-2 ${step === 2 ? "text-green-700" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</span>
              Payment & Finalize
            </span>
          </div>
        )}

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50/50">
          
          {/* STEP 1: Items & Customer Details */}
          {step === 1 && (
            <>
              {/* Left Column: Menu list and customer inputs */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col space-y-5">
                
                {/* Customer Details Fields */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Guest Customer (Optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-green-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Table Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Table 5 (Optional)"
                      value={table}
                      onChange={(e) => setTable(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-green-500 transition"
                    />
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-205 rounded-xl py-2 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-green-400 transition"
                    />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-200 border ${
                          selectedCategory === cat 
                            ? "bg-emerald-600 border-emerald-600 text-white" 
                            : "bg-white border-slate-200 hover:border-slate-350 text-slate-600"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu items grid */}
                <div className="flex-1 overflow-y-auto min-h-[250px]">
                  {loadingMenu ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent mb-3"></div>
                      <p className="text-sm font-black text-slate-500">Loading branch menu...</p>
                    </div>
                  ) : filteredMenuItems.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-slate-500 font-bold">No dishes found matching selection.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredMenuItems.map(item => {
                        const inCartQty = cart[item.menuItemId?._id || item._id] || 0;
                        const available = item.isAvailable && item.quantity > 0;
                        
                        return (
                          <div 
                            key={item._id} 
                            className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex justify-between items-center ${
                              !available ? "opacity-50" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 pr-2 min-w-0">
                              {item.menuItemId?.imageUrl ? (
                                <img 
                                  src={item.menuItemId.imageUrl} 
                                  alt={item.menuItemId.name}
                                  className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-slate-100 text-green-600 rounded-xl flex items-center justify-center text-lg shrink-0 border border-slate-200">
                                  <FaUtensils className="text-xs" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-extrabold text-sm text-slate-800 truncate">{item.menuItemId?.name}</p>
                                <p className="text-xs text-slate-400 font-semibold">{item.menuItemId?.category}</p>
                                <p className="text-sm font-black text-emerald-600 mt-0.5">₹{item.price.toFixed(2)}</p>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {!available ? (
                                <span className="text-[10px] font-black tracking-wider uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                                  Out of Stock
                                </span>
                              ) : inCartQty === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(item.menuItemId?._id || item._id)}
                                  className="px-3.5 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-black text-xs rounded-xl transition-all duration-200 hover:scale-[1.05]"
                                >
                                  + Add
                                </button>
                              ) : (
                                <div className="flex items-center border border-green-200 rounded-xl bg-green-50 overflow-hidden text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFromCart(item.menuItemId?._id || item._id)}
                                    className="px-3 py-1.5 hover:bg-green-100 text-green-700 font-black"
                                  >
                                    -
                                  </button>
                                  <span className="px-2.5 text-green-800 font-extrabold">{inCartQty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(item.menuItemId?._id || item._id)}
                                    className="px-3 py-1.5 hover:bg-green-100 text-green-700 font-black"
                                    disabled={inCartQty >= item.quantity}
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: POS Cart Summary */}
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 p-6 bg-white flex flex-col justify-between shrink-0">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Current Order</h4>
                    
                    {cartItemsCount === 0 ? (
                      <div className="text-center py-16 text-slate-400">
                        <FaUtensils className="text-3xl mx-auto mb-3 opacity-30 text-green-600" />
                        <p className="font-bold text-xs">Cart is empty</p>
                        <p className="text-[10px] mt-1 font-semibold text-slate-400">Select items from the left menu.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                        {Object.entries(cart).map(([itemId, qty]) => {
                          const dish = menuItems.find(item => item.menuItemId?._id === itemId || item._id === itemId);
                          const name = dish?.menuItemId?.name || "Unknown Item";
                          const price = dish?.price || 0;

                          return (
                            <div key={itemId} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                              <div className="min-w-0 pr-2">
                                <p className="font-extrabold text-xs text-slate-800 truncate">{name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">₹{price.toFixed(2)} each</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFromCart(itemId)}
                                    className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 font-bold text-slate-700">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(itemId)}
                                    className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                                    disabled={qty >= (dish?.quantity || 99)}
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="font-black text-xs text-slate-800 w-14 text-right">
                                  ₹{(price * qty).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {cartItemsCount > 0 && (
                    <div className="border-t border-slate-100 pt-4 mt-4 space-y-2 shrink-0">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Items Subtotal:</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>GST (5%):</span>
                        <span>₹{gst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-slate-800 pt-1 border-t border-slate-50">
                        <span>Grand Total:</span>
                        <span className="text-emerald-600">₹{grandTotal.toFixed(2)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition duration-200 shadow-md hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Proceed to Payment
                        <FaArrowRight className="text-[10px]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Payment Selector & Finalize */}
          {step === 2 && (
            <div className="flex-1 p-8 flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6 overflow-y-auto">
              <div className="text-center">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Final Payment</h4>
                <p className="text-3xl font-black text-emerald-600">₹{grandTotal.toFixed(2)}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">Select transaction method to finalize</p>
              </div>

              {/* Payment selection grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Cash option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Cash")}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all duration-300 ${
                    paymentMethod === "Cash"
                      ? "bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-350 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-inner font-extrabold">
                    ₹
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-800">Cash Payment</h5>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Collect physical currency. Mark order as Unpaid/Pending.</p>
                  </div>
                </button>

                {/* Scanner option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Online")}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all duration-300 ${
                    paymentMethod === "Online"
                      ? "bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-350 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">
                    <FaClock className="text-sm animate-pulse" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-800">UPI QR Scanner</h5>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Display dynamic QR code. Confirm immediate digital receipt.</p>
                  </div>
                </button>
              </div>

              {/* Dynamic details based on method */}
              <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                {paymentMethod === "Cash" ? (
                  <div className="text-center space-y-4 py-4">
                    <p className="text-sm font-semibold text-slate-600">
                      Collect <span className="font-extrabold text-slate-800">₹{grandTotal.toFixed(2)}</span> in cash. The order will be placed as <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Unpaid</span>.
                    </p>
                    <div className="flex gap-2.5 justify-center">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-5 py-2.5 border-2 border-slate-200 hover:border-slate-350 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Back to Menu
                      </button>
                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={submitting}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition duration-200 shadow-md active:scale-95 cursor-pointer"
                      >
                        {submitting ? "Processing..." : "Place Cash Order"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2 space-y-4">
                    {/* Simulated Scanner UPI Box */}
                    <div className="relative border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center w-52 shrink-0">
                      {/* Glimmer Scanner Scan line effect */}
                      <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scanner z-10 shadow-md animate-bounce"></div>
                      
                      {/* Styled mock QR Code */}
                      <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl flex items-center justify-center relative shadow-sm overflow-hidden p-2">
                        {/* Dynamic looking QR matrix lines simulated by grid */}
                        <div className="grid grid-cols-6 gap-1 w-full h-full opacity-90">
                          {[...Array(36)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`rounded-sm ${(i % 3 === 0 || i % 7 === 0 || i < 6 || i > 30 || i % 6 === 0) ? "bg-slate-800" : "bg-transparent"} ${
                                (i === 0 || i === 5 || i === 30 || i === 35) ? "border-2 border-slate-900 bg-white p-0.5 flex items-center justify-center" : ""
                              }`}
                            >
                              {(i === 0 || i === 5 || i === 30 || i === 35) && <div className="w-full h-full bg-slate-900 rounded-sm"></div>}
                            </div>
                          ))}
                        </div>
                        {/* Center Branding logo */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-600 text-white font-black rounded-lg flex items-center justify-center text-[10px] shadow-md border border-white">
                            QB
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center mt-2.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan QR To Pay</p>
                        <p className="text-xs font-black text-slate-700 mt-0.5">quickbite@upi</p>
                      </div>
                    </div>

                    <div className="text-center space-y-3">
                      <p className="text-xs text-slate-500 font-semibold">
                        Once customer completes payment scan on their mobile device, click below to confirm.
                      </p>
                      <div className="flex gap-2.5 justify-center">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-5 py-2.5 border-2 border-slate-200 hover:border-slate-350 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Back to Menu
                        </button>
                        <button
                          type="button"
                          onClick={handlePlaceOrder}
                          disabled={submitting}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition duration-200 shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          {submitting ? "Finalizing..." : "Confirm Payment Success"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Success Confirmation & Formal Invoice Receipt */}
          {step === 3 && createdOrder && (
            <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center max-w-lg mx-auto py-8">
              
              {/* Animated scaling Success Icon */}
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl shadow-inner mb-4 animate-bounce">
                <FaCheckCircle />
              </div>
              
              <h4 className="text-xl font-black text-slate-800 tracking-tight text-center">Order Created Successfully!</h4>
              <p className="text-xs text-slate-500 mt-1 font-semibold text-center">Receipt details are printed below.</p>

              {/* Formal POS Digital Receipt Slip */}
              <div className="w-full bg-white border border-slate-300 border-dashed shadow-md rounded-2xl p-6 mt-6 space-y-4 font-mono text-xs text-slate-700 leading-relaxed max-h-[50vh] overflow-y-auto">
                <div className="text-center border-b border-dashed pb-3 border-slate-200">
                  <h5 className="font-extrabold text-sm uppercase text-slate-900">QUICKBITE SERVICES</h5>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">BRANCH ID • {user?.branchId}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{new Date(createdOrder.createdAt).toLocaleString()}</p>
                </div>

                {/* Big Unique Token Display */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center my-3 border-dashed">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pickup Token</p>
                  <p className="text-2xl font-black text-green-700 mt-1">
                    {createdOrder.tokenNumber || "PENDING PAYMENT"}
                  </p>
                  {!createdOrder.payment?.paid && (
                    <p className="text-[9px] font-extrabold text-rose-600 mt-1">Collect physical cash before pickup</p>
                  )}
                </div>

                {/* Metadata details */}
                <div className="space-y-1 text-[10px] font-semibold text-slate-500 border-b border-dashed pb-3 border-slate-200">
                  <p><span className="font-bold text-slate-700">Order ID:</span> {createdOrder._id}</p>
                  <p><span className="font-bold text-slate-700">Customer:</span> {createdOrder.customerName}</p>
                  {createdOrder.table && <p><span className="font-bold text-slate-700">Table No:</span> {createdOrder.table}</p>}
                  <p>
                    <span className="font-bold text-slate-700">Payment:</span> {createdOrder.payment?.method} ({createdOrder.payment?.paid ? "PAID" : "UNPAID"})
                  </p>
                </div>

                {/* Items listing */}
                <div className="space-y-1.5 border-b border-dashed pb-3 border-slate-200 text-[10px]">
                  <div className="flex justify-between font-bold text-slate-900 border-b pb-1 border-slate-100">
                    <span>ITEM NAME</span>
                    <div className="flex gap-4">
                      <span>QTY</span>
                      <span className="w-14 text-right">TOTAL</span>
                    </div>
                  </div>
                  {createdOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between font-medium">
                      <span className="truncate max-w-[150px]">{item.name}</span>
                      <div className="flex gap-4">
                        <span className="text-slate-400 font-bold">x{item.quantity}</span>
                        <span className="w-14 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 pt-1 text-[10px] font-bold">
                  <div className="flex justify-between font-medium text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{(createdOrder.total - (createdOrder.total * 0.05 / 1.05)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-500">
                    <span>GST (5%):</span>
                    <span>₹{(createdOrder.total * 0.05 / 1.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-slate-900 pt-1.5 border-t border-slate-100">
                    <span>GRAND TOTAL:</span>
                    <span>₹{createdOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[9px] text-center font-bold text-slate-400 tracking-wider pt-3">
                  THANK YOU FOR DINING WITH US!
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 w-full mt-6">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-3 border-2 border-slate-200 hover:border-slate-350 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Print Slip
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center justify-center cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

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
  const [showOfflineModal, setShowOfflineModal] = useState(false);

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

  const handleMarkPaymentSuccess = async (orderId) => {
    try {
      const res = await axios.put(
        `http://localhost:5001/api/order/${orderId}/payment-success`,
        {},
        { withCredentials: true }
      );
      toast.success("Payment marked as successful!");
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, ...res.data } : order
        )
      );
    } catch (err) {
      console.error("Error marking payment success:", err);
      toast.error("Failed to mark payment success.");
    }
  };

  const handleOfflineOrderCreated = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
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
              <MdOutlineReorder className="text-green-600" /> Orders
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              View and manage customer orders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/staff/service"
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-2xl shadow-sm transition active:scale-95 cursor-pointer flex justify-center"
            >
              <FaUtensils className="text-xs" />
              New Offline Order
            </Link>
            <button
              onClick={refreshOrders}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold text-sm rounded-2xl shadow-sm transition active:scale-95 cursor-pointer"
            >
              <FaSync className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent mb-4"></div>
            <p className="text-lg font-black text-slate-700">Loading orders...</p>
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
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/70 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Main Orders Board Grid */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 transition-all">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  {statusFilter} Orders ({filteredOrders.length})
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full shadow-sm"></div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg font-bold text-slate-500">No orders found.</p>
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
                            <h3 className="text-lg font-black text-slate-800 mt-1">{order.userId?.name || order.customerName || "Guest"}</h3>
                            {order.table && (
                              <p className="text-xs font-semibold text-slate-500">Table: {order.table}</p>
                            )}
                            {order.tokenNumber ? (
                              <span className="text-[10px] font-black text-green-700 bg-green-50 border border-green-155 inline-block px-2 py-0.5 rounded mt-1.5">
                                Token: {order.tokenNumber}
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-155 inline-block px-2 py-0.5 rounded mt-1.5 animate-pulse">
                                Unpaid • Cash
                              </span>
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
                        <div className="flex flex-col gap-2">
                          {!order.payment?.paid && order.payment?.method === "Cash" && (
                            <button
                              type="button"
                              onClick={() => handleMarkPaymentSuccess(order._id)}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                            >
                              <FaCheckCircle className="text-xs" />
                              Mark Paid (Cash Received)
                            </button>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-sm"
                              title="View Full Details"
                            >
                              <FaEllipsisV className="text-xs" />
                            </button>

                            {!isDoneOrCancelled && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusUpdate(order._id, order.status, "cancel")}
                                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusUpdate(order._id, order.status, "next")}
                                  className="flex-[2] py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                  {statusVal === "pending" && (
                                    <>Prepare</>
                                  )}
                                  {(statusVal === "in progress" || statusVal === "preparing") && (
                                    <>Mark Ready</>
                                  )}
                                  {(statusVal === "ready for service" || statusVal === "ready") && (
                                    <>Complete</>
                                  )}
                                  <FaArrowRight className="text-[9px]" />
                                </button>
                              </>
                            )}
                          </div>
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

      {showOfflineModal && (
        <OfflineOrderModal
          user={user}
          onClose={() => setShowOfflineModal(false)}
          onOrderCreated={handleOfflineOrderCreated}
        />
      )}
    </div>
  );
}

export default OrderPage;
