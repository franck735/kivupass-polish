import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_SPACE_NAME, AGORA_SPACE_NAME, resolveDashboardPath } from "@/lib/spaces";

interface AuthPageProps {
  mode: "login" | "signup";
}

const AuthPage = ({ mode }: AuthPageProps) => {
  const { user, loading, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<typeof mode>(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTab(mode);
  }, [mode]);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const redirectAfterAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;
    navigate(await resolveDashboardPath(userId), { replace: true });
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    const fullName = name.trim();
    const { error } = await signUp(email, password, { name: fullName });
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Compte créé avec succès !");
      await redirectAfterAuth();
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Connecté avec succès !");
      await redirectAfterAuth();
    }
  };

  const pageTitle = tab === "signup" ? "Créer un compte" : "Connexion";

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-10 border-b border-border lg:border-b-0 lg:border-r lg:p-12 bg-gradient-to-br from-[#0a0a0c] via-[#121214] to-[#161618]">
            <div className="mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-[0.3em]">KivuPass</p>
              <h1 className="mt-4 font-syne text-3xl font-bold text-primary">{pageTitle}</h1>
              <p className="mt-3 text-sm text-muted-foreground">Connectez-vous ou inscrivez-vous pour accéder à votre espace {tab === "signup" ? `${AGORA_SPACE_NAME} ou ${ADMIN_SPACE_NAME.toLowerCase()}` : "personnel"}.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTab("login")}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${tab === "login" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                Connexion
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${tab === "signup" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                Inscription
              </button>
            </div>
          </div>
          <div className="p-10 lg:p-12">
            <form onSubmit={tab === "signup" ? handleSignup : handleLogin} className="space-y-5">
              {tab === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Nom complet</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nom complet"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-opacity-90 transition"
              >
                {isLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : tab === "signup" ? "Créer mon compte" : "Se connecter"}
              </button>
              <div className="flex justify-between text-xs text-muted-foreground">
                <button type="button" onClick={() => navigate(tab === "signup" ? "/login" : "/signup")} className="text-primary hover:underline">
                  {tab === "signup" ? "J’ai déjà un compte" : "Je crée un compte"}
                </button>
                {tab === "login" && (
                  <button type="button" onClick={() => navigate("/reset-password")} className="text-primary hover:underline">
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
