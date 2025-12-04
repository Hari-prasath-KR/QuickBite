import React, { useState, useRef } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";

const BusinessIcon = () => (
    <svg
        className="w-16 h-16 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4m0 4h5m0 0v-4m0 4H3m3-4h3m-3 0V7h3m-3 4h3m0-4V7m0 4h3m0 0V7m3 14v-4m0 4h3m0 0v-4m0 4h-3m6-4h.01M9 12h6m-6 4h6"
        />
    </svg>
);
const AddCatering = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [logo, setLogo] = useState(null);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name || !description || !logo) {
            setError("Please fill in all fields and upload a logo.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("logo", logo);

        try {
            await axios.post("http://localhost:5001/api/caterings", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            setSuccess("Catering service added successfully!");
            setName("");
            setDescription("");
            setLogo(null);
            // Use the ref to clear the file input's value
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            console.error("Error adding catering:", err);
            setError(err.response?.data?.msg || "Failed to add catering. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col">
            <AdminNavbar />
            <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Column: Information */}
                    <div className="text-center md:text-left">
                        <BusinessIcon />
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 mt-4">
                            Register a New Service
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Add a new catering service to the platform. Provide the name, a detailed description, and an official logo to get started.
                        </p>
                    </div>

                    {/* Right Column: Form */}
                    <div>
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 space-y-6"
                        >
                            {success && <div className="p-4 text-sm text-green-800 bg-green-100 rounded-lg">{success}</div>}
                            {error && <div className="p-4 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}

                            <div>
                                <label htmlFor="name" className="block mb-2 font-semibold text-gray-700">Catering Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="e.g., Royal Caterers"
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block mb-2 font-semibold text-gray-700">Description</label>
                                <textarea
                                    id="description"
                                    placeholder="Describe the unique services and specialties offered..."
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition h-36 resize-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="logo" className="block mb-2 font-semibold text-gray-700">Catering Logo</label>
                                <input
                                    id="logo"
                                    type="file"
                                    ref={fileInputRef} // Attach the ref here
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 transition"
                                    onChange={(e) => setLogo(e.target.files[0])}
                                    accept="image/png, image/jpeg, image/gif"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
                            >
                                Add Catering Service
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddCatering;