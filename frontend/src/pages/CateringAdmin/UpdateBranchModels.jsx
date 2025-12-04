import React, { useState, useEffect } from 'react';

const UpdateBranchModal = ({ branch, onClose, onUpdate }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('Active');
  useEffect(() => {
    if (branch) {
      setName(branch.name || 'wfegrd');
      setLocation(branch.location || 'agesrh');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-800">Update Branch</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="updateName"  className="block mb-2 font-semibold text-gray-700">Branch Name</label>
            <input id="updateName" type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="updateLocation" className="block mb-2 font-semibold text-gray-700">Location</label>
            <input id="updateLocation" type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Status</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${status === 'Active' ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
              <span className={`font-semibold ${status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                {status}
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition duration-300">
            Update Branch
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateBranchModal;