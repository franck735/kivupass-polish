import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveDashboardPath } from "@/lib/spaces";

interface AuthModalProps {
  open: boolean;
  tab: "login" | "signup";
  onClose: () => void;
  onTabChange: (tab: "login" | "signup") => void;
}

const AuthModal = ({ open, tab, onClose, onTabChange }: AuthModalProps) => {
  const { signUp, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const redirectAfterAuth = async (userId: string) => {
    navigate(await resolveDashboardPath(userId));
  };
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const resetForm = () => {
    setName(""); setEmail(""); setPassword("");
    setForgotEmail(""); setShowForgot(false);
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await signUp(email, password, { name });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Compte créé avec succès !");
      handleClose();
      // Auto-confirm is enabled, so user is logged in immediately
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await redirectAfterAuth(session.user.id);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Connecté avec succès !");
      handleClose();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await redirectAfterAuth(session.user.id);
      }
    }
  };
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    const { error } = await resetPassword(forgotEmail);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email de réinitialisation envoyé !");
      setShowForgot(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Erreur Google: " + (result.error as Error).message);
      setLoading(false);
    } else if (result.redirected) {
      return; // browser redirects
    } else {
      toast.success("Connecté avec Google !");
      setLoading(false);
      handleClose();
    }
  };

  if (!open) return null;

  const inputClass = "w-full px-4 py-3.5 bg-dark-3 border-[1.5px] border-dark-5 rounded-lg text-foreground text-sm outline-none focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all placeholder:text-text-dim";

  return (
    <div
      className="fixed inset-0 z-[2000] bg-background/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={tab === "signup" ? "Créer un compte KivuPass" : "Connexion à KivuPass"} className="bg-secondary border border-dark-4 rounded-2xl w-full max-w-[460px] max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-6 sm:p-10 relative animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 bg-dark-4 rounded-full flex items-center justify-center text-muted-foreground hover:bg-dark-5 hover:text-foreground transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="font-display font-extrabold text-xl text-foreground mb-7">
          Kivu<span className="text-primary">Pass</span>
        </div>

        {showForgot ? (
          <form onSubmit={handleForgot}>
            <p className="text-sm text-muted-foreground mb-4">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Email</label>
              <input type="email" placeholder="nom@exemple.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className={inputClass} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 relative overflow-hidden">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Envoyer le lien"}
            </button>
            <p className="text-center text-sm text-text-dim mt-5">
              <button type="button" onClick={() => setShowForgot(false)} className="text-primary hover:underline">← Retour</button>
            </p>
          </form>
        ) : (
          <>
            <div className="flex gap-1 bg-dark-3 rounded-full p-1 mb-6">
              {(["signup", "login"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onTabChange(t)}
                  className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t === "signup" ? "Créer un compte" : "Connexion"}
                </button>
              ))}
            </div>

            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-sm font-semibold border border-dark-5 bg-dark-3 text-foreground hover:bg-dark-4 transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuer avec Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-dark-5" />
              <span className="text-xs text-text-dim uppercase">ou</span>
              <div className="flex-1 h-px bg-dark-5" />
            </div>

            {tab === "signup" ? (
              <form onSubmit={handleSignup}>
                <div className="mb-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Nom complet</label>
                  <input type="text" placeholder="Votre nom complet" value={name} onChange={e => setName(e.target.value)} className={inputClass} autoComplete="name" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Email</label>
                  <input type="email" placeholder="nom@exemple.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} required />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Mot de passe</label>
                  <input type="password" placeholder="Créer un mot de passe" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} required minLength={6} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 relative overflow-hidden">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><span className="absolute inset-0 bg-gradient-to-br from-white/12 to-transparent" /><span className="relative">Créer mon compte</span></>}
                </button>
                <p className="text-center text-sm text-text-dim mt-5">
                  Déjà un compte ?{" "}
                  <button type="button" onClick={() => onTabChange("login")} className="text-primary hover:underline">Connectez-vous</button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Email</label>
                  <input type="email" placeholder="nom@exemple.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} required />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Mot de passe</label>
                  <input type="password" placeholder="Votre mot de passe" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} required />
                </div>
                <div className="text-right mb-6">
                  <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-primary hover:underline">Mot de passe oublié ?</button>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 relative overflow-hidden">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><span className="absolute inset-0 bg-gradient-to-br from-white/12 to-transparent" /><span className="relative">Se connecter</span></>}
                </button>
                <p className="text-center text-sm text-text-dim mt-5">
                  Pas encore de compte ?{" "}
                  <button type="button" onClick={() => onTabChange("signup")} className="text-primary hover:underline">Créer un compte</button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
