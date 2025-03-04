import React, { useState, useEffect } from "react";
import { getOfficers, createOfficer, updateOfficer } from "@/lib/db";
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
} from "lucide-react";

interface Officer {
  id: string;
  name: string;
  badge: string;
  rank: string;
  department: string;
  status: "active" | "on-leave" | "suspended";
  performance: number;
  joinDate: string;
}

const OfficerManagement = ({ initialOfficers = mockOfficers }) => {
  const [officers, setOfficers] = useState(initialOfficers);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOfficers = async () => {
      setIsLoading(true);
      try {
        const data = await getOfficers();
        if (data && data.length > 0) {
          setOfficers(data);
        }
      } catch (error) {
        console.error("Error fetching officers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfficers();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all-officers");
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [isAddOfficerOpen, setIsAddOfficerOpen] = useState(false);
  const [isAssignDutyOpen, setIsAssignDutyOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);

  const filteredOfficers = officers.filter(
    (officer) =>
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "on-leave":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
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
            <SelectItem value="on-leave">On Leave</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="patrol">Patrol</SelectItem>
            <SelectItem value="detective">Detective</SelectItem>
            <SelectItem value="swat">SWAT</SelectItem>
            <SelectItem value="k9">K-9 Unit</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        defaultValue="all-officers"
        className="w-full"
        onValueChange={setSelectedTab}
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
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfficers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell className="font-medium">
                        {officer.name}
                      </TableCell>
                      <TableCell>{officer.badge}</TableCell>
                      <TableCell>{officer.rank}</TableCell>
                      <TableCell>{officer.department}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(officer.status) as any}>
                          {officer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{officer.joinDate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOfficer(officer)}
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
                          <Button variant="ghost" size="icon">
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
                              style={{ width: `${officer.performance}%` }}
                            />
                          </div>
                          <span>{officer.performance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            officer.performance > 75 ? "default" : "secondary"
                          }
                        >
                          {officer.performance > 75 ? "Improving" : "Stable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
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
        open={!!selectedOfficer}
        onOpenChange={(open) => !open && setSelectedOfficer(null)}
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
                defaultValue={selectedOfficer?.name}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="badge" className="text-right">
                Badge #
              </label>
              <Input
                id="badge"
                defaultValue={selectedOfficer?.badge}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="rank" className="text-right">
                Rank
              </label>
              <Select defaultValue={selectedOfficer?.rank}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Officer">Officer</SelectItem>
                  <SelectItem value="Sergeant">Sergeant</SelectItem>
                  <SelectItem value="Lieutenant">Lieutenant</SelectItem>
                  <SelectItem value="Captain">Captain</SelectItem>
                  <SelectItem value="Chief">Chief</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="department" className="text-right">
                Department
              </label>
              <Select defaultValue={selectedOfficer?.department}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Patrol">Patrol</SelectItem>
                  <SelectItem value="Detective">Detective</SelectItem>
                  <SelectItem value="SWAT">SWAT</SelectItem>
                  <SelectItem value="K-9 Unit">K-9 Unit</SelectItem>
                  <SelectItem value="Traffic">Traffic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">
                Status
              </label>
              <Select defaultValue={selectedOfficer?.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOfficer(null)}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
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
                  <SelectItem value="Officer">Officer</SelectItem>
                  <SelectItem value="Sergeant">Sergeant</SelectItem>
                  <SelectItem value="Lieutenant">Lieutenant</SelectItem>
                  <SelectItem value="Captain">Captain</SelectItem>
                  <SelectItem value="Chief">Chief</SelectItem>
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
                  <SelectItem value="Patrol">Patrol</SelectItem>
                  <SelectItem value="Detective">Detective</SelectItem>
                  <SelectItem value="SWAT">SWAT</SelectItem>
                  <SelectItem value="K-9 Unit">K-9 Unit</SelectItem>
                  <SelectItem value="Traffic">Traffic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOfficerOpen(false)}
            >
              Cancel
            </Button>
            <Button>Add Officer</Button>
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
    </div>
  );
};

// Mock data for officers
const mockOfficers: Officer[] = [
  {
    id: "1",
    name: "John Smith",
    badge: "B-1234",
    rank: "Sergeant",
    department: "Patrol",
    status: "active",
    performance: 92,
    joinDate: "2015-03-12",
  },
  {
    id: "2",
    name: "Maria Rodriguez",
    badge: "B-2345",
    rank: "Officer",
    department: "K-9 Unit",
    status: "active",
    performance: 88,
    joinDate: "2018-06-23",
  },
  {
    id: "3",
    name: "David Chen",
    badge: "B-3456",
    rank: "Lieutenant",
    department: "Detective",
    status: "active",
    performance: 95,
    joinDate: "2010-11-05",
  },
  {
    id: "4",
    name: "Sarah Johnson",
    badge: "B-4567",
    rank: "Officer",
    department: "Traffic",
    status: "on-leave",
    performance: 78,
    joinDate: "2019-02-18",
  },
  {
    id: "5",
    name: "Michael Brown",
    badge: "B-5678",
    rank: "Officer",
    department: "Patrol",
    status: "active",
    performance: 82,
    joinDate: "2017-09-30",
  },
  {
    id: "6",
    name: "Lisa Wilson",
    badge: "B-6789",
    rank: "Captain",
    department: "SWAT",
    status: "active",
    performance: 91,
    joinDate: "2008-04-15",
  },
  {
    id: "7",
    name: "Robert Davis",
    badge: "B-7890",
    rank: "Officer",
    department: "Patrol",
    status: "suspended",
    performance: 65,
    joinDate: "2020-01-10",
  },
];

export default OfficerManagement;
