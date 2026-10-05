import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Bell, Menu, Plus, Search, UserRound } from "lucide-react";
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
import { AGORA_MENU_SECTIONS, AGORA_TAB_META, type AgoraTabId } from "@/lib/agora";

const AgoraDashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AgoraTabId>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  const activeMeta = AGORA_TAB_META[activeTab];
  const searchResults = quickSearch.trim()
    ? AGORA_MENU_SECTIONS.flatMap((section) => section.items).filter((item) => item.label.toLocaleLowerCase("fr").includes(quickSearch.trim().toLocaleLowerCase("fr"))).slice(0, 5)
    : [];

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
    <div className="flex min-h-screen bg-slate-50/80">
      <AgoraSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
          <button aria-label="Ouvrir la navigation" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-foreground hover:bg-muted">
            <Menu size={24} />
          </button>
          <span className="font-syne text-lg font-bold text-foreground">Kivu<span className="text-primary">Pass</span></span>
        </header>
        <main className="min-w-0 flex-1 overflow-auto">
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-border bg-white/95 px-6 py-4 backdrop-blur md:flex xl:px-10">
            <div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">KivuPass <span className="mx-1 text-slate-300">/</span> Agora</p><h1 className="mt-1 truncate font-syne text-xl font-bold text-foreground">{activeMeta.title}</h1></div>
            <div className="relative mx-6 hidden max-w-sm flex-1 lg:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={quickSearch} onChange={(event) => setQuickSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && searchResults[0]) { setActiveTab(searchResults[0].id); setQuickSearch(""); } if (event.key === "Escape") setQuickSearch(""); }} placeholder="Rechercher dans Agora" aria-label="Rechercher une page Agora" className="h-10 w-full rounded-xl border border-border bg-slate-50/70 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
              {searchResults.length > 0 && <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-lg">{searchResults.map((item) => <button key={item.id} onClick={() => { setActiveTab(item.id); setQuickSearch(""); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"><item.icon size={16} className="text-primary" />{item.label}</button>)}</div>}
            </div>
            <div className="ml-4 flex shrink-0 items-center gap-2">
              <button aria-label="Ouvrir les notifications" onClick={() => setActiveTab("notifications")} className="relative rounded-xl border border-border p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"><Bell size={18} /></button>
              <button onClick={() => setActiveTab("profile")} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"><UserRound size={16} className="text-primary" /><span className="max-w-32 truncate">{user.full_name || user.email}</span></button>
              <button onClick={() => setActiveTab("create")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"><Plus size={16} />Créer un événement</button>
            </div>
          </header>
          <div className="mx-auto w-full max-w-[1500px] p-4 md:p-6 lg:p-8 xl:px-10">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default AgoraDashboard;
