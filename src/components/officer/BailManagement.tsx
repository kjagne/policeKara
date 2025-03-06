import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  Plus,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  DollarSign,
  Gavel,
  Timer,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { format, formatDistanceToNow, addHours, isPast } from "date-fns";

// Types
interface BailRecord {
  id: string;
  case_id: string;
  suspect_id: string;
  bail_amount: number;
  bail_type: "Cash" | "Property" | "Surety" | "Recognizance";
  bailer_name: string;
  bailer_contact: string;
  bailer_relationship?: string;
  bailer_address?: string;
  bailer_id_type?: string;
  bailer_id_number?: string;
  status: "Pending" | "Approved" | "Denied" | "Revoked" | "Completed";
  court_date?: string;
  detention_start: string;
  detention_end?: string;
  detention_limit_hours: number;
  notes?: string;
  created_by?: string;
  assigned_officer?: string;
  created_at: string;
  updated_at: string;
  case?: Case;
  suspect?: Criminal;
  creator?: Officer;
  assigned?: Officer;
}

interface Case {
  id: string;
  title: string;
  case_number: string;
  status: string;
}

interface Criminal {
  id: string;
  first_name: string;
  last_name: string;
  national_id?: string;
  current_status?: string;
}

interface Officer {
  id: string;
  name: string;
  badge: string;
}

interface DetentionRecord {
  id: string;
  criminal_id: string;
  case_id?: string;
  cell_number?: string;
  station_id?: string;
  detention_start: string;
  detention_end?: string;
  status: "Active" | "Released" | "Transferred" | "Escaped";
  release_reason?: string;
  arresting_officer?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  criminal?: Criminal;
  case?: Case;
  station?: Station;
  officer?: Officer;
}

interface Station {
  id: string;
  name: string;
}

