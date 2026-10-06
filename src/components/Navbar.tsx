import { useState, useEffect } from "react";
import { Menu, X, LogOut, User, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navbar = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!user) { setIsOwner(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "owner" }).then(({ data }) => setIsOwner(!!data));
  }, [user]);

  const navLinks = [
    { href: "#events", label: "Explorer" },
    { href: "#how", label: "Comment ça marche" },
    { href: "#about", label: "À propos" },
    { href: "#pricing", label: "Tarifs" },
    { href: "#contact", label: "Contact" },
  ];

  const displayName = user?.full_name || user?.email?.split("@")[0] || "";
  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      setIsOwner(false);
      setMobileOpen(false);
      navigate("/", { replace: true });
    } catch {
      setSigningOut(false);
      toast.error("La déconnexion n’a pas abouti. Réessayez.");
    }
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl" : "border-b border-white/10 bg-gradient-to-b from-black/20 to-transparent"}`}>
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-14">
        <a href="#home" aria-label="KivuPass, accueil" className={`flex shrink-0 items-center gap-2.5 font-display text-xl font-bold tracking-tight transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${scrolled ? "bg-[#147a79]" : "border border-white/40 bg-white/10 backdrop-blur-md"}`}>
            <span className="text-sm font-bold text-white">KP</span>
          </div>
          Kivu<span className="text-primary">Pass</span>
        </a>

        <nav className={`hidden items-center gap-1 rounded-full p-1 backdrop-blur-lg md:flex ${scrolled ? "bg-slate-100/80" : "border border-white/15 bg-white/10"}`}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${scrolled ? "text-slate-600 hover:bg-white hover:text-slate-950" : "text-white/90 hover:bg-white hover:text-slate-900"}`}>{link.label}</a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {loading ? null : user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground max-w-[120px] truncate">{displayName}</span>
              </div>
              <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </button>
              {isOwner && (
                <button onClick={() => navigate("/admin")} className="px-4 py-2 rounded-lg text-sm font-semibold bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-all active:scale-95 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </button>
              )}
              <button onClick={() => void handleSignOut()} disabled={signingOut} className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground border border-border hover:border-destructive hover:text-destructive transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-60">
                <LogOut className="w-3.5 h-3.5" /> {signingOut ? "Déconnexion…" : "Déconnexion"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className={`rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${scrolled ? "border border-slate-300 text-slate-700 hover:border-[#147a79]" : "border border-white/35 text-white hover:bg-white/10"}`}>Connexion</button>
              <button onClick={() => navigate("/signup")} className={`rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${scrolled ? "bg-[#147a79] text-white hover:bg-[#0f6362]" : "bg-white text-slate-900 hover:bg-white/90"}`}>Créer un compte</button>
            </>
          )}
        </div>

        <button aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={mobileOpen} className={`rounded-full p-2 transition active:scale-95 md:hidden ${scrolled ? "text-slate-900" : "text-white"}`} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="space-y-3 border-t border-slate-200 bg-white p-4 shadow-xl md:hidden">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="block py-2 text-muted-foreground font-medium hover:text-foreground" onClick={() => setMobileOpen(false)}>{link.label}</a>
          ))}
          <div className="flex flex-wrap gap-2.5 pt-3 border-t border-border">
            {user ? (
              <>
                <button onClick={() => { navigate("/dashboard"); setMobileOpen(false); }} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground">Dashboard</button>
                {isOwner && (
                  <button onClick={() => { navigate("/admin"); setMobileOpen(false); }} className="px-4 py-2 rounded-lg text-sm font-semibold text-destructive border border-destructive/30">Admin</button>
                )}
                <button onClick={() => void handleSignOut()} disabled={signingOut} className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground border border-border disabled:opacity-60">{signingOut ? "Déconnexion…" : "Déconnexion"}</button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate("/login"); setMobileOpen(false); }} className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-700 border border-slate-200">Connexion</button>
                <button onClick={() => { navigate("/signup"); setMobileOpen(false); }} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#147a79] text-white">Créer un compte</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
