import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import api from "../../utils/api";
import { 
  ArrowLeft, 
  Building, 
  DollarSign, 
  Award, 
  Users, 
  ShoppingBag, 
  Shield, 
  Mail, 
  TrendingUp,
  Activity,
  ChevronRight
} from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444", "#64748b"];

const CateringDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [catering, setCatering] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCateringAnalytics = async () => {
      try {
        const res = await api.get(`/admin/analytics/caterings/${id}`, { withCredentials: true });
        const { catering, analytics } = res.data;

        setCatering(catering);
        setAnalytics(analytics);
      } catch (err) {
        console.error("Error fetching catering analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCateringAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col items-center justify-center p-6">
        <div className="bg-white/45 backdrop-blur-xl border border-white/30 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!catering) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col items-center justify-center p-6 text-left">
        <div className="bg-white/45 backdrop-blur-xl border border-white/30 rounded-[2rem] p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <h3 className="text-xl font-black text-slate-900">❌ Catering Corporation Not Found</h3>
          <p className="text-xs font-semibold text-slate-500">The specified dining node provider does not exist or has been removed from the registry cluster.</p>
          <button 
            onClick={() => navigate("/admin")}
            className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            Return to operations control
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col">
      {/* Navbar wrapper */}
      <div className="fixed top-0 left-0 w-full z-50">
        <AdminNavbar />
      </div>

      <div className="pt-24 p-8 space-y-8 flex-grow">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2.5 bg-white/45 hover:bg-white/70 border border-white/30 rounded-2xl text-xs font-black text-slate-700 shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98] hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        {/* === HERO SECTION === */}
        <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start text-left">
          {/* Subtle Background Art */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-[10rem]"></div>
          
          {/* Logo container */}
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-[2rem] overflow-hidden bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center p-2 shrink-0">
            <img
              src={catering.logo || "/default-logo.png"}
              alt={catering.name}
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>

          {/* Details */}
          <div className="flex-grow space-y-4">
            <div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-xs font-black rounded-full border border-emerald-200 shadow-sm inline-flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Registered Corporation
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-950 mt-2 leading-tight tracking-tight">{catering.name}</h2>
              <p className="mt-2 text-sm text-slate-600 font-semibold max-w-2xl leading-relaxed">{catering.description || "Premium catering corporate provider servicing campus students and college faculty nodes."}</p>
            </div>

            {/* Admin Profile Details */}
            {catering.admin ? (
              <div className="p-4 bg-white/50 border border-white/40 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Manager Account</p>
                    <p className="text-xs font-black text-slate-900">{catering.admin.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Manager Email</p>
                    <p className="text-xs font-black text-slate-900 truncate">{catering.admin.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl max-w-lg text-xs font-bold text-amber-700">
                ⚠️ No manager is currently assigned to this catering service. Use the Admin controls on the main dashboard to link an admin account.
              </div>
            )}
          </div>
        </div>

        {/* === ANALYTICS SECTION === */}
        {analytics ? (
          <div className="space-y-8">
            
            {/* 1. Revenue Summaries (Chronological order: Today, Week, Month) */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-[2rem] p-8 shadow-xl text-left space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">💰 Revenue Analysis</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Chronological sales progression summary</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: "today", label: "Today", desc: "Logged sales today" },
                  { key: "weekly", label: "This Week", desc: "Logged sales past 7 days" },
                  { key: "monthly", label: "This Month", desc: "Logged sales past 30 days" }
                ].map((period) => (
                  <div key={period.key} className="bg-white/50 border border-slate-200/40 p-6 rounded-2xl shadow-sm space-y-2 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-[3rem]"></div>
                    
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{period.label}</p>
                    <p className="text-3xl font-black text-slate-950">₹{analytics.revenue[period.key].amount.toLocaleString("en-IN")}</p>
                    
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 font-semibold">{period.desc}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-0.5 ${
                        Number(analytics.revenue[period.key].percentageChange) >= 0
                          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200"
                          : "bg-rose-500/10 text-rose-700 border border-rose-200"
                      }`}>
                        {Number(analytics.revenue[period.key].percentageChange) >= 0 ? "▲" : "▼"} {Math.abs(Number(analytics.revenue[period.key].percentageChange))}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Split analytics detail grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left column: Top Dishes with progress volumes */}
              <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-[2rem] p-8 shadow-xl text-left space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">🍽️ High-Volume Dishes</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Top-selling menu items by volume</p>
                </div>

                <div className="space-y-4">
                  {analytics.topDishes.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-bold text-xs">
                      No dish order volume logged yet.
                    </div>
                  ) : (
                    analytics.topDishes.slice(0, 5).map((dish, idx) => {
                      const maxOrders = analytics.topDishes[0]?.count || 1;
                      const fillPercentage = (dish.count / maxOrders) * 100;
                      return (
                        <div key={idx} className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center font-bold text-slate-700">
                            <span className="font-black text-slate-950">{idx + 1}. {dish.dish}</span>
                            <span className="text-indigo-600 font-extrabold">{dish.count} orders</span>
                          </div>
                          
                          {/* Progress volume track */}
                          <div className="w-full h-3 bg-slate-100/80 rounded-full border overflow-hidden">
                            <div 
                              style={{ width: `${fillPercentage}%` }} 
                              className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full transition-all duration-1000"
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right column: Canteens branches lists & Pie chart */}
              <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-[2rem] p-8 shadow-xl text-left space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">📊 Canteen Contribution</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Branch contribution to corporation revenue</p>
                </div>

                {analytics.branches.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-bold text-xs">
                    No branch canteens currently operational.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Recharts Pie */}
                    <div className="w-full h-48 flex justify-center items-center">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={analytics.branchesPie}
                            dataKey="revenue"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={65}
                            innerRadius={30}
                            paddingAngle={2}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {analytics.branchesPie.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Canteen branches ledger */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {analytics.branches.map((branch) => (
                        <div key={branch._id} className="flex items-center bg-white/50 border border-slate-200/30 p-3.5 rounded-2xl shadow-sm">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-emerald-400/10 to-teal-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mr-3 font-bold">
                            🏢
                          </div>
                          <div className="min-w-0 flex-grow text-left">
                            <h5 className="font-black text-slate-900 text-xs truncate">{branch.name}</h5>
                            <p className="text-[11px] font-extrabold text-slate-600 mt-0.5">₹{(branch.revenue || 0).toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          // Skeleton loader
          <div className="space-y-6 text-left">
            <div className="h-44 bg-white/40 rounded-3xl animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-white/40 rounded-3xl animate-pulse"></div>
              <div className="h-64 bg-white/40 rounded-3xl animate-pulse"></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CateringDetails;
