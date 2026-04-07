import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle } from "lucide-react";

const categories = ["Concert", "Conférence", "Festival", "Sport", "Autre"];

export const CreateEvent = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "", category: "Concert", description: "", date: "", time: "",
    address: "", price: "", currency: "USD", capacity: "",
    payName: "", payPhone: "", payOperator: "Airtel Money",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);

    const eventId = crypto.randomUUID();
    const reqId = crypto.randomUUID();

    const { error } = await supabase.from("pub_requests").insert({
      id: reqId,
      event_id: eventId,
      organizer_id: user.id,
      organizer_name: user.user_metadata?.full_name || "",
      organizer_email: user.email || "",
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
      status: "pending",
    });

    setSaving(false);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Demande envoyée ! L'admin la validera sous peu.");
      setStep(1);
      setForm({ title: "", category: "Concert", description: "", date: "", time: "", address: "", price: "", currency: "USD", capacity: "", payName: "", payPhone: "", payOperator: "Airtel Money" });
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Créer ma Billetterie</h1>

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
          <h2 className="font-semibold text-foreground">Paiement organisateur</h2>
          <p className="text-sm text-muted-foreground">Numéro sur lequel vous recevrez les paiements des participants.</p>
          <Input placeholder="Nom du titulaire" value={form.payName} onChange={(e) => set("payName", e.target.value)} />
          <Input placeholder="Numéro Mobile Money" value={form.payPhone} onChange={(e) => set("payPhone", e.target.value)} />
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
