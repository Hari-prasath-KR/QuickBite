import React, { useEffect, useState } from 'react'
import CustomerNavbar from '../components/CustomerNavbar'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

// --- Sub-components for a cleaner structure ---

// Skeleton Loader for a better initial loading experience
const CateringCardSkeleton = () => (
  <div className="bg-white/45 backdrop-blur-md rounded-2xl shadow-md p-6 flex flex-col items-center border border-white/20 animate-pulse">
    <div className="h-24 w-24 rounded-full bg-slate-200/50 mb-4"></div>
    <div className="h-6 w-3/4 rounded bg-slate-200/50 mb-2"></div>
    <div className="h-4 w-full rounded bg-slate-200/50 mb-4"></div>
    <div className="h-4 w-1/2 rounded bg-slate-200/50"></div>
    <div className="mt-6 h-10 w-32 bg-slate-200/50 rounded-lg"></div>
  </div>
);


const CustomerDashboard = () => {
  const [caterings, setCaterings] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [selectedCatering, setSelectedCatering] = useState(null);
  const [branches, setBranches] = useState([]);
  const [showBranchPopup, setShowBranchPopup] = useState(false);
  const navigate = useNavigate();

  const triggerSearch = () => {
    window.dispatchEvent(new CustomEvent('open-quickbite-search'));
  };

  useEffect(() => {
    const fetchCaterings = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/caterings", {
          withCredentials: true,
        });
        setCaterings(res.data);
      } catch (err) {
        console.error("Error fetching caterings:", err);
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };
    fetchCaterings();
  }, []);

  const handleCateringClick = async (catering) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/branch/public/${catering._id}`);
      //console.log(res.data);
      setBranches(res.data);
      setSelectedCatering(catering);
      setShowBranchPopup(true);
    } catch (err) {
      console.error("Error fetching branches:", err);
      alert("Failed to load branches. Please try again.");
    }
  };

  const handleBranchSelect = (branchId) => {
    navigate(`/customer/order/${branchId}`);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white'>
      <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
        <CustomerNavbar />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col items-center pt-24 px-6">
        {/* === HERO SECTION === */}
        <section className="min-h-screen pt-0 pb-20 px-6 flex items-center">
          <div className="container mx-auto max-w-6xl grid md:grid-cols-2 items-center gap-12">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold text-green-900 leading-tight">
                Your College Cravings,
                <span className="text-yellow-600"> Delivered.</span>
              </h1>
              <p className="mt-4 text-lg text-gray-700 max-w-md">
                Skip the queue. Order delicious meals from your favorite campus
                caterings and get back to what matters.
              </p>
              {/* Modern Glassmorphic Search Bar Trigger */}
              <div className="mt-6 max-w-md cursor-pointer group animate-fade-in" onClick={triggerSearch}>
                <div className="flex items-center gap-3 bg-white/45 backdrop-blur-md border border-white/30 rounded-2xl px-5 py-3.5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-800 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-slate-500 font-semibold text-sm">
                    Search branches, caterings, locations, or dishes...
                  </span>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => document.getElementById('caterings').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transform hover:scale-105 transition-all"
                >
                  Browse Caterings 👇
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" // Suggestion: Use a more dynamic food image
                alt="Delicious Food"
                className="w-80 h-80 object-contain drop-shadow-2xl animate-pulse-slow"
              />
            </div>
          </div>
        </section>

        {/* === HOW IT WORKS SECTION === */}
        <section className="py-12 w-full max-w-6xl px-4">
          <div className="bg-white/35 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl p-8 md:p-12 transition-all duration-500">
            
            {/* Unified Header */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-800 px-3.5 py-1.5 rounded-full">
                ✨ How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 tracking-tight leading-none">
                Order with Ease
              </h2>
              <p className="text-slate-700 mt-3 text-base md:text-lg font-semibold">
                Getting your favorite meal has never been easier.
              </p>
              <div className="w-20 h-1.5 bg-gradient-to-r from-emerald-500 to-green-400 mx-auto mt-5 rounded-full shadow-sm"></div>
            </div>

            {/* Integrated Steps */}
            <div className="grid md:grid-cols-3 gap-6">

              {/* Step 1 */}
              <div className="bg-white/45 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col items-center text-center hover:-translate-y-1">
                <div className="bg-emerald-500/10 rounded-full p-4 mb-4 inline-flex group-hover:scale-110 transition duration-300 ring-4 ring-emerald-500/5">
                  <span className="text-3xl">📍</span>
                </div>
                <div className="bg-emerald-500/20 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded-full mb-3 uppercase tracking-wider">
                  Step 01
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">Choose & Customize</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Browse menus from all available caterings on campus.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white/45 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col items-center text-center hover:-translate-y-1">
                <div className="bg-emerald-500/10 rounded-full p-4 mb-4 inline-flex group-hover:scale-110 transition duration-300 ring-4 ring-emerald-500/5">
                  <span className="text-3xl">💳</span>
                </div>
                <div className="bg-emerald-500/20 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded-full mb-3 uppercase tracking-wider">
                  Step 02
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">Pay Securely Online</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Fast and secure payments. No need for cash.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white/45 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col items-center text-center hover:-translate-y-1">
                <div className="bg-emerald-500/10 rounded-full p-4 mb-4 inline-flex group-hover:scale-110 transition duration-300 ring-4 ring-emerald-500/5">
                  <span className="text-3xl">🍔</span>
                </div>
                <div className="bg-emerald-500/20 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded-full mb-3 uppercase tracking-wider">
                  Step 03
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">Enjoy Your Meal</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We'll notify you when it's ready. Just grab and go!
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* === FEATURED CATERINGS SECTION === */}
        <section id="caterings" className="py-12 w-full max-w-6xl px-4">
          <div className="bg-white/35 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl p-8 md:p-12 transition-all duration-500">
            
            {/* Unified Header */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-800 px-3.5 py-1.5 rounded-full">
                🍽️ Our Caterers
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 tracking-tight leading-none">
                Caterings On Campus
              </h2>
              <p className="text-slate-700 mt-3 text-base md:text-lg font-semibold">
                Explore delicious menus from top campus caterers.
              </p>
              <div className="w-20 h-1.5 bg-gradient-to-r from-emerald-500 to-green-400 mx-auto mt-5 rounded-full shadow-sm"></div>
            </div>

            {/* Caterings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {loading
                ? // Show skeleton loaders while fetching data
                [...Array(3)].map((_, i) => <CateringCardSkeleton key={i} />)
                : caterings.map((catering) => (
                  <div
                    key={catering._id}
                    className="bg-white/45 backdrop-blur-md rounded-2xl border border-white/25 shadow-md p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                    onClick={() => handleCateringClick(catering)} // Open branch popup
                  >
                    <img
                      src={catering.logo}
                      alt={catering.name}
                      className="h-24 w-24 object-contain mb-4 rounded-full border-2 border-yellow-400/60 shadow-sm bg-white/10"
                    />
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {catering.name}
                    </h3>
                    <p className="text-slate-700 text-sm mt-2 text-center flex-grow font-medium">
                      {catering.description || "Delicious meals for everyone!"}
                    </p>
                    <button className="mt-6 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all shadow-sm">
                      View Menu
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* === WHY CHOOSE US SECTION === */}
        <section className="bg-white/30 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-4xl text-center border border-white/30 mb-10">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-12">Why You'll Love Our Service</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white/45 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm flex flex-col items-center text-center justify-center">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-slate-900 font-extrabold text-lg">Blazing Fast</h3>
                <p className="text-slate-600 text-sm mt-1">Order in under a minute.</p>
              </div>
              <div className="bg-white/45 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm flex flex-col items-center text-center justify-center">
                <div className="text-4xl mb-3"> 🍱 </div>
                <h3 className="text-slate-900 font-extrabold text-lg">Great Variety</h3>
                <p className="text-slate-600 text-sm mt-1">All your campus favorites in one place.</p>
              </div>
              <div className="bg-white/45 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm flex flex-col items-center text-center justify-center">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-slate-900 font-extrabold text-lg">Secure Payments</h3>
                <p className="text-slate-600 text-sm mt-1">100% secure online payment system.</p>
              </div>
              <div className="bg-white/45 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm flex flex-col items-center text-center justify-center">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="text-slate-900 font-extrabold text-lg">Real Reviews</h3>
                <p className="text-slate-600 text-sm mt-1">See real-time ratings from students.</p>
              </div>
            </div>
          </div>
        </section>
        {/* === FINAL CTA SECTION === */}
        {/*  <section className="py-20 px-6">
            <div className="container mx-auto max-w-4xl text-center bg-green-800 text-white p-12 rounded-2xl shadow-xl">
                <h2 className="text-4xl font-extrabold mb-4">Ready to Skip the Queue?</h2>
                <p className="text-green-100 text-lg mb-8">Create an account and place your first order in minutes.</p>
                <button
                  onClick={() => navigate("/register")}
                  className="px-10 py-4 bg-yellow-500 text-green-900 font-extrabold rounded-lg shadow-md hover:bg-yellow-400 transform hover:scale-105 transition-all text-lg"
                >
                  Register Now & Start Ordering 🚀
                </button>
            </div>
        </section> */}
        {/* === FOOTER === */}
        {/* <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto max-w-6xl text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Campus Eats. All Rights Reserved.</p>
                <div className="mt-4 space-x-6">
                    <a href="/about" className="hover:text-yellow-400">About Us</a>
                    <a href="/contact" className="hover:text-yellow-400">Contact</a>
                    <a href="/privacy" className="hover:text-yellow-400">Privacy Policy</a>
                </div>
            </div>
        </footer> */}
      </div>

      {/* Branch Selection Popup */}
      {showBranchPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in-up">
            <button
              onClick={() => setShowBranchPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Select a Branch for {selectedCatering?.name}
            </h3>

            {branches.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No branches available at the moment.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {branches.map(branch => {
                  const isActive = branch.status === 'Active';
                  return (
                    <div
                      key={branch._id}
                      onClick={() => {
                        if (isActive) {
                          handleBranchSelect(branch._id);
                        } else {
                          toast.error(`${branch.name} is currently inactive and not accepting orders.`);
                        }
                      }}
                      className={`p-4 border rounded-xl transition-all flex justify-between items-center group ${
                        isActive
                          ? 'border-emerald-100 hover:bg-emerald-50/50 hover:border-emerald-300 cursor-pointer shadow-sm hover:shadow'
                          : 'border-slate-200 bg-slate-50/50 opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Indicator Dot/Icon */}
                        <div className="relative flex h-3 w-3">
                          {isActive ? (
                            <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </>
                          ) : (
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-400"></span>
                          )}
                        </div>
                        
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold ${isActive ? 'text-slate-800 group-hover:text-emerald-800' : 'text-slate-500'}`}>
                              {branch.name}
                            </h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                              isActive 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className={`text-xs ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                            📍 {branch.location || "On Campus"}
                          </p>
                        </div>
                      </div>
                      
                      {isActive ? (
                        <span className="text-emerald-600 transition-transform group-hover:translate-x-1 duration-200 text-xl font-bold">
                          ➔
                        </span>
                      ) : (
                        <span className="text-slate-400 text-lg">
                          🔒
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default CustomerDashboard