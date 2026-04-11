import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ParticipantSidebar } from "@/components/participant/ParticipantSidebar";
import { ParticipantTickets } from "@/components/participant/ParticipantTickets";
import { ParticipantExplore } from "@/components/participant/ParticipantExplore";
import { ParticipantOrders } from "@/components/participant/ParticipantOrders";
import { ParticipantProfile } from "@/components/participant/ParticipantProfile";
import { ParticipantNotifications } from "@/components/participant/ParticipantNotifications";
import { Menu } from "lucide-react";

const ParticipantDashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("tickets");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/" replace />;

  const renderContent = () => {
    switch (activeTab) {
      case "tickets": return <ParticipantTickets />;
      case "events": return <ParticipantExplore />;
      case "orders": return <ParticipantOrders />;
      case "profile": return <ParticipantProfile />;
      case "notifications": return <ParticipantNotifications />;
      default: return <ParticipantTickets />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <ParticipantSidebar activeTab={activeTab} onTabChange={setActiveTab} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground"><Menu size={24} /></button>
          <span className="font-syne font-bold text-primary text-lg">KivuPass</span>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
