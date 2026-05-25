import React, { useEffect, useState } from "react";
import CateringAdminNavbar from "../../components/CateringAdminNavbar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import api from "../../utils/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#6A33AA", "#CCCCCC"];

const CateringAdmin = () => {
  const [catering, setCatering] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [filtering, setFiltering] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/catering-admin/analytics?branchId=all", { withCredentials: true });
      setCatering(res.data.catering);
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = async (e) => {
    const branchId = e.target.value;
    setSelectedBranch(branchId);
    setFiltering(true);
    try {
      const res = await api.get(`/catering-admin/analytics?branchId=${branchId}`, { withCredentials: true });
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setFiltering(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-650">Loading catering analytics...</div>;
  if (!catering) return <div className="p-10 text-center text-rose-600 font-bold">❌ Catering not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex">

      <main className="flex-1 p-8 pt-0 space-y-8">
        {/* Hero Section */}
        <div className="bg-cover bg-center h-52 md:h-72 flex items-center rounded-b-3xl shadow-lg"
            style={{
            backgroundImage: catering
              ? `url("/Gemini_Generated_Image_ay0h6xay0h6xay0h.png")`
              : "none",
          }}>
          <div className="bg-black/50 w-full h-full rounded-b-3xl flex items-center px-12">
            <img src={catering.logo || "/default-logo.png"} className="h-36 w-36 rounded-full border-4 border-white mr-6 object-cover shadow"/>
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-extrabold">{catering.name}</h2>
              <p className="mt-2 text-lg md:text-xl max-w-2xl font-medium">{catering.description}</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="space-y-6">
            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["today", "weekly", "monthly"].map((period, i) => (
                <div key={i} className="p-5 bg-white/70 backdrop-blur-md rounded-2xl text-center border border-white/50 shadow-md hover:scale-[1.01] transition-all">
                  <p className="font-extrabold text-sm text-slate-500 uppercase tracking-widest">
                    {period === "today" ? "Today" : period === "weekly" ? "This Week" : "This Month"}
                  </p>
                  <p className="text-3xl font-black text-slate-800 mt-2">₹{analytics.revenue[period].amount.toLocaleString("en-IN")}</p>
                  <p className={`text-xs font-bold mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                    analytics.revenue[period].percentageChange >= 0
                      ? "text-emerald-700 bg-emerald-500/10"
                      : "text-rose-700 bg-rose-500/10"
                  }`}>
                    {analytics.revenue[period].percentageChange >= 0 ? "▲" : "▼"} {Math.abs(analytics.revenue[period].percentageChange)}%
                  </p>
                </div>
              ))}
            </div>

            {/* Top Dishes */}
            <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/60 relative">
              {filtering && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex justify-center items-center z-10 rounded-2xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 border-b pb-4 border-slate-100">
                <h4 className="font-black text-lg text-slate-800 flex items-center gap-2">
                  🍽 Top Dishes
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Branch Filter:</span>
                  <select
                    value={selectedBranch}
                    onChange={handleBranchChange}
                    className="bg-white/80 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-xl text-xs focus:outline-none focus:border-green-500 transition-colors font-bold shadow-sm"
                  >
                    <option value="all">All Branches</option>
                    {analytics.branches && analytics.branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {analytics.topDishes.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-bold text-sm">
                  No orders or dishes logged for this branch selection.
                </div>
              ) : (
                <ul className="space-y-3">
                  {analytics.topDishes.map((dish, i) => (
                    <li key={i} className="flex justify-between items-center bg-white/60 border border-slate-100/80 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                      <span className="text-slate-800 font-extrabold text-sm">{i+1}. {dish.dish}</span>
                      <span className="text-emerald-600 font-black text-sm">{dish.count} orders</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pie Chart */}
            <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/60">
              <h4 className="font-black text-lg text-slate-800 mb-6 border-b pb-4 border-slate-100">📊 Top Branch Revenue Contribution</h4>
              <div className="w-full h-80 flex flex-col md:flex-row justify-center items-center gap-6">
                <div className="flex-1 w-full h-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.branchesPie}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {analytics.branchesPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CateringAdmin;
