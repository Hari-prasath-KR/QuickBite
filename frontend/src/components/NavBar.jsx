import React from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar bg-green-400 shadow-md px-6">
      <div className="flex-1">
        <a className="text-3xl font-extrabold text-white cursor-pointer">
          QuickBites 🍔
        </a>
      </div>
      <div className="dropdown dropdown-bottom">
            <button tabIndex={0} role="button" className="btn btn-square btn-ghost text-white">
              <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 stroke-current" 
              fill="none" viewBox="0 0 24 24"
              >
              <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 6h16M4 12h16M4 18h16"
              />
              </svg>
            </button>
            <ul tabIndex={0} className="menu dropdown-content mt-3 p-2 shadow bg-white rounded-box w-40 right-0 gap-2">
              <li><button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg w-full" onClick={()=>navigate("/login")}>👤 Login</button></li>
              <li><button className="bg-green-500 hover:bg-green-600 text-white rounded-lg w-full" onClick={()=>navigate("/register")}>📋 Register</button></li>
            </ul>
      </div>
    </div>
  );
};

export default NavBar;
