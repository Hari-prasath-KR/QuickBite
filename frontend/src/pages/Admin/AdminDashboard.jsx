import React, { useEffect, useMemo, useState } from "react";
import {PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,} from "recharts";
import AdminNavbar from "../../components/AdminNavbar";
import api from "../../utils/api";
import CateringManagement from "./CateringManagement";
import CateringManagementSkeleton from "./CateringManagement"

// --- Reusable Icon and Card Components ---
const ArrowUpIcon = () => (
  <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const IncomeStatCard = ({ title, amount, percentageChange, comparisonText }) => {
  const isPositive = percentageChange >= 0;
  const formattedAmount = amount.toLocaleString("en-IN");

  return (
    <div className="flex flex-col">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">₹{formattedAmount}</p>
      <div className="flex items-center text-sm mt-2">
        <span
          className={`flex items-center font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
          {Math.abs(percentageChange)}%
        </span>
        <span className="text-gray-500 ml-1">{comparisonText}</span>
      </div>
    </div>
  );
};

const TotalIncomeSection = ({ stats }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm">
    <h4 className="text-xl font-extrabold text-gray-800 mb-4">📅 Total Revenue</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <IncomeStatCard
        title="This Week's Income"
        amount={stats?.weekly?.amount || 0}
        percentageChange={stats?.weekly?.percentageChange || 0}
        comparisonText="vs. last week"
      />
      <IncomeStatCard
        title="Today's Income"
        amount={stats?.today?.amount || 0}
        percentageChange={stats?.today?.percentageChange || 0}
        comparisonText="vs. yesterday"
      />
      <IncomeStatCard
        title="This Month's Income"
        amount={stats?.monthly?.amount || 0}
        percentageChange={stats?.monthly?.percentageChange || 0}
        comparisonText="vs. last month"
      />
    </div>
  </div>
);

// --- Skeleton Components ---
const TotalIncomeSkeleton = () => (
  <div className="bg-cyan-50 p-6 rounded-2xl shadow-sm animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
);

const RevenueCardSkeleton = () => (
  <div className="bg-white/90 p-6 rounded-2xl shadow-lg animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-3/4 mb-5"></div>
    <div className="grid grid-cols-2 gap-6">
      <div className="p-5 bg-gray-100 rounded-xl">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      </div>
      <div className="p-5 bg-gray-100 rounded-xl">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

const TopDishesSkeleton = () => (
  <div className="bg-white/90 p-6 rounded-2xl shadow-lg animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-1/2 mb-5"></div>
    <ul className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <li
          key={i}
          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
        >
          <div className="h-5 bg-gray-300 rounded w-2/3"></div>
          <div className="h-5 bg-gray-300 rounded w-1/4"></div>
        </li>
      ))}
    </ul>
  </div>
);

const PieChartSkeleton = () => (
  <div className="bg-white/90 p-6 rounded-2xl shadow-lg animate-pulse flex flex-col">
    <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="flex-grow w-full h-64 flex items-center justify-center">
      <div className="w-48 h-48 bg-gray-300 rounded-full"></div>
    </div>
    <div className="mt-6 grid grid-cols-2 gap-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
        >
          <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
          <div className="flex-grow space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white/90 p-6 rounded-2xl shadow-lg animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
    <div className="h-[250px] bg-gray-200 rounded-lg"></div>
  </div>
);

// --- Main Admin Dashboard Component ---
const AdminDashboard = () => {
  const [rev, setRev] = useState(null);
  const [topDishes, setTopDishes] = useState([]);
  const [revenuePer, setRevenuePer] = useState([]);
  const [incomeStats, setIncomeStats] = useState(null);

  // --- New state for CateringManagement ---
  const [catering, setCaterings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get("/admin/analytics/income-summary").then((r) => {
  console.log("Income summary response:", r.data);
  setIncomeStats(r.data);
});
      api.get("/admin/analytics/revenue-summary").then((r) => setRev(r.data));
      api.get("/admin/analytics/top-dishes?limit=5&period=30").then((r) =>
        setTopDishes(r.data)
      );
      api.get("/admin/analytics/revenue-per-catering?days=30").then((r) =>
        setRevenuePer(r.data)
      );

      // Fetch catering list
      const fetchCaterings = async () => {
    const res = await api.get("/caterings", { withCredentials: true });
    setCaterings(res.data);
    setLoading(false);
  };
   fetchCaterings();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const COLORS = [
    "#FFA000",
    "#FFB300",
    "#FFC107",
    "#FFCA28",
    "#FFD54F",
    "#FFEE58",
    "#9E9E9E",
  ];

  const pieChartData = useMemo(() => {
    if (revenuePer.length === 0) return [];
    if (revenuePer.length <= 6) {
      return revenuePer;
    }
    const top6 = revenuePer.slice(0, 6);
    const otherRevenue = revenuePer
      .slice(6)
      .reduce((acc, curr) => acc + curr.revenue, 0);

    return [...top6, { name: "Other", revenue: otherRevenue, cateringId: "other" }];
  }, [revenuePer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white">
      <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
        <AdminNavbar />
      </div>

      <div className="pt-24 p-8">
        {/* === TOTAL INCOME SECTION === */}
        <div className="mb-8">
          {incomeStats ? (
            <TotalIncomeSection stats={incomeStats} />
          ) : (
            <TotalIncomeSkeleton />
          )}
        </div>

        {/* === HISTORICAL TRENDS (GRAPHS) === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {revenuePer.length > 0 ? (
            <>
              <div className="bg-white/90 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
                <h4 className="text-xl font-extrabold text-gray-800 mb-4">
                  📅 Weekly Revenue
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenuePer.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#34D399"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/90 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
                <h4 className="text-xl font-extrabold text-gray-800 mb-4">
                  📆 Monthly Revenue
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenuePer}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          )}
        </div>

        {/* === KEY METRICS & BREAKDOWNS === */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top-Left Section */}
          <div className="space-y-8">
            {/* Revenue Card */}
            {rev ? (
              <div className="bg-white/90 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
                <h3 className="text-xl font-extrabold text-gray-800">
                  💰 Revenue / Orders
                </h3>
                <div className="mt-5 grid grid-cols-2 gap-6">
                  <div className="p-5 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-sm">
                    <div className="text-sm text-gray-600">Today Revenue</div>
                    <div className="text-3xl font-bold text-green-700">
                      ₹{rev.today.totalRevenue || 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      Orders: {rev?.today?.orderCount || 0}
                    </div>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl shadow-sm">
                    <div className="text-sm text-gray-600">Yesterday Revenue</div>
                    <div className="text-3xl font-bold text-yellow-700">
                      ₹{rev.yesterday.totalRevenue || 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      Orders: {rev?.yesterday?.orderCount || 0}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <RevenueCardSkeleton />
            )}

            {/* Top Dishes */}
            {topDishes.length > 0 ? (
              <div className="bg-white/90 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
                <h3 className="text-xl font-extrabold text-gray-800">🍽 Top Dishes</h3>
                <ul className="mt-5 space-y-3">
                  {topDishes.map((d, i) => (
                    <li
                      key={d.dish}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <span className="font-medium text-gray-700">
                        {i + 1}. {d.dish}
                      </span>
                      <span className="font-semibold text-indigo-600">
                        {d.count} orders
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <TopDishesSkeleton />
            )}
          </div>

          {/* Top-Right Section */}
          {revenuePer.length > 0 ? (
            <div className="bg-white/90 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition flex flex-col">
              <h3 className="text-xl font-extrabold text-gray-800">
                📊 Top Caterer Revenue
              </h3>
              <div className="flex-grow w-full h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {revenuePer.slice(0, 6).map((r) => (
                  <div
                    key={r.cateringId}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <img
                      src={r.logo}
                      alt={r.name}
                      className="h-10 w-10 object-cover rounded-full border"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-700">
                        {r.name}
                      </div>
                      <div className="text-xs text-gray-500">₹{r.revenue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <PieChartSkeleton />
          )}
        </div>

        {/* === MANAGE CATERING SECTION === */}
       <div className="mt-12">
          {loading ? (
            <CateringManagementSkeleton />
          ) : (
            <CateringManagement loading={loading} catering={catering} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
