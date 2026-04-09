import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, MapPin, Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PurchaseModal } from "./PurchaseModal";

const categories = ["Tous", "Concert", "Conférence", "Festival", "Sport", "Autre"];

export const EventsCatalog = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .eq("approved", true)
      .order("date", { ascending: true })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = events.filter((e) => {
    const matchCat = filter === "Tous" || e.category?.toLowerCase() === filter.toLowerCase();
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Événements</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un événement..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Aucun événement trouvé.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <div key={e.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors">
              {e.image && <img src={e.image} alt={e.title} className="w-full h-40 object-cover" />}
              <div className="p-4 space-y-2">
                <span className="text-xs text-primary font-medium uppercase">{e.category}</span>
                <h3 className="font-semibold text-foreground">{e.title}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {e.date && <span className="flex items-center gap-1"><CalendarDays size={12} />{e.date}</span>}
                  {e.address && <span className="flex items-center gap-1"><MapPin size={12} />{e.address}</span>}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm font-bold text-primary">{e.price > 0 ? `${e.price} ${e.currency}` : "Gratuit"}</p>
                  {user && (
                    <Button size="sm" onClick={() => setSelectedEvent(e)} className="gap-1 text-xs">
                      <ShoppingCart size={14} />Acheter
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <PurchaseModal event={selectedEvent} open={!!selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};
