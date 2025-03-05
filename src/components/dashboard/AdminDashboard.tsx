import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import DepartmentOverview from "../admin/DepartmentOverview";
import OfficerManagement from "../admin/OfficerManagement";
import StationManagement from "../admin/StationManagement";
import SystemConfiguration from "../admin/SystemConfiguration";
import EmergencyResponseDashboard from "../admin/EmergencyResponseDashboard";

interface AdminDashboardProps {
  userName?: string;
  userAvatar?: string;
  defaultView?: "overview" | "officers" | "stations" | "emergency" | "config";
}

const AdminDashboard = ({
  userName = "Admin User",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  defaultView = "overview",
}: AdminDashboardProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<string>(defaultView);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Always use Outlet for proper React Router navigation
  const renderContent = () => {
    return <Outlet />;
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
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default AdminDashboard;
