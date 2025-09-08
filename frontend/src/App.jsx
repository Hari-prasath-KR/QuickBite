import React from "react";
import { Routes, Route } from "react-router-dom";
import LoadingPage from "./pages/LoadingPage";
import Home from "./pages/Home";  // create this page
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import StaffDashboard from "./pages/StaffDashboard";
import CateringAdmin from "./pages/CateringAdmin";
import CustomerDashboard from "./pages/CustomerDashboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoadingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/admin" element={<AdminPage/>}/>
      <Route path="/catering" element={<CateringAdmin/>}/>
      <Route path="/staff" element={<StaffDashboard/>}/>
      <Route path="/customer" element={<CustomerDashboard/>}/>
    </Routes>
  );
};

export default App;
