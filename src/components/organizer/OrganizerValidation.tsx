import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const OrganizerValidation = () => {
  const { user } = useAuth();
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!ticketId.trim() || !user) return;
    setSearching(true);
    setResult(null);

    const { data, error } = await supabase.from("tickets").select("*")
      .eq("id", ticketId.trim()).eq("organizer_id", user.id).single();

    setSearching(false);

    if (error || !data) {
      setResult({ status: "invalid", message: "Billet introuvable ou ne vous appartient pas." });
      return;
    }

    if (data.validated) {
      setResult({ status: "used", message: "Ce billet a déjà été utilisé.", ticket: data });
      return;
    }

    if (data.payment_status !== "approved") {
      setResult({ status: "unpaid", message: "Le paiement de ce billet n'est pas confirmé.", ticket: data });
      return;
    }

    setResult({ status: "valid", message: "Billet valide !", ticket: data });
  };

  const handleValidate = async () => {
    if (!result?.ticket) return;
    const { error } = await supabase.from("tickets").update({
      validated: true,
      validated_at: new Date().toISOString(),
    }).eq("id", result.ticket.id);

    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Billet validé avec succès !");
      setResult({ ...result, status: "used", message: "Billet marqué comme utilisé." });
    }
  };

  const statusIcon = () => {
    if (!result) return null;
    if (result.status === "valid") return <CheckCircle size={48} className="text-green-400" />;
    if (result.status === "used") return <AlertCircle size={48} className="text-yellow-400" />;
    return <XCircle size={48} className="text-destructive" />;
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Valider les billets</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><QrCode size={20} /> Vérification de billet</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Entrez l'ID du billet..."
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching} className="gap-1.5">
              <Search size={16} /> Vérifier
            </Button>
          </div>

          {result && (
            <div className={`rounded-lg p-4 text-center space-y-2 ${
              result.status === "valid" ? "bg-green-500/10" : result.status === "used" ? "bg-yellow-500/10" : "bg-destructive/10"
            }`}>
              {statusIcon()}
              <p className="font-semibold text-foreground">{result.message}</p>
              {result.ticket && (
                <div className="text-sm text-muted-foreground space-y-1 text-left mt-3">
                  <p><strong>Événement :</strong> {result.ticket.event_title}</p>
                  <p><strong>Acheteur :</strong> {result.ticket.owner_name || result.ticket.owner_email}</p>
                  <p><strong>Téléphone :</strong> {result.ticket.owner_phone || "—"}</p>
                </div>
              )}
              {result.status === "valid" && (
                <Button onClick={handleValidate} className="mt-3 gap-1.5">
                  <CheckCircle size={16} /> Marquer comme utilisé
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
