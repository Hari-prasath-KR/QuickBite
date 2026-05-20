import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GoogleAuthModal from "../components/GoogleAuthModal";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password,
      },
       { withCredentials: true } 
    );
      console.log(res.data);

      // 1. Extract the user name from the response
      const loggedInName = res.data.name;
      // 3. Store the name in localStorage for persistence
      localStorage.setItem('userName', loggedInName);
      // localStorage.setItem("token", res.data.token);
      // localStorage.setItem("role", res.data.role);

      setSuccess("Logged in successfully!");
      setError("");

      setTimeout(() => {
        if (res.data.role === "admin") navigate("/admin");
        else if (res.data.role === "cateringAdmin") navigate("/catering");
        else if (res.data.role === "staff") navigate("/staff/dashboard");
        else navigate("/customer");
      }, 800);
    } catch (err) {
      console.error("🔥 Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed");
      setSuccess("");
    }
  };

  const handleGoogleSelect = async (googleUser) => {
    try {
      setIsGoogleModalOpen(false);
      const res = await axios.post("http://localhost:5001/api/auth/google-login", googleUser, {
        withCredentials: true
      });
      
      localStorage.setItem('userName', res.data.name);
      setSuccess("Logged in with Google successfully!");
      setError("");
      
      setTimeout(() => {
        if (res.data.role === "admin") navigate("/admin");
        else if (res.data.role === "cateringAdmin") navigate("/catering");
        else if (res.data.role === "staff") navigate("/staff/dashboard");
        else navigate("/customer");
      }, 800);
    } catch (err) {
      console.error("🔥 Google authentication failed:", err);
      setError(err.response?.data?.message || err.response?.data?.msg || "Google authentication failed");
      setSuccess("");
    }
  };

  return (
    <>
      <div className="navbar bg-green-400 shadow-md px-6 fixed top-0 left-0 w-full z-50">
          <a className="text-2xl font-extrabold text-white cursor-pointer" onClick={()=>{navigate("/home")}}>
            QuickBite 🍔
          </a>
      </div>

    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-2xl w-96 border-2 border-yellow-400"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-yellow-600  text-center">
          QuickBite Login 🍔
        </h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">{success}</p>}

        <input
          type="email"
          placeholder="Enter your Email"
          className="w-full mb-4 px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter your Password"
          className="w-full mb-6 px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition duration-300 shadow-md mb-2"
        >
          Login
        </button>

        <div className="flex items-center my-3">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-xs text-gray-400 font-bold uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="w-full flex items-center justify-center py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.21-.63-.35-1.3-.35-2.09C4.66 12.63 5.84 14.09 5.84 14.09z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-yellow-600 font-semibold cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </form>
    </div>

    <GoogleAuthModal
      isOpen={isGoogleModalOpen}
      onClose={() => setIsGoogleModalOpen(false)}
      onSelect={handleGoogleSelect}
    />
    </>
  );
};

export default Login;
