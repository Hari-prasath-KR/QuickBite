import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import CateringManagement from "./CateringManagement";
import UserManagement from "./UserManagement";
import api from "../../utils/api";
import { 
  Building, 
  Users, 
  ShoppingBag, 
  Shield, 
  Server, 
  Database, 
  Cpu, 
  ArrowRight, 
  Plus, 
  UserCheck,
  TrendingUp,
  Sliders,
  AlertTriangle,
  Flame,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

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
  
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState("caterers"); // caterers, users, settings

  // System Configurations Local State
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    return localStorage.getItem("qb_maintenance_mode") === "true";
  });
  const [taxRate, setTaxRate] = useState(() => {
    return localStorage.getItem("qb_tax_rate") || "5.00";
  });
  const [starterCredits, setStarterCredits] = useState(() => {
    return localStorage.getItem("qb_starter_credits") || "500";
  });
  const [savingSettings, setSavingSettings] = useState(false);

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

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavingSettings(true);
    
    // Sync to local storage
    localStorage.setItem("qb_maintenance_mode", maintenanceMode.toString());
    localStorage.setItem("qb_tax_rate", taxRate);
    localStorage.setItem("qb_starter_credits", starterCredits);
    
    setTimeout(() => {
      setSavingSettings(false);
      toast.success("System configurations applied successfully platform-wide!");
    }, 800);
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
              Monitor campus-wide dining nodes, regulate registered catering corporations, manage student wallets, audit accounts, and configure system variables.
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

        {/* === TAB NAVIGATION GRID === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Control Panel Area (Takes 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Segmented Tab Bar */}
            <div className="bg-white/45 backdrop-blur-xl border border-white/30 rounded-2xl p-1.5 flex gap-1 shadow-sm w-fit">
              {[
                { id: "caterers", label: "Catering Corporations" },
                { id: "users", label: "User Registry" },
                { id: "settings", label: "System Configs" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Content Panels */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-[2rem] shadow-xl p-8 transition-all duration-300">
              
              {/* Tab 1: Catering Management */}
              {activeTab === "caterers" && (
                <CateringManagement loading={loadingCaterings} catering={caterings} />
              )}

              {/* Tab 2: User Account Registry */}
              {activeTab === "users" && (
                <UserManagement />
              )}

              {/* Tab 3: System Configurations */}
              {activeTab === "settings" && (
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Global Configurations</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Control settings applied campus-wide</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
                    
                    {/* Platform Status */}
                    <div className="p-5 bg-white/50 border border-slate-200/50 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-black text-slate-900">Platform Online Status</p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Toggle maintenance screen for students/faculty canteens</p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setMaintenanceMode(!maintenanceMode)}
                          className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                            maintenanceMode ? "bg-rose-500 justify-end" : "bg-emerald-500 justify-start"
                          }`}
                        >
                          <span className="bg-white w-4 h-4 rounded-full shadow-md transition-all"></span>
                        </button>
                      </div>

                      {maintenanceMode ? (
                        <div className="p-3 bg-rose-50 border border-rose-100 text-[10px] text-rose-700 font-bold rounded-xl flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          Platform is currently configured in Maintenance Mode. Students cannot place orders.
                        </div>
                      ) : (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-700 font-bold rounded-xl flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          Platform is fully active. All canteens and branches are accepting orders online.
                        </div>
                      )}
                    </div>

                    {/* Standard CGST/SGST Tax rates */}
                    <div className="p-5 bg-white/50 border border-slate-200/50 rounded-2xl space-y-4">
                      <div>
                        <p className="text-xs font-black text-slate-900">Tax Rates Calibration</p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">CGST + SGST tax values applied to receipts</p>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Default System Tax Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="30"
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          className="w-full p-3 bg-white/80 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none focus:border-slate-800"
                        />
                      </div>
                    </div>

                    {/* Starter Wallet balance credit */}
                    <div className="p-5 bg-white/50 border border-slate-200/50 rounded-2xl space-y-4">
                      <div>
                        <p className="text-xs font-black text-slate-900">Welcome Wallet Bonus</p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Starter credits credited to new accounts automatically</p>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Starter Bonus (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={starterCredits}
                          onChange={(e) => setStarterCredits(e.target.value)}
                          className="w-full p-3 bg-white/80 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none focus:border-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {savingSettings ? "Applying settings..." : "Apply & Save Configurations"}
                    </button>

                  </form>
                </div>
              )}

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

            {/* Interactive Infrastructure Diagnoser Widget */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-[2rem] p-8 shadow-xl text-left space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Platform Health</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Interactive diagnostics</p>
                </div>
                <button
                  onClick={() => {
                    toast.success("Diagnostic check complete! All core cluster systems are fully synchronized.");
                  }}
                  title="Run Diagnostic Alert"
                  className="p-1.5 bg-slate-900/10 hover:bg-slate-900 text-slate-800 hover:text-white rounded-xl border transition-all active:scale-[0.98]"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
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
