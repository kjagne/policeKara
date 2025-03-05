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

  // Check if we're using nested routes with Outlet
  const isUsingNestedRoutes = window.location.pathname !== "/admin";

  // Force the activeView to match the current path
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/admin/officers")) {
      setActiveView("officers");
    } else if (path.includes("/admin/stations")) {
      setActiveView("stations");
    } else if (path.includes("/admin/emergency")) {
      setActiveView("emergency");
    } else if (path.includes("/admin/config")) {
      setActiveView("config");
    } else {
      setActiveView("overview");
    }

    // Listen for custom events from the Sidebar component
    const handleSetActiveView = (event) => {
      setActiveView(event.detail);
    };

    window.addEventListener("setActiveView", handleSetActiveView);

    return () => {
      window.removeEventListener("setActiveView", handleSetActiveView);
    };
  }, [window.location.pathname]);

  const renderContent = () => {
    // If using nested routes, render the Outlet
    if (isUsingNestedRoutes) {
      return <Outlet />;
    }

    // Otherwise, render the appropriate component based on activeView
    switch (activeView) {
      case "overview":
        return <DepartmentOverview />;
      case "officers":
        return <OfficerManagement />;
      case "stations":
        return <StationManagement />;
      case "emergency":
        return <EmergencyResponseDashboard />;
      case "config":
        return <SystemConfiguration />;
      default:
        return <DepartmentOverview />;
    }
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
