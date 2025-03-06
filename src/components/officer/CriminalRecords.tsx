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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  FileText,
  User,
  UserPlus,
  Fingerprint,
  Camera,
  Upload,
  Eye,
  Edit,
  Trash2,
  Download,
  FileUp,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Users,
  Link,
} from "lucide-react";
import { format } from "date-fns";

// Types
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
  current_status: "At Large" | "In Custody" | "Released" | "Deceased";
  arrest_history?: any[];
  created_at: string;
  updated_at: string;
}

interface CriminalCase {
  id: string;
  criminal_id: string;
  case_id: string;
  role: "Suspect" | "Witness" | "Victim" | "Person of Interest";
  notes?: string;
  created_at: string;
  case?: Case;
}

interface Case {
  id: string;
  title: string;
  case_number: string;
  status: string;
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
  case?: Case;
  station?: Station;
  officer?: Officer;
}

interface Station {
  id: string;
  name: string;
}

interface Officer {
  id: string;
  name: string;
  badge: string;
}

interface CriminalFile {
  id: string;
  criminal_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  file_category: "Mugshot" | "Fingerprint" | "DNA" | "Document" | "Video" | "Other";
  description?: string;
  uploaded_by?: string;
  uploaded_at: string;
  officer?: Officer;
}

const CriminalRecords: React.FC = () => {
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [criminalCases, setCriminalCases] = useState<CriminalCase[]>([]);
  const [detentionRecords, setDetentionRecords] = useState<DetentionRecord[]>([]);
  const [criminalFiles, setCriminalFiles] = useState<CriminalFile[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isAddCriminalOpen, setIsAddCriminalOpen] = useState(false);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [selectedCriminal, setSelectedCriminal] = useState<Criminal | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState<string>("Document");
  const [activeTab, setActiveTab] = useState("criminals");
  const [criminalDetailsTab, setCriminalDetailsTab] = useState("details");

  // Fetch data on component mount
  useEffect(() => {
    fetchCriminals();
    fetchCases();
    fetchStations();
    fetchOfficers();
  }, []);

  // Fetch criminal details when a criminal is selected
  useEffect(() => {
    if (selectedCriminal) {
      fetchCriminalCases(selectedCriminal.id);
      fetchDetentionRecords(selectedCriminal.id);
      fetchCriminalFiles(selectedCriminal.id);
    }
  }, [selectedCriminal]);

  const fetchCriminals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("criminals")
        .select("*");

      if (error) throw error;

      if (data) {
        setCriminals(data);
      }
    } catch (error) {
      console.error("Error fetching criminals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCriminalCases = async (criminalId: string) => {
    try {
      const { data, error } = await supabase
        .from("criminal_cases")
        .select(`*, case:case_id(*)`) 
        .eq("criminal_id", criminalId);

      if (error) throw error;

      if (data) {
        setCriminalCases(data);
      }
    } catch (error) {
      console.error("Error fetching criminal cases:", error);
    }
  };

  const fetchDetentionRecords = async (criminalId: string) => {
    try {
      const { data, error } = await supabase
        .from("detention_records")
        .select(`
          *,
          case:case_id(*),
          station:station_id(*),
          officer:arresting_officer(*)
        `)
        .eq("criminal_id", criminalId);

      if (error) throw error;

      if (data) {
        setDetentionRecords(data);
      }
    } catch (error) {
      console.error("Error fetching detention records:", error);
    }
  };

  const fetchCriminalFiles = async (criminalId: string) => {
    try {
      const { data, error } = await supabase
        .from("criminal_files")
        .select(`*, officer:uploaded_by(*)`)
        .eq("criminal_id", criminalId);

      if (error) throw error;

      if (data) {
        setCriminalFiles(data);
      }
    } catch (error) {
      console.error("Error fetching criminal files:", error);
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

  const handleCreateCriminal = async (formData: any) => {
    setIsLoading(true);
    try {
      // Parse known associates if provided
      let knownAssociates = null;
      if (formData.knownAssociates) {
        try {
          knownAssociates = JSON.parse(formData.knownAssociates);
        } catch (e) {
          // If not valid JSON, treat as comma-separated list
          knownAssociates = formData.knownAssociates.split(',').map((name: string) => name.trim());
        }
      }

      const { data, error } = await supabase
        .from("criminals")
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            dob: formData.dob,
            gender: formData.gender,
            national_id: formData.nationalId,
            passport_number: formData.passportNumber,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            gang_affiliation: formData.gangAffiliation,
            bio: formData.bio,
            current_status: formData.currentStatus,
            known_associates: knownAssociates,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchCriminals();
        setIsAddCriminalOpen(false);
        alert("Criminal record created successfully!");
      }
    } catch (error) {
      console.error("Error creating criminal record:", error);
      alert("Failed to create criminal record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkCase = async (formData: any) => {
    if (!selectedCriminal) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("criminal_cases")
        .insert([
          {
            criminal_id: selectedCriminal.id,
            case_id: formData.caseId,
            role: formData.role,
            notes: formData.notes,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchCriminalCases(selectedCriminal.id);
        setIsAddCaseOpen(false);
        alert("Case linked successfully!");
      }
    } catch (error) {
      console.error("Error linking case:", error);
      alert("Failed to link case. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (formData: any) => {
    if (!selectedCriminal || !selectedFile) return;
    
    setIsLoading(true);
    try {
      // Determine the storage bucket based on file category
      let bucketName = "criminal-files";
      if (fileCategory === "Mugshot") {
        bucketName = "mugshots";
      } else if (fileCategory === "Fingerprint") {
        bucketName = "fingerprints";
      }
      
      // Upload file to Supabase Storage
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${selectedCriminal.last_name}_${selectedCriminal.first_name}_${fileCategory}_${timestamp}_${selectedFile.name}`;
      
      const { data: fileData, error: fileError } = await supabase.storage
        .from(bucketName)
        .upload(filename, selectedFile);
        
      if (fileError) throw fileError;
      
      if (fileData) {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileData.path);
          
        // Create file record in database
        const { data, error } = await supabase
          .from("criminal_files")
          .insert([
            {
              criminal_id: selectedCriminal.id,
              file_name: selectedFile.name,
              file_type: selectedFile.type,
              file_size: selectedFile.size,
              file_url: urlData.publicUrl,
              file_category: fileCategory,
              description: formData.description,
              uploaded_by: "current-officer-id" // Replace with actual officer ID
            },
          ])
          .select();

        if (error) throw error;

        if (data) {
          // If this is a mugshot, update the criminal record
          if (fileCategory === "Mugshot") {
            await supabase
              .from("criminals")
              .update({ mugshot_url: urlData.publicUrl })
              .eq("id", selectedCriminal.id);
          }
          
          // If this is a fingerprint, update the criminal record
          if (fileCategory === "Fingerprint") {
            await supabase
              .from("criminals")
              .update({ fingerprint_data: urlData.publicUrl })
              .eq("id", selectedCriminal.id);
          }
          
          await fetchCriminalFiles(selectedCriminal.id);
          await fetchCriminals(); // Refresh to get updated mugshot/fingerprint URLs
          setIsUploadFileOpen(false);
          setSelectedFile(null);
          alert("File uploaded successfully!");
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter criminals based on search query and status filter
  const filteredCriminals = criminals.filter((criminal) => {
    const fullName = `${criminal.first_name} ${criminal.last_name}`;
    const matchesSearch = 
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (criminal.national_id && criminal.national_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus =
      statusFilter === "all" || criminal.current_status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "At Large":
        return "bg-red-100 text-red-800";
      case "In Custody":
        return "bg-blue-100 text-blue-800";
      case "Released":
        return "bg-green-100 text-green-800";
      case "Deceased":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Suspect":
        return "bg-red-100 text-red-800";
      case "Witness":
        return "bg-blue-100 text-blue-800";
      case "Victim":
        return "bg-purple-100 text-purple-800";
      case "Person of Interest":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get file category badge color
  const getFileCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "Mugshot":
        return "bg-blue-100 text-blue-800";
      case "Fingerprint":
        return "bg-purple-100 text-purple-800";
      case "DNA":
        return "bg-green-100 text-green-800";
      case "Document":
        return "bg-yellow-100 text-yellow-800";
      case "Video":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Criminal Records</h1>
          <p className="text-muted-foreground">
            Manage criminal profiles, case associations, and detention history
          </p>
        </div>
        <Button onClick={() => setIsAddCriminalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> New Criminal Record
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="criminals" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Criminal Records
          </TabsTrigger>
          {selectedCriminal && (
            <TabsTrigger value="criminal-details" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Criminal Profile
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="criminals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Criminal Records</CardTitle>
              <CardDescription>
                View and manage criminal profiles and records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
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
                      <SelectItem value="at large">At Large</SelectItem>
                      <SelectItem value="in custody">In Custody</SelectItem>
                      <SelectItem value="released">Released</SelectItem>
                      <SelectItem value="deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Gang Affiliation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Loading criminal records...
                        </TableCell>
                      </TableRow>
                    ) : filteredCriminals.length > 0 ? (
                      filteredCriminals.map((criminal) => (
                        <TableRow key={criminal.id}>
                          <TableCell className="font-medium">
                            {criminal.first_name} {criminal.last_name}
                          </TableCell>
                          <TableCell>{criminal.national_id || "N/A"}</TableCell>
                          <TableCell>
                            {criminal.dob ? format(new Date(criminal.dob), "PP") : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeVariant(criminal.current_status)}>
                              {criminal.current_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{criminal.gang_affiliation || "None"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedCriminal(criminal);
                                  setActiveTab("criminal-details");
                                  setCriminalDetailsTab("details");
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">Report</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No criminal records found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedCriminal && (
          <TabsContent value="criminal-details" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedCriminal.first_name} {selectedCriminal.last_name}</h2>
                <p className="text-muted-foreground">
                  ID: {selectedCriminal.national_id || "N/A"} • Status: {selectedCriminal.current_status}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsUploadFileOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <Button variant="outline" onClick={() => setIsAddCaseOpen(true)}>
                  <Link className="mr-2 h-4 w-4" />
                  Link Case
                </Button>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>

            <Tabs value={criminalDetailsTab} onValueChange={setCriminalDetailsTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Profile</TabsTrigger>
                <TabsTrigger value="cases">Cases</TabsTrigger>
                <TabsTrigger value="detention">Detention History</TabsTrigger>
                <TabsTrigger value="files">Files & Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Full Name</h3>
                          <p className="text-sm">{selectedCriminal.first_name} {selectedCriminal.last_name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Date of Birth</h3>
                          <p className="text-sm">{selectedCriminal.dob ? format(new Date(selectedCriminal.dob), "PPP") : "Not recorded"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Gender</h3>
                          <p className="text-sm">{selectedCriminal.gender || "Not recorded"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">National ID</h3>
                          <p className="text-sm">{selectedCriminal.national_id || "Not recorded"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Passport Number</h3>
                          <p className="text-sm">{selectedCriminal.passport_number || "Not recorded"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Status</h3>
                          <Badge className={getStatusBadgeVariant(selectedCriminal.current_status)}>
                            {selectedCriminal.current_status}
                          </Badge>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Address</h3>
                          <p className="text-sm">{selectedCriminal.address || "Not recorded"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                          <p className="text-sm">Phone: {selectedCriminal.phone || "Not recorded"}</p>
                          <p className="text-sm">Email: {selectedCriminal.email || "Not recorded"}</p>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Gang Affiliation</h3>
                        <p className="text-sm">{selectedCriminal.gang_affiliation || "None recorded"}</p>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Known Associates</h3>
                        {selectedCriminal.known_associates && selectedCriminal.known_associates.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedCriminal.known_associates.map((associate, index) => (
                              <Badge key={index} variant="outline">
                                {typeof associate === 'string' ? associate : JSON.stringify(associate)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No known associates recorded</p>
                        )}
                      </div>

                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Biography/Notes</h3>
                        <p className="text-sm whitespace-pre-line">{selectedCriminal.bio || "No additional information recorded"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Identification</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      {selectedCriminal.mugshot_url ? (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-center mb-2">Mugshot</h3>
                          <div className="w-full max-w-[200px] aspect-[3/4] rounded-md overflow-hidden border">
                            <img 
                              src={selectedCriminal.mugshot_url} 
                              alt={`Mugshot of ${selectedCriminal.first_name} ${selectedCriminal.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6 flex flex-col items-center">
                          <div className="