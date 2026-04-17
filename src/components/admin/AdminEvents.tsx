import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const AdminEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("events").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setEvents(data || []);
      setLoading(false);
    });
  }, []);

  const removeEvent = async (id: string) => {
    if (!window.confirm("Supprimer définitivement cet événement ?")) return;
    await supabase.from("events").delete().eq("id", id);
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Événements ({events.length})</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground text-left">
                <th className="p-3">Affiche</th><th className="p-3">Titre</th><th className="p-3">Catégorie</th><th className="p-3">Date</th><th className="p-3">Prix</th><th className="p-3">Statut</th><th className="p-3">Actions</th>
              </tr></thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3">
                      {e.image ? (
                        <img src={e.image} alt={e.title} className="h-12 w-20 rounded-md object-cover" />
                      ) : (
                        <div className="h-12 w-20 rounded-md bg-muted" />
                      )}
                    </td>
                    <td className="p-3 font-medium text-foreground">{e.title}</td>
                    <td className="p-3 text-muted-foreground">{e.category}</td>
                    <td className="p-3 text-muted-foreground">{e.date || "—"}</td>
                    <td className="p-3">{e.price} {e.currency}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={e.approved ? "border-green-500 text-green-400" : "border-muted-foreground"}>
                        {e.approved ? "Approuvé" : e.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeEvent(e.id)}>
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
