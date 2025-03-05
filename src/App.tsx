import { Suspense } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import Home from "./components/home";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import OfficerDashboard from "./components/dashboard/OfficerDashboard";
import AnalystDashboard from "./components/dashboard/AnalystDashboard";
import DepartmentOverview from "./components/admin/DepartmentOverview";
import OfficerManagement from "./components/admin/OfficerManagement";
import StationManagement from "./components/admin/StationManagement";
import SystemConfiguration from "./components/admin/SystemConfiguration";
import EmergencyResponseDashboard from "./components/admin/EmergencyResponseDashboard";
import PersonalStats from "./components/officer/PersonalStats";
import CaseManagement from "./components/officer/CaseManagement";
import DutyRoster from "./components/officer/DutyRoster";
import Reports from "./components/officer/Reports";
import CrimeStatistics from "./components/analyst/CrimeStatistics";
import AICrimePrediction from "./components/analyst/AICrimePrediction";
import ReportGeneration from "./components/analyst/ReportGeneration";
import DataAnalysis from "./components/analyst/DataAnalysis";
import { AuthProvider } from "./context/AuthContext";
import routes from "./tempo-routes";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<DepartmentOverview />} />
            <Route path="officers" element={<OfficerManagement />} />
            <Route path="stations" element={<StationManagement />} />
            <Route path="emergency" element={<EmergencyResponseDashboard />} />
            <Route path="config" element={<SystemConfiguration />} />
          </Route>

          {/* Officer Routes */}
          <Route path="/officer" element={<OfficerDashboard />}>
            <Route index element={<PersonalStats />} />
            <Route path="cases" element={<CaseManagement />} />
            <Route path="roster" element={<DutyRoster />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Analyst Routes */}
          <Route path="/analyst" element={<AnalystDashboard />}>
            <Route index element={<CrimeStatistics />} />
            <Route path="statistics" element={<CrimeStatistics />} />
            <Route path="prediction" element={<AICrimePrediction />} />
            <Route path="reports" element={<ReportGeneration />} />
            <Route path="analysis" element={<DataAnalysis />} />
          </Route>

          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
