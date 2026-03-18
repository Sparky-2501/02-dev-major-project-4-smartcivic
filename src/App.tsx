import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ReportPage from "./pages/ReportPage";
import CommunityPage from "./pages/CommunityPage";
import AuthorityPage from "./pages/AuthorityPage";
import MapPage from "./pages/MapPage";
import TrackingPage from "./pages/TrackingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="dark">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/authority" element={<AuthorityPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
