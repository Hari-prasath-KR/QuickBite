import React, { useState, useEffect } from 'react';
import { X, Building, MapPin, Power, CheckCircle2 } from 'lucide-react';

const UpdateBranchModal = ({ branch, onClose, onUpdate }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (branch) {
      setName(branch.name || '');
      setLocation(branch.location || '');
      setStatus(branch.status || 'Active');
    }
  }, [branch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(branch._id, { name, location, status });
  };

  const handleToggleStatus = () => {
    setStatus(currentStatus => (currentStatus === 'Active' ? 'Inactive' : 'Active'));
  };

  if (!branch) return null;

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
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Update Branch
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Catering Station Config
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
          
          {/* Branch Name Field */}
          <div>
            <label htmlFor="updateName" className="block mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Branch Name
            </label>
            <div className="relative group">
              <Building className="w-4 h-4 text-slate-400 absolute left-4 top-4 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                id="updateName" 
                type="text" 
                className="w-full bg-white/50 border border-slate-200/80 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:bg-white/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-xs text-slate-800 shadow-sm transition-all placeholder:text-slate-400" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="e.g. Science Block Canteen"
              />
            </div>
          </div>

          {/* Branch Location Field */}
          <div>
            <label htmlFor="updateLocation" className="block mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Location / Building Floor
            </label>
            <div className="relative group">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-4 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                id="updateLocation" 
                type="text" 
                className="w-full bg-white/50 border border-slate-200/80 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:bg-white/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-xs text-slate-800 shadow-sm transition-all placeholder:text-slate-400" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required 
                placeholder="e.g. Ground Floor, Room 102"
              />
            </div>
          </div>

          {/* iOS-Style Operations Status Toggle */}
          <div>
            <label className="block mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Kitchen Operations Status
            </label>
            <div className="bg-white/40 border border-slate-200/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-slate-850">
                  Kitchen Readiness
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  Controls order acceptance
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${
                    status === 'Active' 
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25' 
                      : 'bg-rose-500 shadow-lg shadow-rose-500/25'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
                      status === 'Active' ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
                
                <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border shadow-sm transition-all duration-300 flex items-center gap-1 ${
                  status === 'Active' 
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-700 shadow-emerald-500/5' 
                    : 'bg-rose-50/70 border-rose-200 text-rose-700 shadow-rose-500/5'
                }`}>
                  {status === 'Active' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Operations
                    </>
                  ) : (
                    <>
                      <Power className="w-3.5 h-3.5" /> Maintenance
                    </>
                  )}
                </span>
              </div>
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

export default UpdateBranchModal;