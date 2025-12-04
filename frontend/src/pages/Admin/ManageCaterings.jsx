import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";

const ManageCaterings = () => {
  const [caterings, setCaterings] = useState([]);

  useEffect(() => {
    fetchCaterings();
  }, []);

  const fetchCaterings = async () => {
    const res = await axios.get("http://localhost:5001/api/caterings", { withCredentials: true });
    setCaterings(res.data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this catering?")) return;
    await axios.delete(`http://localhost:5001/api/caterings/${id}`,{ withCredentials: true });
    fetchCaterings();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white">
     <div className="fixed top-0 left-0 w-full z-50">
          <AdminNavbar />
        </div>
      <div className="pt-24 p-8">
        <h2 className="text-2xl font-bold mb-4 text-white">📋 All Caterings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {caterings.map((c) => (
            <div key={c._id} className="bg-white p-4 rounded-lg shadow-md">
              {c.logo && (
                <img
                  src={c.logo}
                  alt={c.name}
                  className="w-20 h-20 object-cover rounded-full mb-3"
                />
              )}
              <h3 className="text-xl font-semibold">{c.name}</h3>
              <p className="text-gray-600">{c.description}</p>
              <button
                onClick={() => handleDelete(c._id)}
                className="mt-3 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageCaterings;
