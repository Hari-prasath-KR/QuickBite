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
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="text-white font-bold text-xl">YourApp</span>
            </div>
            <div className="flex items-center space-x-4">
              {user.role === 'customer' && (
                <button
                  onClick={() => navigate('/order-history')}
                  className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Order History
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      
      <main className="pt-10">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6 w-11/12 md:w-1/2">
          <div className="flex justify-center">
            <div className="relative">
              <img
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                src={user.profilePhotoUrl || '/default-profile.svg'}
                alt="Profile"
              />
              <button
                onClick={handlePhotoEditClick}
                className="absolute bottom-0 right-0 bg-slate-700 hover:bg-slate-900 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
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
            <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-md text-gray-500 mt-1">{user.email}</p>
          </div>
          <div className="border-t pt-6 text-center">
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
              Edit Name & Email
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;