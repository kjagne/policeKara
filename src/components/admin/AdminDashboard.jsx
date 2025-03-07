import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentOverview from "./DepartmentOverview";
import CasesTab from "./CasesTab";
import OfficerManagement from "./OfficerManagement";
import ResourcesTab from "./ResourcesTab";
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  Settings,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="w-full h-full bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <div className="container mx-auto px-4">
            <TabsList className="h-14">
              <TabsTrigger value="overview" className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
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
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
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
            <OfficerManagement />
          </TabsContent>

          <TabsContent value="resources" className="mt-0">
            <ResourcesTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">System Settings</h3>
                <p className="mt-2 text-muted-foreground">
                  System settings and configuration options will be available
                  here.
                </p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
