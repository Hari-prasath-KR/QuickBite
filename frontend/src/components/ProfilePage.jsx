import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- Effects ---
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

  // Handle profile photo selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
    }
  };

  // Trigger the hidden file input when the edit button is clicked
  const handlePhotoEditClick = () => {
    fileInputRef.current.click();
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen bg-gray-100">Loading profile...</div>;
  }

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
                className="absolute bottom-0 right-0 bg-green-500 hover:bg-green-600 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition shadow"
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
                accept="image/png, image/jpeg"
              />
            </div>
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