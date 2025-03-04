import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import DepartmentOverview from "../admin/DepartmentOverview";
import OfficerManagement from "../admin/OfficerManagement";
import StationManagement from "../admin/StationManagement";
import SystemConfiguration from "../admin/SystemConfiguration";

interface AdminDashboardProps {
  userName?: string;
  userAvatar?: string;
  defaultCollapsed?: boolean;
}

const AdminDashboard = ({
  userName = "Admin User",
  userAvatar = "",
  defaultCollapsed = false,
}: AdminDashboardProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar
        userRole="admin"
        userName={userName}
        userAvatar={userAvatar}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DepartmentOverview />} />
          <Route path="/officers" element={<OfficerManagement />} />
          <Route path="/stations" element={<StationManagement />} />
          <Route path="/config" element={<SystemConfiguration />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
