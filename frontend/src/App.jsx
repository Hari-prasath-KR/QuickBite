import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoadingPage from "./pages/LoadingPage";
import Home from "./pages/Home";  // create this page
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import CateringAdminDashboard from "./pages/CateringAdmin/CateringAdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerOrderPage from "./pages/OrderPage";
import CustomerOrderHistoryPage from "./pages/OrderHistory";
import AddCatering from "./pages/Admin/AddCatering";
import ManageCatering from "./pages/Admin/ManageCaterings";
import AddCateringAdmin from "./pages/Admin/AddCateringAdmin";
import ManageCateringAdmins from "./pages/Admin/ManageCateringAdmins";
import Analytics from "./pages/Admin/Analytics";
import CateringDetails from "./pages/Admin/CateringDetail";
import ProfilePage from "./components/ProfilePage";
import OrderPage from "./pages/Staff/OrderPage";
import MenuPage from "./pages/Staff/MenuPage";
import StaffService from "./pages/Staff/StaffService";
// import ManageMenu from "./pages/CateringAdmin/ManageMenu";
// import ManageBranches from "./pages/CateringAdmin/ManageBranches";
// import ManageStaff from "./pages/CateringAdmin/ManageStaff";
// import ManageAnalysis from "./pages/CateringAdmin/ManageAnalysis";

const App = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-catering" element={<AddCatering />} />
        <Route path="/admin/manage-caterings" element={<ManageCatering />} />
        <Route path="/admin/add-catering-admin" element={<AddCateringAdmin />} />
        <Route path="/admin/manage-catering-admins" element={<ManageCateringAdmins />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/catering/:id" element={<CateringDetails />} />
        <Route path="/catering/*" element={<CateringAdminDashboard />} />
        {/* <Route path="/catering/manage-menu" element={<ManageMenu/>}/>
      <Route path="/catering/manage-branches" element={<ManageBranches/>}/>
      <Route path="/catering/manage-staff" element={<ManageStaff/>}/>
      <Route path="/catering/manage-analysis" element={<ManageAnalysis/>}/> */}
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/order/:branchId" element={<CustomerOrderPage />} />
        <Route path="/customer/order-history" element={<CustomerOrderHistoryPage />} />
        <Route path="/order-history" element={<CustomerOrderHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/order" element={<OrderPage />} />
        <Route path="/staff/menu" element={<MenuPage />} />
        <Route path="/staff/service" element={<StaffService />} />
      </Routes>
    </>
  );
};

export default App;

