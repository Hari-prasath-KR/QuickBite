import React, { useState} from "react"; //useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

function AddBranchNavbar() {
    const navigate = useNavigate();
    return (
        <div className="navbar bg-gradient-to-br from-green-500 via-green-400 to-yellow-200 shadow-lg">
            <div className="flex-1">
                <button onClick={() => navigate(-1)} className="btn btn-ghost text-2xl text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Create a New Branch
                </button>
            </div>
        </div>
    );
}

export function AddBranch() {
  const BranchIcon = () => (
    <svg
      className="w-16 h-16 text-yellow-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 7l9-4 9 4-9 4-9-4zm0 8l9 4 9-4M3 7v8m18-8v8"
      />
    </svg>
  );
  const [branchName, setBranchName] = useState("");
  const [location, setLocation] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!branchName || !location) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      await axios.post( "http://localhost:5001/api/catering-admin/branches", { branchName, location }, { withCredentials: true } );
      setSuccess("Branch added successfully!");
      setBranchName("");
      setLocation("");
    } catch (err) {
      console.error("Error adding branch:", err);
      setError(err.response?.data?.msg || "Failed to add branch. Please try again.");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col">
      <AddBranchNavbar />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left Section */}
          <div className="text-center md:text-left">
            <BranchIcon />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 mt-4"> Register a New Branch </h1>
            <p className="mt-4 text-lg text-gray-600">  Add a new branch for your catering service. Include location details for better visibility. </p>
          </div>
          {/* Right Section */}
          <div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 space-y-6" >
              {success && (<div className="p-4 text-sm text-green-800 bg-green-100 rounded-lg">  {success}</div> )}
              {error && (<div className="p-4 text-sm text-red-800 bg-red-100 rounded-lg">  {error} </div> )}
              <div>
                <label className="block mb-2 font-semibold text-gray-700"> Branch Name</label>
                <input type="text" placeholder="e.g., Royal Caterers - Coimbatore" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500"
                value={branchName} onChange={(e) => setBranchName(e.target.value)} required/>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700"> Location</label>
                <input  type="text" placeholder="e.g., Gandhipuram, Coimbatore" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500"
                 value={location}onChange={(e) => setLocation(e.target.value)} required/>
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition duration-300" >
                Add Branch
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}