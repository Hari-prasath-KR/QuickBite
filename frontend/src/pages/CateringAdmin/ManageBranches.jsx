import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import UpdateBranchModal from './UpdateBranchModels';
import api from '../../utils/api';
import { 
  Building, 
  Plus, 
  Trash2, 
  Edit, 
  Power, 
  MapPin, 
  Users, 
  Info,
  Phone,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Navbar({ onAddBranchClick }) {
  return (
    <div className="navbar bg-gradient-to-br from-green-500 via-green-400 to-yellow-200 shadow-lg overflow-visible">
      <div className="flex-1">
        <span className="btn btn-ghost text-2xl text-white select-none hover:bg-transparent font-black tracking-tight">
          Branch Directory
        </span>
      </div>
      <div className="flex-none">
        <button 
          onClick={onAddBranchClick}
          className="btn btn-sm bg-white/20 hover:bg-white/35 text-white border-none rounded-xl flex items-center gap-1.5 font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </button>
      </div>
    </div>
  );
}

const BranchCard = ({ branch, onDelete, onUpdate, onToggleStatus, staffCount, togglingId }) => {
  const isActive = branch.status === 'Active';
  
  return (
    <div className={`bg-white/45 backdrop-blur-md border border-white/25 rounded-3xl p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between ${
      !isActive && 'opacity-70 bg-rose-50/5'
    }`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight truncate max-w-[150px]" title={branch.name}>
            {branch.name}
          </h3>
          <span className={`px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-full shadow-sm
            ${isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
            {branch.status}
          </span>
        </div>
        
        <div className="space-y-2 text-slate-700 text-xs font-semibold">
          <p className="flex items-center gap-1.5 truncate">
            <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{branch.location || "No address specified"}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{branch.phone || "No contact logged"}</span>
          </p>
          
          <div className="pt-3 border-t border-slate-200/40 mt-3 flex items-center gap-2 text-slate-550">
            <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{staffCount} Active Kitchen Staff</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {/* Toggle kitchen status switch */}
        <button
          onClick={() => onToggleStatus(branch)}
          disabled={togglingId === branch._id}
          className={`w-full py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm ${
            isActive
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {togglingId === branch._id ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : isActive ? (
            <>
              <Power className="w-3.5 h-3.5" /> Break Kitchen
            </>
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5" /> Start Kitchen
            </>
          )}
        </button>

        {/* Edit and Delete button row */}
        <div className="flex gap-2">
          <button 
            onClick={() => onUpdate(branch)} 
            className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
          > 
            <Edit className="w-3.5 h-3.5" /> Update
          </button>
          <button 
            onClick={() => onDelete(branch._id)} 
            className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-500/20 transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
          > 
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>  
        </div>
      </div>
    </div>
  );
};

function ManageBranches() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  useEffect(() => {
    fetchInitialDetails();
  }, []);

  const fetchInitialDetails = async () => {
    try {
      setError(null);
      setLoading(true);

      const [branchesRes, staffRes] = await Promise.all([
        api.get("/catering-admin/branches"),
        api.get("/catering-admin/branches/staff")
      ]);

      setBranches(branchesRes.data);
      setStaff(staffRes.data);
    } catch (err) {
      console.error("Failed to fetch branch operational data:", err);
      setError("Could not load campus branch directory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Staff assigned per branch calculation
  const staffCounts = useMemo(() => {
    const counts = {};
    staff.forEach(s => {
      if (s.branchId) {
        const bId = s.branchId._id;
        counts[bId] = (counts[bId] || 0) + 1;
      }
    });
    return counts;
  }, [staff]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch? All kitchen orders and assignments will be detached.")) return;
    try { 
      await api.delete(`/catering-admin/branches/${id}`);
      toast.success("Branch deleted successfully!");
      setBranches(current => current.filter(b => String(b._id) !== String(id)));
    } catch (err) {
      toast.error("Failed to delete branch.");
      console.error("Delete failed:", err);
    }
  };

  // Quick In-place Toggle status (Active/Inactive)
  const handleToggleStatus = async (branch) => {
    const newStatus = branch.status === 'Active' ? 'Inactive' : 'Active';
    try {
      setTogglingId(branch._id);
      
      await api.put(`/catering-admin/branches/${branch._id}`, {
        name: branch.name,
        location: branch.location,
        status: newStatus
      });

      toast.success(`${branch.name} is now ${newStatus}!`);
      
      // Update local state in place instantly
      setBranches(prev => prev.map(b => b._id === branch._id ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error("Failed to toggle status:", err);
      toast.error("Failed to toggle branch operational status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenUpdateModal = (branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBranch(null);
    setIsModalOpen(false);
  };

  const handleUpdateBranch = async (branchId, updatedData) => {
    try {
      const res = await api.put(`/catering-admin/branches/${branchId}`, updatedData);
      setBranches(prev => prev.map(b => b._id === branchId ? res.data : b));
      toast.success("Branch details updated successfully!");
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to update branch details.");
      console.error("Update failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="font-extrabold text-slate-800 text-lg">Gathering branch directories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex items-center justify-center p-8">
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-10 max-w-md w-full shadow-2xl text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Sync Failure</h2>
          <p className="text-slate-700 font-medium mb-6">{error}</p>
          <button
            onClick={fetchInitialDetails}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-md"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col'>
      {/* Fixed top Navbar */}
      <div className='fixed top-0 left-64 right-0 z-40'>
        <Navbar onAddBranchClick={() => navigate("/catering/add-branch")} />
      </div>

      <div className="pt-20 p-8 space-y-8 flex-1">
        <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 transition-all duration-500">
          
          {/* Header Details */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-slate-200/50 pb-6">
            <div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                Our Campus Branches
              </h2>
              <p className="text-slate-700 text-sm font-semibold mt-1">
                Monitor and configure physical campus branches, inspect personnel sizes, and control real-time operational kitchen availability.
              </p>
            </div>
          </div>
          
          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <BranchCard 
                key={branch._id} 
                branch={branch} 
                onDelete={handleDelete} 
                onUpdate={handleOpenUpdateModal}
                onToggleStatus={handleToggleStatus}
                staffCount={staffCounts[branch._id] || 0}
                togglingId={togglingId}
              />
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <UpdateBranchModal
          branch={editingBranch}
          onClose={handleCloseModal}
          onUpdate={handleUpdateBranch}
        />
      )}
    </div>
  );
}

export default ManageBranches;