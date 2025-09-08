import React from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar bg-yellow-400 shadow-md px-6">
      {/* Left menu icon */}
      <div className="flex-none">
        <button className="btn btn-square btn-ghost text-white">
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
            ></path>
          </svg>
        </button>
      </div>

      {/* Logo + Title */}
      <div className="flex-1">
        <a className="text-2xl font-extrabold text-white cursor-pointer">
          QuickBite 🍔
        </a>
      </div>

      {/* Right side buttons */}
      <div className="flex-none space-x-3">
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 bg-white text-yellow-600 font-semibold rounded-lg shadow hover:bg-yellow-100 transition duration-300"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="px-5 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow hover:bg-yellow-700 transition duration-300"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default NavBar;
