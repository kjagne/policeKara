import React, { useState } from "react";
import {
  FileText,
  BarChart2,
  Users,
  Calendar,
  Download,
  Plus,
  Filter,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportTemplateProps {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  category: string;
  icon: React.ReactNode;
}

interface ReportProps {
  templates?: ReportTemplateProps[];
  reports?: any[];
  statistics?: any[];
}

const defaultTemplates: ReportTemplateProps[] = [
  {
    id: "1",
    title: "Department Performance Report",
    description: "Monthly overview of department performance metrics and KPIs",
    lastUpdated: "2023-10-15",
    category: "Performance",
    icon: <BarChart2 className="h-8 w-8 text-blue-500" />,
  },
  {
    id: "2",
    title: "Crime Statistics Summary",
    description:
      "Comprehensive breakdown of crime statistics by category and location",
    lastUpdated: "2023-10-10",
    category: "Statistics",
    icon: <FileText className="h-8 w-8 text-green-500" />,
  },
  {
    id: "3",
    title: "Officer Activity Report",
    description:
      "Detailed analysis of officer activities, cases handled, and outcomes",
    lastUpdated: "2023-10-05",
    category: "Personnel",
    icon: <Users className="h-8 w-8 text-purple-500" />,
  },
  {
    id: "4",
    title: "Quarterly Budget Report",
    description:
      "Financial overview of department budget allocation and expenditure",
    lastUpdated: "2023-09-30",
    category: "Finance",
    icon: <Calendar className="h-8 w-8 text-amber-500" />,
  },
];

const defaultReports = [
  {
    id: "1",
    title: "Q3 Crime Statistics",
    date: "2023-10-01",
    author: "Jane Smith",
    status: "Published",
  },
  {
    id: "2",
    title: "Annual Department Performance",
    date: "2023-09-15",
    author: "John Doe",
    status: "Draft",
  },
  {
    id: "3",
    title: "Resource Allocation Analysis",
    date: "2023-08-22",
    author: "Alex Johnson",
    status: "Published",
  },
  {
    id: "4",
    title: "Officer Performance Metrics",
    date: "2023-08-10",
    author: "Sarah Williams",
    status: "Under Review",
  },
  {
    id: "5",
    title: "Budget Forecast 2024",
    date: "2023-07-28",
    author: "Michael Brown",
    status: "Draft",
  },
];

const defaultStatistics = [
  {
    id: "1",
    title: "Violent Crime Rate",
    value: "-12%",
    trend: "down",
    period: "vs last quarter",
  },
  {
    id: "2",
    title: "Case Clearance Rate",
    value: "68%",
    trend: "up",
    period: "current quarter",
  },
  {
    id: "3",
    title: "Response Time",
    value: "8.2 min",
    trend: "down",
    period: "avg. this month",
  },
  {
    id: "4",
    title: "Reports Generated",
    value: "142",
    trend: "up",
    period: "this quarter",
  },
];

const ReportGeneration: React.FC<ReportProps> = ({
  templates = defaultTemplates,
  reports = defaultReports,
  statistics = defaultStatistics,
}) => {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Report Generation</h1>
          <p className="text-muted-foreground">
            Create, manage, and distribute department reports
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create New Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statistics.map((stat) => (
          <Card key={stat.id}>
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  {stat.title}
                </span>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span
                    className={`ml-2 text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}
                  >
                    {stat.trend === "up" ? "↑" : "↓"} {stat.period}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs
        defaultValue="templates"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          <TabsTrigger value="create">Create Report</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search templates..." className="pl-8" />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="statistics">Statistics</SelectItem>
                  <SelectItem value="personnel">Personnel</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded-md bg-primary/10">
                      {template.icon}
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      {template.category}
                    </span>
                  </div>
                  <CardTitle className="mt-4">{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between pt-2 pb-4">
                  <span className="text-xs text-muted-foreground">
                    Updated: {template.lastUpdated}
                  </span>
                  <Button size="sm">Use Template</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Reports Tab */}
        <TabsContent value="my-reports">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reports..." className="pl-8" />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Title</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Author</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-4">{report.title}</td>
                        <td className="p-4">{report.date}</td>
                        <td className="p-4">{report.author}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              report.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : report.status === "Draft"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Report Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Report</CardTitle>
              <CardDescription>
                Fill in the details to generate a new report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Report Title
                </label>
                <Input id="title" placeholder="Enter report title" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="statistics">Statistics</SelectItem>
                      <SelectItem value="personnel">Personnel</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="timeframe" className="text-sm font-medium">
                    Time Frame
                  </label>
                  <Select>
                    <SelectTrigger id="timeframe">
                      <SelectValue placeholder="Select time frame" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Enter report description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="data-sources" className="text-sm font-medium">
                  Data Sources
                </label>
                <Select>
                  <SelectTrigger id="data-sources">
                    <SelectValue placeholder="Select data sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crime-stats">
                      Crime Statistics
                    </SelectItem>
                    <SelectItem value="officer-data">Officer Data</SelectItem>
                    <SelectItem value="case-records">Case Records</SelectItem>
                    <SelectItem value="budget-data">Budget Data</SelectItem>
                    <SelectItem value="resource-allocation">
                      Resource Allocation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="metrics" className="text-sm font-medium">
                  Key Metrics to Include
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="metric-1"
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="metric-1">Case Clearance Rate</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="metric-2"
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="metric-2">Response Time</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="metric-3"
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="metric-3">Crime Rate by Category</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="metric-4"
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="metric-4">Officer Performance</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="metric-5"
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="metric-5">Resource Utilization</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="metric-6"
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="metric-6">Budget Analysis</label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save as Draft</Button>
              <Button>Generate Report</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportGeneration;
