import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import CrimeStatistics from "../analyst/CrimeStatistics";
import AICrimePrediction from "../analyst/AICrimePrediction";
import ReportGeneration from "../analyst/ReportGeneration";
import DataAnalysis from "../analyst/DataAnalysis";

interface AnalystDashboardProps {
  userName?: string;
  userAvatar?: string;
  defaultView?: "statistics" | "prediction" | "reports" | "analysis";
}

const AnalystDashboard = ({
  userName = "Jane Analyst",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=analyst",
  defaultView = "statistics",
}: AnalystDashboardProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<string>(defaultView);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Check if we're using nested routes with Outlet
  const isUsingNestedRoutes = window.location.pathname !== "/analyst";

  const renderContent = () => {
    // If using nested routes, render the Outlet
    if (isUsingNestedRoutes) {
      return <Outlet />;
    }

    // Otherwise, render the appropriate component based on activeView
    switch (activeView) {
      case "statistics":
        return <CrimeStatistics />;
      case "prediction":
        return <AICrimePrediction />;
      case "reports":
        return <ReportGeneration />;
      case "analysis":
        return <DataAnalysis />;
      default:
        return <CrimeStatistics />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar
        userRole="analyst"
        userName={userName}
        userAvatar={userAvatar}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default AnalystDashboard;
