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
  AlertTriangle,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Camera,
  Upload,
} from "lucide-react";
import { format } from "date-fns";

// Types
interface WantedCriminal {
  id: string;
  criminal_id: string;
  crimes_committed: string;
  last_seen_location?: string;
  last_seen_date?: string;
  danger_level?: "Low" | "Medium" | "High" | "Extreme";
  bounty?: number;
  status: "Wanted" | "Captured";
  priority?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  criminal?: Criminal;
  creator?: Officer;
}

interface Criminal {
  id: string;
  first_name: string;
  last_name: string;
  dob?: string;
  gender?: string;
  national_id?: string;
  passport_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  mugshot_url?: string;
  fingerprint_data?: string;
  known_associates?: any[];
  gang_affiliation?: string;
  bio?: string;
  current_status: string;
  arrest_history?: any[];
  created_at: string;
  updated_at: string;
}

interface Officer {
  id: string;
  name: string;
  badge: string;
}

const WantedCriminalsModule: React.FC = () => {
  const [wantedCriminals, setWantedCriminals] = useState<WantedCriminal[]>([]);
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dangerFilter, setDangerFilter] = useState("all");

  const [isAddWantedOpen, setIsAddWantedOpen] = useState(false);
  const [isViewWantedOpen, setIsViewWantedOpen] = useState(false);
  const [selectedWanted, setSelectedWanted] = useState<WantedCriminal | null>(
    null,
  );
  const [selectedCriminal, setSelectedCriminal] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchWantedCriminals();
    fetchCriminals();
    fetchOfficers();
  }, []);

  const fetchWantedCriminals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("wanted_criminals").select(`
          *,
          criminal:criminal_id(*),
          creator:created_by(*)
        `);

      if (error) throw error;

      if (data) {
        setWantedCriminals(data);
      }
    } catch (error) {
      console.error("Error fetching wanted criminals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCriminals = async () => {
    try {
      const { data, error } = await supabase.from("criminals").select("*");

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

  const handleAddWantedCriminal = async (formData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("wanted_criminals")
        .insert([
          {
            criminal_id: formData.criminalId,
            crimes_committed: formData.crimesCommitted,
            last_seen_location: formData.lastSeenLocation,
            last_seen_date: formData.lastSeenDate,
            danger_level: formData.dangerLevel,
            bounty: formData.bounty ? parseFloat(formData.bounty) : null,
            status: "Wanted",
            priority: formData.priority ? parseInt(formData.priority) : 0,
            notes: formData.notes,
            created_by: "current-officer-id", // Replace with actual officer ID
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        // Update criminal status to "At Large"
        await supabase
          .from("criminals")
          .update({ current_status: "At Large" })
          .eq("id", formData.criminalId);

        await fetchWantedCriminals();
        await fetchCriminals();
        setIsAddWantedOpen(false);
        alert("Wanted criminal added successfully!");
      }
    } catch (error) {
      console.error("Error adding wanted criminal:", error);
      alert("Failed to add wanted criminal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureWanted = async (wantedId: string, criminalId: string) => {
    setIsLoading(true);
    try {
      // Update wanted criminal status
      const { data, error } = await supabase
        .from("wanted_criminals")
        .update({
          status: "Captured",
          updated_at: new Date().toISOString(),
        })
        .eq("id", wantedId)
        .select();

      if (error) throw error;

      if (data) {
        // Update criminal status to "In Custody"
        await supabase
          .from("criminals")
          .update({ current_status: "In Custody" })
          .eq("id", criminalId);

        await fetchWantedCriminals();
        await fetchCriminals();
        alert("Wanted criminal marked as captured!");
      }
    } catch (error) {
      console.error("Error capturing wanted criminal:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadMugshot = async (criminalId: string, file: File) => {
    if (!file) return;

    setIsLoading(true);
    try {
      // Upload file to Supabase Storage
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `mugshot_${timestamp}_${file.name}`;

      const { data: fileData, error: fileError } = await supabase.storage
        .from("mugshots")
        .upload(filename, file);

      if (fileError) throw fileError;

      if (fileData) {
        const { data: urlData } = supabase.storage
          .from("mugshots")
          .getPublicUrl(fileData.path);

        // Update criminal record with mugshot URL
        const { data, error } = await supabase
          .from("criminals")
          .update({ mugshot_url: urlData.publicUrl })
          .eq("id", criminalId)
          .select();

        if (error) throw error;

        if (data) {
          await fetchCriminals();
          await fetchWantedCriminals();
          setSelectedFile(null);
          alert("Mugshot uploaded successfully!");
        }
      }
    } catch (error) {
      console.error("Error uploading mugshot:", error);
      alert("Failed to upload mugshot. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter wanted criminals based on search query and danger filter
  const filteredWantedCriminals = wantedCriminals.filter((wanted) => {
    const fullName = `${wanted.criminal?.first_name} ${wanted.criminal?.last_name}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wanted.crimes_committed
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (wanted.last_seen_location &&
        wanted.last_seen_location
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesDanger =
      dangerFilter === "all" ||
      (wanted.danger_level &&
        wanted.danger_level.toLowerCase() === dangerFilter.toLowerCase());

    return matchesSearch && matchesDanger;
  });

  // Get active wanted criminals (status = "Wanted")
  const activeWantedCriminals = wantedCriminals.filter(
    (wanted) => wanted.status === "Wanted",
  );

  // Get high danger wanted criminals
  const highDangerWanted = activeWantedCriminals.filter(
    (wanted) =>
      wanted.danger_level === "High" || wanted.danger_level === "Extreme",
  );

  // Helper function to get danger level badge color
  const getDangerLevelBadgeVariant = (level?: string) => {
    switch (level) {
      case "Extreme":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Wanted":
        return "bg-red-100 text-red-800";
      case "Captured":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-GM", {
      style: "currency",
      currency: "GMD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Wanted Criminals</h1>
          <p className="text-muted-foreground">
            Track and manage most wanted criminals in the system
          </p>
        </div>
        <Button onClick={() => setIsAddWantedOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Wanted Criminal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Wanted</CardTitle>
            <CardDescription>Currently at large</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activeWantedCriminals.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>High Danger</CardTitle>
            <CardDescription>High & extreme risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {highDangerWanted.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Captured</CardTitle>
            <CardDescription>Successfully apprehended</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {wantedCriminals.filter((w) => w.status === "Captured").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Wanted List</CardTitle>
          <CardDescription>
            Criminals currently wanted by law enforcement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, crimes, or location..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={dangerFilter} onValueChange={setDangerFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by danger level" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="extreme">Extreme</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Crimes</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Danger Level</TableHead>
                  <TableHead>Bounty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading wanted criminals...
                    </TableCell>
                  </TableRow>
                ) : filteredWantedCriminals.length > 0 ? (
                  filteredWantedCriminals.map((wanted) => (
                    <TableRow key={wanted.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {wanted.criminal?.mugshot_url ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                src={wanted.criminal.mugshot_url}
                                alt={`${wanted.criminal.first_name} ${wanted.criminal.last_name}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <span>
                            {wanted.criminal?.first_name}{" "}
                            {wanted.criminal?.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-[200px] truncate"
                          title={wanted.crimes_committed}
                        >
                          {wanted.crimes_committed}
                        </div>
                      </TableCell>
                      <TableCell>
                        {wanted.last_seen_location ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{wanted.last_seen_location}</span>
                          </div>
                        ) : (
                          "Unknown"
                        )}
                        {wanted.last_seen_date && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(wanted.last_seen_date), "PP")}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getDangerLevelBadgeVariant(
                            wanted.danger_level,
                          )}
                        >
                          {wanted.danger_level || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {wanted.bounty ? (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span>{formatCurrency(wanted.bounty)}</span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeVariant(wanted.status)}>
                          {wanted.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedWanted(wanted);
                              setIsViewWantedOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>

                          {wanted.status === "Wanted" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCaptureWanted(
                                  wanted.id,
                                  wanted.criminal_id,
                                )
                              }
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="sr-only">Mark as Captured</span>
                            </Button>
                          )}

                          {!wanted.criminal?.mugshot_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCriminal(wanted.criminal_id);
                                // Open upload mugshot dialog
                                document
                                  .getElementById("mugshot-upload")
                                  ?.click();
                              }}
                            >
                              <Camera className="h-4 w-4 text-blue-500" />
                              <span className="sr-only">Add Mugshot</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No wanted criminals found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input for mugshot upload */}
      <input
        type="file"
        id="mugshot-upload"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedCriminal) {
            setSelectedFile(file);
            handleUploadMugshot(selectedCriminal, file);
          }
        }}
      />

      {/* Add Wanted Criminal Dialog */}
      <Dialog open={isAddWantedOpen} onOpenChange={setIsAddWantedOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Wanted Criminal</DialogTitle>
            <DialogDescription>
              Add a criminal to the most wanted list.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                criminalId: (e.target as any).criminalId.value,
                crimesCommitted: (e.target as any).crimesCommitted.value,
                lastSeenLocation: (e.target as any).lastSeenLocation.value,
                lastSeenDate: (e.target as any).lastSeenDate.value,
                dangerLevel: (e.target as any).dangerLevel.value,
                bounty: (e.target as any).bounty.value,
                priority: (e.target as any).priority.value,
                notes: (e.target as any).notes.value,
              };
              handleAddWantedCriminal(formData);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="criminalId">Criminal *</Label>
                  <Select name="criminalId" required>
                    <SelectTrigger id="criminalId" className="mt-1">
                      <SelectValue placeholder="Select criminal" />
                    </SelectTrigger>
                    <SelectContent>
                      {criminals
                        .filter(
                          (c) =>
                            !wantedCriminals.some(
                              (w) =>
                                w.criminal_id === c.id && w.status === "Wanted",
                            ),
                        )
                        .map((criminal) => (
                          <SelectItem key={criminal.id} value={criminal.id}>
                            {criminal.first_name} {criminal.last_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="crimesCommitted">Crimes Committed *</Label>
                  <Textarea
                    id="crimesCommitted"
                    name="crimesCommitted"
                    required
                    className="mt-1"
                    rows={2}
                    placeholder="List of crimes committed"
                  />
                </div>
                <div>
                  <Label htmlFor="lastSeenLocation">Last Seen Location</Label>
                  <Input
                    id="lastSeenLocation"
                    name="lastSeenLocation"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastSeenDate">Last Seen Date</Label>
                  <Input
                    id="lastSeenDate"
                    name="lastSeenDate"
                    type="date"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dangerLevel">Danger Level *</Label>
                  <Select name="dangerLevel" defaultValue="Medium">
                    <SelectTrigger id="dangerLevel" className="mt-1">
                      <SelectValue placeholder="Select danger level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Extreme">Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bounty">Bounty (GMD)</Label>
                  <Input
                    id="bounty"
                    name="bounty"
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority (0-10)</Label>
                  <Input
                    id="priority"
                    name="priority"
                    type="number"
                    min="0"
                    max="10"
                    step="1"
                    defaultValue="0"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" name="notes" className="mt-1" rows={3} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddWantedOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add to Wanted List"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Wanted Criminal Dialog */}
      {selectedWanted && (
        <Dialog open={isViewWantedOpen} onOpenChange={setIsViewWantedOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Wanted Criminal Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedWanted.criminal?.first_name}{" "}
                {selectedWanted.criminal?.last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col items-center">
                  {selectedWanted.criminal?.mugshot_url ? (
                    <div className="w-full max-w-[200px] aspect-[3/4] rounded-md overflow-hidden border">
                      <img
                        src={selectedWanted.criminal.mugshot_url}
                        alt={`Mugshot of ${selectedWanted.criminal.first_name} ${selectedWanted.criminal.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-[200px] aspect-[3/4] rounded-md bg-muted flex flex-col items-center justify-center border">
                      <User className="h-16 w-16 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No mugshot available
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSelectedCriminal(selectedWanted.criminal_id);
                          document.getElementById("mugshot-upload")?.click();
                        }}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Add Mugshot
                      </Button>
                    </div>
                  )}
                  <div className="mt-4 w-full">
                    <Badge
                      className={getStatusBadgeVariant(selectedWanted.status)}
                      className="w-full justify-center py-1"
                    >
                      {selectedWanted.status}
                    </Badge>
                  </div>
                  {selectedWanted.bounty && (
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium">Bounty</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(selectedWanted.bounty)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="md:w-2/3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Full Name
                      </h3>
                      <p className="font-medium">
                        {selectedWanted.criminal?.first_name}{" "}
                        {selectedWanted.criminal?.last_name}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Danger Level
                      </h3>
                      <Badge
                        className={getDangerLevelBadgeVariant(
                          selectedWanted.danger_level,
                        )}
                      >
                        {selectedWanted.danger_level || "Unknown"}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Priority
                      </h3>
                      <p>{selectedWanted.priority || 0}/10</p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Crimes Committed
                      </h3>
                      <p className="text-sm whitespace-pre-line">
                        {selectedWanted.crimes_committed}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Last Seen
                      </h3>
                      <p className="text-sm">
                        {selectedWanted.last_seen_location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {selectedWanted.last_seen_location}
                          </span>
                        ) : (
                          "Location unknown"
                        )}
                      </p>
                      <p className="text-sm mt-1">
                        {selectedWanted.last_seen_date ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(
                              new Date(selectedWanted.last_seen_date),
                              "PPP",
                            )}
                          </span>
                        ) : (
                          "Date unknown"
                        )}
                      </p>
                    </div>
                    {selectedWanted.notes && (
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Additional Notes
                        </h3>
                        <p className="text-sm whitespace-pre-line">
                          {selectedWanted.notes}
                        </p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Added By
                      </h3>
                      <p className="text-sm">
                        {selectedWanted.creator?.name || "Unknown"}
                        {selectedWanted.creator?.badge &&
                          ` (Badge: ${selectedWanted.creator.badge})`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Added on{" "}
                        {format(new Date(selectedWanted.created_at), "PPp")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              {selectedWanted.status === "Wanted" ? (
                <Button
                  onClick={() => {
                    handleCaptureWanted(
                      selectedWanted.id,
                      selectedWanted.criminal_id,
                    );
                    setIsViewWantedOpen(false);
                  }}
                  disabled={isLoading}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Captured
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsViewWantedOpen(false)}
                >
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WantedCriminalsModule;
