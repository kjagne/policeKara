import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
import { Input } from "@/components/ui/input";
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Search,
  RefreshCw,
} from "lucide-react";

interface DataAnalysisProps {
  title?: string;
  description?: string;
  datasets?: {
    id: string;
    name: string;
    lastUpdated: string;
    size: string;
    type: string;
  }[];
}

const DataAnalysis = ({
  title = "Data Analysis Tools",
  description = "Advanced tools for historical data analysis, pattern recognition, and resource optimization.",
  initialDatasets = [
    {
      id: "1",
      name: "Crime Records 2023",
      lastUpdated: "2023-12-15",
      size: "1.2 GB",
      type: "Historical",
    },
    {
      id: "2",
      name: "Officer Performance Data",
      lastUpdated: "2023-11-30",
      size: "450 MB",
      type: "Performance",
    },
    {
      id: "3",
      name: "Resource Allocation Metrics",
      lastUpdated: "2023-12-01",
      size: "320 MB",
      type: "Resource",
    },
    {
      id: "4",
      name: "Patrol Patterns 2020-2023",
      lastUpdated: "2023-10-15",
      size: "2.1 GB",
      type: "Historical",
    },
    {
      id: "5",
      name: "Emergency Response Times",
      lastUpdated: "2023-12-10",
      size: "780 MB",
      type: "Performance",
    },
  ],
}: DataAnalysisProps) => {
  const [datasets, setDatasets] = useState(initialDatasets);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatasets = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("datasets").select("*");

        if (error) {
          console.error("Error fetching datasets:", error);
          return;
        }

        if (data && data.length > 0) {
          setDatasets(data);
        }
      } catch (error) {
        console.error("Error fetching datasets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatasets();
  }, []);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("1y");
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setIsLoading(true);
                try {
                  const { data, error } = await supabase
                    .from("datasets")
                    .select("*");

                  if (error) {
                    console.error("Error refreshing datasets:", error);
                    return;
                  }

                  if (data && data.length > 0) {
                    setDatasets(data);
                  }
                } catch (error) {
                  console.error("Error refreshing datasets:", error);
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Refreshing..." : "Refresh Data"}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="historical" className="w-full">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="historical">
              <BarChart className="h-4 w-4 mr-2" />
              Historical Analysis
            </TabsTrigger>
            <TabsTrigger value="patterns">
              <LineChart className="h-4 w-4 mr-2" />
              Pattern Recognition
            </TabsTrigger>
            <TabsTrigger value="resources">
              <PieChart className="h-4 w-4 mr-2" />
              Resource Optimization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historical Data Analysis</CardTitle>
                <CardDescription>
                  Analyze historical crime data to identify trends and patterns
                  over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-4">
                  <div className="w-1/3">
                    <Select
                      value={selectedDataset}
                      onValueChange={setSelectedDataset}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        {datasets
                          .filter((dataset) => dataset.type === "Historical")
                          .map((dataset) => (
                            <SelectItem key={dataset.id} value={dataset.id}>
                              {dataset.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-1/3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1m">Last Month</SelectItem>
                        <SelectItem value="3m">Last 3 Months</SelectItem>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                        <SelectItem value="1y">Last Year</SelectItem>
                        <SelectItem value="3y">Last 3 Years</SelectItem>
                        <SelectItem value="5y">Last 5 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="secondary" disabled={isLoading}>
                    <Filter className="h-4 w-4 mr-2" />
                    {isLoading ? "Loading..." : "Apply Filters"}
                  </Button>
                </div>

                <div className="border rounded-md p-6 flex items-center justify-center h-[400px] bg-muted/20">
                  <div className="text-center">
                    <BarChart className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      Select a dataset and time range to visualize historical
                      data
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Violent Crimes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Property Crimes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm">Other Offenses</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pattern Recognition</CardTitle>
                <CardDescription>
                  Identify crime patterns and correlations using advanced
                  analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-4">
                  <div className="w-2/3">
                    <Input
                      placeholder="Search for patterns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="secondary">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Temporal Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md p-4 flex items-center justify-center h-[180px] bg-muted/20">
                        <LineChart className="h-12 w-12 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Spatial Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md p-4 flex items-center justify-center h-[180px] bg-muted/20">
                        <div className="w-full h-full bg-gray-200 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Pattern Insights</h3>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 border rounded-md">
                      <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="font-medium">
                          Increasing weekend incidents in downtown area
                        </p>
                        <p className="text-sm text-muted-foreground">
                          +15% compared to last month
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 border rounded-md">
                      <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                      <div>
                        <p className="font-medium">
                          Decreasing property crimes in residential zones
                        </p>
                        <p className="text-sm text-muted-foreground">
                          -8% compared to last month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export Patterns
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Optimization</CardTitle>
                <CardDescription>
                  Optimize resource allocation based on historical data and
                  predictive analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Officer Allocation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">78%</span>
                        <span className="text-green-500 flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 mr-1" /> Optimal
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: "78%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Current allocation efficiency
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Vehicle Utilization
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">65%</span>
                        <span className="text-yellow-500 flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 mr-1" /> Improving
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-yellow-500 h-2.5 rounded-full"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Current utilization rate
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Equipment Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">92%</span>
                        <span className="text-green-500 flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 mr-1" /> Excellent
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: "92%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Operational equipment
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-md p-4 mb-4">
                  <h3 className="font-medium mb-2">
                    Optimization Recommendations
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2"></div>
                      <p>
                        Increase patrol units in downtown area between 10 PM and
                        2 AM on weekends
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2"></div>
                      <p>
                        Reallocate 3 officers from North district to South
                        district during day shifts
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2"></div>
                      <p>
                        Schedule preventative maintenance for vehicles #103,
                        #156, and #178
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="border rounded-md p-4 flex items-center justify-center h-[200px] bg-muted/20">
                  <PieChart className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export Recommendations
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Available Datasets</CardTitle>
            <CardDescription>Select a dataset to analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Last Updated</th>
                    <th className="text-left p-3 font-medium">Size</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-3 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Loading datasets...</span>
                        </div>
                      </td>
                    </tr>
                  ) : datasets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-3 text-center text-muted-foreground"
                      >
                        No datasets found
                      </td>
                    </tr>
                  ) : (
                    datasets.map((dataset, index) => (
                      <tr
                        key={dataset.id}
                        className={
                          index % 2 === 0 ? "bg-background" : "bg-muted/20"
                        }
                      >
                        <td className="p-3">{dataset.name}</td>
                        <td className="p-3">{dataset.type}</td>
                        <td className="p-3">{dataset.lastUpdated}</td>
                        <td className="p-3">{dataset.size}</td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/analyst/analysis/dataset/${dataset.id}`,
                                )
                              }
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {}}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataAnalysis;
