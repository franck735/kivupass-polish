import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Ticket, CalendarDays, FileText, MessageSquare, Settings, LogOut, Home, DollarSign, QrCode, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_SPACE_NAME } from "@/lib/spaces";

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "events", label: "Événements", icon: CalendarDays },
  { id: "tickets", label: "Billets", icon: Ticket },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "validation", label: "Journal validation", icon: QrCode },
  { id: "requests", label: "Demandes", icon: FileText },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Paramètres", icon: Settings },
];

interface Props { activeTab: string; onTabChange: (tab: string) => void; open: boolean; }

export const AdminSidebar = ({ activeTab, onTabChange, open }: Props) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className={cn(
      "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col transition-transform duration-300",
      open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="px-6 py-5 border-b border-sidebar-border">
        <span className="font-syne font-extrabold text-xl text-primary tracking-tight">KivuPass</span>
        <p className="text-xs text-muted-foreground mt-0.5">Espace administration</p>
        <span className="inline-block mt-1 text-[10px] uppercase tracking-wider bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-semibold">{ADMIN_SPACE_NAME}</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => onTabChange(item.id)} className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            activeTab === item.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}>
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <Home size={18} /> Accueil
        </button>
        <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </aside>
  );
};
