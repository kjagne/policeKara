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
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  UserPlus,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import { format } from "date-fns";

const OfficerManagement = () => {
  const [officers, setOfficers] = useState([]);
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOfficerOpen, setIsAddOfficerOpen] = useState(false);
  const [isViewOfficerOpen, setIsViewOfficerOpen] = useState(false);
  const [isEditOfficerOpen, setIsEditOfficerOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [filters, setFilters] = useState({
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
    rank: "officer",
    department: "patrol",
    station_id: "",
    email: "",
    phone: "",
    status: "active",
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

  // Available ranks and departments for selection
  const ranks = [
    "officer",
    "sergeant",
    "lieutenant",
    "captain",
    "inspector",
    "chief",
  ];

  const departments = [
    "patrol",
    "investigation",
    "traffic",
    "narcotics",
    "cybercrime",
    "administration",
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

      if (filters.searchQuery) {
        query = query.or(
          `name.ilike.%${filters.searchQuery}%,badge.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%`,
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

  const updatePersonnelStats = (officerData) => {
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

  const handleCreateOfficer = async () => {
    if (!newOfficerData.name || !newOfficerData.badge) {
      alert("Please provide a name and badge number");
      return;
    }

    setIsLoading(true);
    try {
      // Create officer record
      const { data, error } = await supabase
        .from("officers")
        .insert([
          {
            name: newOfficerData.name,
            badge: newOfficerData.badge,
            rank: newOfficerData.rank,
            department: newOfficerData.department,
            station_id: newOfficerData.station_id || null,
            email: newOfficerData.email,
            phone: newOfficerData.phone,
            status: newOfficerData.status,
            profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newOfficerData.badge}`,
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
          rank: "officer",
          department: "patrol",
          station_id: "",
          email: "",
          phone: "",
          status: "active",
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

  const handleUpdateOfficerStatus = async (officerId, newStatus) => {
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

  const handleDeleteOfficer = async (officerId) => {
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

  const handleViewOfficer = (officer) => {
    setSelectedOfficer(officer);
    setIsViewOfficerOpen(true);
  };

  const handleEditOfficer = (officer) => {
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => fetchOfficers(), 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "on_leave":
        return "bg-blue-100 text-blue-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRankBadgeVariant = (rank) => {
    switch (rank) {
      case "chief":
        return "bg-purple-100 text-purple-800";
      case "captain":
        return "bg-indigo-100 text-indigo-800";
      case "lieutenant":
        return "bg-blue-100 text-blue-800";
      case "sergeant":
        return "bg-yellow-100 text-yellow-800";
      case "inspector":
        return "bg-orange-100 text-orange-800";
      case "officer":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Officer Management</h2>
          <p className="text-muted-foreground">
            Manage officers and staff across all stations
          </p>
        </div>
        <Button onClick={() => setIsAddOfficerOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Officer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Personnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{personnelStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {personnelStats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {personnelStats.onLeave}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Inactive/Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {personnelStats.inactive}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine the personnel list</CardDescription>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rank</Label>
              <Select
                value={filters.rank}
                onValueChange={(value) => handleFilterChange("rank", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranks</SelectItem>
                  {ranks.map((rank) => (
                    <SelectItem key={rank} value={rank}>
                      {rank.charAt(0).toUpperCase() + rank.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select
                value={filters.department}
                onValueChange={(value) =>
                  handleFilterChange("department", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Station</Label>
              <Select
                value={filters.station}
                onValueChange={(value) => handleFilterChange("station", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search personnel..."
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
          <CardTitle>Personnel List</CardTitle>
          <CardDescription>
            All officers and staff matching your filter criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : officers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
                    <TableHead>Badge</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                            <img
                              src={
                                officer.profile_image ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${officer.badge}`
                              }
                              alt={officer.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="font-medium">{officer.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{officer.badge}</TableCell>
                      <TableCell>
                        <Badge className={getRankBadgeVariant(officer.rank)}>
                          {officer.rank.charAt(0).toUpperCase() +
                            officer.rank.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {officer.department.charAt(0).toUpperCase() +
                          officer.department.slice(1)}
                      </TableCell>
                      <TableCell>
                        {officer.station?.name || "Not assigned"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadgeVariant(officer.status)}
                        >
                          {officer.status
                            .replace("_", " ")
                            .charAt(0)
                            .toUpperCase() +
                            officer.status.replace("_", " ").slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {officer.email && (
                          <div className="flex items-center text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            {officer.email}
                          </div>
                        )}
                        {officer.phone && (
                          <div className="flex items-center text-xs mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {officer.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOfficer(officer)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOfficer(officer)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          {officer.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateOfficerStatus(
                                  officer.id,
                                  "inactive",
                                )
                              }
                            >
                              <UserX className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Deactivate</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateOfficerStatus(officer.id, "active")
                              }
                            >
                              <UserCheck className="h-4 w-4 text-green-500" />
                              <span className="sr-only">Activate</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-sm font-semibold">No personnel found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filters.searchQuery ||
                filters.status !== "all" ||
                filters.rank !== "all" ||
                filters.department !== "all" ||
                filters.station !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by adding a new officer"}
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsAddOfficerOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add Officer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Officer Dialog */}
      <Dialog open={isAddOfficerOpen} onOpenChange={setIsAddOfficerOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Officer</DialogTitle>
            <DialogDescription>
              Enter the details for the new officer
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newOfficerData.name}
                  onChange={(e) =>
                    setNewOfficerData({
                      ...newOfficerData,
                      name: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="badge">Badge Number *</Label>
                <Input
                  id="badge"
                  value={newOfficerData.badge}
                  onChange={(e) =>
                    setNewOfficerData({
                      ...newOfficerData,
                      badge: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rank">Rank</Label>
                <Select
                  value={newOfficerData.rank}
                  onValueChange={(value) =>
                    setNewOfficerData({ ...newOfficerData, rank: value })
                  }
                >
                  <SelectTrigger id="rank" className="mt-1">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {rank.charAt(0).toUpperCase() + rank.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={newOfficerData.department}
                  onValueChange={(value) =>
                    setNewOfficerData({ ...newOfficerData, department: value })
                  }
                >
                  <SelectTrigger id="department" className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newOfficerData.email}
                  onChange={(e) =>
                    setNewOfficerData({
                      ...newOfficerData,
                      email: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newOfficerData.phone}
                  onChange={(e) =>
                    setNewOfficerData({
                      ...newOfficerData,
                      phone: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="station">Station *</Label>
                <Select
                  value={newOfficerData.station_id}
                  onValueChange={(value) =>
                    setNewOfficerData({ ...newOfficerData, station_id: value })
                  }
                >
                  <SelectTrigger id="station" className="mt-1">
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
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newOfficerData.status}
                  onValueChange={(value) =>
                    setNewOfficerData({ ...newOfficerData, status: value })
                  }
                >
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOfficerOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOfficer} disabled={isLoading}>
              {isLoading ? "Creating..." : "Add Officer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Officer Dialog */}
      <Dialog open={isViewOfficerOpen} onOpenChange={setIsViewOfficerOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Officer Details</DialogTitle>
            <DialogDescription>
              Badge #{selectedOfficer?.badge}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
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
                    className={
                      selectedOfficer
                        ? getRankBadgeVariant(selectedOfficer.rank)
                        : ""
                    }
                  >
                    {selectedOfficer?.rank.charAt(0).toUpperCase() +
                      selectedOfficer?.rank.slice(1)}
                  </Badge>
                  <Badge
                    className={
                      selectedOfficer
                        ? getStatusBadgeVariant(selectedOfficer.status)
                        : ""
                    }
                  >
                    {selectedOfficer?.status
                      .replace("_", " ")
                      .charAt(0)
                      .toUpperCase() +
                      selectedOfficer?.status.replace("_", " ").slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Department
                </h3>
                <p className="text-base flex items-center">
                  <Building className="mr-1 h-4 w-4" />
                  {selectedOfficer?.department.charAt(0).toUpperCase() +
                    selectedOfficer?.department.slice(1)}
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
                  Cases Assigned
                </h3>
                <p className="text-2xl font-bold">
                  {selectedOfficer?.cases_count || 0}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Reports Filed
                </h3>
                <p className="text-2xl font-bold">
                  {selectedOfficer?.reports_count || 0}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewOfficerOpen(false);
                handleEditOfficer(selectedOfficer);
              }}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Officer
            </Button>
            <Button onClick={() => setIsViewOfficerOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Officer Dialog */}
      <Dialog open={isEditOfficerOpen} onOpenChange={setIsEditOfficerOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Officer</DialogTitle>
            <DialogDescription>Update officer information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={editOfficerData.name}
                  onChange={(e) =>
                    setEditOfficerData({
                      ...editOfficerData,
                      name: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-badge">Badge Number *</Label>
                <Input
                  id="edit-badge"
                  value={editOfficerData.badge}
                  onChange={(e) =>
                    setEditOfficerData({
                      ...editOfficerData,
                      badge: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-rank">Rank</Label>
                <Select
                  value={editOfficerData.rank}
                  onValueChange={(value) =>
                    setEditOfficerData({ ...editOfficerData, rank: value })
                  }
                >
                  <SelectTrigger id="edit-rank" className="mt-1">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {rank.charAt(0).toUpperCase() + rank.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Select
                  value={editOfficerData.department}
                  onValueChange={(value) =>
                    setEditOfficerData({
                      ...editOfficerData,
                      department: value,
                    })
                  }
                >
                  <SelectTrigger id="edit-department" className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editOfficerData.email}
                  onChange={(e) =>
                    setEditOfficerData({
                      ...editOfficerData,
                      email: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editOfficerData.phone}
                  onChange={(e) =>
                    setEditOfficerData({
                      ...editOfficerData,
                      phone: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-station">Station *</Label>
                <Select
                  value={editOfficerData.station_id}
                  onValueChange={(value) =>
                    setEditOfficerData({
                      ...editOfficerData,
                      station_id: value,
                    })
                  }
                >
                  <SelectTrigger id="edit-station" className="mt-1">
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
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editOfficerData.status}
                  onValueChange={(value) =>
                    setEditOfficerData({ ...editOfficerData, status: value })
                  }
                >
                  <SelectTrigger id="edit-status" className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOfficerOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateOfficer} disabled={isLoading}>
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficerManagement;
