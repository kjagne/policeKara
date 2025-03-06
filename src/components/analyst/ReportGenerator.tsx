import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  User,
  BarChart2,
  FileOutput,
  Save,
  Share2,
  Printer,
  Mail,
  Copy,
  CheckCircle,
} from "lucide-react";

// Types
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  sections: ReportSection[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface ReportSection {
  id: string;
  title: string;
  type: "text" | "chart" | "table" | "image";
  content?: string;
  chart_type?: string;
  data_source?: string;
  options?: any;
}

interface GeneratedReport {
  id: string;
  title: string;
  description: string;
  template_id: string;
  status: "draft" | "published" | "archived";
  content: any;
  created_at: string;
  updated_at: string;
  created_by: string;
  template?: ReportTemplate;
}

const ReportGenerator: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(
    null,
  );
  const [newReportData, setNewReportData] = useState({
    title: "",
    description: "",
    template_id: "",
  });
  const [reportContent, setReportContent] = useState<any>({});
  const [exportFormat, setExportFormat] = useState("pdf");
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchReports();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching report templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("generated_reports")
        .select("*, template:template_id(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching generated reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!newReportData.template_id || !newReportData.title) {
      alert("Please select a template and provide a title");
      return;
    }

    setIsLoading(true);
    try {
      // Get the selected template
      const template = templates.find(
        (t) => t.id === newReportData.template_id,
      );
      if (!template) throw new Error("Template not found");

      // Initialize content based on template sections
      const initialContent = {};
      template.sections.forEach((section) => {
        initialContent[section.id] = {
          type: section.type,
          value: section.content || "",
          options: section.options || {},
        };
      });

      // Create the report
      const { data, error } = await supabase
        .from("generated_reports")
        .insert([
          {
            title: newReportData.title,
            description: newReportData.description,
            template_id: newReportData.template_id,
            status: "draft",
            content: initialContent,
            created_by: "current-user-id", // Replace with actual user ID
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchReports();
        setIsReportDialogOpen(false);
        setNewReportData({
          title: "",
          description: "",
          template_id: "",
        });
        alert("Report created successfully!");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Failed to create report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("generated_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      await fetchReports();
      alert("Report deleted successfully!");
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("generated_reports")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", reportId);

      if (error) throw error;

      await fetchReports();
      alert(
        `Report ${status === "published" ? "published" : "archived"} successfully!`,
      );
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Failed to update report status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = (report: GeneratedReport) => {
    setSelectedReport(report);
    setReportContent(report.content);
    setIsPreviewDialogOpen(true);
  };

  const handleExportReport = () => {
    if (!selectedReport) return;

    // In a real implementation, this would generate a PDF, Word, or other format
    // For now, we'll just create a JSON file
    const content = JSON.stringify(selectedReport, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedReport.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareReport = () => {
    if (!selectedReport || !shareEmail) return;

    setIsSharing(true);
    // Simulate API call to share report
    setTimeout(() => {
      setIsSharing(false);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }, 1500);
  };

  const handlePrintReport = () => {
    if (!selectedReport) return;
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Report Generator</h1>
          <p className="text-muted-foreground">
            Create, manage, and export detailed crime analysis reports
          </p>
        </div>
        <Button onClick={() => setIsReportDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Available Templates</CardTitle>
            <CardDescription>Report templates you can use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Reports</CardTitle>
            <CardDescription>Reports you've created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Published Reports</CardTitle>
            <CardDescription>Reports shared with others</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reports.filter((r) => r.status === "published").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>
            View, edit, and manage your generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reports.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.title}
                      </TableCell>
                      <TableCell>
                        {report.template?.name || "Unknown Template"}
                      </TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === "published"
                              ? "bg-green-100 text-green-800"
                              : report.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {report.status.charAt(0).toUpperCase() +
                            report.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          {report.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateReportStatus(report.id, "published")
                              }
                            >
                              <FileOutput className="h-4 w-4 text-green-500" />
                              <span className="sr-only">Publish</span>
                            </Button>
                          )}
                          {report.status === "published" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateReportStatus(report.id, "archived")
                              }
                            >
                              <Save className="h-4 w-4 text-blue-500" />
                              <span className="sr-only">Archive</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-sm font-semibold">No reports yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating a new report.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsReportDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Select a template and provide basic information for your report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="template">Report Template *</Label>
              <Select
                value={newReportData.template_id}
                onValueChange={(value) =>
                  setNewReportData({ ...newReportData, template_id: value })
                }
              >
                <SelectTrigger id="template" className="mt-1">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                value={newReportData.title}
                onChange={(e) =>
                  setNewReportData({ ...newReportData, title: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newReportData.description}
                onChange={(e) =>
                  setNewReportData({
                    ...newReportData,
                    description: e.target.value,
                  })
                }
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateReport} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Preview Dialog */}
      <Dialog
        open={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
        className="max-w-4xl"
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>{selectedReport?.description}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Report metadata */}
            <div className="flex justify-between text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {selectedReport && formatDate(selectedReport.created_at)}
              </div>
              <div className="flex items-center">
                <User className="mr-1 h-4 w-4" />
                Analyst Report
              </div>
            </div>

            <Separator className="my-4" />

            {/* Report content */}
            <div className="space-y-8">
              {selectedReport?.template?.sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {section.type === "text" && (
                    <div className="prose max-w-none">
                      {reportContent[section.id]?.value || section.content || (
                        <p className="text-muted-foreground italic">
                          No content provided for this section.
                        </p>
                      )}
                    </div>
                  )}
                  {section.type === "chart" && (
                    <div className="h-[300px] bg-muted rounded-md flex items-center justify-center">
                      <div className="text-center">
                        <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Chart visualization would appear here
                        </p>
                      </div>
                    </div>
                  )}
                  {section.type === "table" && (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Column 1</TableHead>
                            <TableHead>Column 2</TableHead>
                            <TableHead>Column 3</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Data 1</TableCell>
                            <TableCell>Data 2</TableCell>
                            <TableCell>Data 3</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Data 4</TableCell>
                            <TableCell>Data 5</TableCell>
                            <TableCell>Data 6</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {section.type === "image" && (
                    <div className="h-[200px] bg-muted rounded-md flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Image would appear here
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="exportFormat">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger id="exportFormat" className="w-[150px]">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="docx">Word Document</SelectItem>
                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExportReport}>
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div className="flex-1 mr-4">
                <Label htmlFor="shareEmail">Share via Email</Label>
                <div className="flex mt-1">
                  <Input
                    id="shareEmail"
                    type="email"
                    placeholder="recipient@example.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                  <Button
                    className="ml-2"
                    onClick={handleShareReport}
                    disabled={isSharing || !shareEmail}
                  >
                    {isSharing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : shareSuccess ? (
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Sent!
                      </div>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" /> Share
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handlePrintReport}>
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                <Button variant="outline">
                  <Copy className="mr-2 h-4 w-4" /> Copy Link
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportGenerator;
