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

  // Always use Outlet for proper React Router navigation
  const renderContent = () => {
    return <Outlet />;
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
