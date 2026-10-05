import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { exportCSV } from "@/lib/csv";
import { ArrowDownToLine, ArrowUpRight, CircleDollarSign, Clock3, Search, Ticket, WalletCards } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type FinanceTicket = { id: string; event_title?: string; owner_name?: string; owner_email?: string; price?: number; currency?: string; payment_status?: string; purchased_at?: string; created_at?: string };
const COLORS = ["#278e83", "#93c9bd", "#d8e5e1"];
const getDate = (ticket: FinanceTicket) => ticket.purchased_at || ticket.created_at;
const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
const money = (amount: number) => `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const AdminFinance = () => {
  const [tickets, setTickets] = useState<FinanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let active = true;
    supabase.from("tickets").select("*").order("purchased_at", { ascending: false }).then(({ data }) => {
      if (!active) return;
      setTickets((data || []) as FinanceTicket[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const approved = useMemo(() => tickets.filter((ticket) => ticket.payment_status === "approved"), [tickets]);
  const pending = useMemo(() => tickets.filter((ticket) => ticket.payment_status === "pending"), [tickets]);
  const grossRevenue = approved.reduce((sum, ticket) => sum + (Number(ticket.price) || 0), 0);
  const commissions = grossRevenue * 0.15;
  const pendingAmount = pending.reduce((sum, ticket) => sum + (Number(ticket.price) || 0), 0);
  const creatorPayout = grossRevenue - commissions;

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)).map((month) => {
      const monthTickets = tickets.filter((ticket) => {
        const date = getDate(ticket);
        return date && monthKey(new Date(date)) === monthKey(month);
      });
      const revenue = monthTickets.filter((ticket) => ticket.payment_status === "approved").reduce((sum, ticket) => sum + (Number(ticket.price) || 0), 0);
      return { month: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(month).replace(".", ""), revenus: revenue, commissions: revenue * 0.15 };
    });
  }, [tickets]);

  const statusData = [
    { name: "Approuvées", value: approved.length },
    { name: "En attente", value: pending.length },
    { name: "Refusées", value: tickets.filter((ticket) => ticket.payment_status === "rejected").length },
  ].filter((item) => item.value > 0);

  const visibleTickets = useMemo(() => tickets.filter((ticket) => {
    const text = `${ticket.owner_name || ""} ${ticket.owner_email || ""} ${ticket.event_title || ""}`.toLocaleLowerCase("fr");
    return (!query.trim() || text.includes(query.trim().toLocaleLowerCase("fr"))) && (statusFilter === "all" || ticket.payment_status === statusFilter);
  }), [tickets, query, statusFilter]);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  const cards = [
    { label: "Revenu brut", value: money(grossRevenue), detail: `${approved.length} paiement${approved.length === 1 ? " approuvé" : "s approuvés"}`, icon: CircleDollarSign },
    { label: "Commissions KivuPass", value: money(commissions), detail: "Taux de commission : 15 %", icon: ArrowUpRight },
    { label: "À reverser aux organisateurs", value: money(creatorPayout), detail: "Après déduction des commissions", icon: WalletCards },
    { label: "Paiements en attente", value: money(pendingAmount), detail: `${pending.length} billet${pending.length === 1 ? "" : "s"} à vérifier`, icon: Clock3 },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-medium text-slate-400">KivuPass <span className="mx-1">/</span> Finance</p><h1 className="mt-1 font-syne text-2xl font-bold tracking-tight text-slate-900">Finance & commissions</h1><p className="mt-1 text-sm text-slate-500">Suivez les revenus, paiements et reversements de la billetterie.</p></div>
        <button type="button" onClick={() => exportCSV(tickets, "finance")} className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#247f76] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1d6d65] sm:self-auto"><ArrowDownToLine size={15} />Exporter les transactions</button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4" aria-label="Résumé financier">
        {cards.map(({ label, value, detail, icon: Icon }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,.025)]">
          <div className="flex items-start justify-between gap-2"><span className="max-w-40 text-xs font-medium leading-5 text-slate-500">{label}</span><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f4f1] text-[#278e83]"><Icon size={18} /></span></div>
          <p className="mt-3 font-syne text-[27px] font-bold leading-none text-slate-900">{value}</p><p className="mt-2 text-[10px] text-slate-400">{detail}</p>
        </article>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,.025)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-syne text-base font-bold text-slate-900">Évolution mensuelle</h2><p className="mt-1 text-xs text-slate-500">Revenus confirmés et commissions KivuPass</p></div><div className="flex gap-3 text-[10px] text-slate-500"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[#278e83]" />Revenus</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[#a7d0c5]" />Commissions</span></div></div>
          {tickets.length === 0 ? <div className="flex h-[245px] items-center justify-center rounded-xl bg-slate-50 text-center"><div><p className="text-sm font-medium text-slate-600">Aucune donnée financière pour le moment</p><p className="mt-1 text-xs text-slate-400">Les transactions confirmées alimenteront ce graphique.</p></div></div> : <div className="h-[245px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData} margin={{ top: 10, right: 6, left: -18, bottom: 0 }} barGap={4}><CartesianGrid stroke="#edf1f3" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#8a96a3", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8a96a3", fontSize: 10 }} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7ecef", fontSize: 11 }} formatter={(value: number) => [money(value)]} /><Bar dataKey="revenus" fill="#278e83" radius={[5, 5, 0, 0]} maxBarSize={27} /><Bar dataKey="commissions" fill="#a7d0c5" radius={[5, 5, 0, 0]} maxBarSize={27} /></BarChart></ResponsiveContainer></div>}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,.025)] sm:p-6">
          <div><h2 className="font-syne text-base font-bold text-slate-900">État des paiements</h2><p className="mt-1 text-xs text-slate-500">Répartition des billets par statut</p></div>
          {statusData.length === 0 ? <div className="flex h-[245px] items-center justify-center text-center"><div><div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[14px] border-slate-100"><Ticket size={29} className="text-slate-300" /></div><p className="mt-4 text-xs text-slate-400">Aucun paiement enregistré</p></div></div> : <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-around"><div className="relative h-[190px] w-[190px] shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={59} outerRadius={83} paddingAngle={3} stroke="none">{statusData.map((item, index) => <Cell key={item.name} fill={COLORS[index]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7ecef", fontSize: 11 }} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="font-syne text-2xl font-bold text-slate-900">{tickets.length}</span><span className="text-[10px] text-slate-400">billets</span></div></div><div className="w-full space-y-3 sm:w-auto">{[{ label: "Approuvés", value: approved.length, color: COLORS[0] }, { label: "En attente", value: pending.length, color: COLORS[1] }, { label: "Refusés", value: tickets.filter((ticket) => ticket.payment_status === "rejected").length, color: COLORS[2] }].map((item) => <div key={item.label} className="flex min-w-36 items-center justify-between gap-5 text-xs"><span className="inline-flex items-center gap-2 text-slate-500"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span><span className="font-semibold text-slate-800">{item.value}</span></div>)}</div></div>}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-4 text-xs"><span className="text-slate-500">Revenus à reverser</span><span className="font-semibold text-slate-800">{money(creatorPayout)}</span></div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,.025)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="font-syne text-base font-bold text-slate-900">Transactions récentes</h2><p className="mt-1 text-xs text-slate-500">Détail des paiements de billets</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Acheteur ou événement" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-primary sm:w-52" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrer par statut" className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-primary"><option value="all">Tous les statuts</option><option value="approved">Approuvés</option><option value="pending">En attente</option><option value="rejected">Refusés</option></select></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead><tr className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400"><th className="px-6 py-3">Acheteur</th><th className="px-4 py-3">Événement</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Montant</th><th className="px-6 py-3 text-right">Statut</th></tr></thead><tbody>{visibleTickets.map((ticket) => { const status = ticket.payment_status || "pending"; const date = getDate(ticket); return <tr key={ticket.id} className="border-t border-slate-100 transition hover:bg-slate-50/60"><td className="px-6 py-3.5"><span className="font-semibold text-slate-800">{ticket.owner_name || "Acheteur"}</span><span className="mt-1 block text-[10px] text-slate-400">{ticket.owner_email || "—"}</span></td><td className="px-4 py-3.5 font-medium text-slate-700">{ticket.event_title || "Billet événement"}</td><td className="px-4 py-3.5 text-slate-500">{date ? new Date(date).toLocaleDateString("fr-FR") : "—"}</td><td className="px-4 py-3.5 font-semibold text-slate-800">{Number(ticket.price || 0).toLocaleString("fr-FR")} {ticket.currency || "USD"}</td><td className="px-6 py-3.5 text-right"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${status === "approved" ? "bg-[#e8f5f0] text-[#22836f]" : status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`}>{status === "approved" ? "Approuvé" : status === "rejected" ? "Refusé" : "En attente"}</span></td></tr>; })}</tbody></table>
          {visibleTickets.length === 0 && <div className="px-6 py-10 text-center"><p className="text-sm font-medium text-slate-600">{tickets.length ? "Aucune transaction ne correspond aux filtres." : "Aucune transaction enregistrée."}</p><p className="mt-1 text-xs text-slate-400">Les nouveaux paiements apparaîtront dans cette liste.</p></div>}
        </div>
      </section>
    </div>
  );
};
