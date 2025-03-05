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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, UserPlus, Edit, Calendar, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Officer {
  id: string;
  badge_number: string;
  first_name: string;
  last_name: string;
  rank: string;
  status: string;
  station_id?: string;
  station_name?: string;
}

const PersonnelTab = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [stations, setStations] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rankFilter, setRankFilter] = useState("all");

  useEffect(() => {
    const fetchOfficers = async () => {
      setIsLoading(true);
      try {
        // First fetch stations to get names
        const { data: stationsData, error: stationsError } = await supabase
          .from("stations")
          .select("id, name");

        if (stationsError) throw stationsError;

        if (stationsData) {
          setStations(stationsData);
        }

        // Then fetch officers
        const { data, error } = await supabase.from("officers").select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          // Add station name to each officer
          const officersWithStationNames = data.map((officer) => {
            const station = stationsData?.find(
              (s) => s.id === officer.station_id,
            );
            return {
              ...officer,
              station_name: station?.name || "Unassigned",
            };
          });

          setOfficers(officersWithStationNames);
        }
      } catch (error) {
        console.error("Error fetching officers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  const filteredOfficers = officers.filter((officer) => {
    const fullName = `${officer.first_name} ${officer.last_name}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.badge_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRank =
      rankFilter === "all" || officer.rank.toLowerCase() === rankFilter;
    return matchesSearch && matchesRank;
  });

  const getOfficersByRank = (rank: string) => {
    return officers.filter(
      (officer) => officer.rank.toLowerCase() === rank.toLowerCase(),
    ).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Officers</CardTitle>
            <CardDescription>Active personnel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{officers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Inspectors</CardTitle>
            <CardDescription>Senior officers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {getOfficersByRank("Inspector")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Sergeants</CardTitle>
            <CardDescription>Mid-level officers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {getOfficersByRank("Sergeant")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Constables</CardTitle>
            <CardDescription>Junior officers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {getOfficersByRank("Constable")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Officer Management</CardTitle>
            <CardDescription>
              View and manage department personnel
            </CardDescription>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Officer
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search officers by name or badge number..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by rank" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranks</SelectItem>
                  <SelectItem value="inspector">Inspector</SelectItem>
                  <SelectItem value="sergeant">Sergeant</SelectItem>
                  <SelectItem value="constable">Constable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Badge Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Loading officers...
                    </TableCell>
                  </TableRow>
                ) : filteredOfficers.length > 0 ? (
                  filteredOfficers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell className="font-medium">
                        {officer.badge_number}
                      </TableCell>
                      <TableCell>
                        {officer.first_name} {officer.last_name}
                      </TableCell>
                      <TableCell>{officer.rank}</TableCell>
                      <TableCell>{officer.station_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            officer.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {officer.status.charAt(0).toUpperCase() +
                            officer.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calendar className="h-4 w-4" />
                            <span className="sr-only">Schedule</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Star className="h-4 w-4" />
                            <span className="sr-only">Performance</span>
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
                      No officers found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Duty Assignment</CardTitle>
            <CardDescription>Upcoming officer assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Morning Patrol - Serrekunda</h3>
                    <p className="text-sm text-muted-foreground">
                      July 5, 2023 • 06:00 - 14:00
                    </p>
                  </div>
                  <Badge>4 Officers</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">GPF-1001</Badge>
                  <Badge variant="outline">GPF-1003</Badge>
                  <Badge variant="outline">GPF-1005</Badge>
                  <Badge variant="outline">GPF-1007</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Evening Patrol - Banjul</h3>
                    <p className="text-sm text-muted-foreground">
                      July 5, 2023 • 14:00 - 22:00
                    </p>
                  </div>
                  <Badge>3 Officers</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">GPF-1002</Badge>
                  <Badge variant="outline">GPF-1004</Badge>
                  <Badge variant="outline">GPF-1006</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Night Patrol - Bakau</h3>
                    <p className="text-sm text-muted-foreground">
                      July 5, 2023 • 22:00 - 06:00
                    </p>
                  </div>
                  <Badge>2 Officers</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">GPF-1008</Badge>
                  <Badge variant="outline">GPF-1001</Badge>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => (window.location.href = "/admin/schedule")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              View Full Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Reviews</CardTitle>
            <CardDescription>Recent officer evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Fatou Ceesay</h3>
                    <p className="text-sm text-muted-foreground">
                      Quarterly Review • June 30, 2023
                    </p>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <Star className="h-4 w-4 text-yellow-400" />
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  Excellent performance in community policing initiatives.
                  Recommended for special recognition.
                </p>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Lamin Sanneh</h3>
                    <p className="text-sm text-muted-foreground">
                      Quarterly Review • June 28, 2023
                    </p>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <Star className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  Good performance overall. Needs improvement in report writing
                  and documentation.
                </p>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Isatou Touray</h3>
                    <p className="text-sm text-muted-foreground">
                      Quarterly Review • June 25, 2023
                    </p>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    {[4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  Satisfactory performance. Recommended for additional training
                  in investigative techniques.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => (window.location.href = "/admin/performance")}
            >
              <Star className="mr-2 h-4 w-4" />
              View All Performance Reviews
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonnelTab;
