import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  PieChart,
  Activity,
  Users,
  Building,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const StatCard = ({
  title = "Statistic",
  value = "0",
  description = "Description of this statistic",
  icon = <Activity size={24} />,
  trend = "neutral",
  trendValue = "0%",
}: StatCardProps) => {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            {trend === "up" && (
              <TrendingUp className="mr-1 text-green-500" size={16} />
            )}
            {trend === "down" && (
              <TrendingUp
                className="mr-1 text-red-500 transform rotate-180"
                size={16}
              />
            )}
            <span
              className={`text-xs ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"}`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface CaseStatusProps {
  active?: number;
  solved?: number;
  pending?: number;
  total?: number;
}

const CaseStatusChart = ({
  active = 42,
  solved = 128,
  pending = 25,
  total = 195,
}: CaseStatusProps) => {
  return (
    <Card className="col-span-2 bg-white">
      <CardHeader>
        <CardTitle>Case Status Overview</CardTitle>
        <CardDescription>
          Current status of all department cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            {/* Placeholder for actual chart */}
            <div className="relative w-48 h-48 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(#4f46e5 0% 22%, #10b981 22% 87%, #f59e0b 87% 100%)",
                  clipPath: "circle(50%)",
                }}
              ></div>
              <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                <span className="text-xl font-bold">{total}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
                <div>
                  <div className="text-sm font-medium">Active</div>
                  <div className="text-sm text-muted-foreground">{active}</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                <div>
                  <div className="text-sm font-medium">Solved</div>
                  <div className="text-sm text-muted-foreground">{solved}</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <div>
                  <div className="text-sm font-medium">Pending</div>
                  <div className="text-sm text-muted-foreground">{pending}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ResourceAllocationProps {
  data?: Array<{
    station: string;
    officers: number;
    vehicles: number;
    equipment: number;
  }>;
}

const ResourceAllocation = ({
  data = [
    { station: "Central Station", officers: 45, vehicles: 12, equipment: 85 },
    { station: "North District", officers: 32, vehicles: 8, equipment: 65 },
    { station: "South District", officers: 28, vehicles: 7, equipment: 60 },
    { station: "East District", officers: 24, vehicles: 6, equipment: 55 },
    { station: "West District", officers: 30, vehicles: 9, equipment: 70 },
  ],
}: ResourceAllocationProps) => {
  return (
    <Card className="col-span-2 bg-white">
      <CardHeader>
        <CardTitle>Resource Allocation</CardTitle>
        <CardDescription>
          Distribution of resources across stations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{item.station}</div>
                <div className="text-sm text-muted-foreground">
                  {item.officers} Officers
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(item.officers / 50) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <div>{item.vehicles} Vehicles</div>
                <div>{item.equipment}% Equipment</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface RecentActivityProps {
  activities?: Array<{
    id: string;
    action: string;
    user: string;
    time: string;
    status?: string;
  }>;
}

const RecentActivity = ({
  activities = [
    {
      id: "1",
      action: "Case #4392 updated",
      user: "Officer Johnson",
      time: "10 minutes ago",
      status: "completed",
    },
    {
      id: "2",
      action: "New officer onboarded",
      user: "Admin Wilson",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: "3",
      action: "Resource allocation changed",
      user: "Captain Reynolds",
      time: "5 hours ago",
      status: "pending",
    },
    {
      id: "4",
      action: "Emergency response drill",
      user: "Training Dept.",
      time: "Yesterday",
      status: "completed",
    },
    {
      id: "5",
      action: "System maintenance",
      user: "IT Department",
      time: "2 days ago",
      status: "completed",
    },
  ],
}: RecentActivityProps) => {
  return (
    <Card className="col-span-2 bg-white">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across the department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-full">
                <Activity size={16} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{activity.user}</span>
                  <span className="mx-1">•</span>
                  <span>{activity.time}</span>
                  {activity.status && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${activity.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                    >
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
};

interface UpcomingEventsProps {
  events?: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  }>;
}

const UpcomingEvents = ({
  events = [
    {
      id: "1",
      title: "Department Meeting",
      date: "Today",
      time: "14:00",
      location: "Conference Room A",
    },
    {
      id: "2",
      title: "Training Session",
      date: "Tomorrow",
      time: "09:30",
      location: "Training Center",
    },
    {
      id: "3",
      title: "Community Outreach",
      date: "Jun 15",
      time: "11:00",
      location: "City Park",
    },
    {
      id: "4",
      title: "Budget Review",
      date: "Jun 18",
      time: "10:00",
      location: "Admin Office",
    },
  ],
}: UpcomingEventsProps) => {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Scheduled events and meetings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <Calendar size={16} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{event.title}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{event.date}</span>
                  <span className="mx-1">•</span>
                  <span>{event.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.location}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          View Calendar
        </Button>
      </CardContent>
    </Card>
  );
};

interface AlertsProps {
  alerts?: Array<{
    id: string;
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
  }>;
}

const Alerts = ({
  alerts = [
    {
      id: "1",
      title: "System Update Required",
      description: "Security update pending for all terminals",
      severity: "medium",
    },
    {
      id: "2",
      title: "Staff Shortage",
      description: "North District reporting officer shortage",
      severity: "high",
    },
    {
      id: "3",
      title: "Equipment Maintenance",
      description: "Vehicle maintenance due for 5 patrol cars",
      severity: "low",
    },
  ],
}: AlertsProps) => {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Alerts & Notifications</CardTitle>
        <CardDescription>Important system alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle
                  size={16}
                  className={
                    alert.severity === "high"
                      ? "text-red-500"
                      : alert.severity === "medium"
                        ? "text-amber-500"
                        : "text-blue-500"
                  }
                />
                <span className="font-medium text-sm">{alert.title}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {alert.description}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${alert.severity === "high" ? "bg-red-100 text-red-800" : alert.severity === "medium" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}
                >
                  {alert.severity.charAt(0).toUpperCase() +
                    alert.severity.slice(1)}{" "}
                  Priority
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface DepartmentOverviewProps {
  stats?: {
    activeCases?: number;
    solvedCases?: number;
    pendingCases?: number;
    totalOfficers?: number;
    availableOfficers?: number;
    stations?: number;
    vehicles?: number;
    equipmentStatus?: number;
  };
}

const DepartmentOverview = ({
  initialStats = {
    activeCases: 0,
    solvedCases: 0,
    pendingCases: 0,
    totalOfficers: 0,
    availableOfficers: 0,
    stations: 0,
    vehicles: 0,
    equipmentStatus: 0,
  },
}: DepartmentOverviewProps) => {
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDepartmentStats = async () => {
      setIsLoading(true);
      try {
        // Fetch case statistics
        const { data: casesData, error: casesError } = await supabase
          .from("cases")
          .select("status");

        if (casesError) throw casesError;

        // Count cases by status
        const activeCases = casesData.filter((c) => c.status === "open").length;
        const solvedCases = casesData.filter(
          (c) => c.status === "closed",
        ).length;
        const pendingCases = casesData.filter(
          (c) => c.status === "pending",
        ).length;

        // Fetch officer statistics
        const { data: officersData, error: officersError } = await supabase
          .from("officers")
          .select("status");

        if (officersError) throw officersError;

        const totalOfficers = officersData.length;
        const availableOfficers = officersData.filter(
          (o) => o.status === "active",
        ).length;

        // Fetch station statistics
        const { data: stationsData, error: stationsError } = await supabase
          .from("stations")
          .select("*");

        if (stationsError) throw stationsError;

        const stations = stationsData.length;
        const vehicles = stationsData.reduce(
          (sum, station) => sum + station.vehicles,
          0,
        );

        // Set the stats
        setStats({
          activeCases,
          solvedCases,
          pendingCases,
          totalOfficers,
          availableOfficers,
          stations,
          vehicles,
          equipmentStatus: 87, // This could be calculated from another table if available
        });
      } catch (error) {
        console.error("Error fetching department stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentStats();
  }, []);
  return (
    <div className="p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Department Overview</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            Export
          </Button>
          <Button size="sm" onClick={() => window.location.reload()}>
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="personnel">Personnel</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard
              title="Active Cases"
              value={stats.activeCases.toString()}
              description="Current open investigations"
              icon={<BarChart size={24} />}
              trend="up"
              trendValue="+5% from last month"
            />
            <StatCard
              title="Officers Available"
              value={`${stats.availableOfficers}/${stats.totalOfficers}`}
              description="Officers currently on duty"
              icon={<Users size={24} />}
              trend="down"
              trendValue="-3% from yesterday"
            />
            <StatCard
              title="Stations"
              value={stats.stations.toString()}
              description="Active police stations"
              icon={<Building size={24} />}
              trend="neutral"
            />
            <StatCard
              title="Equipment Status"
              value={`${stats.equipmentStatus}%`}
              description="Overall equipment readiness"
              icon={<Activity size={24} />}
              trend="up"
              trendValue="+2% from last week"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <CaseStatusChart
              active={stats.activeCases}
              solved={stats.solvedCases}
              pending={stats.pendingCases}
              total={stats.activeCases + stats.solvedCases + stats.pendingCases}
            />
            <ResourceAllocation />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <RecentActivity />
            <UpcomingEvents />
            <Alerts />
          </div>
        </TabsContent>

        <TabsContent value="cases">
          <div className="p-4 text-center bg-white rounded-lg border">
            <p className="text-muted-foreground">
              Case details content would go here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="personnel">
          <div className="p-4 text-center bg-white rounded-lg border">
            <p className="text-muted-foreground">
              Personnel details content would go here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="p-4 text-center bg-white rounded-lg border">
            <p className="text-muted-foreground">
              Resources details content would go here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepartmentOverview;
