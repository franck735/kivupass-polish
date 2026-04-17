import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle } from "lucide-react";

const categories = ["Concert", "Conférence", "Festival", "Sport", "Autre"];
const PUBLICATION_FEE_PHONE = "+243979728411";

export const CreateEvent = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [pubFeeUsd, setPubFeeUsd] = useState("20");
  const [ownerPaymentPhone, setOwnerPaymentPhone] = useState(PUBLICATION_FEE_PHONE);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const posterInputRef = useRef<HTMLInputElement | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (posterPreview) {
        URL.revokeObjectURL(posterPreview);
      }
    };
  }, [posterPreview]);

useEffect(() => {
    if (!user) return;

    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (!data) return;

      setProfile(data);
      setForm((previous) => ({
        ...previous,
        payName: previous.payName || data.pay_name || data.name || "",
        payPhone: previous.payPhone || data.pay_phone || data.phone || "",
        payOperator: data.pay_operator || previous.payOperator,
      }));
    });
  }, [user]);

  useEffect(() => {
    supabase
      .from("settings")
      .select("value")
      .eq("key", "publication_fee_usd")
      .single()
      .then(({ data }) => {
        if (data?.value) setPubFeeUsd(data.value);
      });
    supabase
      .from("settings")
      .select("value")
      .eq("key", "owner_payment_number")
      .single()
      .then(({ data }) => {
        if (data?.value) setOwnerPaymentPhone(data.value);
      });
  }, []);

  const [form, setForm] = useState({
    title: "", category: "Concert", description: "", date: "", time: "",
    address: "", price: "", currency: "USD", capacity: "",
    payName: "", payPhone: "", payOperator: "Airtel Money",
    publication_fee_phone: ownerPaymentPhone,
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);

    const eventId = crypto.randomUUID();
    const reqId = crypto.randomUUID();
    let proofUrl: string | null = null;
    let posterUrl: string | null = null;

    if (proofFile) {
      const ext = proofFile.name.split(".").pop();
      const path = `${user.id}/publication-${reqId}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("publication-proofs").upload(path, proofFile);
      if (uploadError) {
        toast.error("Erreur upload preuve : " + uploadError.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("publication-proofs").getPublicUrl(path);
      proofUrl = urlData.publicUrl;
    }

    if (posterFile) {
      const ext = posterFile.name.split(".").pop();
      const path = `${user.id}/event-poster-${eventId}.${ext}`;
      const { error: posterError } = await supabase.storage.from("event-posters").upload(path, posterFile);
      if (posterError) {
        toast.error("Erreur upload affiche : " + posterError.message);
        setSaving(false);
        return;
      }
      const { data: posterUrlData } = supabase.storage.from("event-posters").getPublicUrl(path);
      posterUrl = posterUrlData.publicUrl;
    }

    await supabase.from("profiles").update({
      pay_name: form.payName || null,
      pay_phone: form.payPhone || null,
      pay_operator: form.payOperator || null,
    }).eq("id", user.id);

    const { error } = await supabase.from("pub_requests").insert({
      id: reqId,
      event_id: eventId,
      organizer_id: user.id,
      organizer_email: user.email || "",
      organizer_name: profile?.name || user.full_name || user.email || "",
      event_title: form.title,
      event_category: form.category,
      event_description: form.description,
      event_date: form.date,
      event_time: form.time,
      event_address: form.address,
      event_price: Number(form.price) || 0,
      event_currency: form.currency,
      event_capacity: Number(form.capacity) || null,
      org_pay_name: form.payName,
      org_pay_phone: form.payPhone,
      org_pay_operator: form.payOperator,
      transaction_id: transactionId || null,
      publication_proof_url: proofUrl,
      event_poster_url: posterUrl,
      publication_fee_phone: form.publication_fee_phone,
      status: "pending",
    });

    setSaving(false);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Demande envoyée dans Agora ! L'administration la validera sous peu.");
      setStep(1);
      setForm({
        title: "",
        category: "Concert",
        description: "",
        date: "",
        time: "",
        address: "",
        price: "",
        currency: "USD",
        capacity: "",
        payName: form.payName,
        payPhone: form.payPhone,
        payOperator: form.payOperator,
        publication_fee_phone: ownerPaymentPhone,
      });
      setTransactionId("");
      setProofFile(null);
      setPosterFile(null);
      setPosterPreview(null);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Créer un événement dans Agora</h1>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {s}
            </div>
            {s < 3 && <div className={`w-10 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Détails de l'événement</h2>
          <label className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground cursor-pointer transition hover:border-primary">
            <span className="font-medium text-foreground">Affiche de l'événement</span>
            <span>{posterFile?.name || "Cliquez pour choisir une image d'affiche"}</span>
            <input
              ref={posterInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setPosterFile(file);
                if (file) {
                  setPosterPreview(URL.createObjectURL(file));
                } else {
                  setPosterPreview(null);
                }
              }}
            />
            <button
              type="button"
              onClick={() => posterInputRef.current?.click()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Choisir une image
            </button>
          </label>
          {posterPreview ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <img src={posterPreview} alt="Aperçu de l'affiche" className="w-full h-48 object-cover" />
            </div>
          ) : null}
          <Input placeholder="Titre de l'événement" value={form.title} onChange={(e) => set("title", e.target.value)} />
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Textarea placeholder="Description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
          </div>
          <Input placeholder="Adresse / Lieu" value={form.address} onChange={(e) => set("address", e.target.value)} />
          <Button onClick={() => setStep(2)} disabled={!form.title}>Suivant</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Tarification</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Prix" value={form.price} onChange={(e) => set("price", e.target.value)} />
            <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="USD">USD</option>
              <option value="CDF">CDF</option>
            </select>
          </div>
          <Input type="number" placeholder="Capacité (optionnel)" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
            <Button onClick={() => setStep(3)}>Suivant</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Paiements & publication</h2>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="font-semibold text-foreground text-lg">Frais de publication: {pubFeeUsd} USD</p>
            <p className="text-sm text-muted-foreground">Payer au téléphone :</p>
            <p className="text-base font-semibold text-foreground">{ownerPaymentPhone}</p>
          </div>
          <p className="text-sm text-muted-foreground">Ces champs sont préremplis depuis votre profil Agora et servent à recevoir vos ventes.</p>
          <Input placeholder="Nom du titulaire" value={form.payName} onChange={(e) => set("payName", e.target.value)} />
          <Input placeholder="Numéro Mobile Money" value={form.payPhone} onChange={(e) => set("payPhone", e.target.value)} />
          <Input placeholder="ID de transaction" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
          <label className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground cursor-pointer transition hover:border-primary">
            <span className="font-medium text-foreground">Preuve de paiement</span>
            <span>{proofFile?.name || "Cliquez pour choisir une image"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Choisir une image
            </button>
          </label>
          <select value={form.payOperator} onChange={(e) => set("payOperator", e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="Airtel Money">Airtel Money</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Orange Money">Orange Money</option>
            <option value="Afri Money">Afri Money</option>
          </select>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>Retour</Button>
            <Button onClick={handleSubmit} disabled={saving} className="gap-2">
              <PlusCircle size={16} />
              {saving ? "Envoi..." : "Soumettre la demande"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
