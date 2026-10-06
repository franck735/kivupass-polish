import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useSearchParams } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
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
import { ProfilePage } from "@/components/dashboard/ProfilePage";
import { Menu } from "lucide-react";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ["dashboard", "users", "tickets", "events", "finance", "validation", "requests", "messages", "notifications", "settings", "profile"];
  const [activeTab, setActiveTab] = useState(() => {
    const requestedTab = searchParams.get("tab");
    return requestedTab && validTabs.includes(requestedTab) ? requestedTab : "dashboard";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setSearchParams(tab === "dashboard" ? {} : { tab }, { replace: true });
  };

  if (authLoading || roleLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!user || role !== "owner") return <Navigate to="/dashboard" replace />;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard onOpenProfile={() => changeTab("profile")} />;
      case "users": return <AdminUsers />;
      case "tickets": return <AdminTickets />;
      case "events": return <AdminEvents />;
      case "finance": return <AdminFinance />;
      case "validation": return <AdminValidationLog />;
      case "requests": return <AdminRequests />;
      case "messages": return <AdminMessages />;
      case "notifications": return <AdminNotifications />;
      case "settings": return <AdminSettings />;
      case "profile": return <ProfilePage />;
      default: return <AdminDashboard onOpenProfile={() => changeTab("profile")} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7f8]">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <AdminSidebar activeTab={activeTab} onTabChange={(t) => { changeTab(t); setSidebarOpen(false); }} open={sidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground"><Menu size={24} /></button>
          <span className="font-syne font-bold text-primary text-lg">KivuPass Admin</span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Admin;
