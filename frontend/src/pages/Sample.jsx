// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import NavBar from "../components/NavBar";
// import { useNavigate } from "react-router-dom";

// // --- Sub-components for a cleaner structure ---

// // Skeleton Loader for a better initial loading experience
// const CateringCardSkeleton = () => (
//   <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-200 animate-pulse">
//     <div className="h-24 w-24 rounded-full bg-gray-200 mb-4"></div>
//     <div className="h-6 w-3/4 rounded bg-gray-200 mb-2"></div>
//     <div className="h-4 w-full rounded bg-gray-200 mb-4"></div>
//     <div className="h-4 w-1/2 rounded bg-gray-200"></div>
//     <div className="mt-6 h-10 w-32 bg-gray-200 rounded-lg"></div>
//   </div>
// );

// // --- Main Home Component ---

// const Home = () => {
//   const [caterings, setCaterings] = useState([]);
//   const [loading, setLoading] = useState(true); // Added loading state
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchCaterings = async () => {
//       try {
//         const res = await axios.get("http://localhost:5001/api/caterings", {
//           withCredentials: true,
//         });
//         setCaterings(res.data);
//       } catch (err) {
//         console.error("Error fetching caterings:", err);
//       } finally {
//         setLoading(false); // Set loading to false after fetch
//       }
//     };
//     fetchCaterings();
//   }, []);

//   return (
//     <>
//       <div className="fixed top-0 left-0 w-full z-50 shadow-md">
//         <NavBar />
//       </div>

//       <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white">
//         {/* === HERO SECTION === */}
//         <section className="pt-32 pb-20 px-6">
//           <div className="container mx-auto max-w-6xl grid md:grid-cols-2 items-center gap-12">
//             <div className="text-left">
//               <h1 className="text-5xl md:text-6xl font-extrabold text-green-900 leading-tight">
//                 Your College Cravings,
//                 <span className="text-yellow-600"> Delivered.</span>
//               </h1>
//               <p className="mt-4 text-lg text-gray-700 max-w-md">
//                 Skip the queue. Order delicious meals from your favorite campus
//                 caterings and get back to what matters.
//               </p>
//               <div className="mt-8 flex gap-4">
//                 <button
//                   onClick={() => document.getElementById('caterings').scrollIntoView({ behavior: 'smooth' })}
//                   className="px-8 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transform hover:scale-105 transition-all"
//                 >
//                   Browse Caterings 👇
//                 </button>
//               </div>
//             </div>
//             <div className="flex justify-center">
//               <img
//                 src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" // Suggestion: Use a more dynamic food image
//                 alt="Delicious Food"
//                 className="w-80 h-80 object-contain drop-shadow-2xl animate-pulse-slow"
//               />
//             </div>
//           </div>
//         </section>

//         {/* === HOW IT WORKS SECTION === */}
//         <section className="py-20 bg-white">
//           <div className="container mx-auto max-w-5xl text-center">
//             <h2 className="text-3xl font-bold text-gray-800 mb-4">
//               Order in 3 Simple Steps
//             </h2>
//             <p className="text-gray-600 mb-12">
//               Getting your favorite meal has never been easier.
//             </p>
//             <div className="grid md:grid-cols-3 gap-10">
//               {/* Step 1 */}
//               <div className="flex flex-col items-center">
//                 <div className="text-5xl mb-4">📍</div>
//                 <h3 className="text-xl font-semibold mb-2">Choose & Customize</h3>
//                 <p className="text-gray-500">
//                   Browse menus from all available caterings on campus.
//                 </p>
//               </div>
//               {/* Step 2 */}
//               <div className="flex flex-col items-center">
//                 <div className="text-5xl mb-4">💳</div>
//                 <h3 className="text-xl font-semibold mb-2">Pay Securely Online</h3>
//                 <p className="text-gray-500">
//                   Fast and secure payments. No need for cash.
//                 </p>
//               </div>
//               {/* Step 3 */}
//               <div className="flex flex-col items-center">
//                 <div className="text-5xl mb-4">🍔</div>
//                 <h3 className="text-xl font-semibold mb-2">Enjoy Your Meal</h3>
//                 <p className="text-gray-500">
//                   We'll notify you when it's ready. Just grab and go!
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* === FEATURED CATERINGS SECTION === */}
//         <section id="caterings" className="py-20 px-6">
//           <div className="container mx-auto max-w-6xl text-center">
//             <h2 className="text-3xl font-bold text-gray-800 mb-12">
//               Caterings On Campus
//             </h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
//               {loading
//                 ? // Show skeleton loaders while fetching data
//                   [...Array(3)].map((_, i) => <CateringCardSkeleton key={i} />)
//                 : caterings.map((catering) => (
//                     <div
//                       key={catering._id}
//                       className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-2xl cursor-pointer"
//                       onClick={() => navigate(`/catering/${catering._id}`)} // Navigate to specific catering
//                     >
//                       <img
//                         src={catering.logo}
//                         alt={catering.name}
//                         className="h-24 w-24 object-contain mb-4 rounded-full border-2 border-yellow-300"
//                       />
//                       <h3 className="text-2xl font-bold text-gray-800">
//                         {catering.name}
//                       </h3>
//                       <p className="text-gray-600 text-sm mt-2 text-center flex-grow">
//                         {catering.description || "Delicious meals for everyone!"}
//                       </p>
//                       <button className="mt-6 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all">
//                         View Menu
//                       </button>
//                     </div>
//                   ))}
//             </div>
//           </div>
//         </section>

