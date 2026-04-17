import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Users } from "lucide-react";
import { exportCSV } from "@/lib/csv";

export const OrganizerAttendees = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("events").select("*").eq("organizer_id", user.id),
      supabase.from("tickets").select("*").eq("organizer_id", user.id).order("purchased_at", { ascending: false }),
    ]).then(([{ data: e }, { data: t }]) => {
      setEvents(e || []);
      setTickets(t || []);
      setLoading(false);
    });
  }, [user]);

  const filtered = selectedEvent === "all" ? tickets : tickets.filter((t) => t.event_id === selectedEvent);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-syne font-bold text-2xl text-foreground">Public & billets ({filtered.length})</h1>
        <Button size="sm" variant="outline" onClick={() => exportCSV(filtered, "participants")} className="gap-1">
          <Download size={14} /> CSV
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <Button size="sm" variant={selectedEvent === "all" ? "default" : "outline"} onClick={() => setSelectedEvent("all")}>Tous</Button>
        {events.map((e) => (
          <Button key={e.id} size="sm" variant={selectedEvent === e.id ? "default" : "outline"} onClick={() => setSelectedEvent(e.id)}>
            {e.title}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
          <Card>
          <CardContent className="p-8 text-center">
            <Users size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucun acheteur pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-3">Nom</th><th className="p-3">Téléphone</th><th className="p-3">Événement</th><th className="p-3">Statut</th>
                </tr></thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground">{t.owner_name || t.owner_email}</td>
                      <td className="p-3 text-muted-foreground">{t.owner_phone || "—"}</td>
                      <td className="p-3 text-muted-foreground">{t.event_title}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={t.payment_status === "approved" ? "border-green-500 text-green-400" : "border-primary text-primary"}>
                          {t.payment_status === "approved" ? "Payé" : "En attente"}
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
