import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddToBranchForm = ({ unassignedBranches, menuItem, onAssignmentAdd }) => {
    const [selectedBranchId, setSelectedBranchId] = useState(unassignedBranches[0]?._id || '');
    const [price, setPrice] = useState(menuItem.defaultPrice || '');
    const [quantity, setQuantity] = useState(0);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const assignmentData = {
                menuItemId: menuItem._id,
                branchId: selectedBranchId,
                price,
                quantity,
            };
            await axios.post('http://localhost:5001/api/catering-admin/branch-menu', assignmentData, { withCredentials: true });
            window.location.reload();
            toast.success(`'${menuItem.name}' was added to the branch!`);
            onAssignmentAdd(); 
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to add item to branch.");
            console.error("Add assignment error:", err);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
    <h4 className="font-semibold text-gray-700">Add to another branch</h4>
    <select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} className="w-full border p-2 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
        {unassignedBranches.map(branch => (
            <option className='text-black' key={branch._id} value={branch._id}>{branch.name}</option>
        ))}
    </select>
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
        <input type="number" step="0.01" min="0" placeholder="e.g., 15.50" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" required/>
    </div>
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input   type="number"  min="0" placeholder="e.g., 50" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" required/>
    </div>
    <div className="flex justify-center">
    <button  type="submit"  className="w-1/4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
        Add Item
    </button>
</div>
</form>
);
};

const EditAssignmentModal = ({ isOpen, onClose, assignment, onUpdateSuccess }) => {
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    useEffect(() => {
        if (assignment) {
            setPrice(assignment.price);
            setQuantity(assignment.quantity);
        }
    }, [assignment]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5001/api/catering-admin/branch-menu/${assignment._id}`, 
                { price, quantity }, 
                { withCredentials: true }
            );
            toast.success("Assignment updated!");
            onUpdateSuccess(); 
            onClose();
        } catch (err) {
            toast.error("Failed to update assignment.",err);
        }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[110] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Edit Assignment for <span className="text-blue-700">{assignment?.branchId?.name}</span></h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border p-2 rounded-md" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border p-2 rounded-md" required/>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={onClose} className="w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BranchAssignmentModal = ({ isOpen, onClose, menuItem }) => {
    const [assignments, setAssignments] = useState({ assignedBranches: [], unassignedBranches: [] });
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const fetchAssignments = useCallback(async () => {
        if (!menuItem) return;
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5001/api/catering-admin/menu/${menuItem._id}/branches`, { withCredentials: true });
            setAssignments(res.data);
        } catch (error) {
            console.error("Could not fetch assignments", error);
            toast.error("Could not load branch data.");
        } finally {
            setLoading(false);
        }
    }, [menuItem]);
    useEffect(() => {
        if (isOpen) {
            fetchAssignments();
        }
    }, [isOpen, fetchAssignments]);

    const handleDeleteAssignment = async (branchMenuItemId) => {
        if (!window.confirm("Are you sure you want to remove this item from this branch?")) return;
        try {
            await axios.delete(`http://localhost:5001/api/catering-admin/branch-menu/${branchMenuItemId}`, { withCredentials: true });
            toast.success("Removed from branch.");
            fetchAssignments();
        } catch (err) {
            toast.error("Failed to remove assignment.", err);
        }
    };
    const openEditModal = (assignment) => {
        setEditingAssignment(assignment);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setEditingAssignment(null);
        setIsEditModalOpen(false);
    };
    if (!isOpen) return null;
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-2xl font-bold text-gray-800">Manage Branch Assignments for <span className="text-green-600">{menuItem.name}</span></h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                    </div>
                    {loading ? <p>Loading...</p> : (
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                                    <img src={menuItem.imageUrl || 'https://via.placeholder.com/150'} alt={menuItem.name} className="w-20 h-20 rounded-lg object-cover"/>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-800">{menuItem.name}</h4>
                                        <p className="text-sm text-gray-500">{menuItem.category}</p>
                                    </div>
                                </div>
                                <h4 className="font-semibold text-gray-700 mb-2">Assigned Branches</h4>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                    {assignments.assignedBranches.length > 0 ? (
                                        assignments.assignedBranches.map(assign => (
                                            <div key={assign._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                <div>
                                                    <p className="font-bold text-blue-800">{assign.branchId?.name || "Deleted Branch"}</p>
                                                    <div className="mt-1 grid grid-cols-2 gap-x-4 text-sm">
                                                        <span className="text-gray-500">Price:</span>
                                                        <span className="font-semibold text-gray-900">${assign.price.toFixed(2)}</span>
                                                        <span className="text-gray-500">Quantity:</span>
                                                        <span className="font-semibold text-gray-900">{assign.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => openEditModal(assign)} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteAssignment(assign._id)} className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ):<p className="text-sm text-gray-500 italic text-center py-4">Not assigned to any branch yet.</p>}
                                </div>
                            </div>
                            <AddToBranchForm 
                                unassignedBranches={assignments.unassignedBranches} 
                                menuItem={menuItem}
                                onAssignmentAdd={fetchAssignments}
                            />
                        </div>
                    )}
                </div>
            </div>
            <EditAssignmentModal 
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                assignment={editingAssignment}
                onUpdateSuccess={fetchAssignments}
            />
        </>
    );
};

export default BranchAssignmentModal;