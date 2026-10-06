import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Component, Suspense, lazy, type ErrorInfo, type ReactNode } from 'react';
const Index = lazy(() => import("./pages/Index.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const AgoraDashboard = lazy(() => import("./pages/AgoraDashboard.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
import { RoleGuard } from "@/components/shared/RoleGuard";

class ApplicationErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("KivuPass a rencontré une erreur d’affichage :", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><section className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="font-syne text-xl font-bold text-slate-900">La page n’a pas pu s’afficher</h1><p className="mt-2 text-sm leading-6 text-slate-600">Une erreur temporaire a interrompu le chargement. Rechargez la plateforme pour reprendre.</p><button onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Recharger la page</button></section></main>;
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
<ApplicationErrorBoundary><BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/dashboard/agora"
                element={
                  <RoleGuard allowedRoles={["organizer", "participant"]}>
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
        </BrowserRouter></ApplicationErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
