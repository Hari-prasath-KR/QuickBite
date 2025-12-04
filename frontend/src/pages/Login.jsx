import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "cateringAdmin") navigate("/catering");
      else if (res.data.role === "staff") navigate("/staff/dashboard");
      else navigate("/customer");
    } catch (err) {
      console.error("🔥 Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed");
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
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition duration-300 shadow-md"
        >
          Login
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
    </div></>
  );
};

export default Login;
