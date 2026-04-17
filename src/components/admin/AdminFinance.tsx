import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, DollarSign, ArrowUpRight } from "lucide-react";
import { exportCSV } from "@/lib/csv";

export const AdminFinance = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("tickets").select("*").order("purchased_at", { ascending: false })
      .then(({ data }) => { setTickets(data || []); setLoading(false); });
  }, []);

  const approved = tickets.filter((t) => t.payment_status === "approved");
  const grossRevenue = approved.reduce((s, t) => s + (t.price || 0), 0);
  const commissions = grossRevenue * 0.15;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-syne font-bold text-2xl text-foreground">Finance & Commissions</h1>
        <Button size="sm" variant="outline" onClick={() => exportCSV(tickets, "finance")} className="gap-1">
          <Download size={14} /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign size={28} className="text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">${grossRevenue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Revenu brut</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ArrowUpRight size={28} className="text-green-400" />
            <div>
              <p className="text-2xl font-bold text-foreground">${commissions.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Commissions (15%)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign size={28} className="text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold text-foreground">${(grossRevenue - commissions).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Reversé aux créateurs Agora</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Toutes les transactions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground text-left">
                <th className="p-3">Acheteur</th><th className="p-3">Événement</th><th className="p-3">Montant</th><th className="p-3">Date</th><th className="p-3">Statut</th>
              </tr></thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground">{t.owner_name || t.owner_email}</td>
                    <td className="p-3 text-muted-foreground">{t.event_title}</td>
                    <td className="p-3">{t.price} {t.currency}</td>
                    <td className="p-3 text-muted-foreground">{new Date(t.purchased_at).toLocaleDateString("fr-FR")}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={t.payment_status === "approved" ? "border-green-500 text-green-400" : t.payment_status === "rejected" ? "border-destructive text-destructive" : "border-primary text-primary"}>
                        {t.payment_status}
                      </Badge>
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
