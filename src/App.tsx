import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import HeroEditor from "./pages/admin/HeroEditor";
import AboutEditor from "./pages/admin/AboutEditor";
import ServicesManager from "./pages/admin/ServicesManager";
import RegionsManager from "./pages/admin/RegionsManager";
import StationsManager from "./pages/admin/StationsManager";
import PartnersManager from "./pages/admin/PartnersManager";
import MessagesInbox from "./pages/admin/MessagesInbox";
import AdminSettings from "./pages/admin/AdminSettings";
import SiteSettingsPage from "./pages/admin/SiteSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/hero" element={<ProtectedRoute><HeroEditor /></ProtectedRoute>} />
          <Route path="/admin/about" element={<ProtectedRoute><AboutEditor /></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute><ServicesManager /></ProtectedRoute>} />
          <Route path="/admin/regions" element={<ProtectedRoute><RegionsManager /></ProtectedRoute>} />
          <Route path="/admin/stations" element={<ProtectedRoute><StationsManager /></ProtectedRoute>} />
          <Route path="/admin/partners" element={<ProtectedRoute><PartnersManager /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute><MessagesInbox /></ProtectedRoute>} />
          <Route path="/admin/site-settings" element={<ProtectedRoute><SiteSettingsPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
