import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  AlertTriangle,
  BarChart3,
  FileText,
  Filter,
  Calendar,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HotspotProps {
  id: string;
  name: string;
  riskLevel: "high" | "medium" | "low";
  crimeType: string;
  location: string;
  prediction: string;
  lastUpdated: string;
}

interface PredictionFactorProps {
  id: string;
  name: string;
  impact: number;
  description: string;
  trend: "increasing" | "decreasing" | "stable";
}

interface ReportProps {
  id: string;
  title: string;
  date: string;
  type: string;
  status: "completed" | "pending" | "draft";
}

const AICrimePrediction = () => {
  const [timeRange, setTimeRange] = useState<string>("7days");

  const [hotspots, setHotspots] = useState<HotspotProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHotspots = async () => {
      setIsLoading(true);
      try {
        // Get crime statistics to generate hotspots
        const { data, error } = await supabase
          .from("crime_statistics")
          .select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          // Group by region and category to identify hotspots
          const regionCounts = {};

          data.forEach((stat) => {
            const key = `${stat.region}-${stat.category}`;
            if (!regionCounts[key]) {
              regionCounts[key] = {
                count: 0,
                region: stat.region,
                category: stat.category,
              };
            }
            regionCounts[key].count += stat.count;
          });

          // Convert to hotspots array and sort by count
          const hotspotData = Object.values(regionCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
            .map((item, index) => {
              const riskLevel =
                index === 0 || index === 1
                  ? "high"
                  : index === 2
                    ? "medium"
                    : "low";

              return {
                id: (index + 1).toString(),
                name: `${item.region}`,
                riskLevel: riskLevel as "high" | "medium" | "low",
                crimeType: item.category,
                location: `${item.region} Area`,
                prediction: `${Math.round(70 - index * 15)}% likelihood in next ${(index + 1) * 7} days`,
                lastUpdated: `${index + 1} hour${index === 0 ? "" : "s"} ago`,
              };
            });

          setHotspots(hotspotData);
        }
      } catch (error) {
        console.error("Error fetching hotspot data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotspots();
  }, []);

  // Mock data for prediction factors
  const defaultPredictionFactors: PredictionFactorProps[] = [
    {
      id: "1",
      name: "Time of Day",
      impact: 85,
      description:
        "Evening hours show highest correlation with theft incidents",
      trend: "increasing",
    },
    {
      id: "2",
      name: "Weather Conditions",
      impact: 62,
      description: "Clear weather correlates with increased outdoor crime",
      trend: "stable",
    },
    {
      id: "3",
      name: "Proximity to Public Transit",
      impact: 78,
      description:
        "Areas within 500m of transit stops show higher incident rates",
      trend: "increasing",
    },
    {
      id: "4",
      name: "Previous Incident History",
      impact: 91,
      description:
        "Locations with prior incidents show strong recurrence patterns",
      trend: "stable",
    },
    {
      id: "5",
      name: "Population Density",
      impact: 73,
      description: "Higher density areas correlate with certain crime types",
      trend: "decreasing",
    },
  ];

  // Mock data for reports
  const defaultReports: ReportProps[] = [
    {
      id: "1",
      title: "Q2 Crime Prediction Analysis",
      date: "2023-06-15",
      type: "Quarterly",
      status: "completed",
    },
    {
      id: "2",
      title: "Downtown District Risk Assessment",
      date: "2023-07-02",
      type: "Area-specific",
      status: "completed",
    },
    {
      id: "3",
      title: "Summer Event Security Planning",
      date: "2023-07-10",
      type: "Special Event",
      status: "pending",
    },
    {
      id: "4",
      title: "Theft Pattern Prediction Model",
      date: "2023-07-15",
      type: "Crime-specific",
      status: "draft",
    },
  ];

  const getRiskLevelColor = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: "increasing" | "decreasing" | "stable") => {
    switch (trend) {
      case "increasing":
        return <ArrowRight className="rotate-45 text-red-500" />;
      case "decreasing":
        return <ArrowRight className="-rotate-45 text-green-500" />;
      case "stable":
        return <ArrowRight className="rotate-0 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: "completed" | "pending" | "draft") => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Crime Prediction
            </h1>
            <p className="text-gray-500 mt-1">
              Analyze patterns, identify hotspots, and generate prediction
              reports
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24hours">Last 24 Hours</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hotspots" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="hotspots" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Crime Hotspots
            </TabsTrigger>
            <TabsTrigger value="factors" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Prediction Factors
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Prediction Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hotspots" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-3 flex justify-center items-center py-12">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Loading hotspots...</span>
                  </div>
                </div>
              ) : hotspots.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  No hotspots found
                </div>
              ) : (
                hotspots.map((hotspot) => (
                  <div key={hotspot.id}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {hotspot.name}
                          </CardTitle>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(hotspot.riskLevel)}`}
                          >
                            {hotspot.riskLevel.charAt(0).toUpperCase() +
                              hotspot.riskLevel.slice(1)}{" "}
                            Risk
                          </span>
                        </div>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {hotspot.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                              Crime Type:
                            </span>
                            <span className="text-sm font-medium">
                              {hotspot.crimeType}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                              Prediction:
                            </span>
                            <span className="text-sm font-medium">
                              {hotspot.prediction}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 border-t flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Updated {hotspot.lastUpdated}
                        </span>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-center mt-4">
              <Button variant="outline">
                View All Hotspots
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="factors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {defaultPredictionFactors.map((factor) => (
                <div key={factor.id}>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{factor.name}</CardTitle>
                        <div className="flex items-center">
                          <span className="text-sm font-bold mr-2">
                            {factor.impact}%
                          </span>
                          {getTrendIcon(factor.trend)}
                        </div>
                      </div>
                      <CardDescription>Impact Factor</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {factor.description}
                      </p>
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${factor.impact}%` }}
                        ></div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 border-t">
                      <Button variant="ghost" size="sm" className="ml-auto">
                        Analyze Factor
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-medium">Recent Prediction Reports</h3>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate New Report
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {defaultReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {report.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            <Calendar className="inline mr-1 h-3 w-3" />
                            {report.date}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {report.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}
                          >
                            {report.status.charAt(0).toUpperCase() +
                              report.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">About AI Predictions</h3>
            <p className="text-sm text-blue-600 mt-1">
              These predictions are based on historical data and AI algorithms.
              They are intended to assist in resource allocation and preventive
              measures, but should not be the sole basis for operational
              decisions. Always combine AI insights with professional judgment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICrimePrediction;
