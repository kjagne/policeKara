import React, { useState, useEffect } from "react";
import { getStations, createStation } from "@/lib/db";
import { MapPin, Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Station {
  id: string;
  name: string;
  address: string;
  district: string;
  officers: number;
  vehicles: number;
  status: "active" | "inactive" | "maintenance";
}

interface StationManagementProps {
  stations?: Station[];
}

const StationManagement = ({
  initialStations = [],
}: StationManagementProps) => {
  const [stations, setStations] = useState(initialStations);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      setIsLoading(true);
      try {
        const data = await getStations();
        if (data && data.length > 0) {
          setStations(data);
        } else {
          setStations(defaultStations);
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
        setStations(defaultStations);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Default mock data if no stations are provided
  const defaultStations: Station[] = [
    {
      id: "1",
      name: "Central Police Station",
      address: "123 Main Street, Downtown",
      district: "Central",
      officers: 45,
      vehicles: 12,
      status: "active",
    },
    {
      id: "2",
      name: "Northside Precinct",
      address: "789 North Avenue, Northside",
      district: "North",
      officers: 32,
      vehicles: 8,
      status: "active",
    },
    {
      id: "3",
      name: "Eastside Station",
      address: "456 East Boulevard, Eastside",
      district: "East",
      officers: 28,
      vehicles: 6,
      status: "maintenance",
    },
    {
      id: "4",
      name: "Westside Outpost",
      address: "321 West Road, Westside",
      district: "West",
      officers: 15,
      vehicles: 4,
      status: "inactive",
    },
  ];

  const displayStations = stations.length > 0 ? stations : defaultStations;

  const handleEditStation = (station: Station) => {
    setSelectedStation(station);
    setIsAddStationOpen(true);
  };

  const handleAddNewStation = () => {
    setSelectedStation(null);
    setIsAddStationOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Station Management</h1>
          <p className="text-muted-foreground">
            Manage police stations and resource allocation
          </p>
        </div>
        <Button onClick={handleAddNewStation}>
          <Plus className="mr-2 h-4 w-4" /> Add Station
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Stations</CardTitle>
            <CardDescription>Active police stations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {displayStations.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Officers</CardTitle>
            <CardDescription>Assigned to stations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {displayStations.reduce(
                (sum, station) => sum + station.officers,
                0,
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Vehicles</CardTitle>
            <CardDescription>Available for deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {displayStations.reduce(
                (sum, station) => sum + station.vehicles,
                0,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="resources">Resource Allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 w-full max-w-sm">
              <Input
                placeholder="Search stations..."
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Officers</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayStations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-medium">
                      {station.name}
                    </TableCell>
                    <TableCell>{station.address}</TableCell>
                    <TableCell>{station.district}</TableCell>
                    <TableCell>{station.officers}</TableCell>
                    <TableCell>{station.vehicles}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(station.status)}`}
                      >
                        {station.status.charAt(0).toUpperCase() +
                          station.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditStation(station)}
                        >
                          <Edit className="h-4 w-4" />
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
          </div>
        </TabsContent>

        <TabsContent
          value="map"
          className="h-[600px] bg-muted rounded-md flex items-center justify-center"
        >
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">Map View</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              Interactive map showing station locations and coverage areas would
              be displayed here.
            </p>
          </div>
        </TabsContent>

        <TabsContent
          value="resources"
          className="h-[600px] bg-muted rounded-md flex items-center justify-center"
        >
          <div className="text-center">
            <h3 className="text-lg font-medium">Resource Allocation</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              Resource allocation tools and visualizations would be displayed
              here, allowing administrators to distribute officers, vehicles,
              and equipment across stations.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Station Dialog */}
      <Dialog open={isAddStationOpen} onOpenChange={setIsAddStationOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedStation ? "Edit Station" : "Add New Station"}
            </DialogTitle>
            <DialogDescription>
              {selectedStation
                ? "Update the station details below."
                : "Fill in the details to add a new police station."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right font-medium">
                Name
              </label>
              <Input
                id="name"
                className="col-span-3"
                defaultValue={selectedStation?.name || ""}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="address" className="text-right font-medium">
                Address
              </label>
              <Input
                id="address"
                className="col-span-3"
                defaultValue={selectedStation?.address || ""}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="district" className="text-right font-medium">
                District
              </label>
              <Input
                id="district"
                className="col-span-3"
                defaultValue={selectedStation?.district || ""}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="officers" className="text-right font-medium">
                Officers
              </label>
              <Input
                id="officers"
                type="number"
                className="col-span-3"
                defaultValue={selectedStation?.officers || 0}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="vehicles" className="text-right font-medium">
                Vehicles
              </label>
              <Input
                id="vehicles"
                type="number"
                className="col-span-3"
                defaultValue={selectedStation?.vehicles || 0}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right font-medium">
                Status
              </label>
              <Select defaultValue={selectedStation?.status || "active"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddStationOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedStation ? "Update Station" : "Add Station"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationManagement;
