import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  FileText,
  Star,
  Filter,
  User,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Shield,
  Award,
  Briefcase,
  Building,
  Download,
  Lock,
  Clipboard,
  BarChart2,
} from "lucide-react";
import { format } from "date-fns";

interface Officer {
  id: string;
  name: string;
  badge: string;
  rank: string;
  department: string;
  station_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  date_joined?: string;
  status: "active" | "inactive" | "on_leave" | "suspended";
  profile_image?: string;
  created_at: string;
  updated_at: string;
  station?: Station;
  cases_count?: number;
  reports_count?: number;
  auth_user_id?: string;
  performance?: number;
}

interface Station {
  id: string;
  name: string;
  location: string;
  district: string;
}

interface PerformanceReview {
  id: string;
  officer_id: string;
  reviewer_id: string;
  review_date: string;
  rating: number;
  comments: string;
  strengths?: string;
  areas_for_improvement?: string;
  goals?: string;
  created_at: string;
  updated_at: string;
  reviewer?: Officer;
}

interface PersonnelFilter {
  status: string;
  rank: string;
  department: string;
  station: string;
  searchQuery: string;
}

const OfficerManagement = ({ initialOfficers = [] }) => {
  const [officers, setOfficers] = useState<Officer[]>(initialOfficers);
  const [stations, setStations] = useState<Station[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<
    PerformanceReview[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOfficerOpen, setIsAddOfficerOpen] = useState(false);
  const [isViewOfficerOpen, setIsViewOfficerOpen] = useState(false);
  const [isEditOfficerOpen, setIsEditOfficerOpen] = useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isAssignDutyOpen, setIsAssignDutyOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [activeTab, setActiveTab] = useState("all-officers");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<PersonnelFilter>({
    status: "all",
    rank: "all",
    department: "all",
    station: "all",
    searchQuery: "",
  });
  const [personnelStats, setPersonnelStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    inactive: 0,
  });
  const [newOfficerData, setNewOfficerData] = useState({
    name: "",
    badge: "",
    rank: "Officer",
    department: "Patrol",
    station_id: "",
    email: "",
    phone: "",
    status: "active",
    password: "",
    create_account: false,
  });
  const [editOfficerData, setEditOfficerData] = useState({
    name: "",
    badge: "",
    rank: "",
    department: "",
    station_id: "",
    email: "",
    phone: "",
    status: "",
  });
  const [newReviewData, setNewReviewData] = useState({
    rating: 3,
    review_date: new Date().toISOString().split("T")[0],
    comments: "",
    strengths: "",
    areas_for_improvement: "",
    goals: "",
  });

  // Available ranks and departments for selection
  const ranks = [
    "Officer",
    "Sergeant",
    "Lieutenant",
    "Captain",
    "Inspector",
    "Chief",
  ];

  const departments = [
    "Patrol",
    "Detective",
    "SWAT",
    "K-9 Unit",
    "Traffic",
    "Investigation",
    "Narcotics",
    "Cybercrime",
    "Administration",
  ];

  useEffect(() => {
    fetchOfficers();
    fetchStations();
  }, []);

  const fetchOfficers = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("officers").select(`
          *,
          station:station_id(id, name, location, district),
          cases_count:cases(count),
          reports_count:reports(count)
        `);

      // Apply filters
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.rank !== "all") {
        query = query.eq("rank", filters.rank);
      }

      if (filters.department !== "all") {
        query = query.eq("department", filters.department);
      }

      if (filters.station !== "all") {
        query = query.eq("station_id", filters.station);
      }

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,badge.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`,
        );
      }

      const { data, error } = await query.order("name");

      if (error) throw error;

      if (data) {
        setOfficers(data);
        updatePersonnelStats(data);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from("stations")
        .select("*")
        .order("name");

      if (error) throw error;

      if (data) {
        setStations(data);
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  const fetchPerformanceReviews = async (officerId: string) => {
    try {
      const { data, error } = await supabase
        .from("performance_reviews")
        .select(
          `
          *,
          reviewer:reviewer_id(id, name, badge, rank)
        `,
        )
        .eq("officer_id", officerId)
        .order("review_date", { ascending: false });

      if (error) throw error;

      if (data) {
        setPerformanceReviews(data);
      }
    } catch (error) {
      console.error("Error fetching performance reviews:", error);
    }
  };

  const updatePersonnelStats = (officerData: Officer[]) => {
    const stats = {
      total: officerData.length,
      active: officerData.filter((o) => o.status === "active").length,
      onLeave: officerData.filter((o) => o.status === "on_leave").length,
      inactive: officerData.filter(
        (o) => o.status === "inactive" || o.status === "suspended",
      ).length,
    };
    setPersonnelStats(stats);
  };

  const createAuthUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return data.user?.id;
    } catch (error) {
      console.error("Error creating auth user:", error);
      throw error;
    }
  };

  const handleCreateOfficer = async (officerData) => {
    if (!officerData.name || !officerData.badge) {
      alert("Please provide a name and badge number");
      return;
    }

    if (
      newOfficerData.create_account &&
      (!newOfficerData.email || !newOfficerData.password)
    ) {
      alert("Email and password are required to create a user account");
      return;
    }

    setIsLoading(true);
    try {
      let authUserId = null;

      // Create auth user if requested
      if (newOfficerData.create_account) {
        authUserId = await createAuthUser(
          newOfficerData.email,
          newOfficerData.password,
        );
      }

      // Create officer record
      const { data, error } = await supabase
        .from("officers")
        .insert([
          {
            name: officerData.name,
            badge: officerData.badge,
            rank: officerData.rank,
            department: officerData.department,
            station_id: newOfficerData.station_id || null,
            email: newOfficerData.email,
            phone: newOfficerData.phone,
            status: officerData.status,
            profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${officerData.badge}`,
            auth_user_id: authUserId,
            performance: Math.floor(Math.random() * 30) + 70, // Random performance between 70-100
            join_date: new Date().toISOString().split("T")[0],
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchOfficers();
        setIsAddOfficerOpen(false);
        setNewOfficerData({
          name: "",
          badge: "",
          rank: "Officer",
          department: "Patrol",
          station_id: "",
          email: "",
          phone: "",
          status: "active",
          password: "",
          create_account: false,
        });
        alert("Officer created successfully!");
      }
    } catch (error) {
      console.error("Error creating officer:", error);
      alert("Failed to create officer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOfficer = async () => {
    if (!selectedOfficer) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("officers")
        .update({
          name: editOfficerData.name,
          badge: editOfficerData.badge,
          rank: editOfficerData.rank,
          department: editOfficerData.department,
          station_id: editOfficerData.station_id || null,
          email: editOfficerData.email,
          phone: editOfficerData.phone,
          status: editOfficerData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedOfficer.id);

      if (error) throw error;

      await fetchOfficers();
      setIsEditOfficerOpen(false);
      alert("Officer updated successfully!");
    } catch (error) {
      console.error("Error updating officer:", error);
      alert("Failed to update officer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOfficerStatus = async (
    officerId: string,
    newStatus: string,
  ) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("officers")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", officerId);

      if (error) throw error;

      await fetchOfficers();
      alert(`Officer status updated to ${newStatus.replace("_", " ")}!`);
    } catch (error) {
      console.error("Error updating officer status:", error);
      alert("Failed to update officer status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOfficer = async (officerId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this officer? This action cannot be undone.",
      )
    )
      return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("officers")
        .delete()
        .eq("id", officerId);

      if (error) throw error;

      await fetchOfficers();
      alert("Officer deleted successfully!");
    } catch (error) {
      console.error("Error deleting officer:", error);
      alert("Failed to delete officer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePerformanceReview = async () => {
    if (!selectedOfficer) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("performance_reviews")
        .insert([
          {
            officer_id: selectedOfficer.id,
            reviewer_id: "current-admin-id", // Replace with actual admin ID
            review_date: newReviewData.review_date,
            rating: newReviewData.rating,
            comments: newReviewData.comments,
            strengths: newReviewData.strengths,
            areas_for_improvement: newReviewData.areas_for_improvement,
            goals: newReviewData.goals,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchPerformanceReviews(selectedOfficer.id);
        setIsAddReviewOpen(false);
        setNewReviewData({
          rating: 3,
          review_date: new Date().toISOString().split("T")[0],
          comments: "",
          strengths: "",
          areas_for_improvement: "",
          goals: "",
        });
        alert("Performance review added successfully!");
      }
    } catch (error) {
      console.error("Error creating performance review:", error);
      alert("Failed to add performance review. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOfficer = async (officer: Officer) => {
    setSelectedOfficer(officer);
    await fetchPerformanceReviews(officer.id);
    setIsViewOfficerOpen(true);
  };

  const handleEditOfficer = (officer: Officer) => {
    setSelectedOfficer(officer);
    setEditOfficerData({
      name: officer.name,
      badge: officer.badge,
      rank: officer.rank,
      department: officer.department,
      station_id: officer.station_id || "",
      email: officer.email || "",
      phone: officer.phone || "",
      status: officer.status,
    });
    setIsEditOfficerOpen(true);
  };

  const handleFilterChange = (key: keyof PersonnelFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => fetchOfficers(), 100);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "outline";
      case "on_leave":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRankBadgeVariant = (rank: string) => {
    switch (rank) {
      case "Chief":
        return "default";
      case "Captain":
        return "default";
      case "Lieutenant":
        return "default";
      case "Sergeant":
        return "default";
      case "Inspector":
        return "default";
      case "Officer":
      default:
        return "outline";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-blue-600";
    if (rating >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Officer Management</h1>
        <Button onClick={() => setIsAddOfficerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Officer
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search officers by name, badge or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        defaultValue="all-officers"
        className="w-full"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all-officers">All Officers</TabsTrigger>
          <TabsTrigger value="assign-duties">Assign Duties</TabsTrigger>
          <TabsTrigger value="performance">Performance Review</TabsTrigger>
        </TabsList>

        <TabsContent value="all-officers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Badge #</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>System Access</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                            <img
                              src={
                                officer.profile_image ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${officer.badge}`
                              }
                              alt={officer.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span>{officer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{officer.badge}</TableCell>
                      <TableCell>{officer.rank}</TableCell>
                      <TableCell>{officer.department}</TableCell>
                      <TableCell>
                        {officer.station?.name || "Not assigned"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(officer.status) as any}
                        >
                          {officer.status.replace("_", "-")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {officer.auth_user_id ? (
                          <Badge>
                            <Lock className="h-3 w-3 mr-1" /> Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Access</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOfficer(officer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditOfficer(officer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsAssignDutyOpen(true)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsPerformanceOpen(true)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteOfficer(officer.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign-duties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Duty Assignment</CardTitle>
              <CardDescription>
                Assign officers to shifts and special duties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Available Officers
                  </h3>
                  <div className="space-y-2">
                    {officers
                      .filter((o) => o.status === "active")
                      .map((officer) => (
                        <div
                          key={officer.id}
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div>
                            <p className="font-medium">{officer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {officer.rank} • {officer.department}
                            </p>
                          </div>
                          <Button size="sm">
                            <UserPlus className="h-4 w-4 mr-2" /> Assign
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Current Assignments
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium">Morning Patrol</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        06:00 - 14:00
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>John Smith</Badge>
                        <Badge>Maria Rodriguez</Badge>
                        <Badge>David Chen</Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium">Evening Patrol</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        14:00 - 22:00
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Sarah Johnson</Badge>
                        <Badge>Michael Brown</Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium">Night Patrol</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        22:00 - 06:00
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Robert Davis</Badge>
                        <Badge>Lisa Wilson</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>
                Evaluate officer performance and track metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                      Officers with 90%+ rating
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">78%</div>
                    <p className="text-xs text-muted-foreground">
                      Across all departments
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Reviews Due
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground">
                      Within next 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
                    <TableHead>Last Review</TableHead>
                    <TableHead>Performance Score</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{officer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {officer.rank}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>2023-09-15</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full bg-secondary h-2 rounded-full mr-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${officer.performance || 75}%` }}
                            />
                          </div>
                          <span>{officer.performance || 75}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (officer.performance || 75) > 75
                              ? "default"
                              : "secondary"
                          }
                        >
                          {(officer.performance || 75) > 75
                            ? "Improving"
                            : "Stable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOfficer(officer);
                            setIsAddReviewOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" /> Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Officer Dialog */}
      <Dialog
        open={!!selectedOfficer && isEditOfficerOpen}
        onOpenChange={(open) => !open && setIsEditOfficerOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Officer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={editOfficerData.name}
                onChange={(e) =>
                  setEditOfficerData({
                    ...editOfficerData,
                    name: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="badge" className="text-right">
                Badge #
              </label>
              <Input
                id="badge"
                value={editOfficerData.badge}
                onChange={(e) =>
                  setEditOfficerData({
                    ...editOfficerData,
                    badge: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="rank" className="text-right">
                Rank
              </label>
              <Select
                value={editOfficerData.rank}
                onValueChange={(value) =>
                  setEditOfficerData({ ...editOfficerData, rank: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  {ranks.map((rank) => (
                    <SelectItem key={rank} value={rank}>
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="department" className="text-right">
                Department
              </label>
              <Select
                value={editOfficerData.department}
                onValueChange={(value) =>
                  setEditOfficerData({ ...editOfficerData, department: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="station" className="text-right">
                Station
              </label>
              <Select
                value={editOfficerData.station_id}
                onValueChange={(value) =>
                  setEditOfficerData({ ...editOfficerData, station_id: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not Assigned</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">
                Status
              </label>
              <Select
                value={editOfficerData.status}
                onValueChange={(value) =>
                  setEditOfficerData({ ...editOfficerData, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={editOfficerData.email}
                onChange={(e) =>
                  setEditOfficerData({
                    ...editOfficerData,
                    email: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right">
                Phone
              </label>
              <Input
                id="phone"
                value={editOfficerData.phone}
                onChange={(e) =>
                  setEditOfficerData({
                    ...editOfficerData,
                    phone: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOfficerOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateOfficer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Officer Dialog */}
      <Dialog open={isAddOfficerOpen} onOpenChange={setIsAddOfficerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Officer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-name" className="text-right">
                Name
              </label>
              <Input
                id="new-name"
                placeholder="Full name"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-badge" className="text-right">
                Badge #
              </label>
              <Input
                id="new-badge"
                placeholder="Badge number"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-rank" className="text-right">
                Rank
              </label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  {ranks.map((rank) => (
                    <SelectItem key={rank} value={rank}>
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-department" className="text-right">
                Department
              </label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-station" className="text-right">
                Station
              </label>
              <Select
                value={newOfficerData.station_id}
                onValueChange={(value) =>
                  setNewOfficerData({ ...newOfficerData, station_id: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not Assigned</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-email" className="text-right">
                Email
              </label>
              <Input
                id="new-email"
                type="email"
                placeholder="Email address"
                className="col-span-3"
                value={newOfficerData.email}
                onChange={(e) =>
                  setNewOfficerData({
                    ...newOfficerData,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-phone" className="text-right">
                Phone
              </label>
              <Input
                id="new-phone"
                placeholder="Phone number"
                className="col-span-3"
                value={newOfficerData.phone}
                onChange={(e) =>
                  setNewOfficerData({
                    ...newOfficerData,
                    phone: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createAccount"
                    checked={newOfficerData.create_account}
                    onChange={(e) =>
                      setNewOfficerData({
                        ...newOfficerData,
                        create_account: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="createAccount"
                    className="text-sm font-medium"
                  >
                    Create system account for this officer
                  </label>
                </div>
              </div>
            </div>
            {newOfficerData.create_account && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-password" className="text-right">
                  Password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Password"
                  className="col-span-3"
                  value={newOfficerData.password}
                  onChange={(e) =>
                    setNewOfficerData({
                      ...newOfficerData,
                      password: e.target.value,
                    })
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOfficerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const nameInput = document.getElementById(
                  "new-name",
                ) as HTMLInputElement;
                const badgeInput = document.getElementById(
                  "new-badge",
                ) as HTMLInputElement;
                const rankSelect = document.querySelector(
                  '[id^="radix-"][aria-expanded]',
                ) as HTMLElement;
                const departmentSelect = document.querySelectorAll(
                  '[id^="radix-"][aria-expanded]',
                )[1] as HTMLElement;

                const officerData = {
                  name: nameInput.value,
                  badge: badgeInput.value,
                  rank: rankSelect.textContent || "Officer",
                  department: departmentSelect.textContent || "Patrol",
                  status: "active",
                };

                handleCreateOfficer(officerData);
              }}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Add Officer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Officer Dialog */}
      <Dialog open={isViewOfficerOpen} onOpenChange={setIsViewOfficerOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Officer Details</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Personal Details
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center">
                <Star className="mr-2 h-4 w-4" />
                Performance Reviews
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center">
                <BarChart2 className="mr-2 h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-muted">
                  <img
                    src={
                      selectedOfficer?.profile_image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedOfficer?.badge}`
                    }
                    alt={selectedOfficer?.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedOfficer?.name}</h2>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge
                      variant={
                        selectedOfficer
                          ? (getStatusBadgeVariant(
                              selectedOfficer.status,
                            ) as any)
                          : "outline"
                      }
                    >
                      {selectedOfficer?.status.replace("_", "-")}
                    </Badge>
                    <Badge variant="outline">{selectedOfficer?.rank}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Department
                  </h3>
                  <p className="text-base flex items-center">
                    <Briefcase className="mr-1 h-4 w-4" />
                    {selectedOfficer?.department}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Station
                  </h3>
                  <p className="text-base flex items-center">
                    <Building className="mr-1 h-4 w-4" />
                    {selectedOfficer?.station?.name || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h3>
                  <p className="text-base flex items-center">
                    <Mail className="mr-1 h-4 w-4" />
                    {selectedOfficer?.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Phone
                  </h3>
                  <p className="text-base flex items-center">
                    <Phone className="mr-1 h-4 w-4" />
                    {selectedOfficer?.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    System Access
                  </h3>
                  <p className="text-base flex items-center">
                    <Lock className="mr-1 h-4 w-4" />
                    {selectedOfficer?.auth_user_id ? "Enabled" : "No Access"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Joined Date
                  </h3>
                  <p className="text-base flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {selectedOfficer?.date_joined
                      ? formatDate(selectedOfficer.date_joined)
                      : formatDate(selectedOfficer?.created_at || "")}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Performance Reviews</h3>
                <Button size="sm" onClick={() => setIsAddReviewOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Review
                </Button>
              </div>

              {performanceReviews.length > 0 ? (
                <div className="space-y-4">
                  {performanceReviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              Review from {formatDate(review.review_date)}
                            </CardTitle>
                            <CardDescription>
                              By {review.reviewer?.name || "Admin"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium">Comments</h4>
                            <p className="text-sm text-muted-foreground">
                              {review.comments}
                            </p>
                          </div>

                          {review.strengths && (
                            <div>
                              <h4 className="text-sm font-medium">Strengths</h4>
                              <p className="text-sm text-muted-foreground">
                                {review.strengths}
                              </p>
                            </div>
                          )}

                          {review.areas_for_improvement && (
                            <div>
                              <h4 className="text-sm font-medium">
                                Areas for Improvement
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {review.areas_for_improvement}
                              </p>
                            </div>
                          )}

                          {review.goals && (
                            <div>
                              <h4 className="text-sm font-medium">Goals</h4>
                              <p className="text-sm text-muted-foreground">
                                {review.goals}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  <Clipboard className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-sm font-semibold">
                    No performance reviews yet
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a performance review to track this officer's progress.
                  </p>
                  <div className="mt-4">
                    <Button size="sm" onClick={() => setIsAddReviewOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add First Review
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cases Assigned</CardTitle>
                    <CardDescription>
                      Total cases assigned to this officer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {selectedOfficer?.cases_count || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reports Filed</CardTitle>
                    <CardDescription>
                      Total reports submitted by this officer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {selectedOfficer?.reports_count || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Rating</CardTitle>
                  <CardDescription>
                    Average rating from all performance reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {performanceReviews.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <div
                        className={`text-5xl font-bold ${getRatingColor(performanceReviews.reduce((sum, review) => sum + review.rating, 0) / performanceReviews.length)}`}
                      >
                        {(
                          performanceReviews.reduce(
                            (sum, review) => sum + review.rating,
                            0,
                          ) / performanceReviews.length
                        ).toFixed(1)}
                      </div>
                      <div className="flex items-center mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 ${i < Math.round(performanceReviews.reduce((sum, review) => sum + review.rating, 0) / performanceReviews.length) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Based on {performanceReviews.length} review
                        {performanceReviews.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No performance reviews available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewOfficerOpen(false);
                handleEditOfficer(selectedOfficer!);
              }}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Officer
            </Button>
            <Button onClick={() => setIsViewOfficerOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Duty Dialog */}
      <Dialog open={isAssignDutyOpen} onOpenChange={setIsAssignDutyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Duty</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="duty-type" className="text-right">
                Duty Type
              </label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select duty type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patrol">Patrol</SelectItem>
                  <SelectItem value="investigation">Investigation</SelectItem>
                  <SelectItem value="special-ops">
                    Special Operations
                  </SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="shift" className="text-right">
                Shift
              </label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">
                    Morning (06:00 - 14:00)
                  </SelectItem>
                  <SelectItem value="evening">
                    Evening (14:00 - 22:00)
                  </SelectItem>
                  <SelectItem value="night">Night (22:00 - 06:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="start-date" className="text-right">
                Start Date
              </label>
              <Input id="start-date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="end-date" className="text-right">
                End Date
              </label>
              <Input id="end-date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="notes" className="text-right">
                Notes
              </label>
              <Input
                id="notes"
                placeholder="Additional information"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDutyOpen(false)}
            >
              Cancel
            </Button>
            <Button>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Review Dialog */}
      <Dialog open={isPerformanceOpen} onOpenChange={setIsPerformanceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Performance Review</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="review-date" className="text-right">
                Review Date
              </label>
              <Input id="review-date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="performance-score" className="text-right">
                Score
              </label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="performance-score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                />
                <span>/ 100</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="strengths" className="text-right pt-2">
                Strengths
              </label>
              <Input
                id="strengths"
                placeholder="Officer's strengths"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="areas-improvement" className="text-right pt-2">
                Areas for Improvement
              </label>
              <Input
                id="areas-improvement"
                placeholder="Areas that need improvement"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="comments" className="text-right pt-2">
                Comments
              </label>
              <Input
                id="comments"
                placeholder="Additional comments"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPerformanceOpen(false)}
            >
              Cancel
            </Button>
            <Button>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Performance Review Dialog */}
      <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Performance Review</DialogTitle>
            <DialogDescription>
              Create a new performance review for {selectedOfficer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="review-date">Review Date *</Label>
                <Input
                  id="review-date"
                  type="date"
                  value={newReviewData.review_date}
                  onChange={(e) =>
                    setNewReviewData({
                      ...newReviewData,
                      review_date: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating (1-5) *</Label>
                <Select
                  value={newReviewData.rating.toString()}
                  onValueChange={(value) =>
                    setNewReviewData({
                      ...newReviewData,
                      rating: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="rating" className="mt-1">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < newReviewData.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      onClick={() =>
                        setNewReviewData({ ...newReviewData, rating: i + 1 })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="comments">Comments *</Label>
              <Textarea
                id="comments"
                value={newReviewData.comments}
                onChange={(e) =>
                  setNewReviewData({
                    ...newReviewData,
                    comments: e.target.value,
                  })
                }
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="strengths">Strengths</Label>
              <Textarea
                id="strengths"
                value={newReviewData.strengths}
                onChange={(e) =>
                  setNewReviewData({
                    ...newReviewData,
                    strengths: e.target.value,
                  })
                }
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="areas-for-improvement">
                Areas for Improvement
              </Label>
              <Textarea
                id="areas-for-improvement"
                value={newReviewData.areas_for_improvement}
                onChange={(e) =>
                  setNewReviewData({
                    ...newReviewData,
                    areas_for_improvement: e.target.value,
                  })
                }
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="goals">Goals</Label>
              <Textarea
                id="goals"
                value={newReviewData.goals}
                onChange={(e) =>
                  setNewReviewData({ ...newReviewData, goals: e.target.value })
                }
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePerformanceReview}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficerManagement;
