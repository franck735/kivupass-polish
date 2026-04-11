import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { CalendarDays, DollarSign, QrCode, Users, MessageSquare, User, Home, LogOut, PlusCircle } from "lucide-react";

const menuItems = [
  { id: "events", label: "Mes Événements", icon: CalendarDays },
  { id: "create", label: "Créer un événement", icon: PlusCircle },
  { id: "sales", label: "Ventes & Revenus", icon: DollarSign },
  { id: "validate", label: "Valider les billets", icon: QrCode },
  { id: "attendees", label: "Participants", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "profile", label: "Mon Profil", icon: User },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  open: boolean;
  onClose: () => void;
}

export const OrganizerSidebar = ({ activeTab, onTabChange, open, onClose }: Props) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-0 h-screen w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-sidebar-border">
          <h2 className="font-syne font-bold text-lg text-primary">KivuPass</h2>
          <p className="text-xs text-muted-foreground mt-1 truncate">{user?.email}</p>
          <span className="inline-block mt-1 text-[10px] uppercase tracking-wider bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-semibold">Organisateur</span>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <Home size={18} /> Accueil
          </button>
          <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};
