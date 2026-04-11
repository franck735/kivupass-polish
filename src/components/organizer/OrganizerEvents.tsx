import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

export const OrganizerEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("events").select("*").eq("organizer_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setEvents(data || []); setLoading(false); });
  }, [user]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Mes Événements</h1>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CalendarDays size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-2">Vous n'avez aucun événement.</p>
            <p className="text-sm text-muted-foreground">Créez votre premier événement pour commencer à vendre des billets.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-3">Titre</th><th className="p-3">Date</th><th className="p-3">Prix</th><th className="p-3">Statut</th>
                </tr></thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground">{e.title}</td>
                      <td className="p-3 text-muted-foreground">{e.date || "—"}</td>
                      <td className="p-3">{e.price} {e.currency}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={e.approved ? "border-green-500 text-green-400" : "border-muted-foreground"}>
                          {e.approved ? "Publié" : e.status === "draft" ? "Brouillon" : e.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
