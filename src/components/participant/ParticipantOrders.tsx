import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export const ParticipantOrders = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Mes Commandes</h1>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucune commande pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="p-3">Événement</th>
                    <th className="p-3">Montant</th>
                    <th className="p-3">Méthode</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground">{t.event_title}</td>
                      <td className="p-3">{t.price} {t.currency}</td>
                      <td className="p-3 text-muted-foreground">{t.payment_method || "Mobile Money"}</td>
                      <td className="p-3 text-muted-foreground">{new Date(t.purchased_at).toLocaleDateString("fr-FR")}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={statusColor(t.payment_status)}>
                          {t.payment_status === "approved" ? "Payé" : t.payment_status === "rejected" ? "Échoué" : "En attente"}
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
