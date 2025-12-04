import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CateringAdminNavbar from "../../components/CateringAdminNavbar";
import CateringAdmin from "./CateringAdmin";
import ManageBranches from "./ManageBranches";
import ManageStaff from "./ManageStaff";
import ManageMenu from "./ManageMenu";
import ManageAnalysis from "./ManageAnalysis";
import { AddBranch } from "./BranchModels";
import { AddStaff } from "./StaffModels";

const CateringAdminDashboard = () => {
  const adminName = localStorage.getItem("userName")||"Guest"; // you can replace this with dynamic data later
  
  return (
    <div className="flex">
      <CateringAdminNavbar adminName={adminName} />

      <main className="ml-64 flex-grow bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CateringAdmin />} />
          <Route path="branches" element={<ManageBranches />} />
          <Route path="staff" element={<ManageStaff />} />
          <Route path="menu" element={<ManageMenu />} />
          <Route path="analytics" element={<ManageAnalysis />} />
          <Route path="add-branch" element={<AddBranch/>}/>
          <Route path="add-staff" element={<AddStaff/>}/>
        </Routes>
      </main>
    </div>
  );
};

export default CateringAdminDashboard;
