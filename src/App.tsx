import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AdminDashboard from "./components/admin/AdminDashboard";
import OfficerDashboard from "./components/dashboard/OfficerDashboard";
import AnalystDashboard from "./components/dashboard/AnalystDashboard";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/officers" element={<AdminDashboard />} />
            <Route path="/admin/cases" element={<AdminDashboard />} />
            <Route path="/admin/personnel" element={<AdminDashboard />} />
            <Route path="/admin/resources" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<AdminDashboard />} />

            {/* Officer Routes */}
            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="/officer/cases" element={<OfficerDashboard />} />
            <Route path="/officer/roster" element={<OfficerDashboard />} />
            <Route path="/officer/reports" element={<OfficerDashboard />} />

            {/* Analyst Routes */}
            <Route path="/analyst" element={<AnalystDashboard />} />
            <Route path="/analyst/statistics" element={<AnalystDashboard />} />
            <Route path="/analyst/prediction" element={<AnalystDashboard />} />
            <Route path="/analyst/reports" element={<AnalystDashboard />} />
            <Route path="/analyst/analysis" element={<AnalystDashboard />} />

            {/* Add the Tempo routes path */}
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" element={<div />} />
            )}
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
