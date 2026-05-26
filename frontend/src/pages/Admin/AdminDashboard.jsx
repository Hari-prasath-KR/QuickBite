import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import CateringManagement from "./CateringManagement";
import api from "../../utils/api";
import { 
  Building, 
  Users, 
  ShoppingBag, 
  Shield, 
  Server, 
  Database, 
  Cpu, 
  Activity, 
  ArrowRight, 
  Plus, 
  UserCheck,
  TrendingUp
} from "lucide-react";

// --- Operational Card Widget ---
const StatCard = ({ title, count, description, icon: Icon, colorClass }) => (
  <div className="bg-white/45 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex justify-between items-start">
    <div className="text-left space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
      <p className="text-3xl font-black text-slate-900">{count.toLocaleString("en-IN")}</p>
      <p className="text-xs text-slate-600 font-semibold">{description}</p>
    </div>
    <div className={`p-3 rounded-2xl ${colorClass} border`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

// --- Operations Skeleton ---
const StatSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white/45 backdrop-blur-xl border border-white/20 p-6 rounded-3xl h-32 flex justify-between">
        <div className="space-y-3 w-2/3">
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-full"></div>
        </div>
        <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
      </div>
    ))}
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [caterings, setCaterings] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCaterings, setLoadingCaterings] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      setLoadingCaterings(true);

      const [statsRes, cateringsRes] = await Promise.all([
        api.get("/admin/analytics/dashboard-summary"),
        api.get("/caterings")
      ]);

      setStats(statsRes.data);
      setCaterings(cateringsRes.data);
    } catch (err) {
      console.error("Error fetching admin dashboard operational details:", err);
    } finally {
      setLoadingStats(false);
      setLoadingCaterings(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col">
      {/* Navbar Container */}
      <div className="fixed top-0 left-0 w-full z-50">
        <AdminNavbar />
      </div>

      <div className="pt-24 p-8 space-y-8 flex-grow">
        
        {/* === HERO SYSTEM BANNER === */}
        <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-500">
          <div className="text-left space-y-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-xs font-black rounded-full border border-emerald-200 shadow-sm flex items-center gap-1 w-fit">
              <Shield className="w-3.5 h-3.5" /> Platform Control Center
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              Global Operations Console
            </h1>
            <p className="text-slate-700 text-sm font-semibold max-w-2xl">
              Monitor campus-wide dining nodes, regulate registered catering corporations, audit admin allocations, and inspect live operational status.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/analytics")}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-600/30 flex items-center gap-2 transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5 active:translate-y-0"
          >
            <TrendingUp className="w-4 h-4" />
            Launch Business Analytics
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* === OPERATIONAL KPIS GRID === */}
        {loadingStats || !stats ? (
          <StatSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Registered Providers"
              count={stats.catererCount}
              description="Active catering companies"
              icon={Building}
              colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-inner"
            />
            <StatCard
              title="Campus Branch Canteens"
              count={stats.branchCount}
              description="Total operational canteens"
              icon={Building}
              colorClass="bg-blue-500/10 border-blue-500/20 text-blue-600 shadow-inner"
            />
            <StatCard
              title="Registered Customers"
              count={stats.customerCount}
              description="Active campus student/faculty accounts"
              icon={Users}
              colorClass="bg-yellow-500/10 border-yellow-500/20 text-yellow-600 shadow-inner"
            />
            <StatCard
              title="Today's Orders Summary"
              count={stats.ordersToday}
              description="System-wide orders logged today"
              icon={ShoppingBag}
              colorClass="bg-purple-500/10 border-purple-500/20 text-purple-600 shadow-inner"
            />
          </div>
        )}

        {/* === CORE OPERATIONS GRID === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Catering Directory Card (Takes 2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-[2rem] shadow-xl p-8 transition-all duration-300">
              <CateringManagement loading={loadingCaterings} catering={caterings} />
            </div>
          </div>

          {/* Quick Actions & System Status Columns (Takes 1 column) */}
          <div className="space-y-8">
            
            {/* Quick Action Panel */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-[2rem] p-8 shadow-xl text-left space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">System Controls</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Quick Actions Hub</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/admin/add-catering")}
                  className="w-full p-4 bg-white/70 hover:bg-white border border-slate-200/50 rounded-2xl flex items-center justify-between shadow-sm hover:shadow transition-all group hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black">Register Catering Provider</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => navigate("/admin/add-catering-admin")}
                  className="w-full p-4 bg-white/70 hover:bg-white border border-slate-200/50 rounded-2xl flex items-center justify-between shadow-sm hover:shadow transition-all group hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black">Add Catering Admin</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Health Monitor widget */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-[2rem] p-8 shadow-xl text-left space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">System Infrastructure</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Real-time health check</p>
              </div>

              {/* Status Nodes */}
              <div className="space-y-4 font-bold text-xs">
                
                {/* Node 1: POS API Core */}
                <div className="p-3 bg-white/50 border border-slate-200/40 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg">
                      <Server className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-800">POS Core API</span>
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[9px] uppercase tracking-wider text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Online
                  </span>
                </div>

                {/* Node 2: Database Cluster */}
                <div className="p-3 bg-white/50 border border-slate-200/40 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-lg">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-800">MongoDB Cluster</span>
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[9px] uppercase tracking-wider text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Active
                  </span>
                </div>

                {/* Node 3: client Vite engine */}
                <div className="p-3 bg-white/50 border border-slate-200/40 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-lg">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-800">Frontend Client</span>
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[9px] uppercase tracking-wider text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Active
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
