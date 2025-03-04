import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
}

const StatCard = ({
  title = "Stat Title",
  value = "0",
  description = "No description available",
  icon = <Star className="h-5 w-5" />,
  trend = 0,
  color = "bg-blue-50",
}: StatCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
      {trend !== 0 && (
        <CardFooter className="p-2">
          <div
            className={`text-xs flex items-center ${trend > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
            <TrendingUp
              className={`h-3 w-3 ml-1 ${trend > 0 ? "" : "transform rotate-180"}`}
            />
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

interface PerformanceMetricProps {
  title: string;
  value: number;
  target: number;
  unit?: string;
}

const PerformanceMetric = ({
  title = "Metric",
  value = 0,
  target = 100,
  unit = "%",
}: PerformanceMetricProps) => {
  const percentage = Math.min(Math.round((value / target) * 100), 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm font-medium">
          {value}
          {unit}{" "}
          <span className="text-muted-foreground">
            / {target}
            {unit}
          </span>
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

interface RecentActivityProps {
  activities: Array<{
    id: string | number;
    title: string;
    time: string;
    type: string;
  }>;
}

const RecentActivity = ({
  activities = [
    {
      id: 1,
      title: "Submitted case report #4872",
      time: "2 hours ago",
      type: "report",
    },
    { id: 2, title: "Completed patrol duty", time: "Yesterday", type: "duty" },
    {
      id: 3,
      title: "Updated evidence for case #4867",
      time: "2 days ago",
      type: "case",
    },
    {
      id: 4,
      title: "Attended training session",
      time: "3 days ago",
      type: "training",
    },
  ],
}: RecentActivityProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "report":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "duty":
        return <Clock className="h-4 w-4 text-green-500" />;
      case "case":
        return <Shield className="h-4 w-4 text-purple-500" />;
      case "training":
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="mr-2 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface UpcomingShiftProps {
  shifts: Array<{
    id: string | number;
    date: string;
    time: string;
    location: string;
    type: string;
  }>;
}

const UpcomingShifts = ({
  shifts = [
    {
      id: 1,
      date: "Today",
      time: "14:00 - 22:00",
      location: "Downtown Precinct",
      type: "Patrol",
    },
    {
      id: 2,
      date: "Tomorrow",
      time: "08:00 - 16:00",
      location: "North District",
      type: "Investigation",
    },
    {
      id: 3,
      date: "Jun 15, 2023",
      time: "16:00 - 00:00",
      location: "Central Station",
      type: "Patrol",
    },
  ],
}: UpcomingShiftProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Shifts</CardTitle>
        <CardDescription>
          Your scheduled duties for the next days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center space-x-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{shift.date}</p>
                  <p className="text-sm text-muted-foreground">{shift.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">{shift.location}</p>
                <Badge variant="secondary" className="mt-1">
                  {shift.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const PersonalStats = () => {
  // Mock data for demonstration
  const officerStats = {
    name: "Officer John Doe",
    badgeNumber: "PD-5421",
    department: "Criminal Investigation",
    stats: [
      {
        title: "Cases Solved",
        value: 24,
        description: "Last 30 days",
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        trend: 8,
        color: "bg-green-50",
      },
      {
        title: "Active Cases",
        value: 7,
        description: "Currently assigned",
        icon: <Shield className="h-5 w-5 text-blue-600" />,
        color: "bg-blue-50",
      },
      {
        title: "Reports Filed",
        value: 32,
        description: "Last 30 days",
        icon: <FileText className="h-5 w-5 text-purple-600" />,
        trend: -3,
        color: "bg-purple-50",
      },
      {
        title: "Duty Hours",
        value: 168,
        description: "This month",
        icon: <Clock className="h-5 w-5 text-orange-600" />,
        trend: 2,
        color: "bg-orange-50",
      },
    ],
    performance: [
      { title: "Case Clearance Rate", value: 78, target: 85, unit: "%" },
      { title: "Report Accuracy", value: 92, target: 95, unit: "%" },
      { title: "Response Time", value: 8.5, target: 10, unit: " min" },
      { title: "Training Completion", value: 16, target: 20, unit: " hrs" },
    ],
    activities: [
      {
        id: 1,
        title: "Submitted case report #4872",
        time: "2 hours ago",
        type: "report",
      },
      {
        id: 2,
        title: "Completed patrol duty",
        time: "Yesterday",
        type: "duty",
      },
      {
        id: 3,
        title: "Updated evidence for case #4867",
        time: "2 days ago",
        type: "case",
      },
      {
        id: 4,
        title: "Attended training session",
        time: "3 days ago",
        type: "training",
      },
    ],
    shifts: [
      {
        id: 1,
        date: "Today",
        time: "14:00 - 22:00",
        location: "Downtown Precinct",
        type: "Patrol",
      },
      {
        id: 2,
        date: "Tomorrow",
        time: "08:00 - 16:00",
        location: "North District",
        type: "Investigation",
      },
      {
        id: 3,
        date: "Jun 15, 2023",
        time: "16:00 - 00:00",
        location: "Central Station",
        type: "Patrol",
      },
    ],
  };

  return (
    <div className="bg-background p-6 min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Personal Dashboard
          </h1>
          <div className="flex items-center mt-2 text-muted-foreground">
            <Badge variant="outline" className="mr-2">
              {officerStats.badgeNumber}
            </Badge>
            <span>{officerStats.department}</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {officerStats.stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
              color={stat.color}
            />
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Your current performance against targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {officerStats.performance.map((metric, index) => (
                <PerformanceMetric
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  target={metric.target}
                  unit={metric.unit}
                />
              ))}
            </CardContent>
          </Card>

          <RecentActivity activities={officerStats.activities} />
        </div>

        {/* Upcoming Shifts */}
        <UpcomingShifts shifts={officerStats.shifts} />
      </div>
    </div>
  );
};

export default PersonalStats;
