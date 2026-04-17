import { useState } from "react";
import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, CheckCircle, ArrowLeft } from "lucide-react";

interface PurchaseModalProps {
  event: any;
  open: boolean;
  onClose: () => void;
}

const operators = ["Airtel Money", "M-Pesa", "Orange Money", "Afri Money"];

export const PurchaseModal = ({ event, open, onClose }: PurchaseModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [payPhone, setPayPhone] = useState("");
  const [payOperator, setPayOperator] = useState("Airtel Money");
  const [transactionId, setTransactionId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => { setStep(1); setPayPhone(""); setTransactionId(""); setProofFile(null); };

  const handleSubmit = async () => {
    if (!user || !event) return;
    setSaving(true);

    const ticketId = crypto.randomUUID();
    let proofUrl: string | null = null;

    if (proofFile) {
      const ext = proofFile.name.split(".").pop();
      const path = `${user.id}/${ticketId}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("payment-proofs")
        .upload(path, proofFile);
      if (upErr) {
        toast.error("Erreur upload preuve : " + upErr.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);
      proofUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("tickets").insert({
      id: ticketId,
      event_id: event.id,
      event_title: event.title,
      event_date: event.date,
      event_time: event.time,
      event_address: event.address,
      price: event.price,
      currency: event.currency,
      organizer_id: event.organizer_id,
      organizer_name: event.organizer_name,
      org_pay_phone: event.payment_phone,
      org_pay_operator: event.payment_operator,
      owner_id: user.id,
      owner_name: user.full_name || "",
      owner_email: user.email || "",
      payment_method: payOperator,
      payment_phone: payPhone,
      transaction_id: transactionId || null,
      proof_image_url: proofUrl,
      payment_status: "pending",
    });

    setSaving(false);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Billet acheté ! En attente de validation.");
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-syne">Acheter un billet</DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Résumé de l'événement</h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
              <p className="font-semibold text-foreground">{event.title}</p>
              {event.date && <p className="text-muted-foreground">📅 {event.date} {event.time && `à ${event.time}`}</p>}
              {event.address && <p className="text-muted-foreground">📍 {event.address}</p>}
              <p className="text-primary font-bold text-lg mt-2">
                {event.price > 0 ? `${event.price} ${event.currency}` : "Gratuit"}
              </p>
            </div>
            {event.payment_phone && (
              <div className="bg-primary/10 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-foreground">Envoyez le paiement à :</p>
                <p className="text-primary font-bold">{event.payment_operator} : {event.payment_phone}</p>
                {event.payment_name && <p className="text-muted-foreground">Nom : {event.payment_name}</p>}
              </div>
            )}
            <Button onClick={() => setStep(2)} className="w-full">Continuer</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Votre moyen de paiement</h3>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Opérateur</label>
              <select
                value={payOperator}
                onChange={(e) => setPayOperator(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {operators.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Numéro de téléphone</label>
              <Input placeholder="+243..." value={payPhone} onChange={(e) => setPayPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">ID de transaction</label>
              <Input placeholder="Ex: TRX123456789" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1"><ArrowLeft size={14} />Retour</Button>
              <Button onClick={() => setStep(3)} disabled={!payPhone} className="flex-1">Suivant</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Preuve de paiement</h3>
            <p className="text-sm text-muted-foreground">
              Uploadez une capture d'écran de votre transaction Mobile Money.
            </p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
              <Upload size={24} className="text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {proofFile ? proofFile.name : "Cliquez pour choisir un fichier"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Choisir une image
              </button>
            </label>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-1"><ArrowLeft size={14} />Retour</Button>
              <Button onClick={handleSubmit} disabled={saving} className="flex-1 gap-2">
                <CheckCircle size={16} />
                {saving ? "Envoi..." : "Confirmer l'achat"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
