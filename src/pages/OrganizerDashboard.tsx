import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { OrganizerSidebar } from "@/components/organizer/OrganizerSidebar";
import { OrganizerEvents } from "@/components/organizer/OrganizerEvents";
import { OrganizerSales } from "@/components/organizer/OrganizerSales";
import { OrganizerValidation } from "@/components/organizer/OrganizerValidation";
import { OrganizerAttendees } from "@/components/organizer/OrganizerAttendees";
import { OrganizerMessages } from "@/components/organizer/OrganizerMessages";
import { OrganizerProfile } from "@/components/organizer/OrganizerProfile";
import { CreateEvent } from "@/components/dashboard/CreateEvent";
import { Menu } from "lucide-react";

const OrganizerDashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("events");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/" replace />;

  const renderContent = () => {
    switch (activeTab) {
      case "events": return <OrganizerEvents />;
      case "create": return <CreateEvent />;
      case "sales": return <OrganizerSales />;
      case "validate": return <OrganizerValidation />;
      case "attendees": return <OrganizerAttendees />;
      case "messages": return <OrganizerMessages />;
      case "profile": return <OrganizerProfile />;
      default: return <OrganizerEvents />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <OrganizerSidebar activeTab={activeTab} onTabChange={setActiveTab} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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

export default OrganizerDashboard;
