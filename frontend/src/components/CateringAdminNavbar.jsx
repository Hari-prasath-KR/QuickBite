import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";

// ================= ICONS =================
const HomeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M3 10.5V21h6V15h6v6h6V10.5" />
  </svg>
);

const BranchesIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17l2.472-2.472a3.375 3.375 0 00-4.773-4.773L6.75 15.75l-2.472 2.472a3.375 3.375 0 004.773 4.773L11.42 15.17z" />
  </svg>
);

const StaffIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const MenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const AnalyticsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.5m1-1.5l1-1.5" />
  </svg>
);

const LogoutIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

const NavLink = ({ icon, name, path }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === `/catering/${path}`;

  return (
    <button
      onClick={() => navigate(`/catering/${path}`)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive ? "bg-white text-green-700 shadow-md" : "text-white/90 hover:bg-white/20 hover:text-white"
      }`}
    >
      {icon}
      <span className="ml-3">{name}</span>
    </button>
  );
};


const CateringAdminNavbar = ({ adminName }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      navigate("/home");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { name: "Dashboard", icon: <HomeIcon className="w-5 h-5" />, path: "dashboard" },
    { name: "Branches", icon: <BranchesIcon className="w-5 h-5" />, path: "branches" },
    { name: "Staff", icon: <StaffIcon className="w-5 h-5" />, path: "staff" },
    { name: "Menu", icon: <MenuIcon className="w-5 h-5" />, path: "menu" },
    { name: "Analytics", icon: <AnalyticsIcon className="w-5 h-5" />, path: "analytics" },
  ];

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 flex flex-col bg-gradient-to-b from-green-500 to-green-700 shadow-2xl z-50">
      <div className="flex items-center justify-center h-20 border-b border-white/20">
        <span className="text-3xl mr-2">🍽️</span>
        <h1 className="text-2xl font-bold text-white">Quickbites</h1>
      </div>

      <nav className="flex-grow px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.name} {...item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
            {adminName?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{adminName}</p>
            <p className="text-xs text-green-100">Catering Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
        >
          <LogoutIcon className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default CateringAdminNavbar;
