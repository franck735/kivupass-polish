import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, Bell, CalendarDays, CircleDollarSign, FileText, Search, Ticket, Users, UserRound } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props { onOpenProfile: () => void }
type TicketRow = { id: string; event_title?: string; owner_name?: string; owner_email?: string; price?: number; currency?: string; payment_status?: string; purchased_at?: string; created_at?: string };

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
const formatMoney = (amount: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

export const AdminDashboard = ({ onOpenProfile }: Props) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, tickets: 0, events: 0, revenue: 0 });
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [avatar, setAvatar] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [{ count: userCount }, { count: ticketCount }, { count: eventCount }, { data: allTickets }, { data: profile }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("tickets").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("tickets").select("*"),
        user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
      ]);
      if (!active) return;
      const rows = (allTickets || []) as TicketRow[];
      const approved = rows.filter((ticket) => ticket.payment_status === "approved");
      const revenue = approved.reduce((sum, ticket) => sum + (Number(ticket.price) || 0), 0);
      setStats({ users: userCount || 0, tickets: ticketCount || 0, events: eventCount || 0, revenue });
      setTickets(rows.sort((a, b) => new Date(b.purchased_at || b.created_at || 0).getTime() - new Date(a.purchased_at || a.created_at || 0).getTime()));
      setAvatar(profile?.avatar_url || "");
      setDisplayName(profile?.name || user?.full_name || user?.email || "Administrateur");
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, [user]);

  const chartData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1));
    return months.map((month) => {
      const label = new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(month).replace(".", "");
      const inMonth = tickets.filter((ticket) => {
        const value = ticket.purchased_at || ticket.created_at;
        if (!value) return false;
        const date = new Date(value);
        return monthKey(date) === monthKey(month);
      });
      return { month: label, revenus: inMonth.filter((ticket) => ticket.payment_status === "approved").reduce((sum, ticket) => sum + (Number(ticket.price) || 0), 0), billets: inMonth.length };
    });
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("fr");
    return tickets.filter((ticket) => !term || `${ticket.event_title || ""} ${ticket.owner_name || ""} ${ticket.owner_email || ""}`.toLocaleLowerCase("fr").includes(term)).slice(0, 6);
  }, [tickets, query]);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  const kpis = [
    { label: "Utilisateurs", value: stats.users.toLocaleString("fr-FR"), note: "Comptes inscrits", icon: Users },
    { label: "Billets vendus", value: stats.tickets.toLocaleString("fr-FR"), note: "Toutes commandes", icon: Ticket },
    { label: "Événements", value: stats.events.toLocaleString("fr-FR"), note: "Dans la plateforme", icon: CalendarDays },
    { label: "Revenus confirmés", value: formatMoney(stats.revenue), note: "Paiements approuvés", icon: CircleDollarSign },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-medium text-slate-400">KivuPass <span className="mx-1">/</span> Administration</p><h1 className="mt-1 font-syne text-2xl font-bold tracking-tight text-slate-900">Vue d’ensemble</h1><p className="mt-1 text-sm text-slate-500">Suivez l’activité de votre billetterie en un coup d’œil.</p></div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button type="button" aria-label="Notifications" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50"><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" /></button>
          <button type="button" onClick={onOpenProfile} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-left transition hover:bg-slate-50">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound size={18} />}</span>
            <span className="max-w-36"><span className="block truncate text-xs font-semibold text-slate-800">{displayName}</span><span className="block text-[10px] text-slate-500">Administrateur</span></span>
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4" aria-label="Indicateurs clés">
        {kpis.map(({ label, value, note, icon: Icon }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,.025)]">
          <div className="flex items-start justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f4f1] text-[#278e83]"><Icon size={18} /></span></div>
          <p className="mt-3 font-syne text-[28px] font-bold leading-none text-slate-900">{value}</p><p className="mt-2 text-[11px] text-slate-400">{note}</p>
        </article>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,.025)] sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-syne text-base font-bold text-slate-900">Revenus et ventes</h2><p className="mt-1 text-xs text-slate-500">Activité des six derniers mois</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5f2] px-2.5 py-1 text-[10px] font-semibold text-[#278e83]"><span className="h-1.5 w-1.5 rounded-full bg-[#278e83]" /> Revenus confirmés</span></div>
          {tickets.length === 0 ? <div className="flex h-[240px] items-center justify-center rounded-xl bg-slate-50 text-center"><div><p className="text-sm font-medium text-slate-600">Les statistiques apparaîtront ici</p><p className="mt-1 text-xs text-slate-400">Dès que les premiers billets seront enregistrés.</p></div></div> : <div className="h-[240px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}><defs><linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#278e83" stopOpacity={0.22} /><stop offset="95%" stopColor="#278e83" stopOpacity={0.015} /></linearGradient></defs><CartesianGrid stroke="#edf1f3" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#8a96a3", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8a96a3", fontSize: 10 }} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7ecef", fontSize: 12 }} formatter={(value: number) => [formatMoney(value), "Revenus"]} /><Area type="monotone" dataKey="revenus" stroke="#278e83" strokeWidth={2.5} fill="url(#adminRevenueFill)" activeDot={{ r: 5, fill: "#278e83", stroke: "white", strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div>}
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,.025)] sm:p-6">
          <div className="flex items-start justify-between"><div><h2 className="font-syne text-base font-bold text-slate-900">Activité des billets</h2><p className="mt-1 text-xs text-slate-500">Répartition des paiements</p></div><span className="rounded-xl bg-slate-100 p-2 text-slate-500"><FileText size={17} /></span></div>
          <div className="mt-5 space-y-5">{[{ label: "Approuvés", value: tickets.filter((ticket) => ticket.payment_status === "approved").length, color: "bg-[#278e83]" }, { label: "En attente", value: tickets.filter((ticket) => ticket.payment_status === "pending").length, color: "bg-[#a4c9c1]" }, { label: "Refusés", value: tickets.filter((ticket) => ticket.payment_status === "rejected").length, color: "bg-slate-300" }].map((item) => <div key={item.label}><div className="mb-2 flex justify-between text-xs"><span className="text-slate-500">{item.label}</span><span className="font-semibold text-slate-800">{item.value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${tickets.length ? Math.max(item.value / tickets.length * 100, item.value ? 4 : 0) : 0}%` }} /></div></div>)}</div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs text-slate-500">Total des billets</span><span className="font-syne text-lg font-bold text-slate-900">{stats.tickets}</span></div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,.025)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="font-syne text-base font-bold text-slate-900">Transactions récentes</h2><p className="mt-1 text-xs text-slate-500">Derniers billets créés sur la plateforme</p></div><label className="relative block w-full sm:max-w-[250px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher…" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-primary focus:bg-white" /></label></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400"><th className="px-6 py-3">Événement</th><th className="px-4 py-3">Participant</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Montant</th><th className="px-6 py-3 text-right">Statut</th></tr></thead>
            <tbody>{visibleTickets.map((ticket) => { const status = ticket.payment_status || "pending"; const dateValue = ticket.purchased_at || ticket.created_at; return <tr key={ticket.id} className="border-t border-slate-100 transition hover:bg-slate-50/60"><td className="px-6 py-3.5"><span className="font-semibold text-slate-800">{ticket.event_title || "Billet événement"}</span><span className="mt-1 block text-[10px] text-slate-400">#{ticket.id.slice(0, 8)}</span></td><td className="px-4 py-3.5 text-slate-600">{ticket.owner_name || ticket.owner_email || "Participant"}</td><td className="px-4 py-3.5 text-slate-500">{dateValue ? new Date(dateValue).toLocaleDateString("fr-FR") : "—"}</td><td className="px-4 py-3.5 font-semibold text-slate-800">{Number(ticket.price || 0).toLocaleString("fr-FR")} {ticket.currency || "USD"}</td><td className="px-6 py-3.5 text-right"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${status === "approved" ? "bg-[#e8f5f0] text-[#22836f]" : status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`}>{status === "approved" ? "Approuvé" : status === "rejected" ? "Refusé" : "En attente"}</span></td></tr>; })}</tbody>
          </table>
          {visibleTickets.length === 0 && <div className="px-6 py-10 text-center"><p className="text-sm font-medium text-slate-600">{tickets.length ? "Aucun résultat pour cette recherche." : "Aucune transaction pour le moment."}</p><p className="mt-1 text-xs text-slate-400">Les nouveaux billets apparaîtront dans cette liste.</p></div>}
        </div>
        <button type="button" onClick={onOpenProfile} className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-3 text-xs font-semibold text-[#278e83] transition hover:bg-slate-50">Gérer mon profil <ArrowUpRight size={14} /></button>
      </section>
    </div>
  );
};
