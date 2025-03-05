import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import OfficerDashboard from "./components/dashboard/OfficerDashboard";
import AnalystDashboard from "./components/dashboard/AnalystDashboard";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/officer/*" element={<OfficerDashboard />} />
          <Route path="/analyst/*" element={<AnalystDashboard />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={<div>Tempo Routes</div>} />
          )}
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
