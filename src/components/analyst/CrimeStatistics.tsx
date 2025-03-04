import React, { useState, useEffect } from "react";
import { getCrimeStats } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  PieChart,
  LineChart,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

interface CrimeStatisticsProps {
  title?: string;
  description?: string;
  timeRanges?: string[];
  regions?: string[];
  crimeCategories?: string[];
  crimeData?: any;
}

const CrimeStatistics = ({
  title = "Crime Statistics Dashboard",
  description = "Visualizations and tables showing crime statistics across different regions, time periods, and categories.",
  timeRanges = [
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days",
    "Last Year",
    "Custom Range",
  ],
  regions = [
    "All Regions",
    "Downtown",
    "North District",
    "South District",
    "East District",
    "West District",
  ],
  crimeCategories = [
    "All Categories",
    "Theft",
    "Assault",
    "Burglary",
    "Vandalism",
    "Drug Offenses",
    "Fraud",
  ],
  crimeData = {
    trends: [
      { date: "Jan", count: 65 },
      { date: "Feb", count: 59 },
      { date: "Mar", count: 80 },
      { date: "Apr", count: 81 },
      { date: "May", count: 56 },
      { date: "Jun", count: 55 },
      { date: "Jul", count: 40 },
    ],
    distribution: [
      { category: "Theft", count: 120 },
      { category: "Assault", count: 80 },
      { category: "Burglary", count: 60 },
      { category: "Vandalism", count: 40 },
      { category: "Drug Offenses", count: 30 },
      { category: "Fraud", count: 25 },
    ],
    regional: [
      { region: "Downtown", count: 150 },
      { region: "North District", count: 90 },
      { region: "South District", count: 70 },
      { region: "East District", count: 60 },
      { region: "West District", count: 50 },
    ],
    timeOfDay: [
      { time: "Morning", count: 45 },
      { time: "Afternoon", count: 90 },
      { time: "Evening", count: 120 },
      { time: "Night", count: 85 },
    ],
    recentIncidents: [
      {
        id: 1,
        type: "Theft",
        location: "123 Main St",
        date: "2023-06-15",
        status: "Resolved",
      },
      {
        id: 2,
        type: "Assault",
        location: "456 Oak Ave",
        date: "2023-06-14",
        status: "Under Investigation",
      },
      {
        id: 3,
        type: "Burglary",
        location: "789 Pine Rd",
        date: "2023-06-13",
        status: "Under Investigation",
      },
      {
        id: 4,
        type: "Vandalism",
        location: "101 Elm St",
        date: "2023-06-12",
        status: "Resolved",
      },
      {
        id: 5,
        type: "Drug Offense",
        location: "202 Maple Dr",
        date: "2023-06-11",
        status: "Pending",
      },
    ],
  },
}: CrimeStatisticsProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRanges[0]);
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [selectedCategory, setSelectedCategory] = useState(crimeCategories[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState(crimeData);

  useEffect(() => {
    const fetchCrimeStats = async () => {
      setIsLoading(true);
      try {
        const data = await getCrimeStats(selectedTimeRange);
        if (data && data.length > 0) {
          // Process the data to match our expected format
          const processedData = {
            ...crimeData,
            trends: data
              .filter(
                (item) =>
                  item.category === selectedCategory ||
                  selectedCategory === "All Categories",
              )
              .map((item) => ({
                date: new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                }),
                count: item.count,
              })),
            distribution: Object.entries(
              data.reduce((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.count;
                return acc;
              }, {}),
            ).map(([category, count]) => ({
              category,
              count: count as number,
            })),
            regional: Object.entries(
              data.reduce((acc, item) => {
                acc[item.region] = (acc[item.region] || 0) + item.count;
                return acc;
              }, {}),
            ).map(([region, count]) => ({ region, count: count as number })),
            timeOfDay: Object.entries(
              data.reduce((acc, item) => {
                const time = item.time_of_day || "Unknown";
                acc[time] = (acc[time] || 0) + item.count;
                return acc;
              }, {}),
            ).map(([time, count]) => ({ time, count: count as number })),
          };

          setStatsData(processedData);
        }
      } catch (error) {
        console.error("Error fetching crime statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrimeStats();
  }, [selectedTimeRange, selectedCategory]);

  return (
    <div className="w-full h-full bg-background p-6 overflow-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Time Range</label>
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Region</label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Crime Category</label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {crimeCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">425</div>
              <p className="text-xs text-muted-foreground">
                +5.2% from previous period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Solved Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">215</div>
              <p className="text-xs text-muted-foreground">
                50.6% resolution rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Investigations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">187</div>
              <p className="text-xs text-muted-foreground">
                44.0% of total cases
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.5 min</div>
              <p className="text-xs text-muted-foreground">
                -2.3 min from previous period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="trends">
              <LineChart className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="distribution">
              <PieChart className="h-4 w-4 mr-2" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="regional">
              <MapPin className="h-4 w-4 mr-2" />
              Regional
            </TabsTrigger>
            <TabsTrigger value="timeOfDay">
              <Calendar className="h-4 w-4 mr-2" />
              Time of Day
            </TabsTrigger>
          </TabsList>
          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Crime Trends Over Time</CardTitle>
                <CardDescription>
                  Monthly crime incidents for{" "}
                  {selectedCategory !== "All Categories"
                    ? selectedCategory
                    : "all categories"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                  {/* Placeholder for actual chart */}
                  <div className="flex flex-col items-center">
                    <BarChart className="h-16 w-16 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Line chart showing crime trends would render here
                    </p>
                    <div className="mt-4 w-full max-w-md h-40 flex items-end justify-between px-4">
                      {crimeData.trends.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-primary w-8"
                            style={{ height: `${item.count}px` }}
                          ></div>
                          <span className="text-xs mt-1">{item.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="distribution" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Crime Category Distribution</CardTitle>
                <CardDescription>
                  Breakdown of incidents by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                  {/* Placeholder for actual chart */}
                  <div className="flex flex-col items-center">
                    <PieChart className="h-16 w-16 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Pie chart showing crime distribution would render here
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      {crimeData.distribution.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full bg-primary-${index + 1}00 mr-2`}
                          ></div>
                          <span>
                            {item.category}: {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="regional" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Crime Analysis</CardTitle>
                <CardDescription>Crime incidents by district</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                  {/* Placeholder for actual chart */}
                  <div className="flex flex-col items-center">
                    <MapPin className="h-16 w-16 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Map visualization would render here
                    </p>
                    <div className="mt-4 w-full max-w-md">
                      {crimeData.regional.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between mb-2"
                        >
                          <span>{item.region}</span>
                          <div className="flex-1 mx-4 bg-muted h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full"
                              style={{ width: `${(item.count / 150) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="timeOfDay" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Time of Day Analysis</CardTitle>
                <CardDescription>
                  Crime incidents by time of day
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                  {/* Placeholder for actual chart */}
                  <div className="flex flex-col items-center">
                    <Calendar className="h-16 w-16 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Time distribution chart would render here
                    </p>
                    <div className="mt-4 grid grid-cols-4 gap-4 w-full max-w-md">
                      {crimeData.timeOfDay.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="relative w-16 bg-muted rounded-t-md overflow-hidden">
                            <div
                              className="bg-primary w-full"
                              style={{
                                height: `${(item.count / 120) * 100}px`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1">{item.time}</span>
                          <span className="text-xs font-medium">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Incidents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Latest reported crime incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium py-2 px-4">ID</th>
                    <th className="text-left font-medium py-2 px-4">Type</th>
                    <th className="text-left font-medium py-2 px-4">
                      Location
                    </th>
                    <th className="text-left font-medium py-2 px-4">Date</th>
                    <th className="text-left font-medium py-2 px-4">Status</th>
                    <th className="text-left font-medium py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crimeData.recentIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-2 px-4">{incident.id}</td>
                      <td className="py-2 px-4">{incident.type}</td>
                      <td className="py-2 px-4">{incident.location}</td>
                      <td className="py-2 px-4">{incident.date}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${incident.status === "Resolved" ? "bg-green-100 text-green-800" : incident.status === "Under Investigation" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {incident.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">Page 1 of 10</div>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CrimeStatistics;
