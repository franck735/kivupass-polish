import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

export const OrganizerRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("pub_requests").select("*").eq("organizer_id", user.id).order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const decorated = await Promise.all((data || []).map(async (request: any) => {
          const proof = request.proof_image;
          if (!proof || proof.startsWith("http")) return { ...request, proof_display_url: proof };
          const { data: signed } = await supabase.storage.from("publication-proofs").createSignedUrl(proof, 3600);
          return { ...request, proof_display_url: signed?.signedUrl || null };
        }));
        setRequests(decorated);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Mes demandes de publication</h1>
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CalendarDays size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucune demande de publication pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Demande</p>
                    <p className="text-lg font-semibold text-foreground">{r.event_title || "Événement sans titre"}</p>
                    <p className="text-sm text-muted-foreground">{r.event_category} · {r.event_date} {r.event_time} · {r.event_address}</p>
                  </div>
                  <Badge className={r.status === "approved" ? "bg-green-600/20 text-green-400" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}>
                    {r.status}
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Transaction</p>
                    <p className="text-sm text-muted-foreground">ID : {r.tx_ref || "—"}</p>
                    <p className="text-sm text-muted-foreground">Téléphone paiement : {r.org_pay_operator} {r.org_pay_phone}</p>
                    <p className="text-sm text-muted-foreground">Frais de publication : {r.pay_phone || "—"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Statut</p>
                    <p className="text-sm text-muted-foreground">Soumis le {new Date(r.created_at).toLocaleString("fr-FR")}</p>
                    {r.approved_at && <p className="text-sm text-muted-foreground">Approuvé le {new Date(r.approved_at).toLocaleString("fr-FR")}</p>}
                    {r.rejected_at && <p className="text-sm text-muted-foreground">Rejeté le {new Date(r.rejected_at).toLocaleString("fr-FR")}</p>}
                  </div>
                </div>
                {r.proof_display_url && (
                  <div>
                    <p className="font-semibold text-foreground">Preuve de paiement</p>
                    <div className="border border-border rounded-lg overflow-hidden bg-black/5">
                      <img src={r.proof_display_url} alt="Preuve de paiement" className="w-full h-48 object-contain" />
                    </div>
                  </div>
                )}
                {r.event_image && (
                  <div>
                    <p className="font-semibold text-foreground">Affiche</p>
                    <div className="border border-border rounded-lg overflow-hidden bg-black/5">
                      <img src={r.event_image} alt="Affiche événement" className="w-full h-48 object-contain" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
