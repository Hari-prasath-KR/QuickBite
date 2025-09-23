import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- Icon Components (for Navbar) ---
const BellIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const Bars3Icon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

// --- Reusable Components ---

const AdminNavbar = ({ adminName = "Catering Admin" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = ['Dashboard', 'Caterers', 'Staff', 'Menu', 'Analytics'];
  
  return (
    <nav>
      <header className="bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center shadow-md fixed top-0 left-0 w-full z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold text-gray-800">Catering Admin</h1>
          </div>
          <div className="hidden lg:flex items-center space-x-6 ml-6">
            {navLinks.map(link => (
               <a key={link} href="#" className={`text-sm font-medium ${link === 'Dashboard' ? 'text-green-600' : 'text-gray-600'} hover:text-green-600 transition-colors`}>
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-600 hover:text-green-600">
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {adminName?.substring(0, 2).toUpperCase()}
            </div>
            <p className="hidden md:block font-semibold text-sm text-gray-800">{adminName}</p>
          </div>
          <button className="text-gray-600 hover:text-green-600 lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </header>
      {isMenuOpen && (
         <div className="lg:hidden fixed top-20 right-4 w-48 bg-white rounded-lg shadow-xl z-40">
           <div className="py-2">
            {navLinks.map(link => (
              <a key={link} href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50">
                {link}
              </a>
            ))}
           </div>
         </div>
      )}
    </nav>
  );
};

const StatCard = ({ title, value, change, isPositive = true }) => {
  const changeColor = isPositive ? 'text-green-600' : 'text-red-500';
  
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>
      </div>
    </div>
  );
};

const TopDishesList = ({ dishes }) => (
  <div>
    <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 Dishes</h3>
    <ol className="space-y-3 text-gray-700">
      {dishes.map((dish, index) => (
        <li key={index} className="flex items-center">
          <span className="text-sm font-medium mr-4 text-gray-400">{index + 1}.</span>
          <span className="text-md">{dish}</span>
        </li>
      ))}
    </ol>
  </div>
);

const RevenueChart = ({ data }) => {
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b', '#d946ef'];

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue by Branch</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="sm:col-span-1 text-sm text-gray-600 space-y-2">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span>{entry.name} ({entry.value}%)</span>
            </div>
          ))}
        </div>
        <div className="sm:col-span-2 w-full h-64">
          <ResponsiveContainer>
            <PieChart>
              <Tooltip formatter={(value) => `${value}%`} />
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={2} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const CateringAdmin = () => {
  
  // Mock Data - Replace this with data from your API
  const statCardData = [
    { title: "Today's Income vs. Yesterday", value: '₹12,450', change: '+15%', isPositive: true },
    { title: "This Week's Income vs. Last Week", value: '₹85,300', change: '+8%', isPositive: true },
    { title: "This Month's Income vs. Last Month", value: '₹3,25,000', change: '-2.5%', isPositive: false },
  ];

  const topDishesData = [
    "Chicken Piccata",
    "Beef Wellington",
    "Vegetarian Lasagna",
    "Seared Salmon",
    "Chocolate Lava Cake",
  ];

  const revenueByBranchData = [
    { name: 'Downtown', value: 25 },
    { name: 'Uptown', value: 20 },
    { name: 'Suburban North', value: 15 },
    { name: 'Suburban South', value: 10 },
    { name: 'Airport', value: 8 },
    { name: 'Others', value: 22 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white text-gray-800 font-sans">
      <AdminNavbar />
      
      <main className="p-4 sm:p-6 lg:p-8 pt-24"> {/* Added pt-24 for fixed navbar offset */}
        
        {/* Header Section */}
        <header className="relative bg-gray-800 text-white p-8 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1887&auto=format&fit=crop')" }}></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold">Gourmet Catering Co.</h1>
            <p className="mt-2 text-lg text-gray-300">Admin Overview Panel</p>
          </div>
        </header>

        {/* Stat Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCardData.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} change={stat.change} isPositive={stat.isPositive} />
          ))}
        </div>

        {/* Income Summary Section */}
        <section className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Income Summary</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <TopDishesList dishes={topDishesData} />
            </div>
            <div className="lg:col-span-2">
              <RevenueChart data={revenueByBranchData} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CateringAdmin;

