import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  FileText,
  Calendar,
  BarChart3,
  BrainCircuit,
  FileBarChart,
  Database,
  User,
  LogOut,
  Menu,
} from "lucide-react";

type SidebarProps = {
  userRole?: "admin" | "officer" | "analyst";
  userName?: string;
  userAvatar?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

const Sidebar = ({
  userRole = "admin",
  userName = "John Doe",
  userAvatar = "",
  collapsed = false,
  onToggleCollapse = () => {},
}: SidebarProps) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  React.useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    {
      name: "Officer Management",
      path: "/admin/officers",
      icon: <Users size={20} />,
    },
    {
      name: "Station Management",
      path: "/admin/stations",
      icon: <Building2 size={20} />,
    },
    {
      name: "System Configuration",
      path: "/admin/config",
      icon: <Settings size={20} />,
    },
  ];

  const officerLinks = [
    { name: "Personal Stats", path: "/officer", icon: <User size={20} /> },
    {
      name: "Case Management",
      path: "/officer/cases",
      icon: <FileText size={20} />,
    },
    {
      name: "Duty Roster",
      path: "/officer/roster",
      icon: <Calendar size={20} />,
    },
    {
      name: "Reports",
      path: "/officer/reports",
      icon: <FileBarChart size={20} />,
    },
  ];

  const analystLinks = [
    {
      name: "Crime Statistics",
      path: "/analyst",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "AI Crime Prediction",
      path: "/analyst/prediction",
      icon: <BrainCircuit size={20} />,
    },
    {
      name: "Report Generation",
      path: "/analyst/reports",
      icon: <FileBarChart size={20} />,
    },
    {
      name: "Data Analysis",
      path: "/analyst/analysis",
      icon: <Database size={20} />,
    },
  ];

  const links = {
    admin: adminLinks,
    officer: officerLinks,
    analyst: analystLinks,
  }[userRole];

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[280px]",
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <div className="font-bold text-xl">Police MS</div>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="ml-auto"
        >
          <Menu size={20} />
        </Button>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          <TooltipProvider>
            {links?.map((link) => (
              <Tooltip key={link.path} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link to={link.path}>
                    <Button
                      variant={isActive(link.path) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start mb-1",
                        isCollapsed ? "px-2" : "px-4",
                      )}
                    >
                      {link.icon}
                      {!isCollapsed && (
                        <span className="ml-3">{link.name}</span>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{link.name}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </div>

      <Separator />

      <div className="p-4">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {userRole}
              </p>
            </div>
          )}
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start mt-4",
                  isCollapsed ? "px-2" : "px-4",
                )}
              >
                <LogOut size={20} />
                {!isCollapsed && <span className="ml-3">Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Sidebar;
