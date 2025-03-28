import React, { useState, useEffect } from "react";
import { getCases, createCase } from "@/lib/db";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
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
} from "lucide-react";

interface Case {
  id: string;
  title: string;
  status: "open" | "closed" | "pending";
  dateCreated: string;
  lastUpdated: string;
  description: string;
  assignedOfficers: string[];
}

interface Evidence {
  id: string;
  caseId: string;
  name: string;
  type: string;
  dateCollected: string;
  location: string;
  status: string;
  description: string;
}

interface Suspect {
  id: string;
  caseId: string;
  name: string;
  age: number;
  gender: string;
  status: string;
  description: string;
  lastKnownLocation: string;
}

const CaseManagement = () => {
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false);
  const [isNewEvidenceDialogOpen, setIsNewEvidenceDialogOpen] = useState(false);
  const [isNewSuspectDialogOpen, setIsNewSuspectDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for cases
  const defaultCases: Case[] = [
    {
      id: "C-2023-001",
      title: "Downtown Robbery",
      status: "open",
      dateCreated: "2023-05-15",
      lastUpdated: "2023-06-02",
      description: "Armed robbery at First National Bank on Main Street",
      assignedOfficers: ["Officer Johnson", "Detective Smith"],
    },
    {
      id: "C-2023-002",
      title: "Vehicle Theft",
      status: "pending",
      dateCreated: "2023-05-20",
      lastUpdated: "2023-05-25",
      description: "Stolen vehicle reported at Westside Mall parking lot",
      assignedOfficers: ["Officer Williams"],
    },
    {
      id: "C-2023-003",
      title: "Residential Burglary",
      status: "closed",
      dateCreated: "2023-04-10",
      lastUpdated: "2023-05-30",
      description: "Break-in at 123 Oak Street, jewelry and electronics stolen",
      assignedOfficers: ["Detective Brown", "Officer Davis"],
    },
  ];

  // Mock data for evidence
  const defaultEvidence: Evidence[] = [
    {
      id: "E-001",
      caseId: "C-2023-001",
      name: "Security Camera Footage",
      type: "Video",
      dateCollected: "2023-05-15",
      location: "Bank Vault",
      status: "Processing",
      description: "CCTV footage showing suspect entering the bank",
    },
    {
      id: "E-002",
      caseId: "C-2023-001",
      name: "Fingerprints",
      type: "Physical",
      dateCollected: "2023-05-15",
      location: "Counter Surface",
      status: "Analyzed",
      description: "Partial fingerprints found on the counter",
    },
    {
      id: "E-003",
      caseId: "C-2023-002",
      name: "Tire Marks",
      type: "Physical",
      dateCollected: "2023-05-20",
      location: "Parking Lot",
      status: "Collected",
      description: "Tire marks found at the scene",
    },
  ];

  // Mock data for suspects
  const defaultSuspects: Suspect[] = [
    {
      id: "S-001",
      caseId: "C-2023-001",
      name: "John Doe",
      age: 32,
      gender: "Male",
      status: "Wanted",
      description:
        "Approximately 6ft tall, medium build, last seen wearing a black hoodie",
      lastKnownLocation: "Downtown area",
    },
    {
      id: "S-002",
      caseId: "C-2023-002",
      name: "Jane Smith",
      age: 28,
      gender: "Female",
      status: "Under Investigation",
      description: "Blonde hair, slim build, tattoo on right arm",
      lastKnownLocation: "Westside Apartments",
    },
  ];

  const [cases, setCases] = useState<Case[]>(defaultCases);
  const [evidence, setEvidence] = useState<Evidence[]>(defaultEvidence);
  const [suspects, setSuspects] = useState<Suspect[]>(defaultSuspects);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      try {
        const data = await getCases();
        if (data && data.length > 0) {
          setCases(data as Case[]);
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const handleCaseSelect = (caseItem: Case) => {
    setSelectedCase(caseItem);
  };

  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const caseEvidence = evidence.filter(
    (item) => selectedCase && item.caseId === selectedCase.id,
  );
  const caseSuspects = suspects.filter(
    (item) => selectedCase && item.caseId === selectedCase.id,
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "default";
      case "closed":
        return "secondary";
      case "pending":
        return "outline";
      case "wanted":
        return "destructive";
      case "under investigation":
        return "default";
      case "processing":
        return "outline";
      case "analyzed":
        return "secondary";
      case "collected":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Case Management</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog
            open={isNewCaseDialogOpen}
            onOpenChange={setIsNewCaseDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Case
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Case</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="case-id" className="text-right">
                    Case ID
                  </label>
                  <Input
                    id="case-id"
                    className="col-span-3"
                    placeholder="Auto-generated"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="title" className="text-right">
                    Title
                  </label>
                  <Input
                    id="title"
                    className="col-span-3"
                    placeholder="Case title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="description" className="text-right">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    className="col-span-3"
                    placeholder="Case description"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="officers" className="text-right">
                    Assigned Officers
                  </label>
                  <Input
                    id="officers"
                    className="col-span-3"
                    placeholder="Officer names (comma separated)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewCaseDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsNewCaseDialogOpen(false)}>
                  Create Case
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredCases.length > 0 ? (
                  filteredCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-accent/50 ${selectedCase?.id === caseItem.id ? "bg-accent" : ""}`}
                      onClick={() => handleCaseSelect(caseItem)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{caseItem.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {caseItem.id}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(caseItem.status)}>
                          {caseItem.status}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2 truncate">
                        {caseItem.description}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>Created: {caseItem.dateCreated}</span>
                        <span>Updated: {caseItem.lastUpdated}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No cases found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedCase ? (
            <Tabs defaultValue="details">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Case Details</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="suspects">Suspects</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{selectedCase.title}</CardTitle>
                      <Badge
                        variant={getStatusBadgeVariant(selectedCase.status)}
                      >
                        {selectedCase.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Case ID</h3>
                      <p>{selectedCase.id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Description</h3>
                      <p>{selectedCase.description}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Assigned Officers</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedCase.assignedOfficers.map((officer, index) => (
                          <Badge key={index} variant="outline">
                            {officer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium">Date Created</h3>
                        <p>{selectedCase.dateCreated}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Last Updated</h3>
                        <p>{selectedCase.lastUpdated}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Case
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Evidence for {selectedCase.title}
                  </h2>
                  <Dialog
                    open={isNewEvidenceDialogOpen}
                    onOpenChange={setIsNewEvidenceDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Evidence
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Evidence</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="evidence-name" className="text-right">
                            Name
                          </label>
                          <Input
                            id="evidence-name"
                            className="col-span-3"
                            placeholder="Evidence name"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="evidence-type" className="text-right">
                            Type
                          </label>
                          <Input
                            id="evidence-type"
                            className="col-span-3"
                            placeholder="Evidence type"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="evidence-location"
                            className="text-right"
                          >
                            Location
                          </label>
                          <Input
                            id="evidence-location"
                            className="col-span-3"
                            placeholder="Where it was found"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="evidence-description"
                            className="text-right"
                          >
                            Description
                          </label>
                          <Textarea
                            id="evidence-description"
                            className="col-span-3"
                            placeholder="Evidence description"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label className="text-right">Upload Files</label>
                          <div className="col-span-3">
                            <Button variant="outline" className="w-full">
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Evidence Files
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsNewEvidenceDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => setIsNewEvidenceDialogOpen(false)}
                        >
                          Add Evidence
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Collected</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caseEvidence.length > 0 ? (
                      caseEvidence.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.dateCollected}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No evidence found for this case
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="suspects" className="space-y-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Suspects for {selectedCase.title}
                  </h2>
                  <Dialog
                    open={isNewSuspectDialogOpen}
                    onOpenChange={setIsNewSuspectDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Suspect
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Suspect</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="suspect-name" className="text-right">
                            Name
                          </label>
                          <Input
                            id="suspect-name"
                            className="col-span-3"
                            placeholder="Suspect name"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="suspect-age" className="text-right">
                            Age
                          </label>
                          <Input
                            id="suspect-age"
                            type="number"
                            className="col-span-3"
                            placeholder="Suspect age"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="suspect-gender"
                            className="text-right"
                          >
                            Gender
                          </label>
                          <Input
                            id="suspect-gender"
                            className="col-span-3"
                            placeholder="Suspect gender"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="suspect-location"
                            className="text-right"
                          >
                            Last Known Location
                          </label>
                          <Input
                            id="suspect-location"
                            className="col-span-3"
                            placeholder="Last known location"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="suspect-description"
                            className="text-right"
                          >
                            Description
                          </label>
                          <Textarea
                            id="suspect-description"
                            className="col-span-3"
                            placeholder="Physical description"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="suspect-status"
                            className="text-right"
                          >
                            Status
                          </label>
                          <Input
                            id="suspect-status"
                            className="col-span-3"
                            placeholder="Suspect status"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsNewSuspectDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => setIsNewSuspectDialogOpen(false)}
                        >
                          Add Suspect
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseSuspects.length > 0 ? (
                    caseSuspects.map((suspect) => (
                      <Card key={suspect.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center">
                              <User className="mr-2 h-5 w-5" />
                              {suspect.name}
                            </CardTitle>
                            <Badge
                              variant={getStatusBadgeVariant(suspect.status)}
                            >
                              {suspect.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm font-medium">Age</p>
                              <p>{suspect.age}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Gender</p>
                              <p>{suspect.gender}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Description</p>
                            <p className="text-sm">{suspect.description}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Last Known Location
                            </p>
                            <p className="text-sm">
                              {suspect.lastKnownLocation}
                            </p>
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Folder className="mr-2 h-4 w-4" />
                              View Files
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="md:col-span-2 text-center py-8 text-muted-foreground">
                      <p>No suspects added to this case</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg bg-muted/20">
              <Folder className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No Case Selected</h3>
              <p className="text-muted-foreground">
                Select a case from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseManagement;
