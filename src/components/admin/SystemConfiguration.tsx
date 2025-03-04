import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Users,
  Bell,
  Lock,
  Globe,
  Database,
  Settings,
  Save,
} from "lucide-react";

interface SystemConfigurationProps {
  initialTab?: string;
}

const SystemConfiguration = ({
  initialTab = "general",
}: SystemConfigurationProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">
            Manage system-wide settings and preferences
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 gap-4 w-full mb-8">
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            User Permissions
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department Name</label>
                  <Input defaultValue="Metro Police Department" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">System Title</label>
                  <Input defaultValue="Police Management System" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Default Timezone
                  </label>
                  <Select defaultValue="utc-8">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-5">
                        Eastern Time (UTC-5)
                      </SelectItem>
                      <SelectItem value="utc-6">
                        Central Time (UTC-6)
                      </SelectItem>
                      <SelectItem value="utc-7">
                        Mountain Time (UTC-7)
                      </SelectItem>
                      <SelectItem value="utc-8">
                        Pacific Time (UTC-8)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <Select defaultValue="mm-dd-yyyy">
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      When enabled, only administrators can access the system
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Debug Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed error logging for troubleshooting
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure system security options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all user accounts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password Rotation</h4>
                    <p className="text-sm text-muted-foreground">
                      Require password changes every 90 days
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Session Timeout (minutes)
                </label>
                <Input type="number" defaultValue="30" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Password Complexity
                </label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (8+ characters)</SelectItem>
                    <SelectItem value="medium">
                      Medium (8+ chars, mixed case, numbers)
                    </SelectItem>
                    <SelectItem value="high">
                      High (12+ chars, mixed case, numbers, symbols)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">IP Restriction</h4>
                    <p className="text-sm text-muted-foreground">
                      Limit access to specific IP addresses
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
              <CardDescription>
                Configure role-based access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Administrator Role</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Full System Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">User Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Configuration Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Audit Log Access</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Officer Role</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Case Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Evidence Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Report Creation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <span className="text-sm">View All Cases</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Analyst Role</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Data Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Report Generation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Crime Statistics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">AI Prediction Tools</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Send system alerts via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Send urgent alerts via SMS
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">In-App Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Show notifications within the application
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Default Notification Email
                </label>
                <Input type="email" defaultValue="admin@metropd.gov" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Alert Frequency</label>
                <Select defaultValue="immediate">
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
              <CardDescription>
                Configure external system connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">National Criminal Database</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect to federal criminal records
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input type="password" defaultValue="••••••••••••••••" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endpoint URL</label>
                    <Input defaultValue="https://api.ncdb.gov/v2" />
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Vehicle Registration System</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect to DMV database
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input type="password" defaultValue="••••••••••••••••" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endpoint URL</label>
                    <Input defaultValue="https://api.dmv.gov/vehicles" />
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Court Management System</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect to judicial case management
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input type="password" placeholder="Enter API key" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endpoint URL</label>
                    <Input placeholder="Enter endpoint URL" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Configure database settings and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Database Type</label>
                  <Select defaultValue="postgres">
                    <SelectTrigger>
                      <SelectValue placeholder="Select database type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgres">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="mssql">
                        Microsoft SQL Server
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Connection String
                  </label>
                  <Input type="password" defaultValue="••••••••••••••••" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Automatic Backups</h4>
                    <p className="text-sm text-muted-foreground">
                      Schedule regular database backups
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Backup Frequency</label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Select backup frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Backup Retention (days)
                </label>
                <Input type="number" defaultValue="30" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Encryption</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable encryption for sensitive data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline">
                  <Lock className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
                <Button variant="destructive">Run Manual Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfiguration;