const BailManagement: React.FC = () => {
  const [bailRecords, setBailRecords] = useState<BailRecord[]>([]);
  const [detentionRecords, setDetentionRecords] = useState<DetentionRecord[]>(
    [],
  );
  const [cases, setCases] = useState<Case[]>([]);
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddBailOpen, setIsAddBailOpen] = useState(false);
  const [isAddDetentionOpen, setIsAddDetentionOpen] = useState(false);
  const [selectedBail, setSelectedBail] = useState<BailRecord | null>(null);
  const [selectedDetention, setSelectedDetention] =
    useState<DetentionRecord | null>(null);
  const [selectedCriminal, setSelectedCriminal] = useState<string>("");
  const [selectedCase, setSelectedCase] = useState<string>("");

  const [activeTab, setActiveTab] = useState("bail");

  // Fetch data on component mount
  useEffect(() => {
    fetchBailRecords();
    fetchDetentionRecords();
    fetchCases();
    fetchCriminals();
    fetchOfficers();
    fetchStations();
  }, []);

  const fetchBailRecords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("bail_records").select(`
          *,
          case:case_id(id, title, case_number, status),
          suspect:suspect_id(id, first_name, last_name, national_id, current_status),
          creator:created_by(id, name, badge),
          assigned:assigned_officer(id, name, badge)
        `);

      if (error) throw error;

      if (data) {
        setBailRecords(data);
      }
    } catch (error) {
      console.error("Error fetching bail records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetentionRecords = async () => {
    try {
      const { data, error } = await supabase.from("detention_records").select(`
          *,
          criminal:criminal_id(id, first_name, last_name, national_id, current_status),
          case:case_id(id, title, case_number, status),
          station:station_id(id, name),
          officer:arresting_officer(id, name, badge)
        `);

      if (error) throw error;

      if (data) {
        setDetentionRecords(data);
      }
    } catch (error) {
      console.error("Error fetching detention records:", error);
    }
  };

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("id, title, case_number, status");

      if (error) throw error;

      if (data) {
        setCases(data);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  };

  const fetchCriminals = async () => {
    try {
      const { data, error } = await supabase
        .from("criminals")
        .select("id, first_name, last_name, national_id, current_status");

      if (error) throw error;

      if (data) {
        setCriminals(data);
      }
    } catch (error) {
      console.error("Error fetching criminals:", error);
    }
  };

  const fetchOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from("officers")
        .select("id, name, badge");

      if (error) throw error;

      if (data) {
        setOfficers(data);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from("stations")
        .select("id, name");

      if (error) throw error;

      if (data) {
        setStations(data);
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  const handleCreateBail = async (formData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bail_records")
        .insert([
          {
            case_id: formData.caseId,
            suspect_id: formData.suspectId,
            bail_amount: parseFloat(formData.bailAmount),
            bail_type: formData.bailType,
            bailer_name: formData.bailerName,
            bailer_contact: formData.bailerContact,
            bailer_relationship: formData.bailerRelationship,
            bailer_address: formData.bailerAddress,
            bailer_id_type: formData.bailerIdType,
            bailer_id_number: formData.bailerIdNumber,
            status: "Pending",
            court_date: formData.courtDate,
            detention_start: formData.detentionStart,
            detention_limit_hours: 73, // The Gambia's 73-hour rule
            notes: formData.notes,
            created_by: "current-officer-id", // Replace with actual officer ID
            assigned_officer: formData.assignedOfficer,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchBailRecords();
        setIsAddBailOpen(false);
        alert("Bail record created successfully!");
      }
    } catch (error) {
      console.error("Error creating bail record:", error);
      alert("Failed to create bail record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDetention = async (formData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("detention_records")
        .insert([
          {
            criminal_id: formData.criminalId,
            case_id: formData.caseId,
            cell_number: formData.cellNumber,
            station_id: formData.stationId,
            detention_start: formData.detentionStart,
            status: "Active",
            arresting_officer: "current-officer-id", // Replace with actual officer ID
            notes: formData.notes,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        // Update criminal status to "In Custody"
        await supabase
          .from("criminals")
          .update({ current_status: "In Custody" })
          .eq("id", formData.criminalId);

        await fetchDetentionRecords();
        await fetchCriminals();
        setIsAddDetentionOpen(false);
        alert("Detention record created successfully!");
      }
    } catch (error) {
      console.error("Error creating detention record:", error);
      alert("Failed to create detention record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBailStatus = async (bailId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bail_records")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bailId)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // If bail is approved, update detention record and criminal status
        if (newStatus === "Approved") {
          const bail = data[0];

          // Update detention record
          await supabase
            .from("detention_records")
            .update({
              detention_end: new Date().toISOString(),
              status: "Released",
              release_reason: "Bail Granted",
              updated_at: new Date().toISOString(),
            })
            .eq("criminal_id", bail.suspect_id)
            .is("detention_end", null);

          // Update criminal status
          await supabase
            .from("criminals")
            .update({ current_status: "Released" })
            .eq("id", bail.suspect_id);
        }

        await fetchBailRecords();
        await fetchDetentionRecords();
        await fetchCriminals();
        alert(`Bail status updated to ${newStatus}!`);
      }
    } catch (error) {
      console.error("Error updating bail status:", error);
      alert("Failed to update bail status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReleaseDetainee = async (detentionId: string, reason: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("detention_records")
        .update({
          detention_end: new Date().toISOString(),
          status: "Released",
          release_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", detentionId)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Update criminal status
        await supabase
          .from("criminals")
          .update({ current_status: "Released" })
          .eq("id", data[0].criminal_id);

        await fetchDetentionRecords();
        await fetchCriminals();
        alert("Detainee released successfully!");
      }
    } catch (error) {
      console.error("Error releasing detainee:", error);
      alert("Failed to release detainee. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter bail records based on search query and status filter
  const filteredBailRecords = bailRecords.filter((record) => {
    const matchesSearch =
      record.suspect?.first_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.suspect?.last_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.case?.case_number
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.bailer_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      record.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Filter detention records based on search query
  const filteredDetentionRecords = detentionRecords.filter((record) => {
    return (
      record.criminal?.first_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.criminal?.last_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.case?.case_number
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.cell_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get active detentions (no end date)
  const activeDetentions = detentionRecords.filter(
    (record) => record.status === "Active" && !record.detention_end,
  );

  // Get detentions approaching 73-hour limit
  const detentionsApproachingLimit = activeDetentions.filter((record) => {
    const detentionStart = new Date(record.detention_start);
    const limitTime = addHours(detentionStart, 73);
    const now = new Date();
    const hoursRemaining =
      (limitTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursRemaining <= 12 && hoursRemaining > 0; // Within 12 hours of limit
  });

  // Get detentions past 73-hour limit
  const detentionsPastLimit = activeDetentions.filter((record) => {
    const detentionStart = new Date(record.detention_start);
    const limitTime = addHours(detentionStart, 73);
    return isPast(limitTime);
  });

  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "revoked":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get detention status badge color
  const getDetentionStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "released":
        return "bg-green-100 text-green-800";
      case "transferred":
        return "bg-yellow-100 text-yellow-800";
      case "escaped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GM", {
      style: "currency",
      currency: "GMD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to calculate detention duration
  const calculateDetentionDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Helper function to calculate time remaining until 73-hour limit
  const calculateTimeRemaining = (start: string) => {
    const detentionStart = new Date(start);
    const limitTime = addHours(detentionStart, 73);
    const now = new Date();

    if (isPast(limitTime)) {
      return "Exceeded";
    }

    return formatDistanceToNow(limitTime, { addSuffix: true });
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bail Management</h1>
          <p className="text-muted-foreground">
            Manage bail requests, detentions, and track 73-hour detention limits
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setIsAddDetentionOpen(true);
              setActiveTab("detention");
            }}
          >
            <User className="mr-2 h-4 w-4" /> New Detention
          </Button>
          <Button
            onClick={() => {
              setIsAddBailOpen(true);
              setActiveTab("bail");
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> New Bail Request
          </Button>
        </div>
      </div>

      {/* Alert for detentions past 73-hour limit */}
      {detentionsPastLimit.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">
                  {detentionsPastLimit.length} detainee(s) have exceeded the
                  73-hour detention limit
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  These detainees must be either granted bail or sent to court
                  immediately.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-800 hover:bg-red-100"
                  >
                    View Detainees
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-800 hover:bg-red-100"
                  >
                    Generate Court Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert for detentions approaching 73-hour limit */}
      {detentionsApproachingLimit.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">
                  {detentionsApproachingLimit.length} detainee(s) approaching
                  73-hour detention limit
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  These detainees will reach their detention limit soon. Please
                  process their bail or prepare court documents.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                  >
                    View Detainees
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Detentions</CardTitle>
            <CardDescription>Currently in custody</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeDetentions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Bail Requests</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {
                bailRecords.filter((record) => record.status === "Pending")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>73-Hour Alerts</CardTitle>
            <CardDescription>Detention limit warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {detentionsPastLimit.length + detentionsApproachingLimit.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="bail" className="flex items-center">
            <Gavel className="mr-2 h-4 w-4" />
            Bail Records
          </TabsTrigger>
          <TabsTrigger value="detention" className="flex items-center">
            <Timer className="mr-2 h-4 w-4" />
            Detention Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bail" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bail Management</CardTitle>
              <CardDescription>
                View and manage bail requests and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, case number, or bailer..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                      <SelectItem value="revoked">Revoked</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Suspect</TableHead>
                      <TableHead>Case</TableHead>
                      <TableHead>Bail Amount</TableHead>
                      <TableHead>Bail Type</TableHead>
                      <TableHead>Bailer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detention Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Loading bail records...
                        </TableCell>
                      </TableRow>
                    ) : filteredBailRecords.length > 0 ? (
                      filteredBailRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.suspect?.first_name}{" "}
                            {record.suspect?.last_name}
                          </TableCell>
                          <TableCell>{record.case?.case_number}</TableCell>
                          <TableCell>
                            {formatCurrency(record.bail_amount)}
                          </TableCell>
                          <TableCell>{record.bail_type}</TableCell>
                          <TableCell>{record.bailer_name}</TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeVariant(record.status)}
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {calculateDetentionDuration(
                              record.detention_start,
                              record.detention_end,
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBail(record);
                                  // Open view dialog
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>

                              {record.status === "Pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateBailStatus(
                                        record.id,
                                        "Approved",
                                      )
                                    }
                                  >
                                    <UserCheck className="h-4 w-4 text-green-500" />
                                    <span className="sr-only">Approve</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateBailStatus(
                                        record.id,
                                        "Denied",
                                      )
                                    }
                                  >
                                    <UserX className="h-4 w-4 text-red-500" />
                                    <span className="sr-only">Deny</span>
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No bail records found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detention Records</CardTitle>
              <CardDescription>
                Track detainees and monitor 73-hour detention limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, case number, or cell..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Detainee</TableHead>
                      <TableHead>Case</TableHead>
                      <TableHead>Cell</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Detention Start</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>73-Hour Limit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Loading detention records...
                        </TableCell>
                      </TableRow>
                    ) : filteredDetentionRecords.length > 0 ? (
                      filteredDetentionRecords.map((record) => {
                        const detentionStart = new Date(record.detention_start);
                        const limitTime = addHours(detentionStart, 73);
                        const isPastLimit =
                          isPast(limitTime) && record.status === "Active";
                        const isApproachingLimit =
                          !isPastLimit &&
                          record.status === "Active" &&
                          (limitTime.getTime() - new Date().getTime()) /
                            (1000 * 60 * 60) <=
                            12;

                        return (
                          <TableRow
                            key={record.id}
                            className={
                              isPastLimit
                                ? "bg-red-50"
                                : isApproachingLimit
                                  ? "bg-yellow-50"
                                  : ""
                            }
                          >
                            <TableCell className="font-medium">
                              {record.criminal?.first_name}{" "}
                              {record.criminal?.last_name}
                            </TableCell>
                            <TableCell>
                              {record.case?.case_number || "N/A"}
                            </TableCell>
                            <TableCell>{record.cell_number || "N/A"}</TableCell>
                            <TableCell>
                              {record.station?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              {format(new Date(record.detention_start), "PPp")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getDetentionStatusBadgeVariant(
                                  record.status,
                                )}
                              >
                                {record.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {record.status === "Active" ? (
                                <span
                                  className={
                                    isPastLimit
                                      ? "text-red-600 font-medium"
                                      : isApproachingLimit
                                        ? "text-yellow-600 font-medium"
                                        : ""
                                  }
                                >
                                  {calculateTimeRemaining(
                                    record.detention_start,
                                  )}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  {record.detention_end ? "Released" : "N/A"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDetention(record);
                                    // Open view dialog
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>

                                {record.status === "Active" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleReleaseDetainee(
                                        record.id,
                                        "Released by officer",
                                      )
                                    }
                                  >
                                    <UserCheck className="h-4 w-4 text-green-500" />
                                    <span className="sr-only">Release</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No detention records found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Bail Dialog */}
      <Dialog open={isAddBailOpen} onOpenChange={setIsAddBailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Bail Request</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new bail request for a detainee.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                caseId: (e.target as any).caseId.value,
                suspectId: (e.target as any).suspectId.value,
                bailAmount: (e.target as any).bailAmount.value,
                bailType: (e.target as any).bailType.value,
                bailerName: (e.target as any).bailerName.value,
                bailerContact: (e.target as any).bailerContact.value,
                bailerRelationship: (e.target as any).bailerRelationship.value,
                bailerAddress: (e.target as any).bailerAddress.value,
                bailerIdType: (e.target as any).bailerIdType.value,
                bailerIdNumber: (e.target as any).bailerIdNumber.value,
                courtDate: (e.target as any).courtDate.value,
                detentionStart: (e.target as any).detentionStart.value,
                assignedOfficer: (e.target as any).assignedOfficer.value,
                notes: (e.target as any).notes.value,
              };
              handleCreateBail(formData);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseId">Case *</Label>
                  <Select name="caseId" defaultValue={selectedCase}>
                    <SelectTrigger id="caseId" className="mt-1">
                      <SelectValue placeholder="Select case" />
                    </SelectTrigger>
                    <SelectContent>
                      {cases.map((caseItem) => (
                        <SelectItem key={caseItem.id} value={caseItem.id}>
                          {caseItem.case_number} - {caseItem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="suspectId">Suspect *</Label>
                  <Select name="suspectId" defaultValue={selectedCriminal}>
                    <SelectTrigger id="suspectId" className="mt-1">
                      <SelectValue placeholder="Select suspect" />
                    </SelectTrigger>
                    <SelectContent>
                      {criminals.map((criminal) => (
                        <SelectItem key={criminal.id} value={criminal.id}>
                          {criminal.first_name} {criminal.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bailAmount">Bail Amount (GMD) *</Label>
                  <Input
                    id="bailAmount"
                    name="bailAmount"
                    type="number"
                    required
                    className="mt-1"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="bailType">Bail Type *</Label>
                  <Select name="bailType" defaultValue="Cash">
                    <SelectTrigger id="bailType" className="mt-1">
                      <SelectValue placeholder="Select bail type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Property">Property Bond</SelectItem>
                      <SelectItem value="Surety">Surety</SelectItem>
                      <SelectItem value="Recognizance">Recognizance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <h3 className="font-medium mb-2">Bailer Information</h3>
                  <Separator className="mb-4" />
                </div>
                <div>
                  <Label htmlFor="bailerName">Bailer Full Name *</Label>
                  <Input
                    id="bailerName"
                    name="bailerName"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bailerContact">Bailer Contact *</Label>
                  <Input
                    id="bailerContact"
                    name="bailerContact"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bailerRelationship">
                    Relationship to Detainee
                  </Label>
                  <Input
                    id="bailerRelationship"
                    name="bailerRelationship"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bailerAddress">Bailer Address</Label>
                  <Input
                    id="bailerAddress"
                    name="bailerAddress"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bailerIdType">ID Type</Label>
                  <Select name="bailerIdType">
                    <SelectTrigger id="bailerIdType" className="mt-1">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers_license">
                        Driver's License
                      </SelectItem>
                      <SelectItem value="voter_card">Voter's Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bailerIdNumber">ID Number</Label>
                  <Input
                    id="bailerIdNumber"
                    name="bailerIdNumber"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <h3 className="font-medium mb-2">Additional Information</h3>
                  <Separator className="mb-4" />
                </div>
                <div>
                  <Label htmlFor="courtDate">Court Date</Label>
                  <Input
                    id="courtDate"
                    name="courtDate"
                    type="datetime-local"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="detentionStart">Detention Start *</Label>
                  <Input
                    id="detentionStart"
                    name="detentionStart"
                    type="datetime-local"
                    required
                    className="mt-1"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <Label htmlFor="assignedOfficer">Assigned Officer</Label>
                  <Select name="assignedOfficer">
                    <SelectTrigger id="assignedOfficer" className="mt-1">
                      <SelectValue placeholder="Select officer" />
                    </SelectTrigger>
                    <SelectContent>
                      {officers.map((officer) => (
                        <SelectItem key={officer.id} value={officer.id}>
                          {officer.name} ({officer.badge})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" className="mt-1" rows={3} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddBailOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Bail Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Detention Dialog */}
      <Dialog open={isAddDetentionOpen} onOpenChange={setIsAddDetentionOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Detention Record</DialogTitle>
            <DialogDescription>
              Record a new detention for a suspect.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                criminalId: (e.target as any).criminalId.value,
                caseId: (e.target as any).caseId.value,
                cellNumber: (e.target as any).cellNumber.value,
                stationId: (e.target as any).stationId.value,
                detentionStart: (e.target as any).detentionStart.value,
                notes: (e.target as any).notes.value,
              };
              handleCreateDetention(formData);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="criminalId">Detainee *</Label>
                  <Select name="criminalId" defaultValue={selectedCriminal}>
                    <SelectTrigger id="criminalId" className="mt-1">
                      <SelectValue placeholder="Select detainee" />
                    </SelectTrigger>
                    <SelectContent>
                      {criminals.map((criminal) => (
                        <SelectItem key={criminal.id} value={criminal.id}>
                          {criminal.first_name} {criminal.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="caseId">Related Case</Label>
                  <Select name="caseId" defaultValue={selectedCase}>
                    <SelectTrigger id="caseId" className="mt-1">
                      <SelectValue placeholder="Select case" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {cases.map((caseItem) => (
                        <SelectItem key={caseItem.id} value={caseItem.id}>
                          {caseItem.case_number} - {caseItem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cellNumber">Cell Number *</Label>
                  <Input
                    id="cellNumber"
                    name="cellNumber"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="stationId">Station *</Label>
                  <Select name="stationId">
                    <SelectTrigger id="stationId" className="mt-1">
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="detentionStart">Detention Start *</Label>
                  <Input
                    id="detentionStart"
                    name="detentionStart"
                    type="datetime-local"
                    required
                    className="mt-1"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" className="mt-1" rows={3} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDetentionOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Detention Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BailManagement;
