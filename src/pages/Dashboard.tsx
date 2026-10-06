import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, error: roleError } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roleError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <section className="max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-syne text-xl font-bold text-foreground">Connexion à l’espace impossible</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{roleError}</p>
          <button onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Réessayer</button>
        </section>
      </main>
    );
  }

  switch (role) {
    case "owner": return <Navigate to="/dashboard/admin" replace />;
    default: return <Navigate to="/dashboard/agora" replace />;
  }
};

export default Dashboard;