//         {/* === WHY CHOOSE US SECTION === */}
//         <section className="py-20 bg-white">
//             <div className="container mx-auto max-w-5xl text-center">
//                 <h2 className="text-3xl font-bold text-gray-800 mb-12">Why You'll Love Our Service</h2>
//                 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//                     <div className="bg-green-50 p-6 rounded-lg">
//                         <div className="text-4xl mb-3">⚡</div>
//                         <h3 className="font-semibold text-lg">Blazing Fast</h3>
//                         <p className="text-gray-600 text-sm">Order in under a minute.</p>
//                     </div>
//                     <div className="bg-yellow-50 p-6 rounded-lg">
//                         <div className="text-4xl mb-3">  🍱 </div>
//                         <h3 className="font-semibold text-lg">Great Variety</h3>
//                         <p className="text-gray-600 text-sm">All your campus favorites in one place.</p>
//                     </div>
//                     <div className="bg-green-50 p-6 rounded-lg">
//                         <div className="text-4xl mb-3">🔒</div>
//                         <h3 className="font-semibold text-lg">Secure Payments</h3>
//                         <p className="text-gray-600 text-sm">100% secure online payment system.</p>
//                     </div>
//                     <div className="bg-yellow-50 p-6 rounded-lg">
//                         <div className="text-4xl mb-3">⭐</div>
//                         <h3 className="font-semibold text-lg">Real Reviews</h3>
//                         <p className="text-gray-600 text-sm">See real-time ratings from students.</p>
//                     </div>
//                 </div>
//             </div>
//         </section>

//         {/* === FINAL CTA SECTION === */}
//         <section className="py-20 px-6">
//             <div className="container mx-auto max-w-4xl text-center bg-green-800 text-white p-12 rounded-2xl shadow-xl">
//                 <h2 className="text-4xl font-extrabold mb-4">Ready to Skip the Queue?</h2>
//                 <p className="text-green-100 text-lg mb-8">Create an account and place your first order in minutes.</p>
//                 <button
//                   onClick={() => navigate("/register")}
//                   className="px-10 py-4 bg-yellow-500 text-green-900 font-extrabold rounded-lg shadow-md hover:bg-yellow-400 transform hover:scale-105 transition-all text-lg"
//                 >
//                   Register Now & Start Ordering 🚀
//                 </button>
//             </div>
//         </section>

//         {/* === FOOTER === */}
//         <footer className="bg-gray-800 text-white py-8">
//             <div className="container mx-auto max-w-6xl text-center text-sm">
//                 <p>&copy; {new Date().getFullYear()} Campus Eats. All Rights Reserved.</p>
//                 <div className="mt-4 space-x-6">
//                     <a href="/about" className="hover:text-yellow-400">About Us</a>
//                     <a href="/contact" className="hover:text-yellow-400">Contact</a>
//                     <a href="/privacy" className="hover:text-yellow-400">Privacy Policy</a>
//                 </div>
//             </div>
//         </footer>

//       </div>
//     </>
//   );
// };

// export default Home;





















// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// // --- Icons ---
// const BellIcon = (props) => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none"
//     viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
//     <path strokeLinecap="round" strokeLinejoin="round"
//       d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967
//       8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967
//       8.967 0 01-2.312 6.022c1.733.64 3.56 1.085
//       5.455 1.31m5.714 0a24.255 24.255 0
//       01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
//   </svg>
// );

// const Bars3Icon = (props) => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none"
//     viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
//     <path strokeLinecap="round" strokeLinejoin="round"
//       d="M3.75 6.75h16.5M3.75 12h16.5m-16.5
//       5.25h16.5" />
//   </svg>
// );

// // --- Navbar ---
// const StaffNavbar = ({ userName = "Amrit Raj", userRole = "Admin" }) => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
// //  const navLinks = [
// //   { name: "Dashboard", path: "/staff/dashboard" },
// //   { name: "Orders", path: "/staff/order" },
// //   { name: "Menu", path: "/staff/menu" },
// // ];


//   return (
//     <nav>
//       <header className="bg-green-400 backdrop-blur-sm p-4 flex justify-between items-center shadow-md fixed top-0 left-0 w-full z-50">
//         <div className="flex items-center space-x-4">
//           <div className="flex items-center space-x-2">
//             <h1 className="text-3xl font-bold text-white">QuickBite</h1>
//             <span className="text-2xl">👨‍🍳</span>
//           </div>
//           {/* <div className="hidden lg:flex items-center space-x-6 ml-6">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.name}
//                 to={link.path}
//                 className={`text-sm font-medium ${
//                   link.name === "Dashboard" ? "text-green-600" : "text-gray-600"
//                 } hover:text-green-600 transition-colors`}
//               >
//                 {link.name}
//               </Link>
//             ))}
//           </div> */}
//         </div>

//         <div className="flex items-center space-x-4">
//           <button className="relative text-gray-600 hover:text-green-600">
//             <BellIcon className="h-6 w-6" />
//             <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
//           </button>
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
//               {userName?.substring(0, 2).toUpperCase()}
//             </div>
//             <div className="hidden md:block">
//               <p className="font-semibold text-sm text-gray-800">{userName}</p>
//               <p className="text-xs text-gray-500">{userRole}</p>
//             </div>
//           </div>
//           <button
//             className="text-gray-600 hover:text-green-600 lg:hidden"
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//           >
//             <Bars3Icon className="h-6 w-6" />
//           </button>
//         </div>
//       </header>

//       {isMenuOpen && (
//         <div className="lg:hidden fixed top-20 right-4 w-48 bg-white rounded-lg shadow-xl z-40">
//           <div className="py-2">
//             {navLinks.map((link) => (
//               <a
//                 key={link}
//                 href="#"
//                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
//               >
//                 {link}
//               </a>
//             ))}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default StaffNavbar;
