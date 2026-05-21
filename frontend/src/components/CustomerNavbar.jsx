import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import toast from 'react-hot-toast'

function CustomerNavbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ caterings: [], branches: [], dishes: [] });
  const [searching, setSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('open-quickbite-search', handleOpenSearch);
    return () => window.removeEventListener('open-quickbite-search', handleOpenSearch);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ caterings: [], branches: [], dishes: [] });
      return;
    }

    setSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${searchQuery}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div>
      <div className="navbar bg-green-400 shadow-lg h-35">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-white text-black rounded-box z-[1] mt-3 w-52 p-3 shadow-2xl border border-slate-100 space-y-1">
              <li><a className="font-semibold py-2 hover:bg-slate-50 rounded-lg" onClick={()=>navigate("/customer")}>🏠 Homepage</a></li>
              <li><a className="font-semibold py-2 hover:bg-slate-50 rounded-lg" onClick={()=>navigate("/customer/order-history")}>📜 Order History</a></li>
              <li><a className="font-semibold py-2 hover:bg-slate-50 rounded-lg" onClick={()=>navigate("/profile")}>👤 Profile Portfolio</a></li>
            </ul>
          </div>
          <a className="text-3xl font-extrabold text-white cursor-pointer ml-4" onClick={()=>{navigate("/customer")}}>
            QuickBites 🍔
          </a>
        </div>
        <div className="navbar-end">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="btn btn-ghost btn-circle text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-circle text-white">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="badge badge-xs badge-warning indicator-item"></span> 
            </div>
          </button>
        </div>
      </div>

      {/* Premium Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex justify-center pt-20 px-4">
          <div className="bg-white/95 backdrop-blur-lg border border-slate-100 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 overflow-hidden animate-fade-in-up transition-all duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-150 pb-4 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-700 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search branches, caterings, locations, or dishes..."
                className="w-full bg-transparent text-slate-800 text-lg font-semibold placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              )}
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="ml-2 text-slate-500 hover:text-slate-800 font-extrabold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition text-xs uppercase tracking-wider animate-scale-in"
              >
                Close
              </button>
            </div>

            {/* Results Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              {searching ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="text-sm font-bold text-slate-500">Searching the campus...</span>
                </div>
              ) : !searchQuery.trim() ? (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <h4 className="text-base font-black text-slate-800">Unified Campus Search</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Type below to instantly search through catering providers, active branches, specific building locations, or your favorite food dishes!
                  </p>
                  
                  <div className="mt-6 flex flex-wrap gap-2 justify-center px-4">
                    {['Canteen', 'Burger', 'Block A', 'Pizza', 'Main Food Court', 'Sandwich'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-green-50 hover:text-green-800 border border-slate-200/60 rounded-full text-xs font-bold text-slate-600 transition"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (searchResults.caterings.length === 0 && searchResults.branches.length === 0 && searchResults.dishes.length === 0) ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-3">🍽️💨</div>
                  <h4 className="text-base font-black text-slate-800">No matches found</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Try checking your spelling or search for something else.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Caterings Matches */}
                  {searchResults.caterings.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
                        <span>🍽️ Caterings ({searchResults.caterings.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {searchResults.caterings.map(c => (
                          <div
                            key={c._id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery('');
                              navigate('/customer');
                              setTimeout(() => {
                                const el = document.getElementById('caterings');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }, 150);
                            }}
                            className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl flex items-center gap-3 hover:bg-slate-100/80 cursor-pointer hover:border-slate-300 transition"
                          >
                            <img
                              src={c.logo}
                              alt={c.name}
                              className="w-10 h-10 rounded-full object-contain bg-white border border-slate-200"
                            />
                            <div className="text-left">
                              <span className="block font-black text-sm text-slate-800">{c.name}</span>
                              <span className="block text-[10px] text-slate-500 line-clamp-1">{c.description || 'Campus favorite'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Branches & Locations Matches */}
                  {searchResults.branches.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
                        <span>📍 Branches & Locations ({searchResults.branches.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {searchResults.branches.map(b => {
                          const isActive = b.status === 'Active';
                          return (
                            <div
                              key={b._id}
                              onClick={() => {
                                if (isActive) {
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                  navigate(`/customer/order/${b._id}`);
                                } else {
                                  toast.error(`${b.name} is currently inactive and not accepting orders.`);
                                }
                              }}
                              className={`p-3 border rounded-2xl flex justify-between items-center transition ${
                                isActive
                                  ? 'bg-slate-50 hover:bg-green-50/40 border-slate-200/60 hover:border-green-200 cursor-pointer'
                                  : 'bg-slate-50/50 border-slate-100 opacity-60 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center gap-3 text-left">
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                                <div>
                                  <span className="font-extrabold text-sm text-slate-800 block leading-tight">
                                    {b.name} <span className="text-[10px] text-slate-500 font-bold">({b.cateringId?.name})</span>
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                                    📍 Location: {b.location || 'On Campus'}
                                  </span>
                                </div>
                              </div>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isActive ? 'Active' : 'Offline'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dishes Matches */}
                  {searchResults.dishes.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
                        <span>🍔 Dishes & Meals ({searchResults.dishes.length})</span>
                      </h4>
                      <div className="space-y-3.5">
                        {searchResults.dishes.map(d => (
                          <div
                            key={d._id}
                            className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col gap-2 hover:bg-slate-100/30 transition text-left"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3">
                                {d.imageUrl ? (
                                  <img
                                    src={d.imageUrl}
                                    alt={d.name}
                                    className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-slate-200/60 flex items-center justify-center text-xl">
                                    🍔
                                  </div>
                                )}
                                <div>
                                  <span className="font-black text-sm text-slate-800 block leading-tight">
                                    {d.name} <span className="text-[9px] uppercase bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-black ml-1.5">{d.category}</span>
                                  </span>
                                  <span className="text-xs text-slate-500 mt-1 block line-clamp-1">
                                    {d.description || 'Freshly prepared campus specialty.'}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm font-black text-slate-800 shrink-0 bg-white border border-slate-200/60 px-2 py-1 rounded-lg">
                                ₹{d.defaultPrice.toFixed(2)}
                              </span>
                            </div>

                            {/* Branches offering this dish */}
                            <div className="border-t border-slate-200/40 mt-1.5 pt-2 flex flex-col gap-1.5">
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                Order directly from branch:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {d.availability && d.availability.length > 0 ? (
                                  d.availability.map(avail => {
                                    const isBranchActive = avail.status === 'Active';
                                    return (
                                      <button
                                        key={avail.branchId}
                                        onClick={() => {
                                          if (isBranchActive) {
                                            setIsSearchOpen(false);
                                            setSearchQuery('');
                                            navigate(`/customer/order/${avail.branchId}`);
                                          } else {
                                            toast.error(`${avail.branchName} is currently inactive.`);
                                          }
                                        }}
                                        className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1.5 ${
                                          isBranchActive
                                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-sm hover:scale-105 active:scale-95'
                                            : 'bg-slate-200 text-slate-400 border-slate-350 cursor-not-allowed opacity-60'
                                        }`}
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${isBranchActive ? 'bg-white' : 'bg-slate-400'}`} />
                                        {avail.branchName} (₹{avail.price})
                                      </button>
                                    );
                                  })
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-semibold italic">
                                    Offline (Unavailable at all branches)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerNavbar;