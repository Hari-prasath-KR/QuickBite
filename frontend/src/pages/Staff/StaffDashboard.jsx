import React, { useState, useEffect } from "react";
import StaffNavbar from "../../components/StaffNavbar";
import BottomNav from "./BottomNav";
import axios from "axios";

// --- Icons ---
const ClockIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0
      11-18 0 9 9 0 0118 0z" />
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

// --- Components ---
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

const RecentOrders = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
        <p className="text-gray-500">No recent orders to display.</p>
      </div>
    );
  }

  const getStatusClass = (status) =>
    status.toLowerCase().includes("completed")
      ? "text-green-600"
      : "text-yellow-600";

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
        <a href="#" className="text-sm text-green-600 hover:underline">
          View all
        </a>
      </div>

      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search recent orders"
          className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
      </div>

      <ul className="space-y-3">
        {orders.map((order, index) => (
          <li
            key={order._id || index}
            className="flex flex-wrap justify-between items-center p-3 bg-gray-50 rounded-md transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <div className="w-10 h-10 bg-yellow-400 rounded-md flex items-center justify-center font-bold text-white">
                {order.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{order.name}</p>
                <p className="text-xs text-gray-500">{order.items} items</p>
              </div>
            </div>
            <div className="text-center my-2 sm:my-0">
              <span className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-full">
                Table: {order.table || "N/A"}
              </span>
            </div>
            <div
              className={`flex items-center space-x-2 text-sm font-semibold ${getStatusClass(order.status)}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${getStatusClass(order.status).replace(
                  "text-",
                  "bg-"
                )}`}
              ></span>
              <span>{order.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PopularDishes = ({ dishes }) => {
    if (!dishes || dishes.length === 0) {
        return (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Dishes</h2>
            <p className="text-gray-500">Not enough data for popular dishes yet.</p>
          </div>
        );
    }

    return(
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Popular Dishes</h2>
                <a href="#" className="text-sm text-green-600 hover:underline">
                View all
                </a>
            </div>

            <ul className="space-y-4">
                {dishes.map((dish, index) => (
                <li key={index} className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-gray-400 w-6">
                    {String(index + 1).padStart(2, "0")}
                    </span>
                    <img
                    src={dish.imageUrl || `https://placehold.co/40x40/FBBF24/FFFFFF?text=${dish.name.charAt(0)}`}
                    alt={dish.name}
                    className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                    <p className="font-semibold text-gray-800">{dish.name}</p>
                    <p className="text-xs text-gray-500">Orders: {dish.orders}</p>
                    </div>
                </li>
                ))}
            </ul>
        </div>
    );
};

// --- Main Dashboard ---
const StaffDashboard = () => {
  const [time, setTime] = useState(new Date());

  // State for dynamic data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for dashboard numbers
  const [stats, setStats] = useState({ totalEarnings: 0, inProgress: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);

  // Clock timer
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedDate = time.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const userRes = await axios.get("/api/auth/profile", { withCredentials: true });
        setUser(userRes.data); 
        const bId = userRes.data.branchId;

        if (bId) {
          const dashboardRes = await axios.get(`/api/branch-analystics/${bId}/dashboard`);
          const apiPayload = dashboardRes.data.data || dashboardRes.data;

          setStats(apiPayload.stats || { totalEarnings: 0, inProgress: 0 });
          setRecentOrders(apiPayload.recentOrders || []);
          setPopularDishes(apiPayload.popularDishes || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        setError("Could not load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Runs only once on component mount

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white text-gray-800 font-sans">
      
      <StaffNavbar 
        userName={user?.name || "Staff"} 
        userRole={user?.role || "Staff"} 
      />

      {/* Navbar space */}
      <div className="pt-20 pb-20">

        {/* Loading State */}
        {loading && (
          <div className="text-center p-10">
            <p className="text-lg font-semibold text-gray-700">Loading dashboard...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center p-10">
            <p className="text-lg font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && user && ( 
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left + Center */}
              <div className="lg:col-span-2 space-y-8">
                <header className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Good Morning, {user?.name || 'Staff'}
                    </h1>
                    <p className="text-gray-600">
                      Give your best services for customers 😊
                    </p>
                  </div>
                  <div className="text-right bg-white p-3 rounded-lg shadow-md">
                    <p className="text-3xl font-mono tracking-wide text-gray-800">
                      {time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                  </div>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <StatCard
                    title="Total Earnings"
                    value={`₹${stats.totalEarnings.toFixed(2)}`}
                    change={stats.earningsChange || "vs Yesterday"}
                    icon={<CurrencyDollarIcon className="h-6 w-6" />}
                    iconBgColor="bg-green-500"
                  />
                  <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    change={stats.inProgressChange || "vs Yesterday"}
                    icon={<ClockIcon className="h-6 w-6" />}
                    iconBgColor="bg-yellow-500"
                  />
                </div>

                {/* Recent Orders */}
                <RecentOrders orders={recentOrders} />
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-1">
                <PopularDishes dishes={popularDishes} />
              </div>
            </div>
          </main>
        )} 
      </div>
      <BottomNav />
    </div>
  );
};

export default StaffDashboard;