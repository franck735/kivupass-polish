const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", redirectTo = `${window.location.origin}/login`) => {
      if (!supabaseUrl || !supabaseKey) return { error: new Error("La connexion sociale n’est pas configurée pour ce site.") };
      const authorize = new URL(`${supabaseUrl}/auth/v1/authorize`);
      authorize.searchParams.set("provider", provider);
      authorize.searchParams.set("redirect_to", redirectTo);
      window.location.assign(authorize.toString());
      return { error: null };
    },
    completeOAuthSignIn: async (accessToken: string) => {
      if (!supabaseUrl || !supabaseKey) throw new Error("La connexion sociale n’est pas configurée pour ce site.");
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("La connexion a échoué. Réessayez.");
      return await response.json() as { id: string; email?: string; user_metadata?: { full_name?: string; name?: string } };
    },
  },
};
