import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export const AdminRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("pub_requests").select("*").order("created_at", { ascending: false });
    const decorated = await Promise.all((data || []).map(async (request: any) => {
      const proof = request.proof_image;
      if (!proof || proof.startsWith("http")) return { ...request, proof_display_url: proof };
      const { data: signed } = await supabase.storage.from("publication-proofs").createSignedUrl(proof, 3600);
      return { ...request, proof_display_url: signed?.signedUrl || null };
    }));
    setRequests(decorated);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-pub-requests")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pub_requests" }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pub_requests" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const [busyId, setBusyId] = useState<string | null>(null);
  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusyId(id);
    const { data, error } = await supabase.rpc("decide_publication_request", { _request_id: id, _decision: decision });
    setBusyId(null);
    if (error || !data) { toast.error(error?.message || "Cette demande a déjà été traitée."); return; }
    toast.success(decision === "approved" ? "Demande approuvée et événement publié" : "Demande refusée");
    await load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Demandes de publication Agora ({requests.length})</h1>
      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Événement proposé</p>
                  <p className="text-lg font-semibold text-foreground">{r.event_title || "Sans titre"}</p>
                  <p className="text-sm text-muted-foreground">{r.event_category} · {r.event_date} {r.event_time} · {r.event_address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={r.status === "approved" ? "bg-green-600/20 text-green-400" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}>
                    {r.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString("fr-FR")}</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Membre Agora créateur</p>
                  <p className="text-sm text-muted-foreground">{r.organizer_name || r.organizer_email}</p>
                  <p className="text-sm text-muted-foreground">{r.organizer_email}</p>
                  <p className="text-sm text-muted-foreground">Téléphone paiement : {r.org_pay_operator} {r.org_pay_phone}</p>
                  {r.pay_phone ? (
                    <p className="text-sm text-muted-foreground">Frais de publication : {r.pay_phone}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Transaction</p>
                  <p className="text-sm text-muted-foreground">ID : {r.tx_ref || "Aucun"}</p>
                  <p className="text-sm text-muted-foreground">Prix demandé : {r.event_price} {r.event_currency}</p>
                  <p className="text-sm text-muted-foreground">Capacité : {r.event_capacity || "—"}</p>
                </div>
              </div>

              {r.proof_display_url ? (
                <div>
                  <p className="font-semibold text-foreground">Preuve de paiement</p>
                  <div className="border border-border rounded-lg overflow-hidden bg-black/5">
                    <img src={r.proof_display_url} alt="Preuve de paiement" className="w-full h-48 object-contain" />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Aucune preuve de paiement fournie.
                </div>
              )}

              {r.event_image ? (
                <div>
                  <p className="font-semibold text-foreground">Affiche proposée</p>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <img src={r.event_image} alt="Affiche événement" className="w-full h-48 object-contain bg-black/5" />
                  </div>
                </div>
              ) : null}

              {r.event_description && (
                <div>
                  <p className="font-semibold text-foreground">Description</p>
                  <p className="text-sm text-muted-foreground">{r.event_description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {r.status === "pending" ? (
                  <>
                    <Button disabled={busyId === r.id} size="sm" variant="ghost" className="text-green-400" onClick={() => decide(r.id, "approved")}><CheckCircle size={16} /> Approuver</Button>
                    <Button disabled={busyId === r.id} size="sm" variant="ghost" className="text-destructive" onClick={() => decide(r.id, "rejected")}><XCircle size={16} /> Rejeter</Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Dernière mise à jour : {r.status === "approved" ? "Approuvée" : "Rejetée"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
