import React, { useEffect, useState } from 'react';
import { X, User, Mail, Building, UserCheck } from 'lucide-react';
import api from '../../utils/api';

const UpdateStaffModal = ({ staff, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', branchId: '' });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const res = await api.get("/catering-admin/branches");
        setBranches(res.data);
      } catch (err) {
        console.error("Failed to fetch branches for modal:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        branchId: staff.branchId?._id || '',
      });
    }
  }, [staff]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(staff._id, formData);
  };

  if (!staff) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300">
      {/* Inline styles for modal scale and backdrop fade animations */}
      <style>{`
        @keyframes modalEntrance {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .premium-modal-content {
          animation: modalEntrance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div className="premium-modal-content bg-white/80 backdrop-blur-2xl border border-white/50 p-8 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] shadow-emerald-950/5 w-full max-w-md transition-all duration-300">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl shadow-inner">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Update Personnel
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Staff Account Profile
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition duration-200 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          
          {/* Personnel Name Field */}
          <div>
            <label htmlFor="name" className="block mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Full Name
            </label>
            <div className="relative group">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-4 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                id="name" 
                name="name" 
                type="text" 
                className="w-full bg-white/50 border border-slate-200/80 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:bg-white/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-xs text-slate-800 shadow-sm transition-all placeholder:text-slate-400" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                placeholder="e.g. John Doe"
              />
            </div>
          </div>

          {/* Personnel Email Field */}
          <div>
            <label htmlFor="email" className="block mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                id="email" 
                name="email" 
                type="email" 
                className="w-full bg-white/50 border border-slate-200/80 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:bg-white/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-xs text-slate-800 shadow-sm transition-all placeholder:text-slate-400" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="e.g. johndoe@catering.com"
              />
            </div>
          </div>

          {/* Branch Assignment Field */}
          <div>
            <label htmlFor="branchId" className="block mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Assign to Branch Canteen
            </label>
            <div className="relative group">
              <Building className="w-4 h-4 text-slate-400 absolute left-4 top-4 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
              {loading ? (
                <div className="w-full bg-white/50 border border-slate-200/80 pl-11 pr-4 py-3.5 rounded-2xl text-xs text-slate-450 font-bold shadow-sm animate-pulse">
                  Loading branch directory...
                </div>
              ) : (
                <select 
                  id="branchId" 
                  name="branchId" 
                  className="w-full bg-white/50 border border-slate-200/80 pl-11 pr-10 py-3.5 rounded-2xl focus:outline-none focus:bg-white/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-xs text-slate-800 shadow-sm cursor-pointer appearance-none transition-all" 
                  value={formData.branchId} 
                  onChange={handleChange}
                >
                  <option value="" className="text-slate-450 font-bold bg-white">Unassigned / Floating Staff</option>
                  {branches.map(branch => (
                    <option className="text-slate-800 font-bold bg-white" key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              )}
              {/* Premium selector chevron decorator */}
              {!loading && (
                <div className="absolute right-4 top-[17px] pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Action Button Controls */}
          <div className="flex gap-3 pt-4 border-t border-slate-200/50 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-250 border border-slate-200/40 text-slate-700 font-extrabold text-xs rounded-2xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5 active:translate-y-0"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-600/30 transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5 active:translate-y-0"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStaffModal;