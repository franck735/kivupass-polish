import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { ProfilePhotoField } from "@/components/shared/ProfilePhotoField";

export const ProfilePage = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setAvatarUrl(data.avatar_url || "");
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name, phone, avatar_url: avatarUrl || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Profil mis à jour !");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Votre compte</p>
      <h1 className="mt-1 mb-2 font-syne text-2xl font-bold text-foreground">Mon profil</h1>
      <p className="mb-6 text-sm text-muted-foreground">Personnalisez votre profil et gardez vos coordonnées à jour.</p>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <ProfilePhotoField name={name} value={avatarUrl} onChange={setAvatarUrl} />
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Email</label>
          <Input value={email} disabled className="opacity-60" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Nom complet</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Téléphone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243..." />
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={16} />
          {saving ? "Sauvegarde..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
};
