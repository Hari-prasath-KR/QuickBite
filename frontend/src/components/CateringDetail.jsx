import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import api from "../utils/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#6A33AA", "#CCCCCC"];

const CateringDetails = () => {
  const { id } = useParams();
  const [catering, setCatering] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCateringAnalytics = async () => {
      try {
        const res = await api.get(`/admin/analytics/caterings/${id}`, { withCredentials: true });
        const { catering, analytics } = res.data;

        setCatering(catering);
        setAnalytics(analytics);
      } catch (err) {
        console.error("Error fetching catering analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCateringAnalytics();
  }, [id]);

  // Skeleton Loader
  const SkeletonBox = ({ className }) => (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
  );
  if (loading) return <div className="p-10">Loading...</div>;
  if (!catering) return <div className="p-10">❌ Catering not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white">
      <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
        <AdminNavbar />
      </div>

      <div className="pt-18 p-8 space-y-8">

        {/* Hero Section */}
        <div
          className="relative bg-cover bg-center h-72 md:h-96 flex items-center rounded-b-3xl shadow-lg mt-2"
          style={{
            backgroundImage: catering
              ? `url("/Gemini_Generated_Image_6xft5n6xft5n6xft.png")`
              : "none",
          }}
        >
          <div className="absolute inset-0 bg-black/50 rounded-b-3xl"></div>

          <div className="relative flex items-center gap-8 px-12">
            {catering ? (
              <>
                <img
                  src={catering.logo || "/default-logo.png"}
                  alt={catering.name}
                  className="h-36 w-36 md:h-44 md:w-44 rounded-full border-4 border-white shadow-xl object-cover"
                />
                <div className="text-white">
                  <h2 className="text-4xl md:text-5xl font-extrabold">{catering.name}</h2>
                  <p className="mt-3 text-lg md:text-xl max-w-2xl">{catering.description}</p>
                  {catering?.admin && (
                    <div className="mt-4 text-base md:text-lg text-gray-200">
                      <p>
                        <span className="font-semibold">Admin:</span> {catering.admin.name}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span> {catering.admin.email}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-8">
                <SkeletonBox className="h-36 w-36 md:h-44 md:w-44 rounded-full border-4 border-white" />
                <div>
                  <SkeletonBox className="h-8 w-64 mb-4" />
                  <SkeletonBox className="h-6 w-80 mb-3" />
                  <SkeletonBox className="h-5 w-60 mb-2" />
                  <SkeletonBox className="h-5 w-48" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Section */}
        {analytics ? (
          <div className="space-y-6">
            {/* Revenue Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-black">💰 Revenue Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["today", "weekly", "monthly"].map((period, i) => (
                  <div key={i} className="p-4 bg-gray-100 rounded-xl text-center">
                    <p className="font-semibold text-black">
                      {period === "today" ? "Today" : period === "weekly" ? "This Week" : "This Month"}
                    </p>
                    <p className="text-2xl font-bold text-black">₹{analytics.revenue[period].amount}</p>
                    <p className="text-sm text-gray-700">
                      {analytics.revenue[period].percentageChange >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(analytics.revenue[period].percentageChange)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Dishes */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h4 className="font-semibold mb-4 text-black flex items-center">🍽 Top Dishes</h4>
                <ul className="space-y-3">
                  {analytics.topDishes.slice(0, 7).map((dish, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-black font-medium">{index + 1}. {dish.dish}</span>
                      <span className="text-blue-600 font-semibold">{dish.count} orders</span>
                    </li>
                  ))}
                  {Array.from({ length: Math.max(0, 8 - analytics.topDishes.length) }).map((_, i) => (
                    <li key={`skeleton-dish-${i}`} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg animate-pulse">
                      <span className="text-gray-400">Loading dish...</span>
                      <span className="text-gray-300">-- orders</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pie Chart + Branches */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h4 className="font-semibold mb-4 text-black flex items-center">📊 Top Caterer Revenue</h4>
                <div className="w-full h-64 flex justify-center items-center">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={analytics.branchesPie}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.branchesPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                  {analytics.branches.map((branch) => (
                    <div key={branch._id} className="flex items-center bg-gray-50 p-3 rounded-xl shadow-sm border">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">🏢</div>
                      <div>
                        <h5 className="font-semibold text-black">{branch.name}</h5>
                        <p className="text-sm text-gray-600">₹{branch.revenue}</p>
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - analytics.branches.length) }).map((_, i) => (
                    <div key={`skeleton-branch-${i}`} className="flex items-center bg-gray-50 p-3 rounded-xl shadow-sm border animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Skeleton for Analytics while loading
          <div className="space-y-6">
            <SkeletonBox className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonBox className="h-64 w-full rounded-2xl" />
              <SkeletonBox className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CateringDetails;
