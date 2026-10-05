import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Search, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import eventFestival from "@/assets/event-festival.jpg";
import eventConcert from "@/assets/event-concert.jpg";
import eventConference from "@/assets/event-conference.jpg";

const categoryLabels: Record<string, string> = { concert: "Concert", conference: "Conférence", conférence: "Conférence", sport: "Sport", festival: "Festival" };
const categoryImages: Record<string, string> = { festival: eventFestival, concert: eventConcert, conference: eventConference, conférence: eventConference, sport: eventFestival };
const categoryTiles = [
  { label: "Concerts", filter: "Concert", image: eventConcert },
  { label: "Festivals", filter: "Festival", image: eventFestival },
  { label: "Conférences", filter: "Conférence", image: eventConference },
];
const formatCategory = (category: string) => categoryLabels[category.toLocaleLowerCase("fr")] || category.charAt(0).toLocaleUpperCase("fr") + category.slice(1);
type EventItem = { id: string; image: string; category: string; date: string; time: string; title: string; address: string; price: number; currency: string };
interface EventsSectionProps { onOpenModal: (tab: "signup") => void; searchTerm?: string }

const formatDate = (value: string) => {
  if (!value) return "Date à confirmer";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
};

const EventsSection = ({ onOpenModal, searchTerm }: EventsSectionProps) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [active, setActive] = useState("Tout");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => { if (searchTerm !== undefined) setQuery(searchTerm); }, [searchTerm]);

  useEffect(() => {
    let alive = true;
    const fetchEvents = async () => {
      setLoading(true);
      setLoadError(false);
      const { data, error } = await supabase.from("events").select("id,title,category,date,time,address,price,currency,image")
        .eq("status", "published").eq("approved", true).order("date", { ascending: true }).limit(24);
      if (!alive) return;
      if (error) setLoadError(true);
      else setEvents((data || []).filter((event) => !event.date || event.date.slice(0, 10) >= new Date().toISOString().slice(0, 10)).map((event) => ({
        id: event.id, title: event.title, category: event.category || "Événement", date: event.date || "", time: event.time || "",
        address: event.address || "Lieu à confirmer", price: Number(event.price) || 0, currency: event.currency || "USD",
        image: event.image || categoryImages[event.category?.toLowerCase()] || eventFestival,
      })));
      setLoading(false);
    };
    void fetchEvents();
    return () => { alive = false; };
  }, [retry]);

  const filters = useMemo(() => ["Tout", ...Array.from(new Set(events.map((event) => formatCategory(event.category))))], [events]);
  const filtered = useMemo(() => events.filter((event) => {
    const matchesCategory = active === "Tout" || formatCategory(event.category) === active;
    const term = query.trim().toLocaleLowerCase("fr");
    return matchesCategory && (!term || `${event.title} ${event.address} ${event.category}`.toLocaleLowerCase("fr").includes(term));
  }), [events, active, query]);

  return <section className="container py-16 md:py-24" id="events">
    <div className="flex flex-col gap-6 mb-9 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-semibold uppercase tracking-[.16em] text-primary">Sorties et rencontres</p><h2 className="mt-2 text-3xl md:text-4xl font-display font-bold text-foreground">Les prochains événements</h2><p className="mt-2 text-muted-foreground">Trouvez une sortie et réservez votre place en ligne.</p></div>
      <label className="relative block w-full lg:max-w-sm"><Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="search" aria-label="Rechercher un événement" placeholder="Ville, événement, catégorie…" value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
    </div>
    {!loading && events.length > 0 && <div className="mb-8"><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-primary">À chacun sa sortie</p><h3 className="mt-1 font-display text-xl font-bold text-slate-900">Explorez par ambiance</h3></div><button type="button" onClick={() => setActive("Tout")} className="text-sm font-semibold text-primary hover:underline">Tout voir</button></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{categoryTiles.map((tile) => <button type="button" key={tile.filter} aria-pressed={active === tile.filter} onClick={() => setActive(active === tile.filter ? "Tout" : tile.filter)} className={`group relative h-36 overflow-hidden rounded-2xl text-left ring-offset-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active === tile.filter ? "ring-2 ring-primary" : ""}`}><img src={tile.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" /><span className="absolute bottom-4 left-4 text-lg font-bold text-white">{tile.label}</span><ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-white transition group-hover:translate-x-1" /></button>)}</div></div>}
    {!loading && events.length > 0 && <div className="mb-7 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrer les événements">{filters.map((filter) => <button key={filter} type="button" aria-pressed={active === filter} onClick={() => setActive(filter)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${active === filter ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"}`}>{filter}</button>)}</div>}
    {loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Chargement des événements">{[0, 1, 2].map((item) => <div key={item} className="h-[340px] animate-pulse rounded-2xl bg-muted" />)}</div>
      : loadError ? <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center"><p className="font-semibold text-foreground">Les événements ne sont pas disponibles pour le moment.</p><p className="mt-2 text-sm text-muted-foreground">Réessayez dans quelques instants.</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-5 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-primary">Réessayer</button></div>
      : filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center"><Ticket className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-semibold text-foreground">{events.length ? "Aucun résultat pour cette recherche." : "Aucun événement publié pour le moment."}</p><p className="mt-1 text-sm text-muted-foreground">{events.length ? "Essayez un autre mot-clé ou une autre catégorie." : "Les nouvelles dates apparaîtront ici dès leur publication."}</p></div>
      : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((event, index) => <motion.article key={event.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .35, delay: Math.min(index * .04, .2) }} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-52 overflow-hidden bg-muted"><img src={event.image} alt={event.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold capitalize text-slate-800 shadow-sm">{categoryLabels[event.category.toLowerCase()] || event.category}</span></div>
        <div className="p-5"><div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Calendar className="h-4 w-4 text-primary" /><span>{formatDate(event.date)}{event.time && ` · ${event.time}`}</span></div><h3 className="mt-3 min-h-12 font-display text-lg font-bold leading-snug text-foreground">{event.title}</h3><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{event.address}</span></p><div className="mt-5 flex items-end justify-between border-t border-border pt-4"><div><p className="text-xs text-muted-foreground">À partir de</p><p className="mt-0.5 font-display text-xl font-bold text-foreground">{event.price.toLocaleString("fr-FR")} <span className="text-sm font-medium">{event.currency}</span></p></div><button type="button" onClick={() => onOpenModal("signup")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">Réserver<ArrowRight className="h-4 w-4" /></button></div></div>
      </motion.article>)}</div>}
  </section>;
};

export default EventsSection;
