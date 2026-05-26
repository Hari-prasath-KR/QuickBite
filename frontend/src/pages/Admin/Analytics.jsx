import React, { useEffect, useMemo, useState } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import AdminNavbar from "../../components/AdminNavbar";
import api from "../../utils/api";
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Utensils, 
  Calendar, 
  Award, 
  Building,
  ShieldAlert
} from "lucide-react";

// --- Income Stat Card ---
const IncomeCard = ({ title, amount, percentageChange, comparisonText, colorClass }) => {
  const isPositive = percentageChange >= 0;
  
  return (
    <div className="bg-white/45 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-md hover:shadow-lg transition duration-300 text-left flex justify-between items-start">
      <div className="space-y-1.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
        <p className="text-3xl font-black text-slate-900">₹{amount.toLocaleString("en-IN")}</p>
        <div className="flex items-center text-xs font-bold text-slate-500 mt-1">
          <span className={`flex items-center gap-0.5 font-extrabold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(percentageChange).toFixed(1)}%
          </span>
          <span className="ml-1">{comparisonText}</span>
        </div>
      </div>
      <div className={`p-2.5 rounded-xl ${colorClass} border`}>
        <DollarSign className="w-5 h-5" />
      </div>
    </div>
  );
};

// --- Custom Skeletons ---
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white/45 border border-white/20 p-6 rounded-3xl h-28 flex justify-between">
        <div className="space-y-3 w-2/3">
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
      </div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white/45 border border-white/25 rounded-3xl p-6 shadow-md animate-pulse h-80 flex flex-col justify-between">
    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
    <div className="h-48 bg-slate-100 rounded-2xl w-full"></div>
    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
  </div>
);

const Analytics = () => {
  const [rev, setRev] = useState(null);
  const [topDishes, setTopDishes] = useState([]);
  const [revenuePer, setRevenuePer] = useState([]);
  const [incomeStats, setIncomeStats] = useState(null);
  
  const [caterers, setCaterers] = useState([]);
  const [selectedCatering, setSelectedCatering] = useState("all");
  
  const [loading, setLoading] = useState(true);
  const [loadingDishes, setLoadingDishes] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [incomeRes, revenueRes, dishesRes, revPerCateringRes, caterersRes] = await Promise.all([
        api.get("/admin/analytics/income-summary"),
        api.get("/admin/analytics/revenue-summary"),
        api.get("/admin/analytics/top-dishes?limit=5&period=30"),
        api.get("/admin/analytics/revenue-per-catering?days=30"),
        api.get("/caterings")
      ]);

      setIncomeStats(incomeRes.data);
      setRev(revenueRes.data);
      setTopDishes(dishesRes.data);
      setRevenuePer(revPerCateringRes.data);
      setCaterers(caterersRes.data);
    } catch (err) {
      console.error("Failed to load business intelligence analytics metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCateringChange = async (e) => {
    const cateringId = e.target.value;
    setSelectedCatering(cateringId);
    setLoadingDishes(true);
    try {
      const res = await api.get(`/admin/analytics/top-dishes?limit=5&period=30&cateringId=${cateringId}`);
      setTopDishes(res.data);
    } catch (err) {
      console.error("Failed to filter dishes:", err);
    } finally {
      setLoadingDishes(false);
    }
  };

  const PIE_COLORS = [
    "#10B981", // Emerald
    "#3B82F6", // Blue
    "#F59E0B", // Amber
    "#EF4444", // Rose
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#64748B"  // Slate
  ];

  const pieChartData = useMemo(() => {
    if (revenuePer.length === 0) return [];
    if (revenuePer.length <= 5) return revenuePer;
    
    const top5 = revenuePer.slice(0, 5);
    const otherRevenue = revenuePer.slice(5).reduce((sum, item) => sum + item.revenue, 0);
    return [...top5, { name: "Other", revenue: otherRevenue, cateringId: "other" }];
  }, [revenuePer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col">
      {/* Fixed top Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <AdminNavbar />
      </div>

      <div className="pt-24 p-8 space-y-8 flex-grow">
        
        {/* === TITLE HERO BLOCK === */}
        <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl text-left space-y-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-xs font-black rounded-full border border-emerald-200 shadow-sm flex items-center gap-1 w-fit">
            <TrendingUp className="w-3.5 h-3.5" /> Platform Intelligence
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
            Financial & Sales Analytics
          </h1>
          <p className="text-slate-700 text-sm font-semibold max-w-2xl">
            Analyze campus dining transaction volumes, evaluate monthly/weekly sales timelines, inspect dishes velocity, and track caterer revenue shares.
          </p>
        </div>

        {/* === REVENUE TOTAL CHRONOLOGY SUMMARY === */}
        {loading || !incomeStats ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <IncomeCard
              title="Today's Total Sales"
              amount={incomeStats.today?.amount || 0}
              percentageChange={incomeStats.today?.percentageChange || 0}
              comparisonText="vs. yesterday"
              colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-inner"
            />
            <IncomeCard
              title="This Week's Sales"
              amount={incomeStats.weekly?.amount || 0}
              percentageChange={incomeStats.weekly?.percentageChange || 0}
              comparisonText="vs. last week"
              colorClass="bg-blue-500/10 border-blue-500/20 text-blue-600 shadow-inner"
            />
            <IncomeCard
              title="This Month's Sales"
              amount={incomeStats.monthly?.amount || 0}
              percentageChange={incomeStats.monthly?.percentageChange || 0}
              comparisonText="vs. last month"
              colorClass="bg-yellow-500/10 border-yellow-500/20 text-yellow-600 shadow-inner"
            />
          </div>
        )}

        {/* === RECHARTS REVENUE TIMELINE GRAPHS === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading || revenuePer.length === 0 ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Weekly Trend Graph */}
              <div className="bg-white/45 backdrop-blur-xl border border-white/30 p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition duration-300">
                <h4 className="text-lg font-black text-slate-900 tracking-tight text-left mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  Weekly Revenue Trend (Last 7 Records)
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenuePer.slice(0, 7)}>
                    <defs>
                      <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={10} stroke="#64748b" tickLine={false} />
                    <YAxis fontSize={10} stroke="#64748b" tickLine={false} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ background: "rgba(255, 255, 255, 0.9)", border: "1px solid #e2e8f0", borderRadius: "1rem", fontWeight: "bold", fontSize: "11px" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWeekly)" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Trend Graph */}
              <div className="bg-white/45 backdrop-blur-xl border border-white/30 p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition duration-300">
                <h4 className="text-lg font-black text-slate-900 tracking-tight text-left mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Monthly Performance Trend
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenuePer}>
                    <defs>
                      <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={10} stroke="#64748b" tickLine={false} />
                    <YAxis fontSize={10} stroke="#64748b" tickLine={false} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ background: "rgba(255, 255, 255, 0.9)", border: "1px solid #e2e8f0", borderRadius: "1rem", fontWeight: "bold", fontSize: "11px" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMonthly)" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* === BOTTOM MARKET SHARE & TOP DISHES GRID === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Dishes Component */}
          <div className="bg-white/45 backdrop-blur-xl border border-white/30 p-8 rounded-[2rem] shadow-xl text-left relative min-h-[350px] flex flex-col justify-between">
            {loadingDishes && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex justify-center items-center z-10 rounded-[2rem]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            )}
            
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-emerald-500" />
                    🍽 Top Dishes
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">High velocity menu choices</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Caterer:</span>
                  <select
                    value={selectedCatering}
                    onChange={handleCateringChange}
                    className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-green-500 shadow-sm cursor-pointer"
                  >
                    <option value="all">All Caterers</option>
                    {caterers && caterers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3 animate-pulse mt-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded-xl"></div>
                  ))}
                </div>
              ) : topDishes.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-bold text-xs border border-dashed border-slate-200 rounded-2xl">
                  <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-350" />
                  No order metrics or dishes found for this selection.
                </div>
              ) : (
                <ul className="space-y-3 mt-4">
                  {topDishes.map((d, i) => (
                    <li
                      key={d.dish}
                      className="flex justify-between items-center p-3 bg-white/50 hover:bg-white border border-slate-200/40 rounded-2xl transition shadow-sm"
                    >
                      <span className="font-extrabold text-xs text-slate-800">
                        {i + 1}. {d.dish}
                      </span>
                      <span className="font-black text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 shadow-sm">
                        {d.count} orders
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Caterer Revenue Market Share (Donut Recharts) */}
          <div className="bg-white/45 backdrop-blur-xl border border-white/30 p-8 rounded-[2rem] shadow-xl text-left flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                📊 Top Caterer Revenue Share
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Platform market share breakdown</p>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center animate-pulse mt-4">
                <div className="w-44 h-44 bg-slate-100 rounded-full"></div>
              </div>
            ) : revenuePer.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-bold text-xs border border-dashed border-slate-200 rounded-2xl mt-4">
                <Building className="w-8 h-8 mx-auto mb-2 text-slate-350" />
                No sales data log currently available.
              </div>
            ) : (
              <>
                <div className="w-full h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ background: "rgba(255, 255, 255, 0.9)", border: "1px solid #e2e8f0", borderRadius: "1rem", fontWeight: "bold", fontSize: "11px" }} />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  {revenuePer.slice(0, 6).map((r, i) => (
                    <div
                      key={r.cateringId}
                      className="flex items-center gap-3 p-2.5 bg-white/50 hover:bg-white border border-slate-200/40 rounded-2xl shadow-sm transition"
                    >
                      <img
                        src={r.logo || "/default-logo.png"}
                        alt={r.name}
                        className="h-9 w-9 object-cover rounded-xl border border-slate-200/30"
                      />
                      <div className="text-left overflow-hidden">
                        <div className="text-[10px] font-black text-slate-800 truncate">
                          {r.name}
                        </div>
                        <div className="text-[11px] font-bold text-emerald-600">₹{r.revenue.toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Analytics;
