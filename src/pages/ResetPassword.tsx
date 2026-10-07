import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [isRecovery, setIsRecovery] = useState(true);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery type in URL hash
    const hash = window.location.hash;
    setIsRecovery(hash.includes("type=recovery"));
  }, []);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Lien envoyé ! Vérifiez votre boîte e-mail.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
      toast.success("Mot de passe mis à jour !");
      setTimeout(() => navigate("/"), 3000);
    }
  };

  const inputClass = "w-full px-4 py-3.5 bg-dark-3 border-[1.5px] border-dark-5 rounded-lg text-foreground text-sm outline-none focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all placeholder:text-text-dim";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-secondary border border-dark-4 rounded-2xl w-full max-w-[460px] p-12">
        <div className="font-display font-extrabold text-xl text-foreground mb-7">
          Kivu<span className="text-primary">Pass</span>
        </div>

        {!isRecovery ? (
          <form onSubmit={sendLink}>
            <p className="text-sm text-muted-foreground mb-6">Entrez votre e-mail : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
            <input type="email" placeholder="vous@exemple.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass + " mb-6"} required />
            <button type="submit" disabled={loading} className="w-full py-4 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Envoyer le lien"}
            </button>
            <button type="button" onClick={() => navigate("/login")} className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground">Retour à la connexion</button>
          </form>
        ) : done ? (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-foreground font-semibold">Mot de passe mis à jour avec succès !</p>
            <p className="text-sm text-muted-foreground">Redirection en cours…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-muted-foreground mb-6">Créez votre nouveau mot de passe.</p>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Nouveau mot de passe</label>
              <input type="password" placeholder="Min. 6 caractères" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} required minLength={6} />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Confirmer</label>
              <input type="password" placeholder="Retapez le mot de passe" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputClass} required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Mettre à jour"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
