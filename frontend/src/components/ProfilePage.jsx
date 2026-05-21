import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import CustomerNavbar from './CustomerNavbar';
import toast from 'react-hot-toast';
import { 
  User, 
  Camera, 
  Award, 
  ShoppingBag, 
  CreditCard, 
  Lock, 
  LogOut, 
  Edit3, 
  Loader2,
  Trophy,
  Gift
} from 'lucide-react';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedPrefs, setSelectedPrefs] = useState(['Vegetarian', 'Spicy']);
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/profile', { withCredentials: true });
        const userData = res.data.data || res.data;
        setUser(userData);
        setEditName(userData.name || '');
        setEditEmail(userData.email || '');
      } catch (err) {
        console.error('Unauthorized, redirecting to login:', err);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      navigate('/home');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Failed to log out.');
    }
  };

  // Handle profile photo upload to Cloudinary
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // File validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG/JPEG/WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    const toastId = toast.loading('Uploading photo to Cloudinary...');

    try {
      const res = await api.put('/user/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (res.data.success) {
        setUser((prevUser) => ({ ...prevUser, profilePhotoUrl: res.data.url }));
        toast.success('Profile photo uploaded and updated!', { id: toastId });
      } else {
        toast.error('Failed to upload photo.', { id: toastId });
      }
    } catch (err) {
      console.error('Failed to upload profile photo:', err);
      toast.error(err.response?.data?.message || 'Error uploading profile photo.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // Update profile details handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put('/user/update', { name: editName, email: editEmail }, { withCredentials: true });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success('Profile details updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(res.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error updating profile details.');
    } finally {
      setUpdating(false);
    }
  };

  const togglePreference = (pref) => {
    if (selectedPrefs.includes(pref)) {
      setSelectedPrefs(selectedPrefs.filter((p) => p !== pref));
    } else {
      setSelectedPrefs([...selectedPrefs, pref]);
    }
  };

  // Trigger the hidden file input when edit button is clicked
  const handlePhotoEditClick = () => {
    fileInputRef.current.click();
  };

  if (!user) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white font-sans">
        <Loader2 className="animate-spin text-emerald-600 h-12 w-12" />
        <span className="text-slate-800 font-extrabold tracking-wide">Loading profile...</span>
      </div>
    );
  }

  const orderCount = user.orderCount || 0;
  const points = orderCount * 10;
  
  // Calculate tier details dynamically based on points
  let tierName = "Bronze";
  let tierColor = "text-orange-600 bg-orange-100/60 border-orange-300 font-bold";
  let nextTier = "Silver";
  let pointsToNext = 100 - points;
  let progressPercentage = (points / 100) * 100;
  
  if (points >= 1000) {
    tierName = "Platinum";
    tierColor = "text-violet-600 bg-violet-100/60 border-violet-300 font-extrabold";
    nextTier = "Max Level";
    pointsToNext = 0;
    progressPercentage = 100;
  } else if (points >= 500) {
    tierName = "Gold";
    tierColor = "text-amber-600 bg-amber-100/60 border-amber-300 font-bold";
    nextTier = "Platinum";
    pointsToNext = 1000 - points;
    progressPercentage = ((points - 500) / 500) * 100;
  } else if (points >= 100) {
    tierName = "Silver";
    tierColor = "text-slate-600 bg-slate-100/60 border-slate-300 font-bold";
    nextTier = "Gold";
    pointsToNext = 500 - points;
    progressPercentage = ((points - 100) / 400) * 100;
  } else {
    tierName = "Bronze";
    tierColor = "text-orange-600 bg-orange-100/60 border-orange-300 font-bold";
    nextTier = "Silver";
    pointsToNext = 100 - points;
    progressPercentage = (points / 100) * 100;
  }

  // Calculate wallet dynamically: starter campus credits ₹500, plus ₹50 for every 10 orders
  const walletAmount = 500 + Math.floor(orderCount / 10) * 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white font-sans">
      {/* Navigation header */}
      {user.role === 'customer' ? (
        <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
          <CustomerNavbar />
        </div>
      ) : (
        <nav className="fixed top-0 left-0 w-full z-50 bg-emerald-500 shadow-md h-16 flex items-center px-6 justify-between text-white">
          <span className="font-extrabold text-2xl cursor-pointer" onClick={() => navigate(-1)}>QuickBite 🍔</span>
          <button onClick={handleLogout} className="bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-lg text-sm font-semibold transition shadow">
            Logout
          </button>
        </nav>
      )}

      {/* Main Profile Portal */}
      <main className="min-h-screen flex items-center justify-center pt-28 pb-12 px-4 md:px-6">
        <div className="w-full max-w-4xl bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 flex flex-col md:flex-row">
          
          {/* Left Side: Avatar & Bio Portfolio */}
          <div className="w-full md:w-1/3 bg-gradient-to-b from-slate-900/5 to-slate-900/10 p-8 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-white/20">
            {/* Avatar container */}
            <div className="relative group">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-emerald-400/80 shadow-lg relative transition-all duration-300 group-hover:scale-105 group-hover:border-yellow-400 bg-white/50">
                <img
                  className="w-full h-full object-cover"
                  src={user.profilePhotoUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                  alt="Profile"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                    <Loader2 className="animate-spin text-emerald-400 h-8 w-8" />
                  </div>
                )}
              </div>
              <button
                onClick={handlePhotoEditClick}
                disabled={uploading}
                className="absolute bottom-1 right-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-2.5 focus:outline-none transition shadow-md hover:scale-110 active:scale-95 duration-200"
                title="Edit profile photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
              />
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 mt-5 leading-tight">{user.name}</h2>
            <p className="text-sm font-semibold text-emerald-800 mt-1.5 bg-emerald-100/50 px-3.5 py-1 rounded-full uppercase tracking-wider inline-block">
              {user.role} Member
            </p>
            
            {/* Bio stats */}
            <div className="w-full grid grid-cols-2 gap-4 mt-8 border-t border-slate-900/10 pt-6">
              <div className="text-center">
                <span className="block text-2xl font-black text-slate-800">{points}</span>
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Loyalty Points</span>
              </div>
              <div className="text-center">
                <span className={`block text-2xl font-black ${tierColor.split(" ")[0]}`}>{tierName}</span>
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Tier Level</span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="mt-8 w-full py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition duration-300 shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
          
          {/* Right Side: Tab Details */}
          <div className="w-full md:w-2/3 p-8 flex flex-col justify-between">
            <div>
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-900/10 pb-2 mb-6 gap-6 justify-center md:justify-start">
                {['portfolio', 'wallet', 'preferences'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-sm font-black uppercase tracking-wider transition-all relative ${
                      activeTab === tab 
                        ? 'text-slate-800' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab === 'portfolio' ? 'Profile' : tab === 'wallet' ? 'Wallet' : 'Preferences'}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full animate-scale-x" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Tab Contents */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <User className="text-emerald-500 w-5 h-5" /> Account Details
                    </h3>
                    <p className="text-xs text-slate-600">Your profile information and platform credentials.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/45 border border-white/20 p-4 rounded-2xl shadow-sm">
                      <span className="block text-xs uppercase font-bold text-slate-500">Full Name</span>
                      <span className="text-base font-bold text-slate-800 mt-1 block">{user.name}</span>
                    </div>
                    
                    <div className="bg-white/45 border border-white/20 p-4 rounded-2xl shadow-sm">
                      <span className="block text-xs uppercase font-bold text-slate-500">Email Address</span>
                      <span className="text-base font-bold text-slate-800 mt-1 block">{user.email}</span>
                    </div>
                  </div>
                  
                  {/* Dynamic Next Milestone Tracker Card */}
                  <div className="bg-white/45 border border-white/20 p-5 rounded-2xl shadow-sm flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider">Loyalty Progress</span>
                          <span className="text-sm font-black text-slate-800">
                            {points >= 1000 
                              ? "Platinum Tier Achieved" 
                              : `Next Tier: ${nextTier}`}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
                        Loyalty Program
                      </span>
                    </div>

                    {/* Progress Slider */}
                    <div className="w-full mt-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>Current: {points} points</span>
                        <span>
                          {points >= 1000 
                            ? "1000+ points" 
                            : `Goal: ${points + pointsToNext} points`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/50 rounded-full h-3 overflow-hidden border border-white/30">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 ease-out" 
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                      Earn 10 loyalty points on every order. 
                      {points < 1000 && ` Place ${pointsToNext / 10} more orders to reach ${nextTier} tier.`}
                    </p>
                  </div>
                  
                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition duration-300 shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Details
                    </button>
                    {user.role === 'customer' && (
                      <button
                        onClick={() => navigate('/order-history')}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition duration-300 shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Order History
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'wallet' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <CreditCard className="text-emerald-500 w-5 h-5" /> Wallet Balance
                    </h3>
                    <p className="text-xs text-slate-600">Manage your wallet balance.</p>
                  </div>
                  
                  {/* Credit Card UI */}
                  <div className="relative w-full max-w-md h-48 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between text-white overflow-hidden group">
                    {/* Glowing effects */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-110 transition duration-500" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-500/15 rounded-full blur-2xl group-hover:scale-110 transition duration-500" />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">QuickBite Card</span>
                        <span className="text-2xl font-black mt-1 block">₹{walletAmount.toLocaleString("en-IN")}.00</span>
                      </div>
                      <span className="text-xl font-extrabold italic tracking-tight text-yellow-400">QuickBite</span>
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-slate-700/50 pt-4">
                      <div>
                        <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Card Holder</span>
                        <span className="text-sm font-semibold">{user.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Expires</span>
                        <span className="text-sm font-semibold">12/30</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dynamic Wallet Rewards Breakdown */}
                  <div className="bg-white/45 border border-white/20 p-5 rounded-2xl shadow-sm flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-xs font-black uppercase text-slate-500 tracking-wider">
                      <span>Wallet Summary</span>
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[9px]">
                        <Gift className="w-3 h-3" /> Wallet Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                      <span>Starter Credit</span>
                      <span>₹500.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-emerald-700">
                      <span>Loyalty Bonus (₹50 per 10 orders)</span>
                      <span>+₹{Math.floor(orderCount / 10) * 50}.00</span>
                    </div>
                    
                    <div className="border-t border-slate-200/60 mt-2 pt-2.5 flex justify-between items-center text-[10px] text-slate-500 font-bold">
                      <span>Total orders placed: {orderCount}</span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        {10 - (orderCount % 10)} orders remaining for next bonus
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'preferences' && (
                <div className="space-y-6 text-left animate-fade-in-up">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Award className="text-emerald-500 w-5 h-5" /> Dietary Preferences
                    </h3>
                    <p className="text-xs text-slate-600">Customize your dietary preferences.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Nut-Free', 'Spicy', 'Desserts'].map((pref) => {
                      const isSelected = selectedPrefs.includes(pref);
                      return (
                        <button
                          key={pref}
                          onClick={() => togglePreference(pref)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                            isSelected 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow'
                              : 'bg-white/45 border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="bg-white/45 border border-white/20 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      These preferences will help highlight relevant menu items during ordering.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-[10px] text-slate-500 font-semibold mt-8 text-center md:text-left">
              QuickBite Student Account
            </p>
          </div>
        </div>
      </main>

      {/* Edit Details Overlay Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-yellow-300 animate-fade-in-up">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold transition"
            >
              ✕
            </button>
            
            <div className="mb-6 text-left">
              <h3 className="text-2xl font-black text-slate-800">Edit Profile Details</h3>
              <p className="text-xs text-slate-500 mt-1">Update your name and email.</p>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1.5 tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 transition"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1.5 tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 transition"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition duration-300 shadow flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;