// CateringManagement.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const CateringManagement = ({ catering, loading }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white/90 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-extrabold text-gray-800 mb-4">
          🍽️ Catering Management
        </h3>

        {/* Skeleton search bar */}
        <div className="w-1/3 mb-4 h-10 bg-gray-200 rounded-lg animate-pulse"></div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center p-3 bg-gray-100 rounded-lg animate-pulse"
            >
              <div className="h-16 w-16 rounded-full bg-gray-300 mb-2"></div>
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && (!catering || catering.length === 0)) {
    return <div>No catering services available.</div>;
  }

  const filteredCaterers = catering.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white/90 p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-extrabold text-gray-800 mb-4">
        🍽️ Catering Management
      </h3>

      {/* Search bar */}
      <input
        type="text"
        placeholder="🔍 Search caterers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-1/3 mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredCaterers.map((caterer) => (
          <div
            key={caterer._id}
            onClick={() => navigate(`/admin/catering/${caterer._id}`)}
            className="flex flex-col items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-center cursor-pointer"
          >
            <img
              src={caterer.logo || "/default-logo.png"}
              alt={caterer.name || "Caterer"}
              className="h-16 w-16 object-cover rounded-full border shadow-sm mb-2"
            />
            <p className="text-sm font-semibold text-gray-700">
              {caterer.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

CateringManagement.propTypes = {
  catering: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default CateringManagement;
