import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Ticket, CalendarDays, DollarSign } from "lucide-react";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, tickets: 0, events: 0, revenue: 0 });
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ count: uCount }, { count: tCount }, { count: eCount }, { data: tickets }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("tickets").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("tickets").select("*").eq("payment_status", "approved").limit(1000),
      ]);

      const revenue = (tickets || []).reduce((sum, t) => sum + (t.price || 0), 0);
      setStats({ users: uCount || 0, tickets: tCount || 0, events: eCount || 0, revenue });

      const { data: recent } = await supabase.from("tickets").select("*").order("purchased_at", { ascending: false }).limit(5);
      setRecentTickets(recent || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const kpis = [
    { label: "Utilisateurs", value: stats.users, icon: Users, color: "text-blue-400" },
    { label: "Billets", value: stats.tickets, icon: Ticket, color: "text-primary" },
    { label: "Événements", value: stats.events, icon: CalendarDays, color: "text-green-400" },
    { label: "Revenus", value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign, color: "text-yellow-400" },
  ];

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Dashboard Admin</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <k.icon size={28} className={k.color} />
              <div>
                <p className="text-2xl font-bold text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Derniers billets</CardTitle></CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun billet.</p>
          ) : (
            <div className="space-y-2">
              {recentTickets.map((t) => (
                <div key={t.id} className="flex justify-between items-center text-sm border-b border-border pb-2">
                  <div>
                    <p className="font-medium text-foreground">{t.event_title}</p>
                    <p className="text-xs text-muted-foreground">{t.owner_name || t.owner_email}</p>
                  </div>
                  <span className={`text-xs font-medium ${t.payment_status === "approved" ? "text-green-400" : t.payment_status === "rejected" ? "text-destructive" : "text-primary"}`}>
                    {t.payment_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
