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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Filter,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar,
  FileText,
  RefreshCw,
  Layers,
  TrendingUp,
  Map,
  Search,
  Sliders,
} from "lucide-react";

// Types
interface CrimeData {
  id: string;
  crime_type: string;
  district: string;
  date: string;
  time: string;
  status: string;
  severity: "high" | "medium" | "low";
  location_lat?: number;
  location_lng?: number;
  officer_id?: string;
  case_id?: string;
  created_at: string;
}

interface AnalysisFilter {
  timeRange: "day" | "week" | "month" | "quarter" | "year" | "custom";
  crimeType: string;
  district: string;
  startDate: string;
  endDate: string;
}

const AdvancedAnalytics: React.FC = () => {
  const [crimeData, setCrimeData] = useState<CrimeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("trends");
  const [filters, setFilters] = useState<AnalysisFilter>({
    timeRange: "month",
    crimeType: "all",
    district: "all",
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [crimeTypes, setCrimeTypes] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState("csv");

  // Fetch data on component mount
  useEffect(() => {
    fetchCrimeData();
    fetchMetadata();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchCrimeData();
  }, [filters]);

  const fetchCrimeData = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("crime_incidents").select("*");

      // Apply filters
      if (filters.crimeType !== "all") {
        query = query.eq("crime_type", filters.crimeType);
      }

      if (filters.district !== "all") {
        query = query.eq("district", filters.district);
      }

      // Apply date range
      query = query.gte("date", filters.startDate).lte("date", filters.endDate);

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setCrimeData(data);
      }
    } catch (error) {
      console.error("Error fetching crime data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      // Fetch unique crime types
      const { data: crimeTypeData, error: crimeTypeError } = await supabase
        .from("crime_incidents")
        .select("crime_type")
        .order("crime_type")
        .limit(100);

      if (crimeTypeError) throw crimeTypeError;

      if (crimeTypeData) {
        const uniqueTypes = Array.from(
          new Set(crimeTypeData.map((item) => item.crime_type)),
        );
        setCrimeTypes(uniqueTypes);
      }

      // Fetch unique districts
      const { data: districtData, error: districtError } = await supabase
        .from("crime_incidents")
        .select("district")
        .order("district")
        .limit(100);

      if (districtError) throw districtError;

      if (districtData) {
        const uniqueDistricts = Array.from(
          new Set(districtData.map((item) => item.district)),
        );
        setDistricts(uniqueDistricts);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  const handleTimeRangeChange = (value: string) => {
    const today = new Date();
    let startDate = new Date();

    switch (value) {
      case "day":
        startDate = new Date(today);
        break;
      case "week":
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case "month":
        startDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case "quarter":
        startDate = new Date(today.setMonth(today.getMonth() - 3));
        break;
      case "year":
        startDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      default:
        // For custom, don't change the dates
        return setFilters({
          ...filters,
          timeRange: value as any,
        });
    }

    setFilters({
      ...filters,
      timeRange: value as any,
      startDate: startDate.toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleExport = () => {
    if (crimeData.length === 0) {
      alert("No data to export");
      return;
    }

    let content = "";
    let filename = `crime_data_${new Date().toISOString().split("T")[0]}`;

    if (exportFormat === "csv") {
      // Create CSV content
      const headers = Object.keys(crimeData[0]).join(",");
      const rows = crimeData
        .map((row) =>
          Object.values(row)
            .map((value) =>
              typeof value === "string" && value.includes(",")
                ? `"${value}"`
                : value,
            )
            .join(","),
        )
        .join("\n");
      content = `${headers}\n${rows}`;
      filename += ".csv";
    } else if (exportFormat === "json") {
      // Create JSON content
      content = JSON.stringify(crimeData, null, 2);
      filename += ".json";
    } else if (exportFormat === "excel") {
      // For Excel, we'll use CSV format that Excel can open
      const headers = Object.keys(crimeData[0]).join(",");
      const rows = crimeData
        .map((row) =>
          Object.values(row)
            .map((value) =>
              typeof value === "string" && value.includes(",")
                ? `"${value}"`
                : value,
            )
            .join(","),
        )
        .join("\n");
      content = `${headers}\n${rows}`;
      filename += ".csv";
    }

    // Create a download link
    const blob = new Blob([content], {
      type: exportFormat === "json" ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Data processing for charts
  const getCrimeByTypeData = () => {
    const counts: Record<string, number> = {};
    crimeData.forEach((crime) => {
      counts[crime.crime_type] = (counts[crime.crime_type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getCrimeByDistrictData = () => {
    const counts: Record<string, number> = {};
    crimeData.forEach((crime) => {
      counts[crime.district] = (counts[crime.district] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getCrimeByTimeData = () => {
    // Group by hour of day
    const hourCounts: Record<string, number> = {};
    crimeData.forEach((crime) => {
      const hour = crime.time.split(":")[0];
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Convert to array and sort by hour
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
      }))
      .sort((a, b) => a.hour - b.hour);
  };

  const getCrimeByDateData = () => {
    // Group by date
    const dateCounts: Record<string, number> = {};
    crimeData.forEach((crime) => {
      dateCounts[crime.date] = (dateCounts[crime.date] || 0) + 1;
    });

    // Convert to array and sort by date
    return Object.entries(dateCounts)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getCrimeBySeverityData = () => {
    const counts: Record<string, number> = {
      high: 0,
      medium: 0,
      low: 0,
    };
    crimeData.forEach((crime) => {
      counts[crime.severity] = (counts[crime.severity] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];
  const SEVERITY_COLORS = {
    high: "#FF5252",
    medium: "#FFC107",
    low: "#4CAF50",
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive crime data analysis and visualization tools
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Export as" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={filters.timeRange}
              onValueChange={handleTimeRangeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">Last 12 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {filters.timeRange === "custom" && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label htmlFor="startDate" className="text-xs">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-xs">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Crime Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={filters.crimeType}
              onValueChange={(value) =>
                setFilters({ ...filters, crimeType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select crime type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crime Types</SelectItem>
                {crimeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>District</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={filters.district}
              onValueChange={(value) =>
                setFilters({ ...filters, district: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Data Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{crimeData.length}</div>
            <p className="text-sm text-muted-foreground">
              Total incidents in selected period
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={fetchCrimeData}
            >
              <RefreshCw className="mr-2 h-3 w-3" /> Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="trends" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trends Analysis
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Distribution Analysis
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            Comparative Analysis
          </TabsTrigger>
          <TabsTrigger value="spatial" className="flex items-center">
            <Map className="mr-2 h-4 w-4" />
            Spatial Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crime Incidents Over Time</CardTitle>
                <CardDescription>
                  Trend of crime incidents during the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : crimeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getCrimeByDateData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString()
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(date) =>
                          new Date(date).toLocaleDateString()
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Incidents"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crime by Time of Day</CardTitle>
                <CardDescription>
                  Distribution of incidents across hours of the day
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : crimeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getCrimeByTimeData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(hour) => `${hour}:00 - ${hour}:59`}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Incidents" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crime by Type</CardTitle>
                <CardDescription>
                  Distribution of incidents by crime category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : crimeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCrimeByTypeData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCrimeByTypeData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crime by Severity</CardTitle>
                <CardDescription>
                  Distribution of incidents by severity level
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : crimeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCrimeBySeverityData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name.charAt(0).toUpperCase() + name.slice(1)}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCrimeBySeverityData().map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={
                              SEVERITY_COLORS[
                                entry.name as keyof typeof SEVERITY_COLORS
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crime by District</CardTitle>
              <CardDescription>
                Comparison of crime incidents across different districts
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : crimeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getCrimeByDistrictData()}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Incidents" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available for the selected filters
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spatial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crime Hotspot Map</CardTitle>
              <CardDescription>
                Geographical distribution of crime incidents
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                {/* This would be replaced with an actual map component */}
                <div className="absolute inset-0 bg-gray-200">
                  {/* Map placeholder */}
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1563656157432-67560b52e9fa?w=800&q=80')] bg-cover bg-center opacity-50"></div>

                  {/* Overlay for crime incidents */}
                  <div className="absolute inset-0">
                    {crimeData
                      .filter(
                        (crime) => crime.location_lat && crime.location_lng,
                      )
                      .map((crime) => (
                        <div
                          key={crime.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${(((crime.location_lng || -16.7) + 16.7) / 1.2) * 100}%`,
                            top: `${((13.5 - (crime.location_lat || 13.5)) / 0.3) * 100}%`,
                          }}
                        >
                          <div className="flex flex-col items-center cursor-pointer group">
                            <div
                              className={`h-3 w-3 rounded-full ${crime.severity === "high" ? "bg-red-500" : crime.severity === "medium" ? "bg-yellow-500" : "bg-green-500"}`}
                            />
                            <div className="hidden group-hover:block absolute bottom-full mb-2 bg-white p-2 rounded shadow-lg z-10 w-48">
                              <div className="font-medium">
                                {crime.crime_type}
                              </div>
                              <div className="text-sm">{crime.district}</div>
                              <div className="text-sm">
                                {new Date(crime.date).toLocaleDateString()} at{" "}
                                {crime.time}
                              </div>
                              <div className="mt-1">
                                <Badge
                                  className={
                                    crime.severity === "high"
                                      ? "bg-red-100 text-red-800"
                                      : crime.severity === "medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }
                                >
                                  {crime.severity.charAt(0).toUpperCase() +
                                    crime.severity.slice(1)}{" "}
                                  Severity
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span>Loading map data...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
