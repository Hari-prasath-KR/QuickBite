import React from "react";
import { useNavigate } from "react-router-dom";


const AdminNavbar = () => {
  const navigate = useNavigate();



  return (
    <div className="navbar bg-green-400 shadow-lg">
      {/* Left Icon (Sidebar / Menu) */}
      <div className="flex-none dropdown">
        <button tabIndex={0} className="btn btn-square btn-ghost text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-6 w-6 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <ul
          tabIndex={0}
          className="menu dropdown-content mt-3 p-2 shadow bg-white rounded-box w-52 text-black space-y-1 font-bold text-xs"
        >
          <li>
            <button 
              onClick={() => navigate("/admin")}
              className="hover:bg-slate-100 rounded-xl transition-colors py-2 flex items-center gap-2"
            >
              🏠 Operations Control
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate("/admin/analytics")}
              className="hover:bg-slate-100 rounded-xl transition-colors py-2 flex items-center gap-2"
            >
              📊 Business Intelligence
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate("/profile")}  
              className="hover:bg-slate-100 rounded-xl transition-colors py-2 flex items-center gap-2 text-slate-800"
            >
              👤 Portfolio
            </button>
          </li>
        </ul>

      </div>

      {/* Brand Name */}
      <div className="flex-1">
       <a className="text-2xl font-extrabold text-white cursor-pointer" onClick={()=>{navigate("/admin")}}>
          QuickBites 🏫
        </a>
      </div>

      {/* Right Dropdown */}
      <div className="flex-none dropdown dropdown-end">
        <button tabIndex={0} className="btn btn-square btn-ghost text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-6 w-6 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </button>
        <ul
          tabIndex={0}
          className="menu dropdown-content mt-3 p-2 shadow bg-white rounded-box w-52 text-black"
        >
          <li><button onClick={() => navigate("/admin/add-catering")}
          className="hover:bg-gray-200 rounded-2xl transition-colors">➕ Add Catering</button></li>
          <li><button onClick={() => navigate("/admin/manage-caterings")}
          className="hover:bg-gray-200 rounded-2xl transition-colors">📋 View Caterings</button></li>
          <li><button onClick={() => navigate("/admin/add-catering-admin")}
          className="hover:bg-gray-200 rounded-2xl transition-colors">👨‍💼 Add Catering Admin</button></li>
          <li><button onClick={() => navigate("/admin/manage-catering-admins")}
          className="hover:bg-gray-200 rounded-2xl transition-colors">👥 Manage Admins</button></li>
          <li><button onClick={() => navigate("/admin/analytics")}
          className="hover:bg-gray-200 rounded-2xl transition-colors">📊 Analytics</button></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminNavbar;
