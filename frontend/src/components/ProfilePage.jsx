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
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/profile', { withCredentials: true });
        setUser(res.data);
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

    try {
      // Send the image to your backend to be processed and saved
      const res = await api.put('/user/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      // Update the user state with the new photo URL from the response
      setUser((prevUser) => ({ ...prevUser, profilePhotoUrl: res.data.url }));
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

  // Trigger the hidden file input when the edit button is clicked
  const handlePhotoEditClick = () => {
    fileInputRef.current.click();
  };

  // Handle Input Changes inside Modal Form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Form Submission for Updates
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Adjust this endpoint route to mirror your backend profile update path
      const res = await api.put('/users/profile-update', formData, { withCredentials: true });
      
      setUser(res.data.user || { ...user, ...formData });
      setIsModalOpen(false);
      // Clear password field for security
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
  console.error('Failed to update profile data:', err);
  // This reads the specific error message sent by your backend
  const serverMessage = err.response?.data?.message || 'Error updating profile information.';
  alert(`Status ${err.response?.status}: ${serverMessage}`);
} finally {
  setIsUpdating(false);
}
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

  // Calculate wallet dynamically: starter campus credits ₹500, plus ₹50 for every 10 orders, falling back to database balance
  const walletAmount = typeof user.walletBalance === 'number' ? user.walletBalance : (500 + Math.floor(orderCount / 10) * 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white font-sans">
      <nav className="bg-green-400 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="text-white font-extrabold text-2xl">QuickBite 🍔</span>
            </div>
            <div className="flex items-center space-x-4">
              {user.role === 'customer' && (
                <button
                  onClick={() => navigate('/order-history')}
                  className="text-white hover:bg-green-500 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Order History
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition shadow"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-10 pb-10 flex justify-center">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-xl p-8 space-y-6 mx-4 border border-yellow-300">
          <div className="flex justify-center">
            <div className="relative">
              <img
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-sm"
                src={user.profilePhotoUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                alt="Profile"
              />
              <button
                onClick={handlePhotoEditClick}
                disabled={uploading}
                className="absolute bottom-1 right-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-2.5 focus:outline-none transition shadow-md hover:scale-110 active:scale-95 duration-200"
                title="Edit profile photo"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
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

          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-green-900">{user.name}</h2>
            <p className="text-lg text-gray-600 mt-1">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full uppercase tracking-wide">
              {user.role}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-6 text-center space-y-3">
            <button className="w-full bg-yellow-500 text-white font-bold py-3 rounded-lg hover:bg-yellow-600 transition shadow-md">
              Edit Name & Email
            </button>
            {user.role === 'customer' && (
              <button
                onClick={() => navigate('/order-history')}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition shadow-md"
              >
                View Order History 📜
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;