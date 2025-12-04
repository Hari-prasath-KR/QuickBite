import React, { useEffect, useState } from "react";
import CateringAdminNavbar from "../../components/CateringAdminNavbar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import api from "../../utils/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#6A33AA", "#CCCCCC"];

const CateringAdmin = () => {
  const [catering, setCatering] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/catering-admin/analytics", { withCredentials: true });
        setCatering(res.data.catering);
        setAnalytics(res.data.analytics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!catering) return <div className="p-10">❌ Catering not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white flex">

      <main className="flex-1 p-8 pt-0 space-y-8">
        {/* Hero Section */}
        <div className="bg-cover bg-center h-52 md:h-72 flex items-center rounded-b-3xl shadow-lg"
            style={{
            backgroundImage: catering
              ? `url("/Gemini_Generated_Image_ay0h6xay0h6xay0h.png")`
              : "none",
          }}>
          <div className="bg-black/50 w-full h-full rounded-b-3xl flex items-center px-12">
            <img src={catering.logo || "/default-logo.png"} className="h-36 w-36 rounded-full border-4 border-white mr-6"/>
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-extrabold">{catering.name}</h2>
              <p className="mt-2 text-lg md:text-xl max-w-2xl">{catering.description}</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="space-y-6">
            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["today", "weekly", "monthly"].map((period, i) => (
                <div key={i} className="p-4 bg-gray-100 rounded-xl text-center">
                  <p className="font-semibold text-black">
                    {period === "today" ? "Today" : period === "weekly" ? "This Week" : "This Month"}
                  </p>
                  <p className="text-2xl font-bold text-black">₹{analytics.revenue[period].amount}</p>
                  <p className="text-sm text-gray-700">
                    {analytics.revenue[period].percentageChange >= 0 ? "▲" : "▼"} {Math.abs(analytics.revenue[period].percentageChange)}%
                  </p>
                </div>
              ))}
            </div>

            {/* Top Dishes */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h4 className="font-semibold mb-4">🍽 Top Dishes</h4>
              <ul className="space-y-3">
                {analytics.topDishes.map((dish, i) => (
                  <li key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-black font-medium">{i+1}. {dish.dish}</span>
                    <span className="text-blue-600 font-semibold">{dish.count} orders</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h4 className="font-semibold mb-4">📊 Top Caterer Revenue</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={analytics.branchesPie} dataKey="revenue" nameKey="name" outerRadius={100}>
                    {analytics.branchesPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CateringAdmin;
