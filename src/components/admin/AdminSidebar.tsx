import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Ticket, CalendarDays, FileText, MessageSquare, Settings, LogOut, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "tickets", label: "Billets", icon: Ticket },
  { id: "events", label: "Événements", icon: CalendarDays },
  { id: "requests", label: "Demandes", icon: FileText },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Paramètres", icon: Settings },
];

interface Props { activeTab: string; onTabChange: (tab: string) => void; open: boolean; }

export const AdminSidebar = ({ activeTab, onTabChange, open }: Props) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className={cn(
      "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
      open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="px-6 py-5 border-b border-border">
        <span className="font-syne font-extrabold text-xl text-primary tracking-tight">KivuPass</span>
        <p className="text-xs text-muted-foreground mt-0.5">Panel Admin</p>
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
      <div className="p-3 border-t border-border space-y-1">
        <button onClick={() => navigate("/dashboard")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <Home size={18} />Dashboard
        </button>
        <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut size={18} />Déconnexion
        </button>
      </div>
    </aside>
  );
};
