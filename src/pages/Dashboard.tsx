import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  switch (role) {
    case "owner": return <Navigate to="/dashboard/admin" replace />;
    case "organizer": return <Navigate to="/dashboard/organizer" replace />;
    default: return <Navigate to="/dashboard/participant" replace />;
  }
};

export default Dashboard;
