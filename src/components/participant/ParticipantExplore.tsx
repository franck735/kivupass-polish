import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PurchaseModal } from "@/components/dashboard/PurchaseModal";
import { Search, Calendar, MapPin, ShoppingCart } from "lucide-react";

const categories = ["Tous", "Concert", "Conférence", "Festival", "Sport", "Autre"];

export const ParticipantExplore = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    supabase.from("events").select("*").eq("status", "published").eq("approved", true).order("date")
      .then(({ data }) => { setEvents(data || []); setLoading(false); });
  }, []);

  const filtered = events.filter((e) => {
    const matchCat = category === "Tous" || e.category === category;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || (e.address || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Explorer les événements</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <Button key={c} size="sm" variant={category === c ? "default" : "outline"} onClick={() => setCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun événement trouvé.</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <Card key={e.id} className="overflow-hidden hover:border-primary/30 transition-colors">
              {e.image && <img src={e.image} alt={e.title} className="w-full h-40 object-cover" />}
              <CardContent className="p-4">
                <Badge variant="outline" className="mb-2 text-xs">{e.category}</Badge>
                <h3 className="font-semibold text-foreground mb-2">{e.title}</h3>
                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                  {e.date && <p className="flex items-center gap-1"><Calendar size={12} /> {e.date}</p>}
                  {e.address && <p className="flex items-center gap-1"><MapPin size={12} /> {e.address}</p>}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">{e.price > 0 ? `${e.price} ${e.currency}` : "Gratuit"}</span>
                  {user && (
                    <Button size="sm" onClick={() => setSelectedEvent(e)} className="gap-1">
                      <ShoppingCart size={14} /> Acheter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedEvent && <PurchaseModal event={selectedEvent} open={!!selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
};
