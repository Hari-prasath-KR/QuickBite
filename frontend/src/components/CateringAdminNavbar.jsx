import React, { useState } from 'react';

// --- Icon Components ---
const BellIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const Bars3Icon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const AdminNavbar = ({ adminName = "Catering Admin" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = ['Dashboard', 'Caterers', 'Staff', 'Menu', 'Analytics'];
  
  return (
    <nav>
      <header className="bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center shadow-md fixed top-0 left-0 w-full z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold text-gray-800">Catering Admin</h1>
          </div>
          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-6 ml-6">
            {navLinks.map(link => (
               <a key={link} href="#" className={`text-sm font-medium ${link === 'Dashboard' ? 'text-green-600' : 'text-gray-600'} hover:text-green-600 transition-colors`}>
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-600 hover:text-green-600">
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {adminName?.substring(0, 2).toUpperCase()}
            </div>
            <p className="hidden md:block font-semibold text-sm text-gray-800">{adminName}</p>
          </div>
          {/* Hamburger Menu Button */}
          <button className="text-gray-600 hover:text-green-600 lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
         <div className="lg:hidden fixed top-20 right-4 w-48 bg-white rounded-lg shadow-xl z-40">
           <div className="py-2">
            {navLinks.map(link => (
              <a key={link} href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50">
                {link}
              </a>
            ))}
           </div>
         </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
