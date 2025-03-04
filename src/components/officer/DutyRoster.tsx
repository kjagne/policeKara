import React, { useState } from "react";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
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
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  CalendarIcon,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ShiftEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: "regular" | "overtime" | "special";
  location: string;
}

interface TimeOffRequest {
  id: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const DutyRoster = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [showTimeOffDialog, setShowTimeOffDialog] = useState<boolean>(false);
  const [timeOffReason, setTimeOffReason] = useState<string>("");
  const [timeOffStartDate, setTimeOffStartDate] = useState<Date | undefined>(
    new Date(),
  );
  const [timeOffEndDate, setTimeOffEndDate] = useState<Date | undefined>(
    new Date(),
  );

  // Mock data for shifts
  const mockShifts: ShiftEvent[] = [
    {
      id: "1",
      title: "Morning Patrol",
      date: new Date(),
      startTime: "08:00",
      endTime: "16:00",
      type: "regular",
      location: "Downtown District",
    },
    {
      id: "2",
      title: "Evening Patrol",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      startTime: "16:00",
      endTime: "00:00",
      type: "regular",
      location: "North District",
    },
    {
      id: "3",
      title: "Special Event Security",
      date: new Date(new Date().setDate(new Date().getDate() + 3)),
      startTime: "10:00",
      endTime: "18:00",
      type: "special",
      location: "City Hall",
    },
    {
      id: "4",
      title: "Night Shift",
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      startTime: "00:00",
      endTime: "08:00",
      type: "overtime",
      location: "South District",
    },
  ];

  // Mock data for time off requests
  const mockTimeOffRequests: TimeOffRequest[] = [
    {
      id: "1",
      startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      reason: "Annual leave",
      status: "approved",
    },
    {
      id: "2",
      startDate: new Date(new Date().setDate(new Date().getDate() + 20)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 21)),
      reason: "Family event",
      status: "pending",
    },
  ];

  const handlePreviousMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    setDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    setDate(newDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleTimeOffSubmit = () => {
    // In a real application, this would submit the time off request to an API
    console.log("Time off request submitted", {
      startDate: timeOffStartDate,
      endDate: timeOffEndDate,
      reason: timeOffReason,
    });
    setShowTimeOffDialog(false);
    setTimeOffReason("");
  };

  // Filter shifts for the selected date
  const shiftsForSelectedDate = selectedDate
    ? mockShifts.filter(
        (shift) => shift.date.toDateString() === selectedDate.toDateString(),
      )
    : [];

  return (
    <div className="w-full h-full bg-background p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Duty Roster</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button variant="outline" onClick={handleNextMonth}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Dialog
              open={showTimeOffDialog}
              onOpenChange={setShowTimeOffDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Request Time Off
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Time Off</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Start Date</label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                          >
                            {timeOffStartDate ? (
                              timeOffStartDate.toLocaleDateString()
                            ) : (
                              <span>Select start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={timeOffStartDate}
                            onSelect={setTimeOffStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">End Date</label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                          >
                            {timeOffEndDate ? (
                              timeOffEndDate.toLocaleDateString()
                            ) : (
                              <span>Select end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={timeOffEndDate}
                            onSelect={setTimeOffEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Reason</label>
                    <textarea
                      className="col-span-3 p-2 border rounded-md"
                      rows={3}
                      value={timeOffReason}
                      onChange={(e) => setTimeOffReason(e.target.value)}
                      placeholder="Please provide a reason for your time off request"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowTimeOffDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleTimeOffSubmit}>Submit Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Calendar</CardTitle>
                <CardDescription>
                  View your upcoming shifts and time off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })
                    : "Select a date"}
                </CardTitle>
                <CardDescription>Shifts for selected date</CardDescription>
              </CardHeader>
              <CardContent>
                {shiftsForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {shiftsForSelectedDate.map((shift) => (
                      <div
                        key={shift.id}
                        className="flex items-start space-x-4 p-3 border rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-full ${shift.type === "regular" ? "bg-blue-100" : shift.type === "overtime" ? "bg-amber-100" : "bg-purple-100"}`}
                        >
                          <Clock
                            className={`h-5 w-5 ${shift.type === "regular" ? "text-blue-600" : shift.type === "overtime" ? "text-amber-600" : "text-purple-600"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{shift.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {shift.startTime} - {shift.endTime}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {shift.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No shifts scheduled for this date
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Time Off Requests</CardTitle>
                <CardDescription>
                  Your pending and approved time off
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockTimeOffRequests.length > 0 ? (
                  <div className="space-y-4">
                    {mockTimeOffRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-start space-x-4 p-3 border rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-full ${request.status === "approved" ? "bg-green-100" : request.status === "rejected" ? "bg-red-100" : "bg-gray-100"}`}
                        >
                          {request.status === "approved" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : request.status === "rejected" ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <CalendarDays className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{request.reason}</h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${request.status === "approved" ? "bg-green-100 text-green-800" : request.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.startDate.toLocaleDateString()} -{" "}
                            {request.endDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No time off requests
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowTimeOffDialog(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DutyRoster;
