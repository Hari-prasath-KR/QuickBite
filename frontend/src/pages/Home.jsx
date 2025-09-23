import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [caterings, setCaterings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCaterings = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/caterings");
        setCaterings(res.data);
        console.log("Caterings:", res.data);
      } catch (err) {
        console.error("Error fetching caterings:", err);
      }
    };
    fetchCaterings();
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <NavBar />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col items-center pt-24 px-6">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 items-center gap-8 mb-16">
          <div className="text-left">
            <h1 className="text-5xl font-extrabold text-green-900 leading-tight">
              Fresh, Fast <br /> & Delicious 🍔
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Order from your favorite catering in your college instantly!
            </p>
            <button
              onClick={() => navigate("/register")}
              className="mt-6 px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
            >
              Start Ordering 🚀
            </button>
          </div>

          {/* Right Image */}
          <div className="flex justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
              alt="Burger"
              className="w-72 h-72 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Catering Cards */}
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
          {caterings.map((catering) => (
            <div
              key={catering._id}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-yellow-300"
            >
              <img
                src={catering.logo}
                alt={catering.name}
                className="h-20 w-20 object-contain mb-4"
              />
              <h2 className="text-xl font-bold text-gray-800">
                {catering.name}
              </h2>
              <p className="text-gray-600 text-sm mt-2 text-center">
                {catering.description || "Delicious meals for everyone!"}
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Login to Order
              </button>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl text-center border border-yellow-300 mb-10">
          <h3 className="text-2xl font-bold mb-4">Features</h3>
          <ul className="space-y-2 text-gray-700">
            <li>⚡ Order in seconds</li>
            <li>🔒 Secure online payment only</li>
            <li>⭐ Real-time ratings & reviews</li>
          </ul>
          <button
            onClick={() => navigate("/register")}
            className="mt-6 px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
          >
            Login / Register to Order Now 🚀
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
