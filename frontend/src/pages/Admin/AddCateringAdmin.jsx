import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import { useNavigate } from "react-router-dom";

// A small SVG component for the "user plus" icon
const UserPlusIcon = () => (
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
      strokeWidth="2"
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    ></path>
  </svg>
);

const AddCateringAdmin = () => {
  const [caterings, setCaterings] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", cateringId: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnassigned = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/admin/unassigned-caterings", { withCredentials: true });
        setCaterings(res.data);
      } catch (error) {
        setErrorMsg("Error loading caterings. Please try refreshing.", error.message);
      }
    };
    fetchUnassigned();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await axios.post("http://localhost:5001/api/admin/add-catering-admin", form, { withCredentials: true });
      setSuccessMsg(res.data.msg || "Admin created successfully!");
      // Clear form on success
      setForm({ name: "", email: "", password: "", cateringId: "" });
      setTimeout(() => navigate("/admin"), 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.msg || "Error creating admin. Please check the details.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex flex-col">
      <AdminNavbar />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left Column: Info */}
          <div className="text-center md:text-left">
            <UserPlusIcon />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 mt-4">
              Create a New Admin
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Assign a new administrator account to an unassigned catering service. Fill out the form to get started.
            </p>
          </div>

          {/* Right Column: Form */}
          <div>
            <form
              onSubmit={onSubmit}
              className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 space-y-6"
            >
              {successMsg && <div className="p-4 text-sm text-green-800 bg-green-100 rounded-lg">{successMsg}</div>}
              {errorMsg && <div className="p-4 text-sm text-red-800 bg-red-100 rounded-lg">{errorMsg}</div>}

              <div>
                <label htmlFor="cateringId" className="block mb-2 font-semibold text-gray-700">Select Catering Service</label>
                <select
                  id="cateringId"
                  name="cateringId"
                  value={form.cateringId}
                  onChange={onChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                  required
                >
                  <option value="" disabled>Choose a catering service...</option>
                  {caterings.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="name" className="block mb-2 font-semibold text-gray-700">Admin Name</label>
                <input id="name" name="name" value={form.name} onChange={onChange} placeholder="e.g., John Doe"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition" required />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 font-semibold text-gray-700">Admin Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="e.g., admin@example.com"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition" required />
              </div>

              <div>
                <label htmlFor="password"className="block mb-2 font-semibold text-gray-700">Password</label>
                <input id="password" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition" required />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
              >
                Create Catering Admin
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddCateringAdmin;