import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import UpdateBranchModal from './UpdateBranchModels';


 function Navbar() {
  const navigate = useNavigate();
  return (
    <div className="navbar bg-gradient-to-br from-green-500 via-green-400 to-yellow-200 shadow-lg overflow-visible">
      <div className="flex-1">
        <a className="btn btn-ghost text-2xl text-white  select-none hover:bg-transparent">
           🏢 Branch Directory
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
          <li><button onClick={() => navigate("/catering/add-branch")} className="w-full text-black text-left p-2 hover:bg-gray-100 rounded-lg"> ➕ Add Branch </button> </li>
          {/* //<li> <button onClick={() => navigate("/catering/update-catering")} className="w-full text-black text-left p-2 hover:bg-gray-100 rounded-lg"> ✏️ Update Catering </button> </li> */}
        </ul>
      </div>
    </div>
  );
}
const BranchCard = ({ branch, onDelete, onUpdate }) => {
  const isActive = branch.status === 'Active';
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md transition-opacity ${!isActive && 'opacity-60'}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold pr-2 text-gray-500">{branch.name}</h3>
        <span className={`px-3 py-1 text-xs font-bold leading-none rounded-full
            ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {branch.status}
        </span>
      </div>
      <p className="text-gray-600 mt-2">📍 {branch.location || "No address provided"}</p>
      <p className="text-gray-500 text-sm mt-1">📞 {branch.phone || "No phone provided"}</p>
      <div className="mt-4"> 
        <button onClick={() => onDelete(branch._id)} className="bg-red-500 text-white px-3 mr-3 py-1 rounded-lg hover:bg-red-600"> Delete
        </button>  <button onClick={() => onUpdate(branch)} className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"> Update </button>
      </div>
    </div>
  );
};

function ManageBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await axios.get("http://localhost:5001/api/catering-admin/branches", { withCredentials: true });
      setBranches(res.data);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setError("Could not load branches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try { 
      await axios.delete(`http://localhost:5001/api/catering-admin/branches/${id}`, { withCredentials: true });
      toast.success("Branch deleted successfully!");
      setBranches(currentBranches => 
        currentBranches.filter(branch => String(branch._id) !== String(id))
      );
    } catch (err) {
      toast.error("Failed to delete branch.");
      console.error("Failed to delete branch:", err);
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
      const res = await axios.put(`http://localhost:5001/api/catering-admin/branches/${branchId}`, updatedData, { withCredentials: true });
      setBranches(currentBranches => currentBranches.map(branch => branch._id === branchId ? res.data : branch));
      toast.success("Branch updated successfully!");
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to update branch.");
      console.error("Update failed:", err);
    }
  };

  if (loading) {
    return <div className="text-center text-xl mt-40">Loading locations...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 text-xl mt-40">{error}</div>;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col'>
      <div className='fixed top-0  left-64 right-0  z-50'>
        <Navbar/>
      </div>
      <div className="pt-20 p-8">
        <h2 className="text-2xl font-bold mb-4 text-white">📍 Our Branches</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <BranchCard key={branch._id} branch={branch} onDelete={handleDelete} onUpdate={handleOpenUpdateModal}  />
          ))}
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