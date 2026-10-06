import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowDownToLine, ArrowRight, Bell, CalendarDays, ChevronDown,
  CircleDollarSign, Clock3, Plus, Search, ShoppingBag, Ticket, TicketCheck,
  TrendingUp, Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { AgoraTabId } from "@/lib/agora";

interface AgoraHomeProps { onNavigate: (tab: AgoraTabId) => void }
type Row = Record<string, any>;
const money = (value: number, currency: string) => `${value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} ${currency}`;
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const shortDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
};

const AgoraHome = ({ onNavigate }: AgoraHomeProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Row[]>([]);
  const [ownedTickets, setOwnedTickets] = useState<Row[]>([]);
  const [orders, setOrders] = useState<Row[]>([]);
  const [requests, setRequests] = useState<Row[]>([]);
  const [notifications, setNotifications] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([
      supabase.from("events").select("*").eq("organizer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("tickets").select("*").eq("owner_id", user.id),
      supabase.from("tickets").select("*").eq("organizer_id", user.id),
      supabase.from("pub_requests").select("*").eq("organizer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]).then(([eventRows, ownedRows, orderRows, requestRows, notificationRows]) => {
      if (!active) return;
      setEvents(eventRows.data || []);
      setOwnedTickets(ownedRows.data || []);
      setOrders(orderRows.data || []);
      setRequests(requestRows.data || []);
      setNotifications(notificationRows.data || []);
      setLoading(false);
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const confirmedOrders = useMemo(() => orders.filter((order) => order.payment_status === "approved"), [orders]);
  const activeTickets = ownedTickets.filter((ticket) => ticket.payment_status === "approved" && !ticket.validated).length;
  const pendingOrders = orders.filter((order) => order.payment_status === "pending").length;
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const pendingRequests = requests.filter((request) => request.status === "pending").length;
  const publishedEvents = events.filter((event) => event.approved).length;

  const revenueByCurrency = useMemo(() => confirmedOrders.reduce<Record<string, number>>((totals, order) => {
    const currency = order.currency || "USD";
    totals[currency] = (totals[currency] || 0) + Number(order.price || 0);
    return totals;
  }, {}), [confirmedOrders]);

  const salesByEvent = useMemo(() => {
    const counts = confirmedOrders.reduce<Record<string, number>>((totals, order) => {
      const eventId = order.event_id || order.event_title || "unknown";
      totals[eventId] = (totals[eventId] || 0) + 1;
      return totals;
    }, {});
    return events.map((event) => ({ ...event, sold: counts[event.id] || 0 })).sort((a, b) => b.sold - a.sold).slice(0, 4);
  }, [confirmedOrders, events]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setHours(12, 0, 0, 0);
      day.setDate(day.getDate() - (6 - index));
      return { key: dateKey(day), label: new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(day).replace(".", ""), orders: 0, entries: 0 };
    });
    const daysByKey = Object.fromEntries(days.map((day) => [day.key, day]));
    for (const order of confirmedOrders) {
      const key = String(order.purchased_at || order.created_at || "").slice(0, 10);
      if (daysByKey[key]) {
        daysByKey[key].orders += 1;
        if (order.validated) daysByKey[key].entries += 1;
      }
    }
    return days;
  }, [confirmedOrders]);

  const filteredOrders = useMemo(() => orders
    .filter((order) => orderFilter === "all" || order.payment_status === orderFilter)
    .filter((order) => !search.trim() || `${order.event_title || ""} ${order.owner_name || ""} ${order.owner_email || ""} ${order.tx_ref || order.transaction_id || ""}`.toLocaleLowerCase("fr").includes(search.trim().toLocaleLowerCase("fr")))
    .sort((a, b) => String(b.purchased_at || b.created_at || "").localeCompare(String(a.purchased_at || a.created_at || "")))
    .slice(0, 8), [orders, orderFilter, search]);

  const exportOrders = () => {
    const rows = [["Billet", "Événement", "Acheteur", "Date", "Montant", "Devise", "Statut"], ...filteredOrders.map((order) => [order.id, order.event_title, order.owner_name || order.owner_email, order.purchased_at || order.created_at, order.price, order.currency, order.payment_status])];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "commandes-kivupass.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex min-h-80 items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  const displayName = user?.full_name?.trim().split(/\s+/)[0] || "";
  const statusStyle: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/15",
    rejected: "bg-rose-50 text-rose-700 ring-rose-600/15",
  };
  const statusLabel: Record<string, string> = { approved: "Confirmée", pending: "En attente", rejected: "Refusée" };

  return <div className="space-y-6">
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="text-sm font-medium text-muted-foreground">{new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</p><h2 className="mt-1 font-syne text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{displayName ? `Bonjour ${displayName}` : "Bienvenue dans Agora"}</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">Retrouvez vos ventes, vos événements et les commandes de billets depuis cet aperçu.</p></div>
      <Button onClick={() => onNavigate("create")} className="h-11 shrink-0 gap-2 rounded-xl px-5 shadow-sm"><Plus size={17} />Créer un événement</Button>
    </section>

    <section aria-label="Indicateurs clés" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={CircleDollarSign} label="Ventes confirmées" value={Object.keys(revenueByCurrency).length ? Object.entries(revenueByCurrency).map(([currency, value]) => money(value, currency)).join(" · ") : "0 USD"} note={`${confirmedOrders.length} billet${confirmedOrders.length === 1 ? "" : "s"} payé${confirmedOrders.length === 1 ? "" : "s"}`} tone="gold" />
      <StatCard icon={ShoppingBag} label="Commandes à traiter" value={String(pendingOrders)} note="Paiements en attente de validation" tone="blue" onClick={() => { setOrderFilter("pending"); document.getElementById("recent-orders")?.scrollIntoView({ behavior: "smooth" }); }} />
      <StatCard icon={TicketCheck} label="Billets actifs" value={String(activeTickets)} note="Billets approuvés non utilisés" tone="green" onClick={() => onNavigate("tickets")} />
      <StatCard icon={CalendarDays} label="Événements publiés" value={String(publishedEvents)} note={pendingRequests ? `${pendingRequests} demande${pendingRequests === 1 ? "" : "s"} en cours` : `${events.length} événement${events.length === 1 ? "" : "s"} au total`} tone="violet" onClick={() => onNavigate("events")} />
    </section>

    <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-display text-base font-bold text-slate-900">Ventes sur la semaine</h3><p className="mt-1 text-sm text-muted-foreground">Billets payés et entrées validées</p></div><span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"><TrendingUp size={14} className="text-primary" />7 derniers jours</span></div>
        <div className="mt-5 h-[230px] w-full" role="img" aria-label="Graphique du nombre de billets payés et entrées validées sur les sept derniers jours"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}><defs><linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient><linearGradient id="entriesGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#64748b" stopOpacity={0.13} /><stop offset="95%" stopColor="#64748b" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e8edf3" strokeDasharray="4 4" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#8792a2", fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#8792a2", fontSize: 11 }} /><Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", boxShadow: "0 8px 24px rgba(15,23,42,.08)" }} /><Area type="monotone" dataKey="orders" name="Billets payés" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#ordersGradient)" /><Area type="monotone" dataKey="entries" name="Entrées validées" stroke="#64748b" strokeWidth={2} fill="url(#entriesGradient)" /></AreaChart></ResponsiveContainer></div>
        <div className="mt-2 flex flex-wrap gap-5 text-xs text-slate-600"><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-primary" />Billets payés</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-slate-500" />Entrées validées</span></div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-base font-bold text-slate-900">Événements les plus vendus</h3><p className="mt-1 text-sm text-muted-foreground">Billets confirmés par événement</p></div><button onClick={() => onNavigate("events")} className="rounded-lg p-2 text-muted-foreground hover:bg-slate-50 hover:text-foreground" aria-label="Voir tous les événements"><ArrowRight size={17} /></button></div>
        {salesByEvent.length ? <div className="mt-5 space-y-1">{salesByEvent.map((event, index) => <div key={event.id} className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${index === 0 ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"}`}><Ticket size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{event.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{shortDate(event.date)} · {event.category || "Événement"}</p></div><div className="text-right"><p className="text-sm font-bold text-slate-800">{event.sold}</p><p className="text-[11px] text-muted-foreground">billets</p></div></div>)}</div> : <EmptyPanel icon={Ticket} title="Pas encore de ventes" description="Les billets confirmés apparaîtront ici." action="Créer un événement" onAction={() => onNavigate("create")} />}
      </div>
    </section>

    <section id="recent-orders" className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h3 className="font-display text-base font-bold text-slate-900">Commandes récentes</h3><p className="mt-1 text-sm text-muted-foreground">Consultez les paiements transmis pour vos événements.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une commande" aria-label="Rechercher une commande" className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary sm:w-56" /></label><div className="relative"><select aria-label="Filtrer les commandes par statut" value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-border bg-white pl-3 pr-9 text-sm text-slate-700 outline-none focus:border-primary sm:w-40"><option value="all">Tous les statuts</option><option value="approved">Confirmées</option><option value="pending">En attente</option><option value="rejected">Refusées</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" /></div><button onClick={exportOrders} disabled={!filteredOrders.length} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ArrowDownToLine size={15} />Exporter CSV</button></div></div>
      {filteredOrders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[740px] text-left text-sm"><thead><tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><th className="px-6 py-3">Événement</th><th className="px-4 py-3">Acheteur</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Montant</th><th className="px-6 py-3">Paiement</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredOrders.map((order) => <tr key={order.id} className="transition hover:bg-slate-50/70"><td className="px-6 py-4"><p className="max-w-60 truncate font-semibold text-slate-800">{order.event_title || "Billet KivuPass"}</p><p className="mt-0.5 font-mono text-[10px] text-muted-foreground">#{String(order.id).slice(0, 8)}</p></td><td className="px-4 py-4"><p className="max-w-44 truncate text-slate-700">{order.owner_name || order.owner_email || "Participant"}</p></td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{shortDate(order.purchased_at || order.created_at)}</td><td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">{money(Number(order.price || 0), order.currency || "USD")}</td><td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle[order.payment_status] || "bg-slate-100 text-slate-600 ring-slate-500/10"}`}>{statusLabel[order.payment_status] || order.payment_status || "Inconnue"}</span></td></tr>)}</tbody></table></div> : <div className="px-6 py-10 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">{orders.length ? "Aucune commande ne correspond aux filtres." : "Aucune commande pour le moment."}</p><p className="mt-1 text-sm text-muted-foreground">Les achats de billets s’afficheront ici.</p></div>}
      {orders.length > filteredOrders.length && <div className="border-t border-border px-6 py-3 text-center"><button onClick={() => onNavigate("sales")} className="text-sm font-semibold text-primary hover:underline">Voir toutes les ventes</button></div>}
    </section>

    <section className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
      <QuickCard icon={Ticket} title="Mes billets" description={`${activeTickets} billet${activeTickets === 1 ? "" : "s"} actif${activeTickets === 1 ? "" : "s"}`} action="Ouvrir les billets" onClick={() => onNavigate("tickets")} />
      <QuickCard icon={Users} title="Validation à l’entrée" description="Scannez un QR code et contrôlez le billet." action="Ouvrir le scanner" onClick={() => onNavigate("validate")} />
      <QuickCard icon={Bell} title="Notifications" description={unreadNotifications ? `${unreadNotifications} notification${unreadNotifications === 1 ? "" : "s"} non lue${unreadNotifications === 1 ? "" : "s"}` : "Vous êtes à jour."} action="Voir les notifications" onClick={() => onNavigate("notifications")} />
    </section>

    {pendingRequests > 0 && <button onClick={() => onNavigate("requests")} className="flex w-full items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900 transition hover:bg-amber-100"><span className="inline-flex items-center gap-2"><Clock3 size={16} />{pendingRequests} demande{pendingRequests === 1 ? "" : "s"} d’événement en attente</span><ArrowRight size={16} /></button>}
    <div className="sr-only" aria-live="polite">{ownedTickets.filter((ticket) => ticket.payment_status === "approved").length} billets achetés</div>
  </div>;
};

function StatCard({ icon: Icon, label, value, note, tone, onClick }: { icon: typeof Ticket; label: string; value: string; note: string; tone: string; onClick?: () => void }) {
  const tones: Record<string, string> = { gold: "bg-amber-50 text-amber-700", blue: "bg-sky-50 text-sky-700", green: "bg-emerald-50 text-emerald-700", violet: "bg-violet-50 text-violet-700" };
  const Wrapper = onClick ? "button" : "div";
  return <Wrapper onClick={onClick} className={`rounded-2xl border border-border bg-white p-5 text-left shadow-sm ${onClick ? "w-full transition hover:-translate-y-0.5 hover:shadow-md" : ""}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 break-words font-display text-2xl font-bold leading-tight text-slate-900">{value}</p></div><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={19} /></span></div><p className="mt-3 text-xs text-slate-500">{note}</p></Wrapper>;
}

function QuickCard({ icon: Icon, title, description, action, onClick }: { icon: typeof Ticket; title: string; description: string; action: string; onClick: () => void }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={18} /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-slate-800">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p><button onClick={onClick} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">{action}<ArrowRight size={13} /></button></div></div>;
}

function EmptyPanel({ icon: Icon, title, description, action, onAction }: { icon: typeof Ticket; title: string; description: string; action: string; onAction: () => void }) {
  return <div className="flex flex-col items-center px-3 py-9 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400"><Icon size={20} /></span><p className="mt-3 text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p><button onClick={onAction} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">{action}<ArrowRight size={13} /></button></div>;
}

export { AgoraHome };
