import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Search,
  Filter,
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart2,
  Download,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

// Types
interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: "open" | "closed" | "pending" | "archived";
  priority: "high" | "medium" | "low";
  assigned_officer_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  assigned_officer?: Officer;
  evidence_count?: number;
  suspects_count?: number;
}

interface Officer {
  id: string;
  name: string;
  badge: string;
  rank: string;
  department: string;
  station_id?: string;
  status: "active" | "inactive" | "on_leave";
}

interface CaseFilter {
  status: string;
  priority: string;
  assignedOfficer: string;
  dateRange: string;
  searchQuery: string;
}

const CasesTab: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [isViewCaseOpen, setIsViewCaseOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [filters, setFilters] = useState<CaseFilter>({
    status: "all",
    priority: "all",
    assignedOfficer: "all",
    dateRange: "all",
    searchQuery: "",
  });
  const [caseStats, setCaseStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    highPriority: 0,
  });
  const [newCaseData, setNewCaseData] = useState({
    title: "",
    description: "",
    status: "open",
    priority: "medium",
    assigned_officer_id: "",
  });

  useEffect(() => {
    fetchCases();
    fetchOfficers();
  }, []);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("cases").select(`
          *,
          assigned_officer:assigned_officer_id(id, name, badge, rank, department),
          evidence_count:evidence(count),
          suspects_count:case_suspects(count)
        `);

      // Apply filters
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }

      if (filters.assignedOfficer !== "all") {
        query = query.eq("assigned_officer_id", filters.assignedOfficer);
      }

      if (filters.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,case_number.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`,
        );
      }

      // Apply date range filter
      if (filters.dateRange === "today") {
        const today = new Date().toISOString().split("T")[0];
        query = query
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`);
      } else if (filters.dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (filters.dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte("created_at", monthAgo.toISOString());
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      if (data) {
        setCases(data);
        updateCaseStats(data);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from("officers")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;

      if (data) {
        setOfficers(data);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };

  const updateCaseStats = (caseData: Case[]) => {
    const stats = {
      total: caseData.length,
      open: caseData.filter((c) => c.status === "open").length,
      closed: caseData.filter((c) => c.status === "closed").length,
      highPriority: caseData.filter((c) => c.priority === "high").length,
    };
    setCaseStats(stats);
  };

  const handleCreateCase = async () => {
    if (!newCaseData.title) {
      alert("Please provide a case title");
      return;
    }

    setIsLoading(true);
    try {
      // Generate a case number (in a real system, this would be more sophisticated)
      const caseNumber = `CASE-${Date.now().toString().slice(-6)}`;

      const { data, error } = await supabase
        .from("cases")
        .insert([
          {
            case_number: caseNumber,
            title: newCaseData.title,
            description: newCaseData.description,
            status: newCaseData.status,
            priority: newCaseData.priority,
            assigned_officer_id: newCaseData.assigned_officer_id || null,
            created_by: "admin-user-id", // Replace with actual admin ID
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchCases();
        setIsAddCaseOpen(false);
        setNewCaseData({
          title: "",
          description: "",
          status: "open",
          priority: "medium",
          assigned_officer_id: "",
        });
        alert("Case created successfully!");
      }
    } catch (error) {
      console.error("Error creating case:", error);
      alert("Failed to create case. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCaseStatus = async (caseId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("cases")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (error) throw error;

      await fetchCases();
      alert(`Case status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating case status:", error);
      alert("Failed to update case status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this case? This action cannot be undone.",
      )
    )
      return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("cases").delete().eq("id", caseId);

      if (error) throw error;

      await fetchCases();
      alert("Case deleted successfully!");
    } catch (error) {
      console.error("Error deleting case:", error);
      alert("Failed to delete case. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCase = (caseData: Case) => {
    setSelectedCase(caseData);
    setIsViewCaseOpen(true);
  };

  const handleFilterChange = (key: keyof CaseFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => fetchCases(), 100);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Case Management</h2>
          <p className="text-muted-foreground">
            Manage and track all cases in the system
          </p>
        </div>
        <Button onClick={() => setIsAddCaseOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Case
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{caseStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Open Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {caseStats.open}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Closed Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {caseStats.closed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {caseStats.highPriority}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine the case list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={filters.priority}
                onValueChange={(value) => handleFilterChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned Officer</Label>
              <Select
                value={filters.assignedOfficer}
                onValueChange={(value) =>
                  handleFilterChange("assignedOfficer", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by officer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Officers</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {officers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.name} ({officer.badge})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  handleFilterChange("dateRange", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
                  className="pl-9"
                  value={filters.searchQuery}
                  onChange={(e) =>
                    handleFilterChange("searchQuery", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Case List</CardTitle>
          <CardDescription>
            All cases matching your filter criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : cases.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned Officer</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">
                        {caseItem.case_number}
                      </TableCell>
                      <TableCell>{caseItem.title}</TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadgeVariant(caseItem.status)}
                        >
                          {caseItem.status.charAt(0).toUpperCase() +
                            caseItem.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPriorityBadgeVariant(caseItem.priority)}
                        >
                          {caseItem.priority.charAt(0).toUpperCase() +
                            caseItem.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {caseItem.assigned_officer ? (
                          <span className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {caseItem.assigned_officer.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(caseItem.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCase(caseItem)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          {caseItem.status === "open" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateCaseStatus(caseItem.id, "closed")
                              }
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="sr-only">Close</span>
                            </Button>
                          )}
                          {caseItem.status === "closed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateCaseStatus(caseItem.id, "open")
                              }
                            >
                              <RefreshCw className="h-4 w-4 text-blue-500" />
                              <span className="sr-only">Reopen</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCase(caseItem.id)}
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
              <h3 className="mt-2 text-sm font-semibold">No cases found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filters.searchQuery ||
                filters.status !== "all" ||
                filters.priority !== "all" ||
                filters.assignedOfficer !== "all" ||
                filters.dateRange !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating a new case"}
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsAddCaseOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Case
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Case Dialog */}
      <Dialog open={isAddCaseOpen} onOpenChange={setIsAddCaseOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
            <DialogDescription>
              Enter the details for the new case
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                value={newCaseData.title}
                onChange={(e) =>
                  setNewCaseData({ ...newCaseData, title: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                value={newCaseData.description}
                onChange={(e) =>
                  setNewCaseData({
                    ...newCaseData,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newCaseData.status}
                  onValueChange={(value) =>
                    setNewCaseData({ ...newCaseData, status: value })
                  }
                >
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newCaseData.priority}
                  onValueChange={(value) =>
                    setNewCaseData({ ...newCaseData, priority: value })
                  }
                >
                  <SelectTrigger id="priority" className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="assignedOfficer">Assigned Officer</Label>
              <Select
                value={newCaseData.assigned_officer_id}
                onValueChange={(value) =>
                  setNewCaseData({ ...newCaseData, assigned_officer_id: value })
                }
              >
                <SelectTrigger id="assignedOfficer" className="mt-1">
                  <SelectValue placeholder="Select officer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {officers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.name} ({officer.badge})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCase} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Case"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Case Dialog */}
      <Dialog open={isViewCaseOpen} onOpenChange={setIsViewCaseOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Case Details</DialogTitle>
            <DialogDescription>{selectedCase?.case_number}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Status
                </h3>
                <Badge
                  className={
                    selectedCase
                      ? getStatusBadgeVariant(selectedCase.status)
                      : ""
                  }
                >
                  {selectedCase?.status.charAt(0).toUpperCase() +
                    selectedCase?.status.slice(1)}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Priority
                </h3>
                <Badge
                  className={
                    selectedCase
                      ? getPriorityBadgeVariant(selectedCase.priority)
                      : ""
                  }
                >
                  {selectedCase?.priority.charAt(0).toUpperCase() +
                    selectedCase?.priority.slice(1)}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Title
              </h3>
              <p className="text-base">{selectedCase?.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Description
              </h3>
              <p className="text-sm">
                {selectedCase?.description || "No description provided"}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Assigned Officer
                </h3>
                <p className="text-sm">
                  {selectedCase?.assigned_officer ? (
                    <span className="flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      {selectedCase.assigned_officer.name} (
                      {selectedCase.assigned_officer.badge})
                    </span>
                  ) : (
                    "Unassigned"
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Created
                </h3>
                <p className="text-sm">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {selectedCase && formatDate(selectedCase.created_at)}
                  </span>
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Evidence Items
                </h3>
                <p className="text-2xl font-bold">
                  {selectedCase?.evidence_count || 0}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Suspects
                </h3>
                <p className="text-2xl font-bold">
                  {selectedCase?.suspects_count || 0}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            {selectedCase?.status === "open" ? (
              <Button
                variant="outline"
                onClick={() => {
                  handleUpdateCaseStatus(selectedCase.id, "closed");
                  setIsViewCaseOpen(false);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Closed
              </Button>
            ) : selectedCase?.status === "closed" ? (
              <Button
                variant="outline"
                onClick={() => {
                  handleUpdateCaseStatus(selectedCase.id, "open");
                  setIsViewCaseOpen(false);
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Reopen Case
              </Button>
            ) : null}
            <Button onClick={() => setIsViewCaseOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CasesTab;
