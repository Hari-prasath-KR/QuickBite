import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import MenuModels from './MenuModels';
import BranchAssignmentModal from './BranchAssigmentModel';
import api from '../../utils/api';
import { 
  Utensils, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter, 
  ShoppingBag, 
  Tag, 
  Building,
  Info,
  Search
} from 'lucide-react';

function MenuPageNavbar({ onAddItemClick }) {
  return (
    <div className="navbar bg-gradient-to-br from-green-500 via-green-400 to-yellow-200 shadow-lg overflow-visible">
      <div className="flex-1">
        <span className="btn btn-ghost text-2xl text-white select-none hover:bg-transparent font-black tracking-tight">
          Menu Management
        </span>
      </div>
      <div className="flex-none">
        <button 
          onClick={onAddItemClick} 
          className="btn btn-sm bg-white/20 hover:bg-white/35 text-white border-none rounded-xl flex items-center gap-1.5 font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Global Item
        </button>
      </div>
    </div>
  );
}

const MenuItemCard = ({ item, onCardClick, onUpdate, onDelete }) => {
  return (
    <div 
      className="flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white/45 backdrop-blur-md border border-white/40 shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      onClick={() => onCardClick(item)}
    >
      <img 
        src={item.imageUrl || '/default-logo.png'} 
        alt={item.name} 
        className="h-44 sm:h-auto sm:w-44 flex-shrink-0 object-cover border-b sm:border-b-0 sm:border-r border-slate-200/30" 
      />
      <div className="flex flex-1 flex-col p-5 justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{item.name}</h3>
            <span className="self-start rounded-xl bg-slate-100/80 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-700 border border-slate-200/40">
              {item.category}
            </span>
          </div>
          <p className="mt-2 text-slate-800 text-xs font-semibold line-clamp-3 leading-relaxed">
            {item.description || 'No detailed description provided for this dish.'}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base Rate</span>
              <p className="text-base font-black text-slate-800">
                ₹{(item.defaultPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            {/* Quick Action options */}
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdate(item); }}  
                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/25 text-blue-700 transition active:scale-95 shadow-sm border border-blue-500/20"
                title="Edit Item"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button  
                onClick={(e) => { e.stopPropagation(); onDelete(item._id); }} 
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-700 transition active:scale-95 shadow-sm border border-rose-500/20"
                title="Delete Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
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
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [menuRes, branchesRes] = await Promise.all([
        api.get('/catering-admin/get-items'),
        api.get('/catering-admin/branches')
      ]);

      setMenuItems(menuRes.data);
      setBranches(branchesRes.data);
    } catch (err) {
      console.error("Failed to fetch menu details:", err);
      setError("Could not load global menu details. Please check connections.");
    } finally {
      setLoading(false);
    }
  };

  // Perform client-side filter computation
  const filteredMenuItems = useMemo(() => {
    let result = [...menuItems];

    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (selectedBranch !== 'All') {
      result = result.filter(item =>
        item.branchInfo && item.branchInfo.some(branchItem => branchItem.branchId?._id === selectedBranch)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [selectedCategory, selectedBranch, searchQuery, menuItems]);

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(isOpen => true);
  };

  const closeModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  // Submit handler (handles both Add and Edit global item)
  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        // Edit flow
        const res = await api.put(`/catering-admin/menu/${editingItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMenuItems(prev => prev.map(item => item._id === editingItem._id ? res.data : item));
        toast.success("Global item updated successfully!");
      } else {
        // Add flow
        const res = await api.post('/catering-admin/add-item', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMenuItems(prev => [res.data, ...prev]);
        toast.success("Global item added successfully!");
      }
      closeModal();
    } catch (err) {
      console.error("Form submit failed:", err);
      toast.error(err.response?.data?.msg || "Failed to save item details.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure? This will delete the item and remove it from all branch kitchen menus.")) {
      return;
    }
    try {
      await api.delete(`/catering-admin/menu/${itemId}`);
      setMenuItems(currentItems => currentItems.filter(item => item._id !== itemId));
      toast.success("Menu item deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete menu item.");
      console.error(err);
    }
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
    fetchInitialData(); // Refresh assignments count
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="font-extrabold text-slate-800 text-lg">Gathering catalog directories...</p>
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
            onClick={fetchInitialData}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-md"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-400 via-yellow-200 to-white min-h-screen flex flex-col">
      {/* Top Navbar */}
      <div className="fixed top-0 left-64 right-0 z-40">
        <MenuPageNavbar onAddItemClick={openAddModal} />
      </div>

      <div className="pt-20 p-8 space-y-8 flex-1">
        <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 transition-all duration-500">
          
          {/* Header Description */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-slate-200/50 pb-6">
            <div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                Global Dishes Directory
              </h2>
              <p className="text-slate-700 text-sm font-semibold mt-1">
                Manage global dishes catalog. Click any dish card to view and manage branch pricing and stocks!
              </p>
            </div>
            
            {/* Quick Informational Tooltip */}
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-bold self-start">
              <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Click cards to assign branches & stocks!</span>
            </div>
          </div>

          {/* Filtering Control Center */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
                Search Dishes
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search dish name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/60 border border-slate-250/30 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-green-500 shadow-sm"
                />
              </div>
            </div>

            {/* Category select filter */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category-filter" className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
                Filter by Category
              </label>
              <select
                id="category-filter"
                className="w-full pl-4 pr-10 py-3 text-xs font-bold text-slate-800 bg-white/45 backdrop-blur-md border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/30 hover:bg-white/60 transition duration-300 shadow-sm cursor-pointer"
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

            {/* Branch select filter */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="branch-filter" className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
                Filter by Branch Assigned
              </label>
              <select
                id="branch-filter"
                className="w-full pl-4 pr-10 py-3 text-xs font-bold text-slate-800 bg-white/45 backdrop-blur-md border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/30 hover:bg-white/60 transition duration-300 shadow-sm cursor-pointer"
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

          {/* Dishes Card Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map(item => (
                <MenuItemCard 
                  key={item._id} 
                  item={item} 
                  onDelete={handleDeleteItem}
                  onUpdate={openEditModal}
                  onCardClick={openBranchModal} 
                />
              ))
            ) : (
              <div className="col-span-1 xl:col-span-2 text-center py-16 bg-white/30 border border-slate-200 border-dashed rounded-2xl">
                <Utensils className="w-12 h-12 text-slate-350 mx-auto mb-2" />
                <h3 className="text-base font-black text-slate-700">No catalog items matched.</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Try refining category, search, or branch selectors.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit modal */}
      <MenuModels
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
      />
      
      {/* Branch stock assignment modal */}
      <BranchAssignmentModal
        isOpen={isBranchModalOpen}
        onClose={closeBranchModal}
        menuItem={selectedMenuItem}
      />
    </div>
  );
}

export default ManageMenu;