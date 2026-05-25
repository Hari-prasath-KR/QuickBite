import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import UpdateStaffModal from './UpdateStaffModel';
import api from '../../utils/api';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Building, 
  Mail, 
  Info,
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react';

function Navbar({ onAddStaffClick }) {
  return (
    <div className="navbar bg-gradient-to-br from-green-500 via-green-400 to-yellow-200 shadow-lg overflow-visible">
      <div className="flex-1">
        <span className="btn btn-ghost text-2xl text-white select-none hover:bg-transparent font-black tracking-tight">
          Staff Directory
        </span>
      </div>
      <div className="flex-none">
        <button 
          onClick={onAddStaffClick}
          className="btn btn-sm bg-white/20 hover:bg-white/35 text-white border-none rounded-xl flex items-center gap-1.5 font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Personnel
        </button>
      </div>
    </div>
  );
}

const StaffCard = ({ staff, onDelete, onUpdate, onUnassign }) => {
  const initials = staff.name?.substring(0, 2).toUpperCase() || '??';
  const isAssigned = !!staff.branchId;
  
  return (
    <div className="bg-white/45 backdrop-blur-md border border-white/25 rounded-3xl p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center text-white font-extrabold text-base shadow-sm select-none">
            {initials}
          </div>
          <div className="text-left overflow-hidden">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight truncate" title={staff.name}>
              {staff.name}
            </h3>
            <p className="text-[10px] font-semibold text-slate-450 truncate flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{staff.email}</span>
            </p>
          </div>
        </div>
        
        <div className="pt-3 border-t border-slate-200/40 text-slate-700 text-xs font-semibold space-y-1.5">
          <p className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-slate-800">Branch:</span> 
            <span className={`truncate max-w-[150px] font-bold ${
              isAssigned ? 'text-slate-650' : 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider font-black'
            }`}>{staff.branchId?.name || 'Unassigned / Floating'}</span>
          </p>
          <p className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-800">Role:</span>
            <span className="text-slate-650 bg-slate-100 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider font-black">
              POS Staff
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {/* Unassign button if assigned */}
        {isAssigned ? (
          <button
            type="button"
            onClick={() => onUnassign(staff)}
            className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-extrabold text-xs rounded-xl border border-amber-500/20 transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <UserX className="w-3.5 h-3.5" /> Unassign Branch
          </button>
        ) : (
          <div className="w-full py-2 bg-slate-100/50 text-slate-400 font-extrabold text-xs rounded-xl border border-slate-200/30 flex items-center justify-center gap-1.5 select-none">
            <UserCheck className="w-3.5 h-3.5" /> Floating Personnel
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={() => onUpdate(staff)} 
            className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" /> Update
          </button>
          <button 
            onClick={() => onDelete(staff._id)} 
            className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-500/20 transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

function ManageStaff() {
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get("/catering-admin/branches/staff");
      setStaffList(res.data);
    } catch (err) {
      setError("Could not load staff directory. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member? Their POS access keys will be revoked immediately.")) return;
    try {
      await api.delete(`/catering-admin/branches/staff/${id}`);
      toast.success("Staff member deleted successfully!");
      setStaffList(current => current.filter(s => s._id !== id));
    } catch (err) {
      toast.error("Failed to delete staff member.");
      console.error("Delete failed:", err);
    }
  };

  const handleOpenUpdateModal = (staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingStaff(null);
    setIsModalOpen(false);
  };

  const handleUpdateStaff = async (staffId, updatedData) => {
    try {
      const res = await api.put(`/catering-admin/branches/staff/${staffId}`, updatedData);
      setStaffList(current => current.map(s => s._id === staffId ? res.data : s));
      toast.success("Staff member details updated successfully!");
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to update staff details.");
      console.error("Update failed:", err);
    }
  };

  const handleUnassignStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to unassign ${staff.name} from their branch canteen? They will become a floating staff member.`)) return;
    try {
      const updatedData = {
        name: staff.name,
        email: staff.email,
        branchId: "" // Empty string clears branch assignment in database
      };
      
      const res = await api.put(`/catering-admin/branches/staff/${staff._id}`, updatedData);
      
      // Update local state list instantly
      setStaffList(current => current.map(s => s._id === staff._id ? res.data : s));
      toast.success(`${staff.name} is now a floating staff member!`);
    } catch (err) {
      toast.error("Failed to unassign staff member.");
      console.error("Unassign failed:", err);
    }
  };

  // Perform search query filtering
  const filteredStaffList = useMemo(() => {
    if (!searchQuery.trim()) return staffList;
    const q = searchQuery.toLowerCase().trim();

    return staffList.filter(s => {
      const nameMatch = s.name ? s.name.toLowerCase().includes(q) : false;
      const emailMatch = s.email ? s.email.toLowerCase().includes(q) : false;
      const branchMatch = s.branchId && s.branchId.name ? s.branchId.name.toLowerCase().includes(q) : false;
      
      return nameMatch || emailMatch || branchMatch;
    });
  }, [searchQuery, staffList]);

  // Statistics counters
  const totalStaffCount = staffList.length;
  const unassignedCount = useMemo(() => {
    return staffList.filter(s => !s.branchId).length;
  }, [staffList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="font-extrabold text-slate-800 text-lg">Gathering staff directories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex items-center justify-center p-8">
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-10 max-w-md w-full shadow-2xl text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Sync Error</h2>
          <p className="text-slate-700 font-medium mb-6">{error}</p>
          <button
            onClick={fetchStaff}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-md"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col'>
      {/* Fixed top Navbar */}
      <div className='fixed top-0 left-64 right-0 z-40'>
        <Navbar onAddStaffClick={() => navigate("/catering/add-staff")} />
      </div>

      <div className="pt-20 p-8 space-y-8 flex-1">
        <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 transition-all duration-500">
          
          {/* Header Details */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-slate-200/50 pb-6">
            <div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                Personnel Directory
              </h2>
              <p className="text-slate-700 text-sm font-semibold mt-1">
                Monitor and configure catering service staff, assign POS locations, and manage kitchen operators.
              </p>
            </div>
            
            {/* Staff statistics row */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-xs font-black rounded-full border border-emerald-200 shadow-sm flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {totalStaffCount} Assigned
              </span>
              {unassignedCount > 0 && (
                <span className="px-3 py-1 bg-rose-500/10 text-rose-700 text-xs font-black rounded-full border border-rose-200 shadow-sm flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> {unassignedCount} Unassigned
                </span>
              )}
            </div>
          </div>

          {/* Filtering Control Center */}
          <div className="w-full max-w-md mb-8">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-750 ml-1">
                Search Personnel
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search staff name, email, or branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/60 border border-slate-250/30 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-green-500 shadow-sm transition"
                />
              </div>
            </div>
          </div>

          {/* Staff Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaffList.length > 0 ? (
              filteredStaffList.map((staff) => (
                <StaffCard 
                  key={staff._id} 
                  staff={staff} 
                  onDelete={handleDeleteStaff} 
                  onUpdate={handleOpenUpdateModal}
                  onUnassign={handleUnassignStaff}
                />
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white/30 border border-slate-200 border-dashed rounded-2xl">
                <Users className="w-12 h-12 text-slate-350 mx-auto mb-2 animate-pulse" />
                <h3 className="text-base font-black text-slate-700">No personnel matched.</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Try refining your search text queries.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <UpdateStaffModal
          staff={editingStaff}
          onClose={handleCloseModal}
          onUpdate={handleUpdateStaff}
        />
      )}
    </div>
  );
}

export default ManageStaff;
