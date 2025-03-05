import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Radio,
  Shield,
  Smartphone,
  Laptop,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";

interface Station {
  id: string;
  name: string;
  vehicles: number;
  officers: number;
  status: string;
}

interface EmergencyUnit {
  id: string;
  unit_name: string;
  unit_type: string;
  status: string;
  current_location: string;
  assigned_call_id: string | null;
}

interface EmergencyCall {
  id: string;
  call_time: string;
  caller_name: string | null;
  location: string;
  description: string;
  priority: string;
  status: string;
}

const ResourcesTab = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [emergencyUnits, setEmergencyUnits] = useState<EmergencyUnit[]>([]);
  const [emergencyCalls, setEmergencyCalls] = useState<EmergencyCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        // Fetch stations
        const { data: stationsData, error: stationsError } = await supabase
          .from("stations")
          .select("*");

        if (stationsError) throw stationsError;

        if (stationsData) {
          setStations(stationsData);
        }

        // Fetch emergency units
        const { data: unitsData, error: unitsError } = await supabase
          .from("emergency_units")
          .select("*");

        if (unitsError) throw unitsError;

        if (unitsData) {
          setEmergencyUnits(unitsData);
        }

        // Fetch emergency calls
        const { data: callsData, error: callsError } = await supabase
          .from("emergency_calls")
          .select("*")
          .order("call_time", { ascending: false })
          .limit(5);

        if (callsError) throw callsError;

        if (callsData) {
          setEmergencyCalls(callsData);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  const getTotalVehicles = () => {
    return stations.reduce((sum, station) => sum + station.vehicles, 0);
  };

  const getActiveUnits = () => {
    return emergencyUnits.filter((unit) => unit.status !== "maintenance")
      .length;
  };

  const getPendingCalls = () => {
    return emergencyCalls.filter((call) => call.status === "pending").length;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "available":
        return "bg-green-100 text-green-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
      case "unavailable":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Vehicles</CardTitle>
            <CardDescription>Available for deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getTotalVehicles()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Units</CardTitle>
            <CardDescription>Emergency response units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getActiveUnits()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Calls</CardTitle>
            <CardDescription>Awaiting response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getPendingCalls()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Response Units</CardTitle>
            <CardDescription>Current status and location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Loading units...
                      </TableCell>
                    </TableRow>
                  ) : emergencyUnits.length > 0 ? (
                    emergencyUnits.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {unit.unit_type === "Patrol" ? (
                              <Car className="h-4 w-4 mr-2" />
                            ) : (
                              <Shield className="h-4 w-4 mr-2" />
                            )}
                            {unit.unit_name}
                          </div>
                        </TableCell>
                        <TableCell>{unit.unit_type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(unit.status)}>
                            {unit.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                            {unit.current_location || "Unknown"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No emergency units found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Emergency Calls</CardTitle>
            <CardDescription>Latest emergency reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">Loading calls...</div>
              ) : emergencyCalls.length > 0 ? (
                emergencyCalls.map((call) => (
                  <div key={call.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{call.description}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDateTime(call.call_time)}
                          <span className="mx-1">•</span>
                          <MapPin className="h-3 w-3 mr-1" />
                          {call.location}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(call.priority)}>
                          {call.priority}
                        </Badge>
                        <Badge className={getStatusColor(call.status)}>
                          {call.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Caller:</span>{" "}
                        {call.caller_name || "Anonymous"}
                      </p>
                      {call.status === "assigned" ? (
                        <p className="text-sm mt-1">
                          <span className="font-medium">Assigned Unit:</span>{" "}
                          {emergencyUnits.find(
                            (unit) => unit.assigned_call_id === call.id,
                          )?.unit_name || "Unknown"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No emergency calls found
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => (window.location.href = "/admin/emergency")}
            >
              View All Emergency Calls
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory</CardTitle>
          <CardDescription>
            Current status of department equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-medium">Patrol Vehicles</h3>
                </div>
                <Badge variant="outline">25 Units</Badge>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Operational</span>
                  <span className="font-medium">20</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "80%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Maintenance</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Radio className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-medium">Communication Devices</h3>
                </div>
                <Badge variant="outline">60 Units</Badge>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Operational</span>
                  <span className="font-medium">55</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "92%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Maintenance</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: "8%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-medium">Mobile Devices</h3>
                </div>
                <Badge variant="outline">40 Units</Badge>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Operational</span>
                  <span className="font-medium">38</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "95%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Maintenance</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: "5%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Laptop className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-medium">Computers</h3>
                </div>
                <Badge variant="outline">30 Units</Badge>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Operational</span>
                  <span className="font-medium">28</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "93%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Maintenance</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: "7%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 border rounded-md bg-yellow-50">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Maintenance Alerts</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>
                      Vehicle maintenance due for patrol cars #103, #156, and
                      #178
                    </span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>
                      Radio equipment battery replacement needed for 5 units
                    </span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>
                      Computer system updates completed for all stations
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => (window.location.href = "/admin/inventory")}
          >
            View Complete Inventory
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesTab;
