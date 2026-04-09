import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Ticket, Calendar, MapPin, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketQR } from "./TicketQR";

export const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTicket, setViewTicket] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("tickets")
      .select("*")
      .eq("owner_id", user.id)
      .order("purchased_at", { ascending: false })
      .then(({ data }) => {
        setTickets(data || []);
        setLoading(false);
      });
  }, [user]);

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-green-600/20 text-green-400";
    if (s === "rejected") return "bg-destructive/20 text-destructive";
    return "bg-primary/20 text-primary";
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Mes Billets</h1>

      {tickets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Ticket size={48} className="mx-auto mb-3 opacity-40" />
          <p>Aucun billet pour le moment.</p>
          <p className="text-sm mt-1">Explorez les événements pour acheter votre premier billet !</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-foreground">{t.event_title || "Événement"}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {t.event_date && <span className="flex items-center gap-1"><Calendar size={12} />{t.event_date}</span>}
                  {t.event_address && <span className="flex items-center gap-1"><MapPin size={12} />{t.event_address}</span>}
                </div>
                <p className="text-sm font-medium text-primary">{t.price} {t.currency}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={statusColor(t.payment_status)}>{t.payment_status}</Badge>
                <Button size="sm" variant="outline" onClick={() => setViewTicket(t)} className="gap-1">
                  <QrCode size={14} />Voir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TicketQR ticket={viewTicket} open={!!viewTicket} onClose={() => setViewTicket(null)} />
    </div>
  );
};
