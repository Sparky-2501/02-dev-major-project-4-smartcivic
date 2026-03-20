import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ReportPage from "./pages/ReportPage";
import CommunityPage from "./pages/CommunityPage";
import MapPage from "./pages/MapPage";
import TrackingPage from "./pages/TrackingPage";
import AuthPage from "./pages/AuthPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="dark">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/tracking" element={<TrackingPage />} />

              {/* Role-based dashboards */}
              <Route path="/citizen-dashboard" element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <CitizenDashboard />
                </ProtectedRoute>
              } />
              <Route path="/report" element={
                <ProtectedRoute allowedRoles={["citizen", "admin"]}>
                  <ReportPage />
                </ProtectedRoute>
              } />
              <Route path="/authority-dashboard" element={
                <ProtectedRoute allowedRoles={["authority"]}>
                  <AuthorityDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Legacy redirect */}
              <Route path="/authority" element={<Navigate to="/authority-dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
