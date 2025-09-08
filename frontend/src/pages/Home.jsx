import React from "react";
import NavBar from "../components/NavBar";

const Home = () => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <NavBar />
      </div>

      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-200">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          🌮 Welcome to QuickBite 🚀
        </h1>
        <p className="mt-6 text-lg text-yellow-900 font-medium">
          Fresh, Fast & Delicious ✨
        </p>
      </div>
    </>
  );
};

export default Home;
