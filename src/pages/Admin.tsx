import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminTickets } from "@/components/admin/AdminTickets";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { AdminRequests } from "@/components/admin/AdminRequests";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminFinance } from "@/components/admin/AdminFinance";
import { AdminValidationLog } from "@/components/admin/AdminValidationLog";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "owner" }).then(({ data }) => {
      setIsOwner(!!data);
    });
  }, [user]);

  if (authLoading || isOwner === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!user || !isOwner) return <Navigate to="/" replace />;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard />;
      case "users": return <AdminUsers />;
      case "tickets": return <AdminTickets />;
      case "events": return <AdminEvents />;
      case "finance": return <AdminFinance />;
      case "validation": return <AdminValidationLog />;
      case "requests": return <AdminRequests />;
      case "messages": return <AdminMessages />;
      case "notifications": return <AdminNotifications />;
      case "settings": return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <AdminSidebar activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setSidebarOpen(false); }} open={sidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground"><Menu size={24} /></button>
          <span className="font-syne font-bold text-primary text-lg">KivuPass Admin</span>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Admin;
