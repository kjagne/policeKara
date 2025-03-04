import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import LoginForm from "./auth/LoginForm";
import AdminDashboard from "./dashboard/AdminDashboard";
import OfficerDashboard from "./dashboard/OfficerDashboard";
import AnalystDashboard from "./dashboard/AnalystDashboard";
import { useAuth } from "@/context/AuthContext";
import { signIn, signOut } from "@/lib/auth";

const Home = () => {
  const { user, signIn, signOut } = useAuth();
  const [userRole, setUserRole] = React.useState<
    "admin" | "officer" | "analyst" | null
  >(null);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (values: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    setIsLoading(true);
    setError("");

    try {
      // Actual authentication with Supabase
      const { session, user } = await signIn(values.email, values.password);

      // Get user role from user metadata or a separate profile table
      // For now, we'll determine role based on email as before
      if (values.email.includes("admin")) {
        setUserRole("admin");
      } else if (values.email.includes("officer")) {
        setUserRole("officer");
      } else if (values.email.includes("analyst")) {
        setUserRole("analyst");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error.message ||
          "Invalid credentials. Try admin@example.com, officer@example.com, or analyst@example.com",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUserRole(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Render the appropriate dashboard based on user role
  if (user && userRole) {
    switch (userRole) {
      case "admin":
        return <AdminDashboard userName="Admin User" />;
      case "officer":
        return <OfficerDashboard officerName="Officer Smith" />;
      case "analyst":
        return <AnalystDashboard userName="Analyst Johnson" />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Police Management System</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a href="#" className="hover:underline">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Help
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome to the Police Management System
              </h2>
              <p className="mt-4 text-muted-foreground">
                A comprehensive platform for law enforcement agencies to manage
                operations, track cases, and analyze crime data.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="font-medium">Admin Dashboard</div>
                <p className="text-sm text-muted-foreground">
                  Manage officers, stations, and system configuration
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="font-medium">Officer Portal</div>
                <p className="text-sm text-muted-foreground">
                  Handle cases, manage evidence, and submit reports
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="font-medium">Analyst Tools</div>
                <p className="text-sm text-muted-foreground">
                  Analyze crime data and generate insights
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="font-medium">Secure Access</div>
                <p className="text-sm text-muted-foreground">
                  Role-based permissions and data protection
                </p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>For demo purposes, use these credentials:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>admin@example.com (Admin access)</li>
                <li>officer@example.com (Officer access)</li>
                <li>analyst@example.com (Analyst access)</li>
                <li>Password: password123 (for all accounts)</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center text-sm">
          <p>© 2023 Police Management System. All rights reserved.</p>
          <p className="mt-2">
            This is a demo application for illustration purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
