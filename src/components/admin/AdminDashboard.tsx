import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentOverview from "./DepartmentOverview";
import CasesTab from "./CasesTab";
import PersonnelTab from "./PersonnelTab";
import ResourcesTab from "./ResourcesTab";
import { FileText, Users, Briefcase, TrendingUp } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="w-full h-full bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto px-4">
            <TabsList className="h-16">
              <TabsTrigger value="overview" className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Department Overview
              </TabsTrigger>
              <TabsTrigger value="cases" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Cases
              </TabsTrigger>
              <TabsTrigger value="personnel" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Personnel
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                Resources
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <TabsContent value="overview" className="mt-0">
            <DepartmentOverview />
          </TabsContent>

          <TabsContent value="cases" className="mt-0">
            <CasesTab />
          </TabsContent>

          <TabsContent value="personnel" className="mt-0">
            <PersonnelTab />
          </TabsContent>

          <TabsContent value="resources" className="mt-0">
            <ResourcesTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
