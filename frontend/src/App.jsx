import React from "react";
import { Routes, Route } from "react-router-dom";
import LoadingPage from "./pages/LoadingPage";
import Home from "./pages/Home";  // create this page
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import CateringAdmin from "./pages/CateringAdmin";
import CustomerDashboard from "./pages/CustomerDashboard";
import AddCatering from "./pages/AddCatering";
import ManageCatering from "./pages/ManageCatering";
import AddCateringAdmin from "./pages/AddCateringAdmin";
import ManageCateringAdmins from "./pages/ManageCateringAdmins";
import Analytics from "./pages/Analytics";
import CateringDetails from "./components/CateringDetail";
import ProfilePage from "./components/ProfilePage";
import OrderPage from "./pages/Staff/OrderPage";
import MenuPage from "./pages/Staff/MenuPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoadingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/admin" element={<AdminDashboard/>}/>
      <Route path="/admin/add-catering" element={<AddCatering/>}/>
      <Route path="/admin/manage-caterings" element={<ManageCatering/>}/>
      <Route path="/catering" element={<CateringAdmin/>}/>
      <Route path="/staff" element={<StaffDashboard/>}/>
      <Route path="/customer" element={<CustomerDashboard/>}/>
      <Route path="/admin/add-catering-admin" element={<AddCateringAdmin/>}/>
      <Route path="/admin/manage-catering-admins" element={<ManageCateringAdmins/>}/>
      <Route path="/admin/analytics" element={<Analytics/>}/>
      <Route path="/admin/catering/:id" element={<CateringDetails />} />
      <Route path="/profile" element={<ProfilePage/>}/>
      <Route path="/staff/order" element={<OrderPage/>}/>
      <Route path="/staff/menu" element={<MenuPage/>}/>
    </Routes>
  );
};

export default App;
