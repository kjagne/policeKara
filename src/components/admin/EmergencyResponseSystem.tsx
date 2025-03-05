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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Truck,
  User,
} from "lucide-react";

const EmergencyResponseSystem = () => {
  const [emergencyCalls, setEmergencyCalls] = useState([]);
  const [emergencyUnits, setEmergencyUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewCallOpen, setIsNewCallOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCall, setSelectedCall] = useState(null);
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);

  useEffect(() => {
    fetchEmergencyCalls();
    fetchEmergencyUnits();

    // Set up real-time subscription for emergency calls
    const callsSubscription = supabase
      .channel("emergency_calls_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emergency_calls" },
        (payload) => {
          console.log("Emergency calls change received:", payload);
          fetchEmergencyCalls();
        },
      )
      .subscribe();

    // Set up real-time subscription for emergency units
    const unitsSubscription = supabase
      .channel("emergency_units_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emergency_units" },
        (payload) => {
          console.log("Emergency units change received:", payload);
          fetchEmergencyUnits();
        },
      )
      .subscribe();

    // Clean up subscriptions on component unmount
    return () => {
      supabase.removeChannel(callsSubscription);
      supabase.removeChannel(unitsSubscription);
    };
  }, []);

  const fetchEmergencyCalls = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("emergency_calls")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setEmergencyCalls(data);
      }
    } catch (error) {
      console.error("Error fetching emergency calls:", error);
      // For demo purposes, set mock data if database table doesn't exist
      setEmergencyCalls([
        {
          id: "EC-001",
          caller_name: "John Smith",
          phone_number: "555-123-4567",
          location: "123 Main St, Downtown",
          description: "Reported break-in at a convenience store",
          priority: "high",
          status: "pending",
          created_at: new Date().toISOString(),
        },
        {
          id: "EC-002",
          caller_name: "Mary Johnson",
          phone_number: "555-987-6543",
          location: "456 Oak Ave, Northside",
          description: "Traffic accident with injuries",
          priority: "high",
          status: "dispatched",
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: "EC-003",
          caller_name: "Robert Davis",
          phone_number: "555-456-7890",
          location: "789 Pine Rd, Westside",
          description: "Suspicious person in the neighborhood",
          priority: "medium",
          status: "pending",
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: "EC-004",
          caller_name: "Sarah Wilson",
          phone_number: "555-789-0123",
          location: "101 Elm St, Eastside",
          description: "Noise complaint from apartment building",
          priority: "low",
          status: "resolved",
          created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          resolved_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmergencyUnits = async () => {
    try {
      const { data, error } = await supabase
        .from("emergency_units")
        .select("*");

      if (error) throw error;

      if (data) {
        setEmergencyUnits(data);
      }
    } catch (error) {
      console.error("Error fetching emergency units:", error);
      // For demo purposes, set mock data if database table doesn't exist
      setEmergencyUnits([
        {
          id: "U-001",
          name: "Patrol Unit 1",
          type: "patrol",
          status: "available",
          location: "Downtown District",
          last_updated: new Date().toISOString(),
        },
        {
          id: "U-002",
          name: "Patrol Unit 2",
          type: "patrol",
          status: "responding",
          location: "En route to 456 Oak Ave",
          last_updated: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        },
        {
          id: "U-003",
          name: "Ambulance 1",
          type: "ambulance",
          status: "responding",
          location: "En route to 456 Oak Ave",
          last_updated: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        },
        {
          id: "U-004",
          name: "SWAT Team",
          type: "swat",
          status: "available",
          location: "Central Station",
          last_updated: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
      ]);
    }
  };

  const handleCreateEmergencyCall = async (callData) => {
    setIsLoading(true);
    try {
      // Generate a new ID
      const newId = `EC-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;

      const newCall = {
        id: newId,
        caller_name: callData.caller_name,
        phone_number: callData.phone_number,
        location: callData.location,
        description: callData.description,
        priority: callData.priority,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      // Try to insert into database
      try {
        const { data, error } = await supabase
          .from("emergency_calls")
          .insert([newCall])
          .select();

        if (error) throw error;
      } catch (dbError) {
        console.error("Database error, using local state instead:", dbError);
      }

      // Update local state
      setEmergencyCalls([newCall, ...emergencyCalls]);
      setIsNewCallOpen(false);
    } catch (error) {
      console.error("Error creating emergency call:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispatchUnits = async (callId, unitIds) => {
    setIsLoading(true);
    try {
      // Update call status in database
      try {
        const { error } = await supabase
          .from("emergency_calls")
          .update({ status: "dispatched" })
          .eq("id", callId);

        if (error) throw error;

        // Update unit status in database
        for (const unitId of unitIds) {
          const { error: unitError } = await supabase
            .from("emergency_units")
            .update({
              status: "responding",
              location: `En route to ${selectedCall?.location}`,
            })
            .eq("id", unitId);

          if (unitError) throw unitError;
        }
      } catch (dbError) {
        console.error("Database error, using local state instead:", dbError);
      }

      // Update local state
      setEmergencyCalls(
        emergencyCalls.map((call) =>
          call.id === callId ? { ...call, status: "dispatched" } : call,
        ),
      );

      setEmergencyUnits(
        emergencyUnits.map((unit) =>
          unitIds.includes(unit.id)
            ? {
                ...unit,
                status: "responding",
                location: `En route to ${selectedCall?.location}`,
                last_updated: new Date().toISOString(),
              }
            : unit,
        ),
      );

      setIsDispatchDialogOpen(false);
    } catch (error) {
      console.error("Error dispatching units:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveCall = async (callId) => {
    setIsLoading(true);
    try {
      const resolvedAt = new Date().toISOString();

      // Update call status in database
      try {
        const { error } = await supabase
          .from("emergency_calls")
          .update({
            status: "resolved",
            resolved_at: resolvedAt,
          })
          .eq("id", callId);

        if (error) throw error;
      } catch (dbError) {
        console.error("Database error, using local state instead:", dbError);
      }

      // Update local state
      setEmergencyCalls(
        emergencyCalls.map((call) =>
          call.id === callId
            ? { ...call, status: "resolved", resolved_at: resolvedAt }
            : call,
        ),
      );

      // Find units responding to this call and set them back to available
      const respondingUnits = emergencyUnits.filter(
        (unit) =>
          unit.status === "responding" &&
          unit.location.includes(selectedCall?.location || ""),
      );

      if (respondingUnits.length > 0) {
        try {
          for (const unit of respondingUnits) {
            const { error } = await supabase
              .from("emergency_units")
              .update({
                status: "available",
                location: "Returning to station",
                last_updated: new Date().toISOString(),
              })
              .eq("id", unit.id);

            if (error) throw error;
          }
        } catch (dbError) {
          console.error("Database error updating units:", dbError);
        }

        // Update local state for units
        setEmergencyUnits(
          emergencyUnits.map((unit) =>
            respondingUnits.some((ru) => ru.id === unit.id)
              ? {
                  ...unit,
                  status: "available",
                  location: "Returning to station",
                  last_updated: new Date().toISOString(),
                }
              : unit,
          ),
        );
      }

      setSelectedCall(null);
    } catch (error) {
      console.error("Error resolving call:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCalls = emergencyCalls.filter(
    (call) =>
      call.caller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const availableUnits = emergencyUnits.filter(
    (unit) => unit.status === "available",
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "dispatched":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "available":
        return "bg-green-100 text-green-800";
      case "responding":
        return "bg-blue-100 text-blue-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUnitTypeIcon = (type) => {
    switch (type) {
      case "patrol":
        return <Radio className="h-4 w-4" />;
      case "ambulance":
        return <Truck className="h-4 w-4" />;
      case "fire":
        return <AlertCircle className="h-4 w-4" />;
      case "swat":
        return <User className="h-4 w-4" />;
      default:
        return <Radio className="h-4 w-4" />;
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  const getTimeSince = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    return formatDate(isoString);
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Emergency Response System</h1>
          <p className="text-muted-foreground">
            Manage emergency calls and dispatch response units
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchEmergencyCalls}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isNewCallOpen} onOpenChange={setIsNewCallOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Emergency Call
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log New Emergency Call</DialogTitle>
                <DialogDescription>
                  Enter the details of the emergency call
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="caller-name" className="text-right">
                    Caller Name
                  </label>
                  <Input
                    id="caller-name"
                    placeholder="Enter caller's name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="phone-number" className="text-right">
                    Phone Number
                  </label>
                  <Input
                    id="phone-number"
                    placeholder="Enter phone number"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="location" className="text-right">
                    Location
                  </label>
                  <Input
                    id="location"
                    placeholder="Enter incident location"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="description" className="text-right">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe the emergency"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="priority" className="text-right">
                    Priority
                  </label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="priority" className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewCallOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const callerNameInput =
                      document.getElementById("caller-name");
                    const phoneNumberInput =
                      document.getElementById("phone-number");
                    const locationInput = document.getElementById("location");
                    const descriptionInput =
                      document.getElementById("description");
                    const prioritySelect =
                      document.querySelector('[id="priority"]');

                    const callData = {
                      caller_name: callerNameInput ? callerNameInput.value : "",
                      phone_number: phoneNumberInput
                        ? phoneNumberInput.value
                        : "",
                      location: locationInput ? locationInput.value : "",
                      description: descriptionInput
                        ? descriptionInput.value
                        : "",
                      priority:
                        prioritySelect && prioritySelect.textContent
                          ? prioritySelect.textContent
                          : "medium",
                    };

                    handleCreateEmergencyCall(callData);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Log Call"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active Emergencies</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="all">All Calls</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search active calls..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {
                    filteredCalls.filter((call) => call.status !== "resolved")
                      .length
                  }{" "}
                  active calls
                </div>
              </div>

              <div className="space-y-4">
                {filteredCalls
                  .filter((call) => call.status !== "resolved")
                  .map((call) => (
                    <Card
                      key={call.id}
                      className={`overflow-hidden transition-all ${selectedCall?.id === call.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setSelectedCall(call)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <CardTitle className="text-base">
                              {call.caller_name}
                            </CardTitle>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className={getPriorityColor(call.priority)}>
                              {call.priority} priority
                            </Badge>
                            <Badge className={getStatusColor(call.status)}>
                              {call.status}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {call.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm">{call.description}</p>
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeSince(call.created_at)}
                        </div>
                        <div>{call.id}</div>
                      </CardFooter>
                    </Card>
                  ))}

                {filteredCalls.filter((call) => call.status !== "resolved")
                  .length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p>No active emergency calls</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resolved calls..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {
                    filteredCalls.filter((call) => call.status === "resolved")
                      .length
                  }{" "}
                  resolved calls
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Caller</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls
                    .filter((call) => call.status === "resolved")
                    .map((call) => (
                      <TableRow
                        key={call.id}
                        onClick={() => setSelectedCall(call)}
                        className="cursor-pointer"
                      >
                        <TableCell>{call.id}</TableCell>
                        <TableCell>{call.caller_name}</TableCell>
                        <TableCell>{call.location}</TableCell>
                        <TableCell>
                          {formatDate(call.created_at)}{" "}
                          {formatTime(call.created_at)}
                        </TableCell>
                        <TableCell>
                          {call.resolved_at
                            ? `${formatDate(call.resolved_at)} ${formatTime(call.resolved_at)}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(call.priority)}>
                            {call.priority}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}

                  {filteredCalls.filter((call) => call.status === "resolved")
                    .length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No resolved calls found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search all calls..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredCalls.length} total calls
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Caller</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls.map((call) => (
                    <TableRow
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      className="cursor-pointer"
                    >
                      <TableCell>{call.id}</TableCell>
                      <TableCell>{call.caller_name}</TableCell>
                      <TableCell>{call.location}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(call.status)}>
                          {call.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(call.priority)}>
                          {call.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{getTimeSince(call.created_at)}</TableCell>
                    </TableRow>
                  ))}

                  {filteredCalls.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No calls found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          {selectedCall ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Emergency Details</CardTitle>
                  <Badge className={getStatusColor(selectedCall.status)}>
                    {selectedCall.status}
                  </Badge>
                </div>
                <CardDescription>Call ID: {selectedCall.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Caller Information</h3>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p>{selectedCall.caller_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p>{selectedCall.phone_number}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Location</h3>
                  <p className="mt-1">{selectedCall.location}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Description</h3>
                  <p className="mt-1">{selectedCall.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Priority</h3>
                    <Badge
                      className={`mt-1 ${getPriorityColor(selectedCall.priority)}`}
                    >
                      {selectedCall.priority}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Received</h3>
                    <p className="mt-1">
                      {formatTime(selectedCall.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(selectedCall.created_at)}
                    </p>
                  </div>
                </div>

                {selectedCall.status === "pending" && (
                  <div className="pt-4">
                    <Dialog
                      open={isDispatchDialogOpen}
                      onOpenChange={setIsDispatchDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Send className="mr-2 h-4 w-4" />
                          Dispatch Units
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Dispatch Response Units</DialogTitle>
                          <DialogDescription>
                            Select units to respond to this emergency
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <h3 className="text-sm font-medium mb-2">
                            Available Units
                          </h3>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {availableUnits.length > 0 ? (
                              availableUnits.map((unit) => (
                                <div
                                  key={unit.id}
                                  className="flex items-center space-x-2 p-2 border rounded-md"
                                >
                                  <input
                                    type="checkbox"
                                    id={`unit-${unit.id}`}
                                    className="h-4 w-4"
                                  />
                                  <label
                                    htmlFor={`unit-${unit.id}`}
                                    className="flex-1"
                                  >
                                    <div className="flex items-center">
                                      {getUnitTypeIcon(unit.type)}
                                      <span className="ml-2 font-medium">
                                        {unit.name}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {unit.location}
                                    </div>
                                  </label>
                                </div>
                              ))
                            ) : (
                              <p className="text-center py-4 text-muted-foreground">
                                No available units
                              </p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsDispatchDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              const selectedUnitIds = Array.from(
                                document.querySelectorAll(
                                  'input[type="checkbox"]:checked',
                                ),
                              ).map((el) => el.id.replace("unit-", ""));

                              if (selectedUnitIds.length === 0) {
                                alert(
                                  "Please select at least one unit to dispatch",
                                );
                                return;
                              }

                              handleDispatchUnits(
                                selectedCall.id,
                                selectedUnitIds,
                              );
                            }}
                            disabled={isLoading || availableUnits.length === 0}
                          >
                            {isLoading
                              ? "Processing..."
                              : "Dispatch Selected Units"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {selectedCall.status === "dispatched" && (
                  <div className="pt-4">
                    <Button
                      className="w-full"
                      onClick={() => handleResolveCall(selectedCall.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Mark as Resolved"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Response Units</CardTitle>
                <CardDescription>
                  Current status of all response units
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyUnits.map((unit) => (
                    <div key={unit.id} className="p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {getUnitTypeIcon(unit.type)}
                          <h3 className="font-medium ml-2">{unit.name}</h3>
                        </div>
                        <Badge className={getStatusColor(unit.status)}>
                          {unit.status}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">{unit.location}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {getTimeSince(unit.last_updated)}
                      </p>
                    </div>
                  ))}

                  {emergencyUnits.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No emergency units available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyResponseSystem;
