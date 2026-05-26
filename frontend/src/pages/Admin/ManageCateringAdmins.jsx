import React, { useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import api from "../../utils/api";
import { 
  Trash2, 
  UserCheck, 
  ArrowLeft, 
  Mail, 
  ShieldCheck, 
  Search, 
  Building 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ManageCateringAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/catering-admins");
      setAdmins(res.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to load catering administrators.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete admin account ${name}? The corresponding catering corporation will lose its administrative privileges.`)) {
      return;
    }

    try {
      await api.delete(`/admin/manage-catering-admins/${id}`);
      toast.success(`Admin ${name} deleted successfully.`);
      setAdmins(admins.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting catering admin:", error);
      toast.error("Failed to delete admin account.");
    }
  };

  const filteredAdmins = admins.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.cateringId?.name && a.cateringId.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col">
      {/* Navbar Fixed container */}
      <div className="fixed top-0 left-0 w-full z-40">
        <AdminNavbar />
      </div>

      <div className="pt-24 p-8 space-y-8 flex-grow">
        
        {/* Navigation & Search Row */}
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
              placeholder="Search by name, email, or caterer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Hero title block */}
        <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl text-left space-y-2">
          <span className="px-3 py-1 bg-blue-500/10 text-blue-700 text-xs font-black rounded-full border border-blue-200 shadow-sm inline-flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" /> Platform Personnel Control
          </span>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight leading-tight">
            Manage Catering Administrators
          </h1>
          <p className="text-slate-600 text-sm font-semibold max-w-2xl">
            Audit assigned catering administrators, inspect company profile associations, or release company administrative linkages.
          </p>
        </div>

        {/* Grid Ledger */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white/40 border border-slate-200/30 rounded-3xl p-6 h-64 animate-pulse"></div>
            ))}
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold text-xs bg-white/20 border border-white/20 rounded-[2rem]">
            No catering administrators match your search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredAdmins.map((admin) => (
              <div
                key={admin._id}
                className="bg-white/45 backdrop-blur-xl border border-white/30 rounded-[2rem] p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full text-left relative overflow-hidden group"
              >
                {/* Visual Top Highlight Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

                <div className="space-y-4">
                  {/* Avatar / Brand Logo Row */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/50 shadow-inner flex items-center justify-center p-1.5">
                      <img
                        src={admin.cateringId?.logo || "/default-logo.png"}
                        alt={admin.cateringId?.name || "Catering brand"}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                    
                    <div className="min-w-0">
                      <h2 className="text-base font-black text-slate-900 leading-tight truncate">{admin.name}</h2>
                      <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {admin.email}
                      </p>
                    </div>
                  </div>

                  {/* Allocation Details Badge Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200/40 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-200/10 text-[9px] uppercase font-black tracking-wider text-blue-700">
                        <Building className="w-3 h-3" />
                        {admin.cateringId?.name || "Unassigned"}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed line-clamp-2">
                      {admin.cateringId?.description || "Catering brand manages active branch canteens and menu items."}
                    </p>
                  </div>
                </div>

                {/* Quick Deletion footer */}
                <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDelete(admin._id, admin.name)}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Release Privileges
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default ManageCateringAdmins;
