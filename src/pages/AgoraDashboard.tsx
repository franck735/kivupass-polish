import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AgoraSidebar } from "@/components/agora/AgoraSidebar";
import { AgoraHome } from "@/components/agora/AgoraHome";
import { AgoraProfile } from "@/components/agora/AgoraProfile";
import { AgoraNotifications } from "@/components/agora/AgoraNotifications";
import { ParticipantExplore } from "@/components/participant/ParticipantExplore";
import { ParticipantTickets } from "@/components/participant/ParticipantTickets";
import { ParticipantOrders } from "@/components/participant/ParticipantOrders";
import { CreateEvent } from "@/components/dashboard/CreateEvent";
import { OrganizerEvents } from "@/components/organizer/OrganizerEvents";
import { OrganizerRequests } from "@/components/organizer/OrganizerRequests";
import { OrganizerSales } from "@/components/organizer/OrganizerSales";
import { OrganizerValidation } from "@/components/organizer/OrganizerValidation";
import { OrganizerAttendees } from "@/components/organizer/OrganizerAttendees";
import { OrganizerMessages } from "@/components/organizer/OrganizerMessages";
import {
  AGORA_SECTION_DEFAULT_TAB,
  AGORA_SECTION_TABS,
  AGORA_TAB_META,
  getAgoraSection,
  type AgoraSectionId,
  type AgoraTabId,
} from "@/lib/agora";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AgoraDashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AgoraTabId>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  const activeSection = getAgoraSection(activeTab);
  const activeMeta = AGORA_TAB_META[activeTab];

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <AgoraHome onNavigate={setActiveTab} />;
      case "tickets":
        return <ParticipantTickets />;
      case "orders":
        return <ParticipantOrders />;
      case "create":
        return <CreateEvent />;
      case "events":
        return <OrganizerEvents />;
      case "requests":
        return <OrganizerRequests />;
      case "sales":
        return <OrganizerSales />;
      case "validate":
        return <OrganizerValidation />;
      case "attendees":
        return <OrganizerAttendees />;
      case "messages":
        return <OrganizerMessages />;
      case "notifications":
        return <AgoraNotifications />;
      case "profile":
        return <AgoraProfile />;
      case "explore":
      default:
        return <ParticipantExplore />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AgoraSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu size={24} />
          </button>
          <span className="font-syne text-lg font-bold text-primary">KivuPass Agora</span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mb-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">Agora</p>
              <h1 className="mt-1 font-syne text-2xl font-bold text-foreground md:text-3xl">{activeMeta.title}</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">{activeMeta.description}</p>
            </div>

            <Tabs
              value={activeSection}
              onValueChange={(value) => setActiveTab(AGORA_SECTION_DEFAULT_TAB[value as AgoraSectionId])}
              className="w-full"
            >
              <TabsList className="grid h-auto w-full max-w-2xl grid-cols-3 rounded-xl bg-muted/70 p-1">
                {AGORA_SECTION_TABS.map((section) => (
                  <TabsTrigger key={section.id} value={section.id} className="rounded-lg px-3 py-2.5">
                    {section.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AgoraDashboard;
