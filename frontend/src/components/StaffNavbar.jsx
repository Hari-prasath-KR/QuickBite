import React, { useState } from "react";

// --- Icons ---
const BellIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967
      8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967
      8.967 0 01-2.312 6.022c1.733.64 3.56 1.085
      5.455 1.31m5.714 0a24.255 24.255 0
      01-5.714 0m5.714 0a3 3 0 11-5.714 0"
    />
  </svg>
);

const Bars3Icon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5
      5.25h16.5"
    />
  </svg>
);

// --- Navbar ---
const StaffNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav>
      <header className="bg-green-400 backdrop-blur-sm p-4 flex justify-between items-center shadow-md fixed top-0 left-0 w-full z-50">
        {/* Branding */}
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold text-white">QuickBites</h1>
          <span className="text-2xl">👨‍🍳</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button className="relative text-gray-100 hover:text-yellow-200 transition-colors">
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userName?.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="font-semibold text-sm text-white">{userName}</p>
              <p className="text-xs text-gray-100">{userRole}</p>
            </div>
          </div>

          {/* Mobile Menu Button (optional) */}
          <button
            className="text-white hover:text-yellow-200 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Optional extra dropdown for mobile (not navigation) */}
      {isMenuOpen && (
        <div className="lg:hidden fixed top-20 right-4 w-48 bg-white rounded-lg shadow-xl z-40">
          <div className="py-2">
            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50">
              Profile
            </button>
            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50">
              Settings
            </button>
            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default StaffNavbar;
