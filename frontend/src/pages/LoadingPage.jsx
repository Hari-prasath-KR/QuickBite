import React, { useEffect } from "react";
import {useNavigate} from "react-router-dom"

const LoadingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000); 
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 via-yellow-200 to-white">
      <h1 className="text-4xl font-bold text-green-800 animate-bounce">
        QuickBite 🍔
      </h1>
      <p className="mt-4 text-lg text-gray-700">
        Loading your delicious experience...
      </p>
    </div>
  );
};

export default LoadingPage;
