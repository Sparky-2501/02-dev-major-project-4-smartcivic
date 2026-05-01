import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MagneticCursor } from "@/components/MagneticCursor";
import { AnimatePresence, motion } from "framer-motion";
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
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

// ─── Page transition wrapper ───────────────────────────────────────────────
// Intentionally subtle — just a gentle fade so we don't fight each page's
// own internal entry animations (especially the elaborate HomePage hero).
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: "easeIn" }
  }
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated routes (must be inside BrowserRouter) ───────────────────────
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* ── PUBLIC ──────────────────────────────────────────────────── */}
        <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />

        {/* ── AUTH REQUIRED ───────────────────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["citizen", "authority", "admin"]}>
            <PageWrapper><DashboardPage /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute allowedRoles={["citizen", "authority", "admin"]}>
            <PageWrapper><CommunityPage /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute allowedRoles={["citizen", "authority", "admin"]}>
            <PageWrapper><MapPage /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/tracking" element={
          <ProtectedRoute allowedRoles={["citizen", "authority", "admin"]}>
            <PageWrapper><TrackingPage /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* ── ROLE-BASED DASHBOARDS ────────────────────────────────────── */}
        <Route path="/citizen-dashboard" element={
          <ProtectedRoute allowedRoles={["citizen"]}>
            <PageWrapper><CitizenDashboard /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute allowedRoles={["citizen", "admin"]}>
            <PageWrapper><ReportPage /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/authority-dashboard" element={
          <ProtectedRoute allowedRoles={["authority"]}>
            <PageWrapper><AuthorityDashboard /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PageWrapper><AdminDashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* ── PROFILE ─────────────────────────────────────────────────── */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={["citizen", "authority", "admin"]}>
            <PageWrapper><ProfilePage /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* ── LEGACY / FALLBACK ────────────────────────────────────────── */}
        <Route path="/authority" element={<Navigate to="/authority-dashboard" replace />} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

// ─── Root app ──────────────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="dark">
            <MagneticCursor />
            <Navbar />
            <AnimatedRoutes />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
