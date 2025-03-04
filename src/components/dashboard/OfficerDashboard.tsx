import React from "react";
import Sidebar from "./Sidebar";
import PersonalStats from "../officer/PersonalStats";
import CaseManagement from "../officer/CaseManagement";
import DutyRoster from "../officer/DutyRoster";
import Reports from "../officer/Reports";
import { useLocation } from "react-router-dom";

interface OfficerDashboardProps {
  officerName?: string;
  officerBadge?: string;
  officerAvatar?: string;
  defaultTab?: "stats" | "cases" | "roster" | "reports";
}

const OfficerDashboard = ({
  officerName = "John Doe",
  officerBadge = "PD-5421",
  officerAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=officer1",
  defaultTab = "stats",
}: OfficerDashboardProps) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState<string>(defaultTab);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Parse the path to determine which tab should be active
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes("/officer/cases")) {
      setActiveTab("cases");
    } else if (path.includes("/officer/roster")) {
      setActiveTab("roster");
    } else if (path.includes("/officer/reports")) {
      setActiveTab("reports");
    } else {
      setActiveTab("stats");
    }
  }, [location]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        userRole="officer"
        userName={officerName}
        userAvatar={officerAvatar}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className="flex-1 overflow-auto">
        {activeTab === "stats" && <PersonalStats />}
        {activeTab === "cases" && <CaseManagement />}
        {activeTab === "roster" && <DutyRoster />}
        {activeTab === "reports" && <Reports />}
      </div>
    </div>
  );
};

export default OfficerDashboard;
