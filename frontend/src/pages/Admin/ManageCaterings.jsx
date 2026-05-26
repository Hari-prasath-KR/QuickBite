import React, { useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import api from "../../utils/api";
import { 
  Trash2, 
  Building, 
  ArrowLeft, 
  ShieldAlert, 
  Sliders, 
  Search,
  ExternalLink
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ManageCaterings = () => {
  const [caterings, setCaterings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaterings();
  }, []);

  const fetchCaterings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/caterings");
      setCaterings(res.data);
    } catch (err) {
      console.error("Error fetching caterers:", err);
      toast.error("Failed to load catering corporations.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete ${name}? All associated canteens, staff, and menus will be unlinked.`)) {
      return;
    }

    try {
      await api.delete(`/caterings/${id}`);
      toast.success(`${name} has been successfully removed.`);
      fetchCaterings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete catering brand.");
    }
  };

  const filteredCaterers = caterings.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col">
      {/* Navbar fixed header */}
      <div className="fixed top-0 left-0 w-full z-40">
        <AdminNavbar />
      </div>

      <div className="pt-24 p-8 space-y-8 flex-grow">
        
        {/* Navigation Breadcrumb & Search Row */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2.5 bg-white/45 hover:bg-white/70 border border-white/30 rounded-2xl text-xs font-black text-slate-700 shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98] hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Operations
          </button>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Search caterers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Hero title block */}
        <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl text-left space-y-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-xs font-black rounded-full border border-emerald-200 shadow-sm inline-flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" /> Platform Node Registry
          </span>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight leading-tight">
            Registered Catering Corporations
          </h1>
          <p className="text-slate-600 text-sm font-semibold max-w-2xl">
            Audit, inspect, or remove active dining providers registered within the QuickBite campus dining framework.
          </p>
        </div>

        {/* Grid Ledger */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white/40 border border-slate-200/30 rounded-3xl p-6 h-48 animate-pulse"></div>
            ))}
          </div>
        ) : filteredCaterers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold text-xs bg-white/20 border border-white/20 rounded-[2rem]">
            No catering companies match your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCaterers.map((c) => (
              <div 
                key={c._id} 
                className="bg-white/45 backdrop-blur-xl border border-white/30 rounded-[2rem] p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full text-left relative overflow-hidden group"
              >
                {/* Visual Top Highlight Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>

                <div className="space-y-4">
                  {/* Brand Logo Container */}
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/50 shadow-inner flex items-center justify-center p-1.5">
                    <img
                      src={c.logo || "/default-logo.png"}
                      alt={c.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>

                  {/* Brand Details */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-3">
                      {c.description || "Premium campus catering provider servicing students and faculty nodes."}
                    </p>
                  </div>
                </div>

                {/* Operations Footer Row */}
                <div className="flex items-center justify-between gap-2 pt-6 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/admin/catering/${c._id}`)}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
                  >
                    View Details <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(c._id, c.name)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageCaterings;
