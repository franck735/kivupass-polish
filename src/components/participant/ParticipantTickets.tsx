import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketQR } from "@/components/dashboard/TicketQR";
import { QrCode, Calendar, MapPin, Ticket } from "lucide-react";

export const ParticipantTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTicket, setViewTicket] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("tickets").select("*").eq("owner_id", user.id).order("purchased_at", { ascending: false })
      .then(({ data }) => { setTickets(data || []); setLoading(false); });
  }, [user]);

  const statusColor = (s: string) => {
    if (s === "approved") return "border-green-500 text-green-400";
    if (s === "rejected") return "border-destructive text-destructive";
    return "border-primary text-primary";
  };

  const statusLabel = (t: any) => {
    if (t.validated) return "Utilisé";
    if (t.payment_status === "approved") return "Actif";
    if (t.payment_status === "rejected") return "Annulé";
    return "En attente";
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Mes Billets</h1>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Ticket size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Vous n'avez aucun billet.</p>
            <p className="text-sm text-muted-foreground">Explorez les événements pour acheter votre premier billet !</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.map((t) => (
            <Card key={t.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-foreground">{t.event_title}</h3>
                  <Badge variant="outline" className={statusColor(t.payment_status)}>
                    {statusLabel(t)}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                  {t.event_date && <p className="flex items-center gap-1.5"><Calendar size={14} /> {t.event_date} {t.event_time && `à ${t.event_time}`}</p>}
                  {t.event_address && <p className="flex items-center gap-1.5"><MapPin size={14} /> {t.event_address}</p>}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">{t.price} {t.currency}</span>
                  {t.payment_status === "approved" && (
                    <Button size="sm" variant="outline" onClick={() => setViewTicket(t)} className="gap-1.5">
                      <QrCode size={14} /> QR Code
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewTicket && <TicketQR ticket={viewTicket} open={!!viewTicket} onClose={() => setViewTicket(null)} />}
    </div>
  );
};
