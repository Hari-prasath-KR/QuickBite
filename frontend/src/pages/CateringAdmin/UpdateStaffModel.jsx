import axios from 'axios';
import React, { useEffect, useState } from 'react'


const UpdateStaffModal = ({ staff, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', branchId: '' });
  const [branches, setBranches] = useState([]);
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/catering-admin/branches", { withCredentials: true });
        setBranches(res.data);
      } catch (err) {
        console.error("Failed to fetch branches for modal", err);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">Update Staff Member</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block mb-2 font-semibold text-gray-700">Full Name</label>
                <input id="name" name="name" type="text" className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="email" className="block mb-2 font-semibold text-gray-700">Email Address</label>
                <input id="email" name="email" type="email" className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="branchId" className="block mb-2 font-semibold text-gray-700">Assign to Branch</label>
                <select id="branchId" name="branchId" className="w-full border p-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-500" value={formData.branchId} onChange={handleChange}>
                    {branches.map(branch => (
                        <option className="text-black" key={branch._id} value={branch._id}>{branch.name}</option>
                    ))}
                </select>
            </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition duration-300">Update Staff</button>
        </form>
      </div>
    </div>
  );
};
export default UpdateStaffModal;