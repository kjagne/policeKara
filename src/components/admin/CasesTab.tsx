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
import { Search, Filter, FileText, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Case {
  id: string;
  title: string;
  status: string;
  dateCreated: string;
  lastUpdated: string;
  assignedOfficers: string[];
}

const CasesTab = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("cases").select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedCases = data.map((item) => ({
            id: item.id,
            title: item.title,
            status: item.status,
            dateCreated: new Date(item.date_created).toLocaleDateString(),
            lastUpdated: new Date(item.last_updated).toLocaleDateString(),
            assignedOfficers:
              typeof item.assigned_officers === "string"
                ? JSON.parse(item.assigned_officers)
                : item.assigned_officers || [],
          }));
          setCases(formattedCases);
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch = caseItem.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "closed":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "default";
    }
  };

  const getCasesByStatus = (status: string) => {
    return cases.filter((caseItem) => caseItem.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Open Cases</CardTitle>
            <CardDescription>Active investigations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getCasesByStatus("open")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Cases</CardTitle>
            <CardDescription>Awaiting further action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {getCasesByStatus("pending")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Closed Cases</CardTitle>
            <CardDescription>Resolved investigations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {getCasesByStatus("closed")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Management</CardTitle>
          <CardDescription>
            Overview of all department cases and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases by title..."
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
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Assigned Officers</TableHead>
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
                        {caseItem.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{caseItem.title}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(caseItem.status)}>
                          {caseItem.status.charAt(0).toUpperCase() +
                            caseItem.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{caseItem.dateCreated}</TableCell>
                      <TableCell>{caseItem.lastUpdated}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {caseItem.assignedOfficers.map((officer, index) => (
                            <Badge key={index} variant="outline">
                              {officer}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
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
    </div>
  );
};

export default CasesTab;
