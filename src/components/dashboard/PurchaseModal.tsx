import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, CheckCircle, ArrowLeft, CalendarDays, MapPin, ShieldCheck, Smartphone, TicketCheck } from "lucide-react";

interface PurchaseModalProps { event: any; open: boolean; onClose: () => void }
const operators = ["Airtel Money", "M-Pesa", "Orange Money", "Afri Money"];
const steps = ["Événement", "Paiement", "Confirmation"];

export const PurchaseModal = ({ event, open, onClose }: PurchaseModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [payPhone, setPayPhone] = useState("");
  const [payOperator, setPayOperator] = useState("Airtel Money");
  const [transactionId, setTransactionId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const reset = () => { setStep(1); setPayPhone(""); setPayOperator("Airtel Money"); setTransactionId(""); setProofFile(null); };
  const close = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!user || !event) return;
    setSaving(true);
    const ticketId = crypto.randomUUID();
    let proofUrl: string | null = null;
    if (proofFile) {
      const ext = proofFile.name.split(".").pop();
      const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(`${user.id}/${ticketId}.${ext}`, proofFile);
      if (uploadError) { toast.error("Erreur lors de l’envoi de la preuve : " + uploadError.message); setSaving(false); return; }
      proofUrl = `${user.id}/${ticketId}.${ext}`;
    }
    const { error } = await supabase.from("tickets").insert({
      id: ticketId, event_id: event.id, event_title: event.title, event_date: event.date, event_time: event.time,
      event_address: event.address, price: event.price, currency: event.currency, organizer_id: event.organizer_id,
      organizer_name: event.organizer_name, org_pay_phone: event.payment_phone, org_pay_operator: event.payment_operator,
      owner_id: user.id, owner_name: user.full_name || "", owner_email: user.email || "", payment_method: payOperator,
      payment_phone: payPhone, owner_phone: payPhone, tx_ref: transactionId || null, proof_image_url: proofUrl, payment_status: "pending", issued_at: null,
    });
    setSaving(false);
    if (error) toast.error("Erreur : " + error.message);
    else {
      toast.success("Demande envoyée à l’organisateur et à l’administration pour vérification."); close();
    }
  };

  const price = Number(event?.price || 0);
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) close(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-xl">
        <div className="bg-gradient-to-br from-[#124d49] to-primary px-6 pb-6 pt-7 text-white sm:px-8">
          <DialogHeader className="text-left">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><TicketCheck size={22} /></div>
            <DialogTitle className="font-syne text-2xl font-bold text-white">Réserver votre billet</DialogTitle>
            <DialogDescription className="text-white/75">Quelques étapes simples pour confirmer votre place.</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex items-center">
            {steps.map((label, index) => { const number = index + 1; return <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2"><span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step >= number ? "bg-white text-primary" : "border border-white/40 text-white/70"}`}>{step > number ? <CheckCircle size={16} /> : number}</span><span className={`hidden text-xs font-medium sm:block ${step >= number ? "text-white" : "text-white/60"}`}>{label}</span></div>
              {number < 3 && <span className={`mx-3 h-px flex-1 ${step > number ? "bg-white" : "bg-white/30"}`} />}
            </div>; })}
          </div>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          {step === 1 && <>
            <div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Votre réservation</p><h3 className="mt-1 font-syne text-lg font-bold text-slate-900">Vérifiez les détails de l’événement</h3></div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {event.image && <img src={event.image} alt="" className="h-36 w-full object-cover" />}
              <div className="space-y-3 p-5"><h4 className="font-syne text-xl font-bold text-slate-900">{event.title}</h4>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">{(event.date || event.time) && <span className="inline-flex items-center gap-2"><CalendarDays size={15} className="text-primary" />{event.date}{event.time ? ` · ${event.time}` : ""}</span>}{event.address && <span className="inline-flex items-center gap-2"><MapPin size={15} className="text-primary" />{event.address}</span>}</div>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-slate-200 bg-slate-50 px-5 py-4"><span className="text-sm font-medium text-slate-600">Total à payer</span><strong className="font-syne text-xl text-slate-900">{price > 0 ? `${price.toLocaleString("fr-FR")} ${event.currency || "USD"}` : "Gratuit"}</strong></div>
            </div>
            {price > 0 && <div className="rounded-xl border border-primary/15 bg-primary/5 p-4"><div className="flex gap-3"><Smartphone size={18} className="mt-0.5 shrink-0 text-primary" /><div><p className="text-sm font-semibold text-slate-800">Paiement Mobile Money</p><p className="mt-1 text-xs leading-5 text-slate-600">{event.payment_phone ? <>Envoyez le montant à <strong>{event.payment_operator} · {event.payment_phone}</strong>{event.payment_name ? ` au nom de ${event.payment_name}` : ""}.</> : "Les coordonnées de paiement seront communiquées par l’organisateur."} Vous pourrez joindre la preuve à l’étape suivante.</p></div></div></div>}
            <Button onClick={() => setStep(2)} className="h-11 w-full rounded-xl font-semibold">Continuer vers le paiement</Button>
          </>}

          {step === 2 && <>
            <div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Étape 2 sur 3</p><h3 className="mt-1 font-syne text-lg font-bold text-slate-900">Renseignez votre transaction</h3><p className="mt-1 text-sm text-slate-500">Utilisez les mêmes informations que celles de votre paiement.</p></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium text-slate-700">Opérateur mobile<select value={payOperator} onChange={(e) => setPayOperator(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10">{operators.map((operator) => <option key={operator}>{operator}</option>)}</select></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Numéro utilisé<Input placeholder="Ex. +243 000 000 000" value={payPhone} onChange={(e) => setPayPhone(e.target.value)} className="h-11 rounded-xl" /></label></div>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">ID de transaction <span className="font-normal text-slate-400">(facultatif)</span><Input placeholder="Ex. TRX123456789" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="h-11 rounded-xl" /></label>
            <div className="flex gap-3"><Button variant="outline" onClick={() => setStep(1)} className="h-11 rounded-xl gap-2"><ArrowLeft size={15} />Retour</Button><Button onClick={() => setStep(3)} disabled={!payPhone.trim()} className="h-11 flex-1 rounded-xl">Continuer</Button></div>
          </>}

          {step === 3 && <>
            <div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Dernière étape</p><h3 className="mt-1 font-syne text-lg font-bold text-slate-900">Ajoutez votre preuve de paiement</h3><p className="mt-1 text-sm text-slate-500">Une capture lisible accélère la vérification de votre réservation.</p></div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-primary/50 hover:bg-primary/5">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm"><Upload size={20} /></span><span className="text-sm font-semibold text-slate-800">{proofFile ? proofFile.name : "Choisir une capture d’écran"}</span><span className="mt-1 text-xs text-slate-500">Image JPG, PNG ou WEBP</span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
            </button>
            <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />Votre billet sera activé dès que le paiement aura été vérifié. Une notification vous informera de la décision.</div>
            <div className="flex gap-3"><Button variant="outline" onClick={() => setStep(2)} className="h-11 rounded-xl gap-2"><ArrowLeft size={15} />Retour</Button><Button onClick={handleSubmit} disabled={saving} className="h-11 flex-1 rounded-xl gap-2">{saving ? "Envoi en cours…" : <><CheckCircle size={16} />Confirmer la réservation</>}</Button></div>
          </>}
        </div>
      </DialogContent>
    </Dialog>
  );
};
