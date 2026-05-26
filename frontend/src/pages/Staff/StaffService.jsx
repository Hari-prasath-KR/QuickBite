import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import StaffNavbar from "../../components/StaffNavbar";
import BottomNav from "./BottomNav";
import { 
  FaClock, 
  FaCheckCircle, 
  FaUser, 
  FaUtensils, 
  FaSearch, 
  FaSync, 
  FaArrowRight,
  FaPrint,
  FaQrcode
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

// Simple Receipt Modal for viewing previous orders
const ReceiptModal = ({ order, onClose, taxRate = 5.0 }) => {
  const handlePrint = () => {
    window.print();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn text-gray-800">
      <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden flex flex-col transition-all">
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-black">Order Receipt</h3>
            <p className="text-xs text-green-100 mt-0.5 font-semibold">ID: {order._id}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-green-200 font-bold text-2xl outline-none">
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Formal POS Digital Receipt Slip */}
          <div className="w-full bg-white border border-slate-300 border-dashed rounded-2xl p-5 space-y-4 font-mono text-xs text-slate-700 leading-relaxed">
            <div className="text-center border-b border-dashed pb-3 border-slate-200">
              <h5 className="font-extrabold text-sm uppercase text-slate-900">QUICKBITE SERVICES</h5>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">BRANCH ID • {order.branchId}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
            </div>

            {/* Big Unique Token Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center my-3 border-dashed">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pickup Token</p>
              <p className="text-2xl font-black text-green-700 mt-1">
                {order.tokenNumber || "PENDING PAYMENT"}
              </p>
              {!order.payment?.paid && (
                <p className="text-[9px] font-extrabold text-rose-600 mt-1">Collect physical cash before pickup</p>
              )}
            </div>

            {/* Metadata details */}
            <div className="space-y-1 text-[10px] font-semibold text-slate-500 border-b border-dashed pb-3 border-slate-200">
              <p><span className="font-bold text-slate-700">Customer:</span> {order.userId?.name || order.customerName || "Guest"}</p>
              {order.table && <p><span className="font-bold text-slate-700">Table No:</span> {order.table}</p>}
              <p>
                <span className="font-bold text-slate-700">Payment:</span> {order.payment?.method} ({order.payment?.paid ? "PAID" : "UNPAID"})
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
              {order.items?.map((item, idx) => (
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
                <span>₹{(order.total - (order.total * (taxRate / 100) / (1 + taxRate / 100))).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-500">
                <span>GST ({taxRate.toFixed(1)}%):</span>
                <span>₹{(order.total * (taxRate / 100) / (1 + taxRate / 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-slate-900 pt-1.5 border-t border-slate-100">
                <span>GRAND TOTAL:</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>

            </div>

            <p className="text-[9px] text-center font-bold text-slate-400 tracking-wider pt-3">
              THANK YOU FOR DINING WITH US!
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 border-2 border-slate-200 hover:border-slate-350 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FaPrint className="text-xs" />
              Print Slip
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function StaffService() {
  const [activeTab, setActiveTab] = useState("pos"); // "pos" or "unpaid"
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // POS State Variables
  const [posStep, setPosStep] = useState(1); // 1: Items, 2: Payment, 3: Success Receipt
  const [customerName, setCustomerName] = useState("");
  const [table, setTable] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState({}); // { itemId: quantity }
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Cash, Online
  const [createdOrder, setCreatedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [taxRate, setTaxRate] = useState(5.0);

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const fetchProfileAndData = async () => {
    setLoading(true);
    try {
      const [userRes, settingsRes] = await Promise.all([
        axios.get("http://localhost:5001/api/auth/profile", { withCredentials: true }),
        axios.get("http://localhost:5001/api/admin/settings", { withCredentials: true }).catch((e) => {
          console.log("Ignored settings load error in StaffService:", e);
          return { data: { taxRate: 5.0 } };
        })
      ]);
      const u = userRes.data.data || userRes.data;
      setUser(u);
      if (settingsRes && settingsRes.data) {
        setTaxRate(settingsRes.data.taxRate);
      }
      
      if (u.branchId) {
        // Fetch branch menu
        const menuRes = await axios.get(`http://localhost:5001/api/menu/branch/${u.branchId}`, { withCredentials: true });
        setMenuItems(menuRes.data);
        
        // Fetch today's orders
        const ordersRes = await axios.get(`http://localhost:5001/api/order/branch/${u.branchId}/today`, { withCredentials: true });
        setOrders(ordersRes.data);
      }
    } catch (err) {
      console.error("Error fetching terminal profile:", err);
      toast.error("Failed to initialize service terminal.");
    } finally {
      setLoading(false);
    }
  };


  const refreshOrdersOnly = async () => {
    if (!user?.branchId) return;
    setRefreshing(true);
    try {
      const ordersRes = await axios.get(`http://localhost:5001/api/order/branch/${user.branchId}/today`, { withCredentials: true });
      setOrders(ordersRes.data);
      toast.success("Orders list updated!");
    } catch (err) {
      console.error("Error refreshing orders:", err);
      toast.error("Failed to refresh orders.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkPaymentSuccess = async (orderId) => {
    try {
      const res = await axios.put(
        `http://localhost:5001/api/order/${orderId}/payment-success`,
        {},
        { withCredentials: true }
      );
      toast.success("Payment marked as successful!");
      
      // Update local orders state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, ...res.data } : order
        )
      );
    } catch (err) {
      console.error("Error marking payment success:", err);
      toast.error("Failed to update payment status.");
    }
  };

  // Menu Categories
  const categories = ["All", ...new Set(menuItems.map(item => item.menuItemId?.category).filter(Boolean))];

  // Filtered Menu Items
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

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  
  const subtotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const dish = menuItems.find(item => item.menuItemId?._id === itemId || item._id === itemId);
    const price = dish?.price || 0;
    return sum + (price * qty);
  }, 0);

  const gst = subtotal * (taxRate / 100); // Dynamic GST
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
      
      // Update local orders list
      setOrders(prev => [res.data, ...prev]);
      
      setPosStep(3); // Go to receipt slip
      toast.success("Order created successfully!");
      // Reset cart and customer inputs
      setCart({});
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place offline order.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetPOS = () => {
    setPosStep(1);
    setCustomerName("");
    setTable("");
    setCart({});
    setCreatedOrder(null);
  };

  // Filter today's unpaid cash orders
  const unpaidCashOrders = orders.filter(
    (o) => !o.payment?.paid && o.payment?.method === "Cash"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white text-gray-800 font-sans flex flex-col">
      <StaffNavbar />

      <main className="flex-1 pt-24 pb-28 px-4 sm:px-6 max-w-6xl w-full mx-auto space-y-6">
        
        {/* Terminal Header & Mode Selector Tabs */}
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white/45 backdrop-blur-md border border-white/35 rounded-3xl p-6 shadow-xl shrink-0">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <FaUtensils className="text-green-600" /> Service Terminal
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Catering POS • {user?.name || "Staff"} • Branch ID: {user?.branchId || "None"}
            </p>
          </div>
          
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-5 py-2.5 font-extrabold text-xs rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "pos" 
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Place Walk-In Order
            </button>
            <button
              onClick={() => setActiveTab("unpaid")}
              className={`px-5 py-2.5 font-extrabold text-xs rounded-xl transition-all duration-200 relative cursor-pointer ${
                activeTab === "unpaid" 
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Unpaid Cash Orders
              {unpaidCashOrders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 bg-rose-500 text-white rounded-full flex items-center justify-center font-black text-[9px] border-2 border-white animate-pulse">
                  {unpaidCashOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent mb-4"></div>
            <p className="text-lg font-black text-slate-700">Loading service terminal...</p>
          </div>
        ) : (
          <>
            {/* VIEW 1: POS walk-in checkout */}
            {activeTab === "pos" && (
              <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
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

                {/* Left Section: Product Selector / Cart Forms */}
                {posStep === 1 && (
                  <>
                    <div className="flex-1 p-6 flex flex-col space-y-5">
                      {/* Customer inputs */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Customer Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Guest Customer (Optional)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-green-500 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Table Number</label>
                          <input
                            type="text"
                            placeholder="e.g. Table 5 (Optional)"
                            value={table}
                            onChange={(e) => setTable(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-green-500 transition"
                          />
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                          <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-205 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-green-400 transition"
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
                                  : "bg-white border-slate-200 hover:border-slate-355 text-slate-600"
                              }`}
                            >
                                {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dishes list */}
                      <div className="flex-1 overflow-y-auto max-h-[400px] min-h-[300px] pr-1">
                        {menuItems.length === 0 ? (
                          <div className="text-center py-16">
                            <p className="text-slate-500 font-bold">No menu items loaded.</p>
                          </div>
                        ) : filteredMenuItems.length === 0 ? (
                          <div className="text-center py-16">
                            <p className="text-slate-500 font-bold">No matching dishes found.</p>
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

                    {/* Right Side: Cart Summary */}
                    <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 p-6 bg-white flex flex-col justify-between shrink-0">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Current Order</h4>
                          
                          {cartItemsCount === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                              <FaUtensils className="text-3xl mx-auto mb-3 opacity-30 text-green-600" />
                              <p className="font-bold text-xs">Cart is empty</p>
                              <p className="text-[10px] mt-1 font-semibold text-slate-400">Select items from the menu.</p>
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                              {Object.entries(cart).map(([itemId, qty]) => {
                                const dish = menuItems.find(item => item.menuItemId?._id === itemId || item._id === itemId);
                                const name = dish?.menuItemId?.name || "Unknown Item";
                                const price = dish?.price || 0;

                                return (
                                  <div key={itemId} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-xs">
                                    <div className="min-w-0 pr-2">
                                      <p className="font-extrabold text-slate-800 truncate">{name}</p>
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
                                      <span className="font-black text-slate-800 w-12 text-right">
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
                              <span>Subtotal:</span>
                              <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold text-slate-500">
                              <span>GST ({taxRate.toFixed(1)}%):</span>
                              <span>₹{gst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-black text-slate-800 pt-1 border-t border-slate-50">
                              <span>Grand Total:</span>
                              <span className="text-emerald-600">₹{grandTotal.toFixed(2)}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setPosStep(2)}
                              className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition duration-200 shadow-md hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                            >
                              Proceed to Payment
                              <FaArrowRight className="text-[9px]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* POS STEP 2: Choose Payment */}
                {posStep === 2 && (
                  <div className="flex-1 p-8 flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
                    <div className="text-center">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Final Payment</h4>
                      <p className="text-3xl font-black text-emerald-600">₹{grandTotal.toFixed(2)}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">Select transaction method to finalize</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {/* Cash */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("Cash")}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all duration-300 cursor-pointer ${
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

                      {/* Scanner */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("Online")}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all duration-300 cursor-pointer ${
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

                    <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      {paymentMethod === "Cash" ? (
                        <div className="text-center space-y-4 py-4">
                          <p className="text-sm font-semibold text-slate-655">
                            Collect <span className="font-extrabold text-slate-800">₹{grandTotal.toFixed(2)}</span> in cash. The order will be placed as <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Unpaid</span>.
                          </p>
                          <div className="flex gap-2.5 justify-center">
                            <button
                              type="button"
                              onClick={() => setPosStep(1)}
                              className="px-5 py-2.5 border border-slate-200 hover:border-slate-350 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                              Back to Menu
                            </button>
                            <button
                              type="button"
                              onClick={handlePlaceOrder}
                              disabled={submitting}
                              className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition duration-200 shadow-md active:scale-95 cursor-pointer"
                            >
                              {submitting ? "Processing..." : "Place Cash Order"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-2 space-y-4">
                          <div className="relative border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center w-48 shrink-0">
                            <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scanner z-10 shadow-md"></div>
                            
                            <div className="w-36 h-36 bg-white border border-slate-200 rounded-xl flex items-center justify-center relative shadow-sm overflow-hidden p-2">
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
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-7 h-7 bg-green-600 text-white font-black rounded-lg flex items-center justify-center text-[8px] shadow-md border border-white">
                                  QB
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center mt-2">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scan QR To Pay</p>
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
                                onClick={() => setPosStep(1)}
                                className="px-5 py-2.5 border border-slate-205 hover:border-slate-350 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
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

                {/* POS STEP 3: Order Completed Bill Receipt Screen */}
                {posStep === 3 && createdOrder && (
                  <div className="flex-1 p-6 flex flex-col items-center justify-center max-w-lg mx-auto py-8">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl shadow-inner mb-3">
                      <FaCheckCircle />
                    </div>
                    
                    <h4 className="text-lg font-black text-slate-800 tracking-tight text-center">Order Created Successfully!</h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-semibold text-center">Receipt details are printed below.</p>

                    {/* Receipt Box */}
                    <div className="w-full bg-white border border-slate-300 border-dashed rounded-2xl p-5 mt-6 space-y-4 font-mono text-xs text-slate-700 leading-relaxed">
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
                          <span>₹{(createdOrder.total - (createdOrder.total * (taxRate / 100) / (1 + taxRate / 100))).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-slate-500">
                          <span>GST ({taxRate.toFixed(1)}%):</span>
                          <span>₹{(createdOrder.total * (taxRate / 100) / (1 + taxRate / 100)).toFixed(2)}</span>
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

                    <div className="flex gap-2.5 w-full mt-6">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex-1 py-2.5 border-2 border-slate-200 hover:border-slate-350 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FaPrint className="text-xs" />
                        Print Slip
                      </button>
                      <button
                        type="button"
                        onClick={resetPOS}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center justify-center cursor-pointer"
                      >
                        New Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: Unpaid Cash Orders management */}
            {activeTab === "unpaid" && (
              <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 transition-all min-h-[450px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    Unpaid Cash Orders ({unpaidCashOrders.length})
                  </h2>
                  <button
                    onClick={refreshOrdersOnly}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <FaSync className={`text-[10px] ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>

                {unpaidCashOrders.length === 0 ? (
                  <div className="text-center py-20 bg-white/40 border border-slate-100 rounded-2xl">
                    <FaClock className="text-3xl text-emerald-600 mx-auto opacity-30 mb-2" />
                    <p className="text-sm font-bold text-slate-500">No unpaid cash orders found today.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unpaidCashOrders.map((order) => (
                      <div 
                        key={order._id}
                        className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between relative"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[9px] font-black tracking-wider uppercase bg-rose-50 border border-rose-150 text-rose-700 px-2 py-0.5 rounded animate-pulse">
                              Unpaid • Cash
                            </span>
                          </div>

                          <h3 className="text-md font-black text-slate-800">{order.customerName || "Guest Customer"}</h3>
                          {order.table && (
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">Table: {order.table}</p>
                          )}
                          
                          {/* Items Checklist */}
                          <div className="py-2.5 border-t border-b border-slate-100/60 my-3 space-y-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-xs text-slate-700 font-semibold">
                                <span className="truncate pr-2">{item.name}</span>
                                <span className="text-[10px] font-black text-slate-400 shrink-0">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center py-1.5 mb-3.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bill</span>
                            <span className="text-md font-black text-emerald-600">₹{order.total.toFixed(2)}</span>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handleMarkPaymentSuccess(order._id)}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer font-sans"
                            >
                              <FaCheckCircle className="text-xs" />
                              Confirm Cash & Mark Paid
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(order)}
                              className="w-full py-2 border border-slate-205 hover:border-slate-350 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer font-sans"
                            >
                              View/Print Slip
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />

      {selectedReceipt && (
        <ReceiptModal
          order={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          taxRate={taxRate}
        />
      )}

    </div>
  );
}

export default StaffService;
