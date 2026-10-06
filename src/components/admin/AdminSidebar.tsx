import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Ticket, CalendarDays, FileText, MessageSquare, Settings, LogOut, Home, DollarSign, QrCode, Bell, UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_SPACE_NAME } from "@/lib/spaces";
import { supabase } from "@/integrations/supabase/client";

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
  { id: "profile", label: "Mon profil", icon: UserRound },
];

interface Props { activeTab: string; onTabChange: (tab: string) => void; open: boolean; }

export const AdminSidebar = ({ activeTab, onTabChange, open }: Props) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    const loadPending = () => supabase.from("tickets").select("id", { count: "exact", head: true }).eq("payment_status", "pending")
      .then(({ count }) => setPendingPayments(count || 0));
    loadPending();
    const channel = supabase.channel("admin-pending-ticket-requests").on("postgres_changes", {
      event: "INSERT", schema: "public", table: "tickets",
    }, loadPending).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <aside className={cn(
      "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#182128] border-r border-[#29343b] flex flex-col transition-transform duration-300 text-slate-100",
      open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="border-b border-white/10 px-5 py-6">
        <span className="font-syne text-xl font-extrabold tracking-tight text-white">Kivu<span className="text-[#65c4b8]">Pass</span></span>
        <p className="mt-1 text-xs text-slate-400">Espace administration</p>
        <span className="mt-3 inline-flex rounded-full border border-[#65c4b8]/25 bg-[#65c4b8]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.15em] text-[#9fe0d6]">{ADMIN_SPACE_NAME}</span>
      </div>
      <p className="px-5 pb-1 pt-6 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Gestion</p>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => onTabChange(item.id)} className={cn(
            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors",
            activeTab === item.id ? "bg-[#65c4b8] text-[#102728] shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-white"
          )}>
            <item.icon size={18} />
            {item.label}
            {item.id === "tickets" && pendingPayments > 0 && <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{pendingPayments > 99 ? "99+" : pendingPayments}</span>}
          </button>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
          <Home size={18} /> Accueil
        </button>
        <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-300 transition-colors hover:bg-rose-400/10">
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </aside>
  );
};
