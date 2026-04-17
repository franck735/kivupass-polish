import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense, lazy } from 'react';
const Index = lazy(() => import("./pages/Index.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const AgoraDashboard = lazy(() => import("./pages/AgoraDashboard.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
import { RoleGuard } from "@/components/shared/RoleGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
<BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/dashboard/agora"
                element={
                  <RoleGuard allowedRoles={["agora"]}>
                    <AgoraDashboard />
                  </RoleGuard>
                }
              />
              <Route path="/dashboard/participant" element={<Navigate to="/dashboard/agora" replace />} />
              <Route path="/dashboard/organizer" element={<Navigate to="/dashboard/agora" replace />} />
              <Route
                path="/dashboard/admin"
                element={
                  <RoleGuard allowedRoles={["owner"]}>
                    <Admin />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin"
                element={
                  <RoleGuard allowedRoles={["owner"]}>
                    <Admin />
                  </RoleGuard>
                }
              />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
