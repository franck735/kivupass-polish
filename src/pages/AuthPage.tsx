import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Mail, TicketCheck, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_SPACE_NAME, AGORA_SPACE_NAME, resolveDashboardPath } from "@/lib/spaces";
import "./AuthPage.css";

interface AuthPageProps { mode: "login" | "signup" }

const AuthPage = ({ mode }: AuthPageProps) => {
  const { user, loading, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<typeof mode>(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const redirectInProgress = useRef(false);

  useEffect(() => setTab(mode), [mode]);
  useEffect(() => {
    if (!loading && user && !redirectInProgress.current) {
      const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
      navigate(from ? `${from.pathname || "/dashboard"}${from.search || ""}${from.hash || ""}` : "/dashboard", { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const oauthError = params.get("error_description");
    if (oauthError) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      toast.error(decodeURIComponent(oauthError.replace(/\+/g, " ")));
      return;
    }
    if (!accessToken || !refreshToken) return;
    redirectInProgress.current = true;
    setSocialLoading("google");
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    void supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(async ({ data, error }) => {
        if (error) throw error;
        toast.success("Connexion réussie !");
        const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
        navigate(from ? `${from.pathname || "/dashboard"}${from.search || ""}${from.hash || ""}` : await resolveDashboardPath(data.session.user.id), { replace: true });
      })
      .catch((error: Error) => toast.error(error.message || "Connexion impossible. Réessayez."))
      .finally(() => setSocialLoading(null));
  }, []);

  const redirectAfterAuth = async () => {
    const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
    if (from) {
      navigate(`${from.pathname || "/dashboard"}${from.search || ""}${from.hash || ""}`, { replace: true });
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (userId) navigate(await resolveDashboardPath(userId), { replace: true });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    redirectInProgress.current = true;
    const result = tab === "signup"
      ? await signUp(email, password, { name: name.trim() })
      : await signIn(email, password);
    setIsLoading(false);
    if (result.error) {
      redirectInProgress.current = false;
      toast.error(result.error.message);
      return;
    }
    if (tab === "signup" && "requiresEmailConfirmation" in result && result.requiresEmailConfirmation) {
      redirectInProgress.current = false;
      toast.success("Compte créé. Consultez votre boîte e-mail pour confirmer l’adresse avant de vous connecter.");
      return;
    }
    toast.success(tab === "signup" ? "Compte créé avec succès !" : "Connecté avec succès !");
    await redirectAfterAuth();
  };

  const changeTab = (next: typeof mode) => {
    setTab(next);
    navigate(next === "login" ? "/login" : "/signup", { replace: true });
  };

  const signInSocial = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/login` } });
      if (error) { setSocialLoading(null); toast.error(error.message); }
    } catch (error) {
      setSocialLoading(null);
      toast.error(error instanceof Error ? error.message : "Connexion sociale impossible. Vérifiez votre connexion Internet.");
    }
  };

  return (
    <main className="auth-scene">
      <div className="auth-scene__shade" />
      <a className="auth-back" href="/" aria-label="Retour à l’accueil"><ArrowLeft size={17} /> Accueil</a>
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand" aria-label="KivuPass"><TicketCheck size={27} strokeWidth={1.7} /><span>KIVUPASS</span></div>
        <div className="auth-heading">
          <p className="auth-eyebrow">VOS MOMENTS, VOTRE PASS</p>
          <h1 id="auth-title">{tab === "signup" ? "Rejoignez l’aventure." : "Heureux de vous revoir."}</h1>
          <p>{tab === "signup" ? `Créez votre compte pour découvrir ${AGORA_SPACE_NAME} et ${ADMIN_SPACE_NAME.toLowerCase()}.` : "Connectez-vous pour retrouver vos billets et vos événements."}</p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Accès au compte">
          <button type="button" role="tab" aria-selected={tab === "login"} className={tab === "login" ? "is-active" : ""} onClick={() => changeTab("login")}>Connexion</button>
          <button type="button" role="tab" aria-selected={tab === "signup"} className={tab === "signup" ? "is-active" : ""} onClick={() => changeTab("signup")}>Créer un compte</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === "signup" && <label className="auth-field"><span>Nom complet</span><div className="auth-input-wrap"><UserRound size={18} /><input autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" required /></div></label>}
          <label className="auth-field"><span>Adresse e-mail</span><div className="auth-input-wrap"><Mail size={18} /><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required /></div></label>
          <label className="auth-field"><span>Mot de passe</span><div className="auth-input-wrap"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} autoComplete={tab === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          {tab === "login" && <div className="auth-forgot"><button type="button" onClick={() => navigate("/reset-password")}>Mot de passe oublié ?</button></div>}
          <button className="auth-submit" type="submit" disabled={isLoading}>{isLoading ? <Loader2 size={20} className="animate-spin" /> : tab === "signup" ? "Créer mon compte" : "Se connecter"}</button>
        </form>
        <div className="auth-social-divider"><span>ou continuer avec</span></div>
        <div className="auth-social-buttons">
          <button type="button" onClick={() => void signInSocial("google")} disabled={!!socialLoading || isLoading} aria-label="Continuer avec Google" className="auth-social-button">
            {socialLoading === "google" ? <Loader2 size={18} className="animate-spin" /> : <span className="auth-google-mark">G</span>}
            Continuer avec Google
          </button>
          <button type="button" onClick={() => void signInSocial("apple")} disabled={!!socialLoading || isLoading} aria-label="Continuer avec Apple" className="auth-social-button">
            {socialLoading === "apple" ? <Loader2 size={18} className="animate-spin" /> : <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16.37 12.53c.02 2.22 1.95 2.96 1.97 2.97-.02.05-.31 1.06-1.02 2.1-.62.91-1.26 1.82-2.27 1.84-.99.02-1.31-.59-2.45-.59s-1.5.57-2.44.61c-.98.04-1.73-.98-2.35-1.88-1.28-1.85-2.26-5.23-.95-7.51.65-1.13 1.8-1.84 3.05-1.86.95-.02 1.84.65 2.42.65.58 0 1.67-.8 2.82-.68.48.02 1.84.19 2.71 1.52-.07.04-1.62.95-1.6 2.83ZM14.52 6.97c.51-.62.85-1.49.76-2.35-.74.03-1.64.49-2.17 1.11-.48.55-.9 1.43-.78 2.27.82.06 1.67-.42 2.19-1.03Z"/></svg>}
            Continuer avec Apple
          </button>
        </div>
        <p className="auth-switch">{tab === "login" ? "Pas encore de compte ?" : "Déjà membre ?"} <button type="button" onClick={() => changeTab(tab === "login" ? "signup" : "login")}>{tab === "login" ? "Inscrivez-vous" : "Connectez-vous"}</button></p>
        <p className="auth-legal">En continuant, vous acceptez nos conditions d’utilisation et notre politique de confidentialité.</p>
      </section>
      <p className="auth-caption">Les bons événements commencent ici <span>·</span> Kigali, Rwanda</p>
    </main>
  );
};

export default AuthPage;
