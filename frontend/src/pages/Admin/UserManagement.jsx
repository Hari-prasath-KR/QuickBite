import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { 
  Search, 
  UserCheck, 
  Trash2, 
  Coins, 
  User, 
  ShieldAlert, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase,
  X,
  Plus,
  Minus
} from "lucide-react";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRoleFilter, setActiveRoleFilter] = useState("all");

  // Modal States
  const [walletModalUser, setWalletModalUser] = useState(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletAction, setWalletAction] = useState("add"); // add or set
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, activeRoleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users", {
        params: {
          role: activeRoleFilter,
          search: searchQuery
        }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching system users:", err);
      toast.error("Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletUpdate = async (e) => {
    e.preventDefault();
    if (!walletModalUser || walletAmount === "" || isNaN(Number(walletAmount))) {
      toast.error("Please enter a valid amount.");
      return;
    }

    const currentBalance = walletModalUser.walletBalance || 0;
    let finalAmount = Number(walletAmount);
    if (walletAction === "add") {
      finalAmount = currentBalance + Number(walletAmount);
    } else if (walletAction === "subtract") {
      finalAmount = Math.max(0, currentBalance - Number(walletAmount));
    }

    try {
      setIsSaving(true);
      await api.put(`/admin/users/${walletModalUser._id}/wallet`, {
        walletBalance: finalAmount
      });
      toast.success(`Updated balance for ${walletModalUser.name} successfully!`);
      setWalletModalUser(null);
      setWalletAmount("");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update wallet balance.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleUpdate = async (e) => {
    e.preventDefault();
    if (!roleModalUser || !newRole) {
      toast.error("Please select a valid role.");
      return;
    }

    try {
      setIsSaving(true);
      await api.put(`/admin/users/${roleModalUser._id}/role`, {
        role: newRole
      });
      toast.success(`Role updated for ${roleModalUser.name} to ${newRole}!`);
      setRoleModalUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user role.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete user ${userName}? This action is irreversible.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(`User ${userName} deleted successfully.`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete user account.");
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "collegeAdmin":
        return (
          <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-200 text-[10px] uppercase font-black tracking-wider text-rose-700">
            <ShieldAlert className="w-3 h-3" /> College Admin
          </span>
        );
      case "cateringAdmin":
        return (
          <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-200 text-[10px] uppercase font-black tracking-wider text-blue-700">
            <Briefcase className="w-3 h-3" /> Catering Admin
          </span>
        );
      case "staff":
        return (
          <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-200 text-[10px] uppercase font-black tracking-wider text-purple-700">
            <UserCheck className="w-3 h-3" /> Branch Staff
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-200 text-[10px] uppercase font-black tracking-wider text-emerald-700">
            <GraduationCap className="w-3 h-3" /> Customer
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5 self-start md:self-auto">
          {[
            { id: "all", label: "All Users" },
            { id: "customer", label: "Customers" },
            { id: "staff", label: "Branch Staff" },
            { id: "cateringAdmin", label: "Catering Admins" },
            { id: "collegeAdmin", label: "Global Admins" }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveRoleFilter(chip.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeRoleFilter === chip.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white/50 border border-slate-200/50 text-slate-700 hover:bg-white"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

      </div>

      {/* User Directory Table Card */}
      <div className="bg-white/45 backdrop-blur-xl border border-white/30 rounded-3xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-xs animate-pulse">
            Retrieving account records...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold text-xs">
            No accounts matching filters found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/50 border-b border-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-500">
                  <th className="py-4 px-6 text-left">User Details</th>
                  <th className="py-4 px-6 text-left">Platform Permission</th>
                  <th className="py-4 px-6 text-left">Wallet Balance</th>
                  <th className="py-4 px-6 text-left">Organization links</th>
                  <th className="py-4 px-6 text-center">Operational Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/20 transition-all text-xs font-semibold text-slate-800">
                    {/* User Details */}
                    <td className="py-4 px-6 text-left space-y-1">
                      <p className="font-black text-slate-950">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{user.email}</p>
                    </td>

                    {/* Permission */}
                    <td className="py-4 px-6 text-left">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Wallet */}
                    <td className="py-4 px-6 text-left">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="font-extrabold text-slate-900">₹{(user.walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>

                    {/* Links */}
                    <td className="py-4 px-6 text-left text-[10px] text-slate-500">
                      {user.role === "cateringAdmin" && user.cateringId?.name && (
                        <span>Caterer: <strong className="text-slate-800">{user.cateringId.name}</strong></span>
                      )}
                      {user.role === "staff" && user.branchId?.name && (
                        <span>Branch: <strong className="text-slate-800">{user.branchId.name}</strong></span>
                      )}
                      {!user.cateringId && !user.branchId && (
                        <span className="text-slate-400 font-medium">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Adjust Wallet */}
                        <button
                          onClick={() => {
                            setWalletModalUser(user);
                            setWalletAction("add");
                          }}
                          title="Adjust Balance"
                          className="p-2 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/20 rounded-xl transition-all"
                        >
                          <Coins className="w-4 h-4" />
                        </button>

                        {/* Adjust Role */}
                        <button
                          onClick={() => {
                            setRoleModalUser(user);
                            setNewRole(user.role);
                          }}
                          title="Change Permission"
                          className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white border border-blue-500/20 rounded-xl transition-all"
                        >
                          <User className="w-4 h-4" />
                        </button>

                        {/* Delete account */}
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          title="Delete Account"
                          className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL 1: WALLET ADJUSTMENT --- */}
      {walletModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl space-y-6 text-left relative animate-scaleUp">
            <button
              onClick={() => setWalletModalUser(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-700 text-xs font-black rounded-full border border-amber-200">
                POS Wallet adjustments
              </span>
              <h3 className="text-xl font-black text-slate-950 mt-3">Adjust Student Credits</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Adjust balance details for user: <strong>{walletModalUser.name}</strong></p>
            </div>

            {/* Current Balance Indicator */}
            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-500">Current Balance:</span>
              <span className="font-black text-slate-900 text-sm">₹{(walletModalUser.walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            <form onSubmit={handleWalletUpdate} className="space-y-4">
              
              {/* Add / Subtract / Set Selection */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "add", label: "Add", icon: Plus, color: "hover:bg-emerald-500/10 hover:text-emerald-700" },
                  { id: "subtract", label: "Subtract", icon: Minus, color: "hover:bg-rose-500/10 hover:text-rose-700" },
                  { id: "set", label: "Set Absolute", icon: Coins, color: "hover:bg-amber-500/10 hover:text-amber-700" }
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setWalletAction(act.id)}
                    className={`py-2 px-3 border rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                      walletAction === act.id
                        ? "bg-slate-950 border-slate-950 text-white shadow-md"
                        : `bg-white border-slate-200/80 text-slate-600 ${act.color}`
                    }`}
                  >
                    <act.icon className="w-3.5 h-3.5" />
                    {act.label}
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Adjustment Amount (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount..."
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none focus:border-slate-800"
                  />
                  <Coins className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? "Syncing changes..." : "Confirm & Save Adjustment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ROLE ADJUSTMENT --- */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl space-y-6 text-left relative animate-scaleUp">
            <button
              onClick={() => setRoleModalUser(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-700 text-xs font-black rounded-full border border-blue-200">
                Account permission level
              </span>
              <h3 className="text-xl font-black text-slate-950 mt-3">Change Account Role</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Adjust role details for: <strong>{roleModalUser.name}</strong></p>
            </div>

            <form onSubmit={handleRoleUpdate} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Select System Permission</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none focus:border-slate-800"
                >
                  <option value="customer">Customer (Student / Faculty)</option>
                  <option value="staff">Branch Staff (Kitchen POS operator)</option>
                  <option value="cateringAdmin">Catering Admin (Catering manager)</option>
                  <option value="collegeAdmin">College Admin (Global Administrator)</option>
                </select>
              </div>

              {/* Informative Warning block */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-[11px] font-semibold text-blue-700 leading-relaxed">
                📢 Changing this user's role to <strong>Customer</strong> or <strong>College Admin</strong> will automatically break any active assignments they have with catering companies or branch canteens.
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? "Updating permission..." : "Confirm Role Mutation"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
