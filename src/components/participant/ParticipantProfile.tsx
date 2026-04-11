import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export const ParticipantProfile = () => {
  const { user, resetPassword } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) { setName(data.name || ""); setPhone(data.phone || ""); setEmail(data.email || ""); }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name, phone }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Erreur : " + error.message);
    else toast.success("Profil mis à jour !");
  };

  const handleResetPassword = async () => {
    if (!email) return;
    const { error } = await resetPassword(email);
    if (error) toast.error(error.message);
    else toast.success("Email de réinitialisation envoyé !");
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-lg">
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Mon Profil</h1>
      <Card>
        <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Nom complet</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
            <Input value={email} disabled />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Téléphone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243..." />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Enregistrer
            </Button>
            <Button variant="outline" onClick={handleResetPassword}>
              Changer le mot de passe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
