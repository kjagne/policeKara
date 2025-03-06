import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  FileText,
  Folder,
  User,
  Edit,
  Trash2,
  Upload,
  Eye,
  Mic,
  UserPlus,
  FileUp,
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Filter,
} from "lucide-react";
import StatementRecorder from "./StatementRecorder";
import EvidenceForm from "./EvidenceForm";

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  date_created: string;
  last_updated: string;
  assigned_officers: string[];
  location: string;
  case_number: string;
  created_by: string;
}

interface Statement {
  id: string;
  case_id: string;
  person_type: "suspect" | "victim" | "witness";
  person_id: string;
  statement_text: string;
  recording_url: string;
  recording_filename: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  person?: Person;
}

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  id_type?: string;
  id_number?: string;
  notes?: string;
}

interface CaseFile {
  id: string;
  case_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  description: string;
  uploaded_by: string;
  uploaded_at: string;
}

interface Evidence {
  id: string;
  case_id: string;
  evidence_type: string;
  description: string;
  location_found: string;
  found_date: string;
  chain_of_custody: any[];
  status: string;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const CaseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [isAddStatementOpen, setIsAddStatementOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [selectedPersonType, setSelectedPersonType] = useState<
    "suspect" | "victim" | "witness"
  >("witness");
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [persons, setPersons] = useState<Person[]>([]);
  const [activeTab, setActiveTab] = useState("cases");
  const [caseDetailsTab, setCaseDetailsTab] = useState("details");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch cases on component mount
  useEffect(() => {
    fetchCases();
    fetchPersons();
  }, []);

  // Fetch case details when a case is selected
  useEffect(() => {
    if (selectedCase) {
      fetchStatements(selectedCase.id);
      fetchCaseFiles(selectedCase.id);
      fetchEvidence(selectedCase.id);
    }
  }, [selectedCase]);

  // Clean up audio recording resources when component unmounts
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioStream]);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("cases").select("*");

      if (error) throw error;

      if (data) {
        const formattedCases = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          status: item.status,
          priority: item.priority || "medium",
          date_created: new Date(item.date_created).toLocaleDateString(),
          last_updated: new Date(item.last_updated).toLocaleDateString(),
          assigned_officers: Array.isArray(item.assigned_officers)
            ? item.assigned_officers
            : typeof item.assigned_officers === "string"
              ? JSON.parse(item.assigned_officers)
              : [],
          location: item.location || "",
          case_number:
            item.case_number || `CASE-${Math.floor(Math.random() * 10000)}`,
          created_by: item.created_by || "officer-1",
        }));
        setCases(formattedCases);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatements = async (caseId: string) => {
    try {
      const { data, error } = await supabase
        .from("statements")
        .select(`*, person:person_id(*)`) // Join with persons table
        .eq("case_id", caseId);

      if (error) throw error;

      if (data) {
        setStatements(data);
      }
    } catch (error) {
      console.error("Error fetching statements:", error);
    }
  };

  const fetchCaseFiles = async (caseId: string) => {
    try {
      const { data, error } = await supabase
        .from("case_files")
        .select("*")
        .eq("case_id", caseId);

      if (error) throw error;

      if (data) {
        setCaseFiles(data);
      }
    } catch (error) {
      console.error("Error fetching case files:", error);
    }
  };

  const fetchEvidence = async (caseId: string) => {
    try {
      const { data, error } = await supabase
        .from("case_evidence")
        .select("*")
        .eq("case_id", caseId);

      if (error) throw error;

      if (data) {
        setEvidence(data);
      }
    } catch (error) {
      console.error("Error fetching evidence:", error);
    }
  };

  const fetchPersons = async () => {
    try {
      const { data, error } = await supabase.from("persons").select("*");

      if (error) throw error;

      if (data) {
        setPersons(data);
      }
    } catch (error) {
      console.error("Error fetching persons:", error);
    }
  };

  const handleCreateCase = async (formData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("cases")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            location: formData.location,
            case_number: formData.caseNumber,
            date_created: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            assigned_officers: formData.assignedOfficers || [],
            created_by: "current-officer-id", // Replace with actual officer ID
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchCases();
        setIsAddCaseOpen(false);
        alert("Case created successfully!");
      }
    } catch (error) {
      console.error("Error creating case:", error);
      alert("Failed to create case. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePerson = async (formData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("persons")
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            id_type: formData.idType,
            id_number: formData.idNumber,
            notes: formData.notes,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchPersons();
        setIsAddPersonOpen(false);
        setSelectedPerson(data[0].id);
        alert("Person added successfully!");
      }
    } catch (error) {
      console.error("Error creating person:", error);
      alert("Failed to add person. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStatement = async (formData: any) => {
    if (!selectedCase) return;

    setIsLoading(true);
    try {
      // If we have recorded audio, upload it first
      let recordingUrl = "";
      let recordingFilename = "";

      if (recordedAudio) {
        // Convert data URL to blob
        const audioBlob = await fetch(recordedAudio).then((r) => r.blob());
        const personName = persons.find((p) => p.id === formData.personId);
        const personFullName = personName
          ? `${personName.first_name}_${personName.last_name}`
          : "unknown";
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `case_${selectedCase.case_number}_${formData.personType}_${personFullName}_${timestamp}.webm`;

        // Upload to Supabase Storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from("case-recordings")
          .upload(filename, audioBlob, {
            contentType: "audio/webm",
          });

        if (fileError) throw fileError;

        if (fileData) {
          const { data: urlData } = supabase.storage
            .from("case-recordings")
            .getPublicUrl(fileData.path);

          recordingUrl = urlData.publicUrl;
          recordingFilename = filename;
        }
      }

      // Create the statement record
      const { data, error } = await supabase
        .from("statements")
        .insert([
          {
            case_id: selectedCase.id,
            person_type: formData.personType,
            person_id: formData.personId,
            statement_text: formData.statementText,
            recording_url: recordingUrl,
            recording_filename: recordingFilename,
            created_by: "current-officer-id", // Replace with actual officer ID
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchStatements(selectedCase.id);
        setIsAddStatementOpen(false);
        setRecordedAudio(null);
        setAudioChunks([]);
        alert("Statement recorded successfully!");
      }
    } catch (error) {
      console.error("Error creating statement:", error);
      alert("Failed to record statement. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvidence = async (formData: any, files: File[]) => {
    if (!selectedCase) return;

    setIsLoading(true);
    try {
      // First, create the evidence record
      const { data, error } = await supabase
        .from("case_evidence")
        .insert([
          {
            case_id: selectedCase.id,
            evidence_type: formData.evidenceType,
            description: formData.description,
            location_found: formData.locationFound,
            found_date: formData.foundDate,
            chain_of_custody: [
              {
                officer: "current-officer-id", // Replace with actual officer ID
                action: "collected",
                timestamp: new Date().toISOString(),
                notes: "Initial collection",
              },
            ],
            status: "active",
            notes: formData.notes,
            created_by: "current-officer-id", // Replace with actual officer ID
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        // If we have files, upload them and associate with this evidence
        if (files.length > 0) {
          for (const file of files) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `evidence_${data[0].id}_${timestamp}_${file.name}`;

            // Upload to Supabase Storage
            const { data: fileData, error: fileError } = await supabase.storage
              .from("case-files")
              .upload(filename, file);

            if (fileError) {
              console.error("Error uploading file:", fileError);
              continue;
            }

            if (fileData) {
              const { data: urlData } = supabase.storage
                .from("case-files")
                .getPublicUrl(fileData.path);

              // Create file record in database
              await supabase.from("case_files").insert([
                {
                  case_id: selectedCase.id,
                  file_name: file.name,
                  file_type: file.type,
                  file_size: file.size,
                  file_url: urlData.publicUrl,
                  description: `Evidence file for ${formData.evidenceType}`,
                  uploaded_by: "current-officer-id", // Replace with actual officer ID
                },
              ]);
            }
          }
        }

        await fetchEvidence(selectedCase.id);
        await fetchCaseFiles(selectedCase.id);
        setIsAddEvidenceOpen(false);
        alert("Evidence added successfully!");
      }
    } catch (error) {
      console.error("Error adding evidence:", error);
      alert("Failed to add evidence. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (formData: any) => {
    if (!selectedCase || !selectedFile) return;

    setIsLoading(true);
    try {
      // Upload file to Supabase Storage
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `case_${selectedCase.case_number}_${timestamp}_${selectedFile.name}`;

      const { data: fileData, error: fileError } = await supabase.storage
        .from("case-files")
        .upload(filename, selectedFile);

      if (fileError) throw fileError;

      if (fileData) {
        const { data: urlData } = supabase.storage
          .from("case-files")
          .getPublicUrl(fileData.path);

        // Create file record in database
        const { data, error } = await supabase
          .from("case_files")
          .insert([
            {
              case_id: selectedCase.id,
              file_name: selectedFile.name,
              file_type: selectedFile.type,
              file_size: selectedFile.size,
              file_url: urlData.publicUrl,
              description: formData.description,
              uploaded_by: "current-officer-id", // Replace with actual officer ID
            },
          ])
          .select();

        if (error) throw error;

        if (data) {
          await fetchCaseFiles(selectedCase.id);
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

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      const recorder = new MediaRecorder(stream);
      setAudioRecorder(recorder);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
        setAudioChunks([...chunks]);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(blob);
        setRecordedAudio(audioURL);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Failed to start recording. Please check your microphone permissions.",
      );
    }
  };

  const stopRecording = () => {
    if (audioRecorder) {
      audioRecorder.stop();
      setIsRecording(false);

      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Handle audio recording from StatementRecorder component
  const handleSaveRecording = (audioBlob: Blob, audioUrl: string) => {
    setRecordedAudio(audioUrl);
  };

  // Filter cases based on search query and status filter
  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (caseItem.case_number &&
        caseItem.case_number.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Helper function to get priority badge color
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Case Management</h1>
          <p className="text-muted-foreground">
            Manage cases, statements, evidence, and reports
          </p>
        </div>
        <Button
          onClick={() => {
            setIsAddCaseOpen(true);
            setActiveTab("cases");
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> New Case
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="cases" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            Cases
          </TabsTrigger>
          {selectedCase && (
            <TabsTrigger value="case-details" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Case Details
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="cases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases by title or case number..."
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
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case Number</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          Loading cases...
                        </TableCell>
                      </TableRow>
                    ) : filteredCases.length > 0 ? (
                      filteredCases.map((caseItem) => (
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
                              className={getPriorityBadgeVariant(
                                caseItem.priority,
                              )}
                            >
                              {caseItem.priority.charAt(0).toUpperCase() +
                                caseItem.priority.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{caseItem.date_created}</TableCell>
                          <TableCell>{caseItem.last_updated}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCase(caseItem);
                                  setActiveTab("case-details");
                                  setCaseDetailsTab("details");
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
                          colSpan={7}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No cases found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedCase && (
          <TabsContent value="case-details" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedCase.title}</h2>
                <p className="text-muted-foreground">
                  Case #{selectedCase.case_number} •{" "}
                  {selectedCase.status.charAt(0).toUpperCase() +
                    selectedCase.status.slice(1)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Case
                </Button>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>

            <Tabs value={caseDetailsTab} onValueChange={setCaseDetailsTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="statements">Statements</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Case Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Description
                        </h3>
                        <p className="text-sm">{selectedCase.description}</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Status
                          </h3>
                          <Badge
                            className={getStatusBadgeVariant(
                              selectedCase.status,
                            )}
                          >
                            {selectedCase.status.charAt(0).toUpperCase() +
                              selectedCase.status.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Priority
                          </h3>
                          <Badge
                            className={getPriorityBadgeVariant(
                              selectedCase.priority,
                            )}
                          >
                            {selectedCase.priority.charAt(0).toUpperCase() +
                              selectedCase.priority.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Location
                        </h3>
                        <p className="text-sm">
                          {selectedCase.location || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Date Created
                        </h3>
                        <p className="text-sm">{selectedCase.date_created}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Last Updated
                        </h3>
                        <p className="text-sm">{selectedCase.last_updated}</p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Assigned Officers
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCase.assigned_officers &&
                        selectedCase.assigned_officers.length > 0 ? (
                          selectedCase.assigned_officers.map(
                            (officer, index) => (
                              <Badge key={index} variant="outline">
                                {officer}
                              </Badge>
                            ),
                          )
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No officers assigned
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Case Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="h-full w-px bg-gray-200 mt-2"></div>
                        </div>
                        <div className="pb-6">
                          <p className="text-sm font-medium">Case Created</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedCase.date_created}
                          </p>
                          <p className="text-sm mt-1">
                            Case was created and assigned to officers
                          </p>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div className="h-full w-px bg-gray-200 mt-2"></div>
                        </div>
                        <div className="pb-6">
                          <p className="text-sm font-medium">
                            Investigation Started
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedCase.date_created}
                          </p>
                          <p className="text-sm mt-1">
                            Initial investigation was started
                          </p>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Current Status:{" "}
                            {selectedCase.status.charAt(0).toUpperCase() +
                              selectedCase.status.slice(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {selectedCase.last_updated}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="statements" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Statements</h3>
                  <Button onClick={() => setIsAddStatementOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Statement
                  </Button>
                </div>

                {statements.length > 0 ? (
                  <div className="space-y-4">
                    {statements.map((statement) => (
                      <Card key={statement.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div>
                              <CardTitle className="text-base">
                                {statement.person_type.charAt(0).toUpperCase() +
                                  statement.person_type.slice(1)}{" "}
                                Statement
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {statement.person?.first_name}{" "}
                                {statement.person?.last_name} •{" "}
                                {new Date(
                                  statement.created_at,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {statement.person_type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-line">
                            {statement.statement_text}
                          </p>

                          {statement.recording_url && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">
                                Audio Recording
                              </h4>
                              <audio controls className="w-full">
                                <source
                                  src={statement.recording_url}
                                  type="audio/webm"
                                />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}
                        </CardContent>
                        <CardContent className="flex justify-between pt-2 border-t">
                          <div className="text-xs text-muted-foreground">
                            Recorded on{" "}
                            {new Date(statement.created_at).toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            {statement.recording_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={statement.recording_url}
                                  download={statement.recording_filename}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">
                        No Statements
                      </h3>
                      <p className="text-muted-foreground text-center max-w-md mb-4">
                        There are no statements recorded for this case yet.
                        Record a statement from a suspect, victim, or witness.
                      </p>
                      <Button onClick={() => setIsAddStatementOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Record Statement
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Evidence</h3>
                  <Button onClick={() => setIsAddEvidenceOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Evidence
                  </Button>
                </div>

                {evidence.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Location Found</TableHead>
                          <TableHead>Date Found</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {evidence.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.evidence_type}
                            </TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.location_found}</TableCell>
                            <TableCell>
                              {new Date(item.found_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Briefcase className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No Evidence</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-4">
                        There is no evidence recorded for this case yet. Add
                        evidence items to track them in the system.
                      </p>
                      <Button onClick={() => setIsAddEvidenceOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Evidence
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Case Files</h3>
                  <Button onClick={() => setIsUploadFileOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </div>

                {caseFiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {caseFiles.map((file) => (
                      <Card key={file.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted rounded-md">
                              <FileText className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h4
                                className="font-medium text-sm truncate"
                                title={file.file_name}
                              >
                                {file.file_name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {(file.file_size / 1024).toFixed(2)} KB •{" "}
                                {file.file_type}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Uploaded{" "}
                                {new Date(
                                  file.uploaded_at,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {file.description && (
                            <p className="text-sm mt-3 text-muted-foreground">
                              {file.description}
                            </p>
                          )}
                          <div className="flex justify-end mt-4 gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </a>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={file.file_url} download={file.file_name}>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <FileUp className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No Files</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-4">
                        There are no files uploaded for this case yet. Upload
                        documents, images, or other files related to the case.
                      </p>
                      <Button onClick={() => setIsUploadFileOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}
      </Tabs>

      {/* Add Case Dialog */}
      <Dialog open={isAddCaseOpen} onOpenChange={setIsAddCaseOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                title: (e.target as any).title.value,
                description: (e.target as any).description.value,
                status: (e.target as any).status.value,
                priority: (e.target as any).priority.value,
                location: (e.target as any).location.value,
                caseNumber: (e.target as any).caseNumber.value,
                assignedOfficers: [],
              };
              handleCreateCase(formData);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Case Title *</Label>
                  <Input id="title" name="title" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="caseNumber">Case Number *</Label>
                  <Input
                    id="caseNumber"
                    name="caseNumber"
                    required
                    className="mt-1"
                    defaultValue={`CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select name="status" defaultValue="open">
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select name="priority" defaultValue="medium">
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
                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddCaseOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Case"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Person Dialog */}
      <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Person</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                firstName: (e.target as any).firstName.value,
                lastName: (e.target as any).lastName.value,
                dateOfBirth: (e.target as any).dateOfBirth.value,
                gender: (e.target as any).gender.value,
                address: (e.target as any).address.value,
                phone: (e.target as any).phone.value,
                email: (e.target as any).email.value,
                idType: (e.target as any).idType.value,
                idNumber: (e.target as any).idNumber.value,
                notes: (e.target as any).notes.value,
              };
              handleCreatePerson(formData);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender">
                    <SelectTrigger id="gender" className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="idType">ID Type</Label>
                  <Select name="idType">
                    <SelectTrigger id="idType" className="mt-1">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers_license">
                        Driver's License
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input id="idNumber" name="idNumber" className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" className="mt-1" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddPersonOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Person"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Statement Dialog */}
      <Dialog
        open={isAddStatementOpen}
        onOpenChange={(open) => {
          setIsAddStatementOpen(open);
          if (!open) {
            // Clean up recording state when dialog is closed
            if (isRecording) {
              stopRecording();
            }
            setRecordedAudio(null);
            setAudioChunks([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record Statement</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                personType: selectedPersonType,
                personId: selectedPerson,
                statementText: (e.target as any).statementText.value,
              };
              handleCreateStatement(formData);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="personType">Person Type *</Label>
                  <Select
                    value={selectedPersonType}
                    onValueChange={(value: "suspect" | "victim" | "witness") =>
                      setSelectedPersonType(value)
                    }
                  >
                    <SelectTrigger id="personType" className="mt-1">
                      <SelectValue placeholder="Select person type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suspect">Suspect</SelectItem>
                      <SelectItem value="victim">Victim</SelectItem>
                      <SelectItem value="witness">Witness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="personId">Person *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setIsAddPersonOpen(true)}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Add New
                    </Button>
                  </div>
                  <Select
                    value={selectedPerson}
                    onValueChange={setSelectedPerson}
                  >
                    <SelectTrigger id="personId" className="mt-1">
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {persons.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.first_name} {person.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="statementText">Statement Text *</Label>
                  <Textarea
                    id="statementText"
                    name="statementText"
                    required
                    className="mt-1"
                    rows={6}
                    placeholder="Enter the statement text here..."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Audio Recording</Label>
                  {selectedCase && selectedPerson && (
                    <StatementRecorder
                      onSave={handleSaveRecording}
                      onCancel={() => setRecordedAudio(null)}
                      caseNumber={selectedCase.case_number}
                      personName={
                        persons.find((p) => p.id === selectedPerson)
                          ?.first_name +
                          " " +
                          persons.find((p) => p.id === selectedPerson)
                            ?.last_name || "Unknown"
                      }
                      personType={selectedPersonType}
                    />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddStatementOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !selectedPerson}>
                {isLoading ? "Saving..." : "Save Statement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Evidence Dialog */}
      <Dialog open={isAddEvidenceOpen} onOpenChange={setIsAddEvidenceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Evidence</DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <EvidenceForm
              onSubmit={handleCreateEvidence}
              onCancel={() => setIsAddEvidenceOpen(false)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog open={isUploadFileOpen} onOpenChange={setIsUploadFileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedFile) {
                alert("Please select a file to upload");
                return;
              }
              const formData = {
                description: (e.target as any).description.value,
              };
              handleUploadFile(formData);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="fileUpload">File *</Label>
                  <Input
                    id="fileUpload"
                    name="fileUpload"
                    type="file"
                    required
                    className="mt-1"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="mt-1"
                    rows={3}
                    placeholder="Enter a description for this file..."
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadFileOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !selectedFile}>
                {isLoading ? "Uploading..." : "Upload File"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseManagement;
