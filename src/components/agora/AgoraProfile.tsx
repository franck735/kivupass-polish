import ChangePasswordCard from "@/components/shared/ChangePasswordCard";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProfilePhotoField } from "@/components/shared/ProfilePhotoField";

export const AgoraProfile = () => {
  const { user, resetPassword } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [payName, setPayName] = useState("");
  const [payPhone, setPayPhone] = useState("");
  const [payOperator, setPayOperator] = useState("Airtel Money");

  useEffect(() => {
    if (!user) return;

    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setName(data.name || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setAvatarUrl(data.avatar_url || "");
        setPayName(data.pay_name || "");
        setPayPhone(data.pay_phone || "");
        setPayOperator(data.pay_operator || "Airtel Money");
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        phone,
        avatar_url: avatarUrl || null,
        pay_name: payName || null,
        pay_phone: payPhone || null,
        pay_operator: payOperator || null,
      })
      .eq("id", user.id);
    setSaving(false);

    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }

    toast.success("Profil Agora mis à jour !");
  };

  const handleResetPassword = async () => {
    if (!email) return;
    const { error } = await resetPassword(email);
    if (error) toast.error(error.message);
    else toast.success("Email de réinitialisation envoyé !");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Votre espace</p><h1 className="mt-1 font-syne text-2xl font-bold text-foreground">Mon profil</h1><p className="mt-1 text-sm text-muted-foreground">Gérez vos coordonnées et votre photo de profil.</p></div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Ces informations apparaissent dans votre espace Agora et servent de base pour vos prochains événements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfilePhotoField name={name} value={avatarUrl} onChange={setAvatarUrl} />
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Nom complet ou nom affiché</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Studio Kivu" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Email</label>
            <Input value={email} disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Téléphone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243..." />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Enregistrer
            </Button>
            <Button variant="outline" onClick={handleResetPassword}>Changer le mot de passe</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paiements & organisation</CardTitle>
          <CardDescription>Facultatif, mais utile pour préremplir vos futures billetteries et recevoir vos ventes plus vite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Nom du titulaire</label>
            <Input value={payName} onChange={(e) => setPayName(e.target.value)} placeholder="Nom du compte Mobile Money" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Numéro Mobile Money</label>
            <Input value={payPhone} onChange={(e) => setPayPhone(e.target.value)} placeholder="+243..." />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Opérateur</label>
            <select
              value={payOperator}
              onChange={(e) => setPayOperator(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="Airtel Money">Airtel Money</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Afri Money">Afri Money</option>
            </select>
          </div>
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Conseil : si vous organisez souvent des événements, renseigner ces champs vous évitera de tout resaisir à chaque création.
          </div>
        </CardContent>
      </Card>
      <ChangePasswordCard />
      </div>
    </div>
  );
};
