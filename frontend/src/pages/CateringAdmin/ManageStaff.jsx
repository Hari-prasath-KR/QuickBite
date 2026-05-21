import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import UpdateStaffModal from './UpdateStaffModel';

function Navbar() {
  const navigate = useNavigate();
  return (
    <div className="navbar bg-gradient-to-br from-green-500 via-green-400 to-yellow-200 shadow-lg overflow-visible">
      <div className="flex-1">
        <a className="btn btn-ghost text-2xl text-white  select-none hover:bg-transparent">
         Staff Directory
        </a>
      </div>
      <div className="flex-none dropdown dropdown-end z-50">
        <label tabIndex={0} className="btn btn-square btn-ghost text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24"
            className="inline-block h-6 w-6 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </label>
        <ul tabIndex={0} className="menu dropdown-content mt-3 p-2 shadow bg-white rounded-box w-52">
          <li><button onClick={() => navigate("/catering/add-staff")} className="w-full text-black text-left p-2 hover:bg-gray-100 rounded-lg"> Add Staff </button> </li>
        </ul>
      </div>
    </div>
  );
}

const StaffCard = ({ staff, onDelete, onUpdate }) => {
  const initials = staff.name?.substring(0, 2).toUpperCase() || '??';
  return (
    <div className="bg-white/45 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            {initials}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-extrabold text-slate-800 leading-tight">{staff.name}</h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{staff.email}</p>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-200/40">
          <p className="text-sm font-medium text-slate-700">
            <span className="font-extrabold text-slate-800">Branch:</span> {staff.branchId?.name || 'Unassigned'}
          </p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button 
          onClick={() => onDelete(staff._id)} 
          className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl transition shadow-sm active:scale-95"
        >
          Delete
        </button>
        <button 
          onClick={() => onUpdate(staff)} 
          className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition shadow-sm active:scale-95"
        >
          Update
        </button>
      </div>
    </div>
  );
};

function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/api/catering-admin/branches/staff", { withCredentials: true });
      setStaffList(res.data);
    } catch (err) {
      setError("Could not load staff members.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/catering-admin/branches/staff/${id}`, { withCredentials: true });
      toast.success("Staff member deleted!");
      setStaffList(currentStaff => currentStaff.filter(staff => staff._id !== id));
    } catch (err) {
      toast.error("Failed to delete staff member.", err);
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
      const res = await axios.put(`http://localhost:5001/api/catering-admin/branches/staff/${staffId}`, updatedData, { withCredentials: true });
      setStaffList(currentStaff => currentStaff.map(staff => staff._id === staffId ? res.data : staff));
      toast.success("Staff member updated!");
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to update staff member.",err);
    }
  };

  if (loading) return <div className="text-center text-xl mt-10">Loading staff...</div>;
  if (error) return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;
  return (
   <div className='min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col'>
       <div className='fixed top-0  left-64 right-0  z-50'>
        <Navbar/>
      </div>
      <div className="pt-20 p-8">
        <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 transition-all duration-500">
          <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
            Staff Members
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-emerald-500 to-green-400 mb-8 rounded-full shadow-sm"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map((staff) => (
              <StaffCard 
                key={staff._id} 
                staff={staff} 
                onDelete={handleDeleteStaff} 
                onUpdate={handleOpenUpdateModal}
              />
            ))}
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
