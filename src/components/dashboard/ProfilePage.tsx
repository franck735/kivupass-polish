import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const ProfilePage = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name, phone })
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
    <div className="max-w-lg">
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Mon Profil</h1>

      <div className="space-y-4">
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
