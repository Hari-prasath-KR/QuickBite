import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

function AddStaffNavbar() {
    const navigate = useNavigate();
    return (
        <div className="navbar bg-gradient-to-br from-green-500 via-green-400 to-yellow-200 shadow-lg">
            <div className="flex-1">
                <button onClick={() => navigate(-1)} className="btn btn-ghost text-2xl text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Register New Employee
                </button>
            </div>
        </div>
    );
}

export function AddStaff() {
    const StaffIcon = () => (
        <svg
            className="w-16 h-16 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    );
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/catering-admin/branches", { withCredentials: true });
                setBranches(res.data);
                if (res.data.length > 0) {
                    setSelectedBranch(res.data[0]._id);
                }
            } catch (err) {
                console.error("Could not fetch branches", err);
                setError("Could not load branches for selection.");
            }
        };
        fetchBranches();
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!name || !email || !password || !selectedBranch) {
            setError("Please fill in all required fields.");
            return;
        }
        const newStaffUser = { name, email, password, branchId: selectedBranch };
        try {
            await axios.post("http://localhost:5001/api/catering-admin/branches/staff", newStaffUser, { 
                withCredentials: true,
            });
            setSuccess("Staff member account created successfully!");
            setName("");
            setEmail("");
            setPassword("");
            if (branches.length > 0) {
                setSelectedBranch(branches[0]._id);
            }
        } catch (err) {
            console.error("Error adding staff:", err);
            setError(err.response?.data?.msg || "Failed to add staff. Please try again.");
        }
    };
  
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col">
            <AddStaffNavbar />
            <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="text-center md:text-left">
                        <StaffIcon />
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 mt-4">
                            Onboard a New Staff Member
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Create a new user account for a staff member and assign them to a branch. They will need the email and password to log in.
                        </p>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg space-y-6">
                            {success && (<div className="p-4 text-sm text-green-800 bg-green-100 rounded-lg">{success}</div>)}
                            {error && (<div className="p-4 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>)}
                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">Staff Full Name</label>
                                <input type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John" required />
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">Email Address (for login)</label>
                                <input type="email" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g  staff@example.com" required />
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">Password</label>
                                <input type="password" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">Assign to Branch</label>
                                <select
                                    className="w-full border text-black border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-green-500"
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}>
                                    <option value="" disabled className="text-black">-- Select a Branch --</option>
                                    {branches.map(branch => (
                                        <option key={branch._id} value={branch._id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition duration-300">
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}