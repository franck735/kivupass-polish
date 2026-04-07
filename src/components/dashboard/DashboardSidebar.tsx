import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Ticket, CalendarDays, UserCircle, MessageSquare, PlusCircle, LogOut, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "tickets", label: "Mes Billets", icon: Ticket },
  { id: "events", label: "Événements", icon: CalendarDays },
  { id: "create", label: "Créer Billetterie", icon: PlusCircle },
  { id: "profile", label: "Mon Profil", icon: UserCircle },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  open: boolean;
}

export const DashboardSidebar = ({ activeTab, onTabChange, open }: Props) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <span className="font-syne font-extrabold text-xl text-primary tracking-tight">KivuPass</span>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Home size={18} />
          Accueil
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};
