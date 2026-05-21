import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import StaffNavbar from "../../components/StaffNavbar";
import BottomNav from "./BottomNav";
import {
  FaSearch,
  FaSync,
  FaBoxes,
  FaClipboardList,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBan,
  FaPlus,
  FaMinus,
  FaToggleOn,
  FaToggleOff,
  FaArrowUp,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

function MenuPage() {
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const fetchProfileAndData = async () => {
    setLoading(true);
    try {
      const userRes = await axios.get("http://localhost:5001/api/auth/profile", { withCredentials: true });
      const u = userRes.data.data || userRes.data;
      setUser(u);

      if (u.branchId) {
        const menuRes = await axios.get(`http://localhost:5001/api/menu/branch/${u.branchId}`, { withCredentials: true });
        setMenuItems(menuRes.data);
      } else {
        toast.error("No branch associated with this staff account.");
      }
    } catch (err) {
      console.error("Error fetching staff menu data:", err);
      toast.error("Failed to load branch inventory.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignment = async (assignmentId, updates) => {
    setUpdatingItemId(assignmentId);
    try {
      const res = await axios.put(
        `http://localhost:5001/api/menuitem/branch-menu/${assignmentId}`,
        updates,
        { withCredentials: true }
      );
      
      // Update local state instantly
      setMenuItems((prevItems) =>
        prevItems.map((item) => (item._id === assignmentId ? { ...item, ...res.data } : item))
      );
      toast.success("Inventory updated successfully!");
    } catch (err) {
      console.error("Error updating menu item assignment:", err);
      toast.error(err.response?.data?.msg || "Failed to update item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleQuantityIncrement = (item, amount) => {
    const newQty = Math.max(0, (item.quantity || 0) + amount);
    handleUpdateAssignment(item._id, { quantity: newQty });
  };

  const handleQuantityChange = (item, value) => {
    const qty = parseInt(value, 10);
    if (!isNaN(qty) && qty >= 0) {
      handleUpdateAssignment(item._id, { quantity: qty });
    }
  };

  // Derive Dynamic Categories from Assignments
  const categories = ["All", ...new Set(menuItems.map((item) => item.menuItemId?.category).filter(Boolean))];

  // Filters logic
  const filteredItems = menuItems.filter((item) => {
    const dish = item.menuItemId;
    if (!dish) return false;

    // Search query match
    const nameMatch = dish.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = dish.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || descMatch;

    // Category match
    const matchesCategory = selectedCategory === "All" || dish.category === selectedCategory;

    // Stock Status match
    let matchesStock = true;
    if (selectedStockStatus === "inStock") {
      matchesStock = item.isAvailable && item.quantity >= 10;
    } else if (selectedStockStatus === "lowStock") {
      matchesStock = item.isAvailable && item.quantity < 10 && item.quantity > 0;
    } else if (selectedStockStatus === "outOfStock") {
      matchesStock = item.isAvailable && item.quantity === 0;
    } else if (selectedStockStatus === "unavailable") {
      matchesStock = !item.isAvailable;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate Statistics dynamically
  const totalDishes = menuItems.length;
  const activeCount = menuItems.filter((item) => item.isAvailable && item.quantity > 0).length;
  const outOfStockCount = menuItems.filter((item) => item.isAvailable && item.quantity === 0).length;
  const lowStockCount = menuItems.filter((item) => item.isAvailable && item.quantity < 10 && item.quantity > 0).length;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Top Navbar */}
      <StaffNavbar />

      {/* Main Container */}
      <div className="pt-20 pb-28 px-4 md:px-8 flex-1 flex flex-col overflow-hidden max-w-7xl mx-auto w-full">
        
        {/* Header Title & Refresh */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Branch Inventory Manager <span className="text-lg px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">Live</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Manage real-time availability, stock quantities, and items listed for online & offline orders.
            </p>
          </div>
          <button
            onClick={fetchProfileAndData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all font-semibold text-sm active:scale-95 disabled:opacity-50 text-slate-200"
          >
            <FaSync className={`${loading ? "animate-spin text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {/* Dynamic Statistics Board */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] shadow-md">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <FaClipboardList size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Dishes</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{totalDishes}</h3>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] shadow-md">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <FaCheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Active Items</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{activeCount}</h3>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] shadow-md">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <FaBan size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Out of Stock</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{outOfStockCount}</h3>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] shadow-md">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <FaExclamationTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Low Stock</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{lowStockCount}</h3>
            </div>
          </div>
        </div>

        {/* Filter Control Bar */}
        <div className="bg-slate-800/60 border border-slate-700/40 p-4 rounded-2xl flex flex-col gap-4 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FaSearch />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish by name or keyword..."
                className="w-full bg-slate-900/80 border border-slate-750 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200 placeholder-slate-500 transition-colors"
              />
            </div>

            {/* Stock Status Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider hidden lg:inline">Stock Filter:</span>
              <select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                className="w-full md:w-52 bg-slate-900/80 border border-slate-750 text-slate-300 py-2.5 px-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="all">All Inventory States</option>
                <option value="inStock">{"In Stock (>= 10)"}</option>
                <option value="lowStock">{"Low Stock (< 10)"}</option>
                <option value="outOfStock">{"Out of Stock (0)"}</option>
                <option value="unavailable">{"Unavailable (Disabled)"}</option>
              </select>
            </div>
          </div>

          {/* Dynamic Scrolling Category Chips */}
          <div className="border-t border-slate-700/30 pt-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex-shrink-0 mr-2">Categories:</span>
            <div className="flex gap-2 pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 border ${
                    selectedCategory === cat
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                      : "bg-slate-900 text-slate-400 border-slate-750 hover:bg-slate-750 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Dish Inventory Grid */}
        <div className="flex-1 overflow-y-auto pr-1 pb-6 scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
          {loading ? (
            <div className="h-48 flex flex-col justify-center items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
              <p className="text-sm text-slate-400 font-semibold">Updating inventory matrix...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-slate-800/20 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col justify-center items-center max-w-md mx-auto mt-12">
              <FaBoxes size={48} className="text-slate-600 mb-4" />
              <h4 className="text-lg font-bold text-slate-300">No Inventory Match</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                We couldn't find any dishes matching your query or selected filters. Try broadening your criteria or reset filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedStockStatus("all");
                }}
                className="mt-5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold rounded-xl text-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const dish = item.menuItemId;
                if (!dish) return null;

                const isItemLowStock = item.isAvailable && item.quantity < 10 && item.quantity > 0;
                const isItemOutOfStock = item.isAvailable && item.quantity === 0;
                const isItemUnavailable = !item.isAvailable;

                // Color coding tags
                let statusBadgeText = "In Stock";
                let statusColorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
                
                if (isItemUnavailable) {
                  statusBadgeText = "Unavailable";
                  statusColorClass = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                } else if (isItemOutOfStock) {
                  statusBadgeText = "Out of Stock";
                  statusColorClass = "bg-rose-500/10 text-rose-400 border-rose-500/25";
                } else if (isItemLowStock) {
                  statusBadgeText = "Low Stock";
                  statusColorClass = "bg-amber-500/10 text-amber-400 border-amber-500/25";
                }

                const isItemUpdating = updatingItemId === item._id;

                return (
                  <div
                    key={item._id}
                    className={`bg-slate-800/40 border transition-all rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group shadow-lg ${
                      isItemUnavailable 
                        ? "border-slate-800/80 bg-slate-900/30 opacity-70" 
                        : isItemUpdating 
                        ? "border-emerald-500 bg-slate-800/60 shadow-emerald-500/5" 
                        : "border-slate-700/40 hover:border-slate-650/60 hover:shadow-2xl hover:bg-slate-800/70"
                    }`}
                  >
                    {/* Inline updating overlay */}
                    {isItemUpdating && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex justify-center items-center z-10 transition-opacity">
                        <div className="flex items-center gap-2 bg-slate-850 px-4 py-2 border border-slate-700 rounded-xl shadow-xl">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                          <span className="text-xs font-bold text-slate-200">Updating...</span>
                        </div>
                      </div>
                    )}

                    {/* Top Content Row */}
                    <div className="flex gap-4">
                      {/* Image Thumbnail */}
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-slate-700 flex-shrink-0 shadow-inner">
                        {dish.imageUrl ? (
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-slate-750 text-slate-500 font-black text-xl">
                            {dish.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className={`absolute bottom-1 right-1 text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider border ${statusColorClass} backdrop-blur-md shadow-sm`}>
                          {statusBadgeText}
                        </span>
                      </div>

                      {/* Text details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-extrabold text-white text-base truncate leading-tight group-hover:text-emerald-400 transition-colors">
                            {dish.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 min-h-[32px] leading-relaxed">
                          {dish.description || "No description provided for this culinary selection."}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-slate-700/60 text-slate-300 text-[10px] font-bold rounded">
                            {dish.category || "Uncategorized"}
                          </span>
                          <span className="text-slate-400 font-extrabold text-sm">
                            ₹{item.price}
                          </span>
                          {item.price !== dish.defaultPrice && (
                            <span className="text-[9px] text-slate-500 font-semibold line-through">
                              ₹{dish.defaultPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock status & quick restock panel */}
                    <div className="mt-4 pt-3 border-t border-slate-700/40 flex flex-col gap-3">
                      {/* Availability Switch & Custom Quantities */}
                      <div className="flex justify-between items-center gap-4">
                        {/* Custom Availability Toggle */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateAssignment(item._id, { isAvailable: !item.isAvailable })}
                            className="focus:outline-none transition-transform active:scale-95"
                            title={item.isAvailable ? "Click to set Unavailable" : "Click to set Available"}
                          >
                            {item.isAvailable ? (
                              <FaToggleOn size={32} className="text-emerald-400 cursor-pointer" />
                            ) : (
                              <FaToggleOff size={32} className="text-slate-600 cursor-pointer" />
                            )}
                          </button>
                          <span className="text-xs font-bold text-slate-300">
                            {item.isAvailable ? "Listed" : "Delisted"}
                          </span>
                        </div>

                        {/* Interactive Quantity Control Panel */}
                        <div className="flex items-center bg-slate-900 border border-slate-750 rounded-xl p-1 shadow-inner">
                          <button
                            onClick={() => handleQuantityIncrement(item, -1)}
                            disabled={item.quantity <= 0}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <FaMinus size={10} />
                          </button>
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item, e.target.value)}
                            className="w-10 bg-transparent text-center text-xs font-black text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleQuantityIncrement(item, 1)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                      </div>

                      {/* Professional Fast Action Shortcut Panel */}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleUpdateAssignment(item._id, { quantity: 0 })}
                          disabled={item.quantity === 0}
                          className="flex-1 py-1.5 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-750 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl text-[10px] font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                        >
                          <FaBan size={10} />
                          Set Out of Stock
                        </button>
                        <button
                          onClick={() => handleUpdateAssignment(item._id, { quantity: (item.quantity || 0) + 20 })}
                          className="flex-1 py-1.5 bg-slate-900/60 hover:bg-emerald-500/10 border border-slate-750 hover:border-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-xl text-[10px] font-bold tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                        >
                          <FaArrowUp size={10} />
                          Restock +20
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Persistent Bottom Nav Bar */}
      <BottomNav />
    </div>
  );
}

export default MenuPage;
