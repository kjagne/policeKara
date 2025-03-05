import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReports, createReport } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  FileText,
  Send,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// Form schema for report submission
const reportFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  type: z.string(),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" }),
  incidentDate: z.string(),
  location: z.string(),
  involvedParties: z.string().optional(),
  evidenceRefs: z.string().optional(),
});

// Mock data for past reports
const pastReports = [
  {
    id: "RPT-2023-001",
    title: "Robbery Investigation Report",
    type: "Investigation",
    submittedDate: "2023-05-15",
    status: "Approved",
  },
  {
    id: "RPT-2023-002",
    title: "Traffic Incident Report",
    type: "Incident",
    submittedDate: "2023-06-22",
    status: "Pending Review",
  },
  {
    id: "RPT-2023-003",
    title: "Monthly Patrol Summary",
    type: "Summary",
    submittedDate: "2023-07-01",
    status: "Approved",
  },
  {
    id: "RPT-2023-004",
    title: "Domestic Disturbance Report",
    type: "Incident",
    submittedDate: "2023-07-15",
    status: "Pending Review",
  },
  {
    id: "RPT-2023-005",
    title: "Evidence Collection Report",
    type: "Evidence",
    submittedDate: "2023-08-03",
    status: "Approved",
  },
];

interface ReportsProps {
  officerId?: string;
  departmentId?: string;
}

const Reports = ({
  officerId = "OFF-123",
  departmentId = "DEPT-001",
}: ReportsProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("submit");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Initialize form
  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      type: "Incident",
      description: "",
      incidentDate: format(new Date(), "yyyy-MM-dd"),
      location: "",
      involvedParties: "",
      evidenceRefs: "",
    },
  });

  // Fetch reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Fetch reports directly from Supabase
        const { data, error } = await supabase.from("reports").select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          // Update the reports state with data from the database
          const formattedReports = data.map((report) => ({
            id: report.id,
            title: report.title,
            type: report.type,
            submittedDate: new Date(report.submitted_date).toLocaleDateString(),
            status:
              report.status.charAt(0).toUpperCase() + report.status.slice(1),
          }));

          // This would replace the mock data
          // setReports(formattedReports);
          console.log("Fetched reports:", formattedReports);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof reportFormSchema>) => {
    try {
      // Send the data directly to Supabase
      const { data: result, error } = await supabase
        .from("reports")
        .insert([
          {
            title: data.title,
            type: data.type,
            description: data.description,
            incident_date: data.incidentDate,
            location: data.location,
            involved_parties: data.involvedParties || null,
            evidence_refs: data.evidenceRefs || null,
            officer_id: officerId,
            department_id: departmentId,
            submitted_date: new Date().toISOString(),
            status: "pending review",
          },
        ])
        .select();

      if (error) throw error;

      console.log("Report submitted:", result);
      alert("Report submitted successfully!");
      form.reset();

      if (result && result.length > 0) {
        // Add the new report to the list
        const newReport = {
          id: result[0].id,
          title: result[0].title,
          type: result[0].type,
          submittedDate: new Date().toLocaleDateString(),
          status: "Pending Review",
        };

        // Update the reports state
        // This would be done if we were using a state for reports
        // setPastReports([newReport, ...pastReports]);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    }
  };

  // Filter reports based on search query and status filter
  const filteredReports = pastReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      report.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Submit and manage your reports</p>
      </div>

      <Tabs
        defaultValue="submit"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Submit Report
          </TabsTrigger>
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            View Past Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Report</CardTitle>
              <CardDescription>
                Fill out the form below to submit a new report. All fields
                marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter report title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Type *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Incident">Incident</SelectItem>
                              <SelectItem value="Investigation">
                                Investigation
                              </SelectItem>
                              <SelectItem value="Evidence">Evidence</SelectItem>
                              <SelectItem value="Summary">Summary</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="incidentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Incident Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter incident location"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed description of the incident or report"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="involvedParties"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Involved Parties</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List any individuals involved"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include names and IDs if available
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="evidenceRefs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evidence References</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List any evidence reference numbers"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include evidence IDs from the evidence management
                            system
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                    >
                      Reset
                    </Button>
                    <Button type="submit" className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Submit Report
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Reports</CardTitle>
              <CardDescription>
                View and manage your previously submitted reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports by title or ID"
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending review">
                        Pending Review
                      </SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            {report.id}
                          </TableCell>
                          <TableCell>{report.title}</TableCell>
                          <TableCell>{report.type}</TableCell>
                          <TableCell>{report.submittedDate}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                report.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : report.status === "Pending Review"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {report.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/officer/reports/${report.id}`)
                                }
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {}}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No reports found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last updated: {format(new Date(), "MMM dd, yyyy")}
              </div>
              <Button
                onClick={() => setActiveTab("submit")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
