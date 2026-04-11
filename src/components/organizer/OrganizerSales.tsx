import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Percent } from "lucide-react";

export const OrganizerSales = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("tickets").select("*").eq("organizer_id", user.id).eq("payment_status", "approved"),
      supabase.from("events").select("*").eq("organizer_id", user.id),
    ]).then(([{ data: t }, { data: e }]) => {
      setTickets(t || []);
      setEvents(e || []);
      setLoading(false);
    });
  }, [user]);

  const totalRevenue = tickets.reduce((s, t) => s + (t.price || 0), 0);
  const commission = totalRevenue * 0.15;
  const netPayout = totalRevenue - commission;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Ventes & Revenus</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign size={28} className="text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Revenu brut</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Percent size={28} className="text-destructive" />
            <div>
              <p className="text-2xl font-bold text-foreground">-${commission.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Commission (15%)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp size={28} className="text-green-400" />
            <div>
              <p className="text-2xl font-bold text-foreground">${netPayout.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Paiement net (85%)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Ventes par événement</CardTitle></CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun événement.</p>
          ) : (
            <div className="space-y-3">
              {events.map((e) => {
                const sold = tickets.filter((t) => t.event_id === e.id).length;
                const rev = tickets.filter((t) => t.event_id === e.id).reduce((s, t) => s + (t.price || 0), 0);
                return (
                  <div key={e.id} className="flex justify-between items-center border-b border-border pb-2">
                    <div>
                      <p className="font-medium text-foreground">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{sold} billets vendus</p>
                    </div>
                    <span className="font-bold text-primary">${rev.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
