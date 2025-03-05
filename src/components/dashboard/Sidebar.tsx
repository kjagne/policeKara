import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Users,
  Building,
  Settings,
  BarChart2,
  Calendar,
  LogOut,
  Shield,
  BrainCircuit,
  FileBarChart,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  userRole: "admin" | "officer" | "analyst";
  userName?: string;
  userAvatar?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({
  userRole = "admin",
  userName = "User Name",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
  collapsed = false,
  onToggleCollapse = () => {},
}: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse();
  };

  const adminLinks = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
      active: location.pathname === "/admin",
      view: "overview",
    },
    {
      title: "Officer Management",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/officers",
      active: location.pathname.includes("/admin/officers"),
      view: "officers",
    },
    {
      title: "Station Management",
      icon: <Building className="h-5 w-5" />,
      href: "/admin/stations",
      active: location.pathname.includes("/admin/stations"),
      view: "stations",
    },
    {
      title: "Emergency Response",
      icon: <Shield className="h-5 w-5" />,
      href: "/admin/emergency",
      active: location.pathname.includes("/admin/emergency"),
      view: "emergency",
    },
    {
      title: "System Configuration",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/config",
      active: location.pathname.includes("/admin/config"),
      view: "config",
    },
  ];

  const officerLinks = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/officer",
      active: location.pathname === "/officer",
    },
    {
      title: "Case Management",
      icon: <FileText className="h-5 w-5" />,
      href: "/officer/cases",
      active: location.pathname.includes("/officer/cases"),
    },
    {
      title: "Duty Roster",
      icon: <Calendar className="h-5 w-5" />,
      href: "/officer/roster",
      active: location.pathname.includes("/officer/roster"),
    },
    {
      title: "Reports",
      icon: <FileText className="h-5 w-5" />,
      href: "/officer/reports",
      active: location.pathname.includes("/officer/reports"),
    },
  ];

  const analystLinks = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/analyst",
      active: location.pathname === "/analyst",
    },
    {
      title: "Crime Statistics",
      icon: <BarChart2 className="h-5 w-5" />,
      href: "/analyst/statistics",
      active: location.pathname.includes("/analyst/statistics"),
    },
    {
      title: "AI Crime Prediction",
      icon: <BrainCircuit className="h-5 w-5" />,
      href: "/analyst/prediction",
      active: location.pathname.includes("/analyst/prediction"),
    },
    {
      title: "Report Generation",
      icon: <FileBarChart className="h-5 w-5" />,
      href: "/analyst/reports",
      active: location.pathname.includes("/analyst/reports"),
    },
    {
      title: "Data Analysis",
      icon: <Database className="h-5 w-5" />,
      href: "/analyst/analysis",
      active: location.pathname.includes("/analyst/analysis"),
    },
  ];

  const links = {
    admin: adminLinks,
    officer: officerLinks,
    analyst: analystLinks,
  };

  const activeLinks = links[userRole] || adminLinks;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[280px]",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && <div className="font-bold text-xl">Police MS</div>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={isCollapsed ? "mx-auto" : ""}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {activeLinks.map((link, index) => (
            <div
              key={index}
              onClick={() => {
                // Navigate using React Router navigate function
                navigate(link.href);
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted cursor-pointer",
                link.active && "text-primary bg-muted",
                isCollapsed && "justify-center px-0",
              )}
            >
              {link.icon}
              {!isCollapsed && <span>{link.title}</span>}
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t">
        <div
          className={cn("flex items-center gap-3", isCollapsed && "flex-col")}
        >
          <Avatar>
            <AvatarImage src={userAvatar} />
            <AvatarFallback>
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium leading-none truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {userRole}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
