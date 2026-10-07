import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

const ChangePasswordCard = () => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères.");
    if (next !== confirm) return toast.error("Les mots de passe ne correspondent pas.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: next, current_password: current } as any);
    setLoading(false);
    if (error) {
      const m = error.message.toLowerCase();
      toast.error(m.includes("current") ? "Mot de passe actuel incorrect." : m.includes("weak") || m.includes("pwned") ? "Mot de passe trop faible ou déjà compromis, choisissez-en un autre." : error.message);
      return;
    }
    setCurrent(""); setNext(""); setConfirm("");
    toast.success("Mot de passe modifié !");
  };

  return (
    <Card className="mt-6">
      <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound size={18} />Changer de mot de passe</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3 max-w-md">
          <Input type="password" placeholder="Mot de passe actuel" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
          <Input type="password" placeholder="Nouveau mot de passe (min. 8)" value={next} onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" />
          <Input type="password" placeholder="Confirmer le nouveau mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
          <Button type="submit" disabled={loading}>{loading ? "Modification..." : "Mettre à jour"}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordCard;
