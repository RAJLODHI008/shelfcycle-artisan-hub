import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StoreDashboard from "./pages/StoreDashboard";
import MakerPortal from "./pages/MakerPortal";
import AdminDashboard from "./pages/AdminDashboard";
import CreateLot from "./pages/CreateLot";
import MakerOnboarding from "./pages/MakerOnboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/store-dashboard" element={
              <ProtectedRoute requiredRole="store_staff">
                <StoreDashboard />
              </ProtectedRoute>
            } />
            <Route path="/maker-portal" element={
              <ProtectedRoute requiredRole="maker">
                <MakerPortal />
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/lots/create" element={
              <ProtectedRoute requiredRole="store_staff">
                <CreateLot />
              </ProtectedRoute>
            } />
            <Route path="/maker-onboarding" element={
              <ProtectedRoute requiredRole="maker">
                <MakerOnboarding />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
