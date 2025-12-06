import React, { useState, useEffect } from "react";
import StaffNavbar from "../../components/StaffNavbar"; // Import your separate StaffNavbar
import BottomNav from "./BottomNav"; // Import your separate BottomNav
import axios from "axios";

const ClockIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0
      11-18 0 9 0 0118 0z" />
  </svg>
);

const CurrencyDollarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 6v12m-3-2.818l.879.659c1.171.879
      3.07.879 4.242 0 1.172-.879
      1.172-2.303 0-3.182C13.536
      12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303
      0-3.182s2.9-.879 4.006 0l.415.33M21
      12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MagnifyingGlassIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5
      7.5 0 105.196 5.196a7.5 7.5
      0 0010.607 10.607z" />
  </svg>
);

const XMarkIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StatCard = ({ title, value, change, icon, iconBgColor }) => (
  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <h3 className="text-gray-600">{title}</h3>
        <p className="text-4xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-green-600 font-semibold">{change}</p>
      </div>
      <div className={`p-3 rounded-md text-white ${iconBgColor}`}>
        {icon}
      </div>
    </div>
  </div>
);

const OrderStatusModal = ({ order, onClose, onStatusUpdated }) => {
  const statusOptions = [
    "Pending",
    "In Progress",
    "Ready for Service",
    "Completed",
    "Cancelled"
  ];

  const [newStatus, setNewStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (String(status).toLowerCase()) {
      case "pending": return "bg-red-200 text-red-800 border-red-400";
      case "in progress": return "bg-yellow-200 text-yellow-800 border-yellow-400";
      case "ready for service": return "bg-blue-200 text-blue-800 border-blue-400";
      case "completed": return "bg-green-200 text-green-800 border-green-400";
      case "cancelled": return "bg-gray-200 text-gray-800 border-gray-400";
      default: return "bg-gray-200 text-gray-800 border-gray-400";
    }
  };

  const normalizeStatusForApi = (label) => label.toLowerCase();

  const handleSave = async () => {
    setLoading(true);
    try {
     
      const payloadStatus = normalizeStatusForApi(newStatus);
      const res = await axios.put(
        `http://localhost:5001/api/order/${order._id}/status`,
        { status: payloadStatus },
        { withCredentials: true }
      );

      console.log("Status Updated:", res.data);

      
      if (onStatusUpdated) onStatusUpdated(order._id, newStatus);
      onClose();
    } catch (err) {
      console.error("Error updating status", err);
      alert("Failed to update status. Check backend or network.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setNewStatus(order.status);
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-4">
      <div className="bg-white/90 rounded-2xl shadow-2xl border border-gray-300 w-full max-w-4xl overflow-hidden flex flex-col animate-fadeIn">
        <div className="p-6 border-b bg-gradient-to-r from-yellow-500 to-yellow-600 flex justify-between items-center text-white">
          <h2 className="text-2xl font-extrabold">Order Details • Table {order.table || "N/A"}</h2>
          <button onClick={onClose} className="hover:scale-110 transition">
            <XMarkIcon className="h-7 w-7 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 flex-grow overflow-y-auto">
          <div className="md:col-span-2 p-6 border-r">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Items Ordered ({order.items?.length || 0})</h3>

            <ul className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-100 rounded-lg p-3 shadow-sm">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <div className="flex items-center space-x-6">
                      <span className="text-sm font-semibold text-gray-700">x{item.quantity}</span>
                      <span className="font-bold text-green-700 text-lg">
                        ₹{item.price ? (item.price * item.quantity).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-center mt-5">No items found for this order.</p>
              )}
            </ul>
          </div>

          <div className="md:col-span-1 p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Current Status</h3>
              <span className={`text-lg font-bold px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">Change Status To</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white shadow focus:ring-2 focus:ring-yellow-500 outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={newStatus === order.status || loading}
              className={`w-full py-3 rounded-xl font-bold tracking-wide transition-all duration-200 ${
                newStatus === order.status || loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg"
              }`}
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentOrders = ({ orders, onOrderClick }) => {
  const [showAll, setShowAll] = useState(false);
  const displayOrders = showAll ? orders : orders.slice(0, 5);

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
        <p className="text-gray-500">No recent orders to display.</p>
      </div>
    );
  }

  const getStatusClass = (status) =>
    String(status).toLowerCase().includes("completed")
      ? "text-green-600 bg-green-100"
      : String(status).toLowerCase().includes("pending")
      ? "text-red-600 bg-red-100"
      : "text-yellow-600 bg-yellow-100";

  const handleViewToggle = (e) => {
    e.preventDefault();
    setShowAll(prev => !prev);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
        {orders.length > 5 && (
          <button onClick={handleViewToggle} className="text-sm text-green-600 hover:underline font-semibold">
            {showAll ? "View less" : "View all"}
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input type="text" placeholder="Search recent orders" className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
      </div>

      <ul className="space-y-3">
        {displayOrders.map((order, index) => (
          <li
            key={order._id || index}
            onClick={() => onOrderClick(order)}
            className="flex flex-wrap justify-between items-center p-3 bg-gray-50 rounded-md transition-colors hover:bg-yellow-100/50 cursor-pointer border border-gray-200"
          >
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <div className="w-10 h-10 bg-yellow-400 rounded-md flex items-center justify-center font-bold text-white shadow-md">
                {order.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{order.name}</p>
                <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
              </div>
            </div>

            <div className={`flex items-center space-x-2 text-sm font-semibold px-3 py-1 rounded-full ${getStatusClass(order.status)}`}>
              <span>{order.status}</span>
            </div>
          </li>
        ))}
      </ul>

      {orders.length > 5 && !showAll && (
        <div className="text-center mt-4">
          <button onClick={handleViewToggle} className="text-sm text-green-600 hover:underline font-semibold">
            Show {orders.length - 5} more orders...
          </button>
        </div>
      )}
    </div>
  );
};
const PopularDishes = ({ dishes }) => {
  // Common classes defined for clarity
  const cardClasses = "bg-white border border-gray-200 p-6 rounded-xl shadow-lg h-full";
  const headingClasses = "text-xl font-bold text-gray-900";
  const viewAllClasses = "text-sm text-blue-600 hover:underline"; // Blue link for light theme
  const rankNumberClasses = "text-lg font-bold text-gray-400 w-6";
  const dishNameClasses = "font-semibold text-gray-800";
  const ordersClasses = "text-xs text-gray-500";
  const listItemClasses = "flex items-center space-x-4";

  if (!dishes || dishes.length === 0) {
    return (
      // Light theme styling for the empty state
      <div className={cardClasses}>
        <h2 className={headingClasses + " mb-4"}>Popular Dishes</h2>
        <p className={ordersClasses}>Not enough data for popular dishes yet.</p>
      </div>
    );
  }

  return (
    // Main card container set to white background and light border/shadow
    <div className={cardClasses}>
      <div className="flex justify-between items-center mb-4">
        {/* Dark text for the main heading */}
        <h2 className={headingClasses}>Popular Dishes</h2>
        {/* Standard link color */}
        <a href="#" className={viewAllClasses}>View all</a>
      </div>
      <ul className="space-y-4">
        {dishes.map((dish, index) => (
          // List item structure matching the image's layout
          <li key={index} className={listItemClasses}>
            {/* Faded gray text for the rank number */}
            <span className={rankNumberClasses}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <img 
              src={dish.imageUrl || `https://placehold.co/40x40/FBBF24/FFFFFF?text=${dish.name.charAt(0)}`} 
              alt={dish.name} 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div>
              <p className={dishNameClasses}>{dish.name}</p>
              <p className={ordersClasses}>Orders: {dish.orders}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const StaffDashboard = () => {
  const [time, setTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalEarnings: 0, inProgress: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedDate = time.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  
  const handleUpdateOrderStatus = async (orderId, newStatusLabel) => {
    setRecentOrders(prev =>
      prev
        .map(order => (order._id === orderId ? { ...order, status: newStatusLabel } : order))
        .filter(order => {
          const s = String(order.status).toLowerCase();
          return s !== "completed" && s !== "cancelled";
        })
    );

    setSelectedOrder(null);

    const payloadStatus = String(newStatusLabel).toLowerCase();

    try {
      await axios.put(`http://localhost:5001/api/order/${orderId}/status`, { status: payloadStatus }, { withCredentials: true });
    } catch (err) {
      console.error("Error updating order status", err);
      alert("Failed to update order status. Please check the network and try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const userRes = await axios.get("http://localhost:5001/api/auth/profile", { withCredentials: true });
        const u = userRes.data.data || userRes.data;
        setUser(u);
        const bId = u.branchId;

        if (bId) {
          const dashboardRes = await axios.get(`http://localhost:5001/api/branch-analystics/${bId}/dashboard`, { withCredentials: true });
          const apiPayload = dashboardRes.data.data || dashboardRes.data;

          const filteredRecent = (apiPayload.recentOrders || []).filter(o => {
            const s = String(o.status || "").toLowerCase();
            return s !== "completed" && s !== "cancelled";
          }).reverse();

          setStats(apiPayload.stats || { totalEarnings: 0, inProgress: 0 });
          setRecentOrders(filteredRecent);
          setPopularDishes(apiPayload.popularDishes || []);
        } else {
          console.error("Branch ID not found in user data");
          setError("Branch ID not found in user data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        setError("Could not load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
  const hour = time.getHours();

  if (hour >= 5 && hour < 12) return "Good Morning!!";
  if (hour >= 12 && hour < 17) return "Good Afternoon!!";
  if (hour >= 17 && hour < 21) return "Good Evening!!";
  return "Hello!!";
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white text-gray-800 font-sans">
      <StaffNavbar userName={user?.name || "Staff"} userRole={user?.role || "Staff"} />

      <div className="pt-20 pb-20">
        {loading && <div className="text-center p-10"><p className="text-lg font-semibold text-gray-700">Loading dashboard...</p></div>}
        {error && <div className="text-center p-10"><p className="text-lg font-semibold text-red-600">{error}</p></div>}

        {!loading && !error && user && (
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <header className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white">{getGreeting()}, {user?.name || "Staff"}</h1>
                    <p className="text-gray-600">Give your best services for customers 😊</p>
                  </div>
                  <div className="text-right bg-white p-3 rounded-lg shadow-md">
                    <p className="text-3xl font-mono tracking-wide text-gray-800">{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                  </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toFixed(2)}`} change={stats.earningsChange || "vs Yesterday"} icon={<CurrencyDollarIcon className="h-6 w-6" />} iconBgColor="bg-green-500" />
                  <StatCard title="In Progress" value={stats.inProgress} change={stats.inProgressChange || "vs Yesterday"} icon={<ClockIcon className="h-6 w-6" />} iconBgColor="bg-yellow-500" />
                </div>

                <RecentOrders orders={recentOrders} onOrderClick={setSelectedOrder} />
              </div>

              <div className="lg:col-span-1">
                <PopularDishes dishes={popularDishes} />
              </div>
            </div>
          </main>
        )}
      </div>

      <BottomNav />

      {selectedOrder && (
        <OrderStatusModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusUpdated={handleUpdateOrderStatus} />
      )}
    </div>
  );
};

export default StaffDashboard;
