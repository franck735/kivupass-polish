import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppUser = { id: string; email: string; full_name?: string };
const asAppUser = (user: User | null): AppUser | null => user ? ({
  id: user.id,
  email: user.email || "",
  full_name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
}) : null;

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, meta?: { name?: string }) => Promise<{ error: Error | null; requiresEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "Erreur inconnue";
  if (/failed to fetch|network|fetch error|load failed/i.test(message)) {
    return new Error("Connexion à Supabase impossible. Vérifiez votre Internet et les variables VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY sur Vercel.");
  }
  return new Error(message);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(asAppUser(nextSession?.user ?? null));
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(asAppUser(session?.user ?? null));
      setLoading(false);
    }).catch((error) => {
      console.error("Impossible de restaurer la session Supabase :", error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, meta?: { name?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLocaleLowerCase("fr"),
        password,
        options: {
          data: { full_name: meta?.name },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      return { error: error ? authError(error) : null, requiresEmailConfirmation: !error && !data.session && !!data.user };
    } catch (error) {
      return { error: authError(error), requiresEmailConfirmation: false };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLocaleLowerCase("fr"), password });
      return { error: error ? authError(error) : null };
    } catch (error) {
      return { error: authError(error) };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setSession(null);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLocaleLowerCase("fr"), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error ? authError(error) : null };
    } catch (error) {
      return { error: authError(error) };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
