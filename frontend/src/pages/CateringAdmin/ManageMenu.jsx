import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import MenuModels from './MenuModels';
import BranchAssignmentModal from './BranchAssigmentModel';

function MenuPageNavbar({ onAddItemClick }) {
    return (
        <div className="navbar bg-gradient-to-br from-green-500 via-green-400 to-yellow-200 shadow-lg overflow-visible mb-6">
            <div className="flex-1">
                <a className="btn btn-ghost text-2xl text-white select-none hover:bg-transparent">
                    📋 Menu Management
                </a>
            </div>
            <button onClick={onAddItemClick} className="btn btn-ghost border-white text-white hover:bg-white hover:text-green-600">
                Add Item
            </button>
        </div>
    );
}

const MenuItemCard = ({ item, onCardClick, onUpdate, onDelete }) => {
    return (
        <div className="flex overflow-hidden rounded-lg bg-white shadow-lg cursor-pointer hover:shadow-xl transition" onClick={() => onCardClick(item)}>
            <img src={item.imageUrl || 'https://via.placeholder.com/200'} alt={item.name} className="h-full w-40 flex-shrink-0 object-cover" />
            <div className="flex flex-1 flex-col p-4">
                <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                <p className="mt-1 flex-grow text-sm text-gray-600">
                    {item.description || 'No description available.'}
                </p>
                <div className="mt-3 flex items-center justify-between">
                    <span className="self-start rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        {item.category}
                    </span>
                    <p className="text-md font-semibold text-gray-900">
                        Global Price: ${(item.defaultPrice || 0).toFixed(2)}
                    </p>
                </div>
                <div className="mt-4 flex gap-2 border-t pt-3">
                    <button onClick={(e) => { e.stopPropagation(); onUpdate(item); }}  className="flex-1 rounded-md bg-blue-100 py-2 px-3 text-sm font-medium text-blue-700 hover:bg-blue-200">
                      Edit
                    </button>
                    <button  onClick={(e) => { e.stopPropagation(); onDelete(item._id); }} className="flex-1 rounded-md bg-red-100 py-2 px-3 text-sm font-medium text-red-700 hover:bg-red-200">
                      Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

function ManageMenu() { 
    const [menuItems, setMenuItems] = useState([]); 
    const [branches, setBranches] = useState([]);  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [filteredMenuItems, setFilteredMenuItems] = useState([]);
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [menuRes, branchesRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/catering-admin/get-items', { withCredentials: true }),
                    axios.get('http://localhost:5001/api/catering-admin/branches', { withCredentials: true })
                ]);
                setMenuItems(menuRes.data);
                setBranches(branchesRes.data);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Could not load menu data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);
    useEffect(() => {
        let itemsToFilter = [...menuItems];
        if (selectedCategory !== 'All') {
            itemsToFilter = itemsToFilter.filter(item => item.category === selectedCategory);
        }
        if (selectedBranch !== 'All') {
            itemsToFilter = itemsToFilter.filter(item =>
                item.branchInfo && item.branchInfo.some(branchItem => branchItem.branchId._id === selectedBranch)
            );
        }
        setFilteredMenuItems(itemsToFilter);
    }, [selectedCategory, selectedBranch, menuItems]);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleAddItem = async (formData) => {
        try {
            const res = await axios.post('http://localhost:5001/api/catering-admin/add-item', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            setMenuItems(prevItems => [res.data, ...prevItems]);
            toast.success("Global item added successfully!");
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to add item.");
            console.error(err);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm("Are you sure? This will delete the item and remove it from all branches.")) {
            return;
        }
        try {
            await axios.delete(`http://localhost:5001/api/catering-admin/menu/${itemId}`, {
                withCredentials: true,
            });
            setMenuItems(currentItems => currentItems.filter(item => item._id !== itemId));
            toast.success("Menu item deleted successfully!");
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to delete item.");
            console.error(err);
        }
    };
    
    const handleUpdateItem = (item) => {
        toast('Edit functionality is not yet implemented.');
        console.log("Editing item:", item);
    };
    
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState(null);

    const openBranchModal = (item) => {
        setSelectedMenuItem(item);
        setIsBranchModalOpen(true);
    };

    const closeBranchModal = () => {
        setSelectedMenuItem(null);
        setIsBranchModalOpen(false);
    };


    return (
        <div className=" bg-gradient-to-br from-green-400 via-yellow-200 to-white min-h-screen">
            <MenuPageNavbar onAddItemClick={openModal} />
            <div className="mx-5 mb-8 p-5 bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-auto flex flex-col gap-1.5 flex-1 md:max-w-xs">
                    <label htmlFor="category-filter" className="text-xs font-black uppercase tracking-widest text-slate-700 ml-1">
                        🍽️ Filter by Category
                    </label>
                    <select
                        id="category-filter"
                        className="w-full pl-4 pr-10 py-3 text-sm font-bold text-slate-800 bg-white/45 backdrop-blur-md border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 hover:bg-white/60 transition duration-300 shadow-sm cursor-pointer"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Appetizer">Appetizer</option>
                        <option value="Main Course">Main Course</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                        <option value="Uncategorized">Uncategorized</option>
                    </select>
                </div>
                <div className="w-full md:w-auto flex flex-col gap-1.5 flex-1 md:max-w-xs">
                    <label htmlFor="branch-filter" className="text-xs font-black uppercase tracking-widest text-slate-700 ml-1">
                        📍 Filter by Branch
                    </label>
                    <select
                        id="branch-filter"
                        className="w-full pl-4 pr-10 py-3 text-sm font-bold text-slate-800 bg-white/45 backdrop-blur-md border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 hover:bg-white/60 transition duration-300 shadow-sm cursor-pointer"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                        <option value="All">All Branches</option>
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.name}</option>
                        ))}
                    </select>
                </div>
            </div>
             <div>
                {loading ? (
                    <p className="text-center text-gray-600 mt-10">Loading menu...</p>
                ) : error ? (
                    <p className="text-center text-red-500 mt-10">{error}</p>
                ) : (
                    <div className="grid grid-cols-1 px-5 md:grid-cols-2 gap-6">
                        {filteredMenuItems.length > 0 ? (
                            filteredMenuItems.map(item => (
                                <MenuItemCard 
                                    key={item._id} 
                                    item={item} 
                                    onDelete={handleDeleteItem}
                                    onUpdate={handleUpdateItem}
                                    onCardClick={openBranchModal} 
                                
                                />
                            ))
                        ) : (
                            <div className="md:col-span-2 text-center text-gray-500 p-10 rounded-lg ">
                                <h3 className="text-xl font-semibold">No menu items match your filters.</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <MenuModels
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleAddItem}
            />
             <BranchAssignmentModal
                isOpen={isBranchModalOpen}
                onClose={closeBranchModal}
                menuItem={selectedMenuItem}
            />
        </div>
    );
}

export default ManageMenu;