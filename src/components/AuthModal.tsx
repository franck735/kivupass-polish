import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  tab: "login" | "signup";
  onClose: () => void;
  onTabChange: (tab: "login" | "signup") => void;
}

const AuthModal = ({ open, tab, onClose, onTabChange }: AuthModalProps) => {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] bg-background/85 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-secondary border border-dark-4 rounded-2xl w-full max-w-[460px] p-12 relative animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 bg-dark-4 rounded-full flex items-center justify-center text-muted-foreground hover:bg-dark-5 hover:text-foreground transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="font-display font-extrabold text-xl text-foreground mb-7">
          Kivu<span className="text-primary">Pass</span>
        </div>

        <div className="flex gap-1 bg-dark-3 rounded-full p-1 mb-8">
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

        {tab === "signup" ? (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-3.5 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Nom</label>
                <input
                  type="text"
                  placeholder="Votre nom"
                  className="w-full px-4 py-3.5 bg-dark-3 border-[1.5px] border-dark-5 rounded-lg text-foreground text-sm outline-none focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all placeholder:text-text-dim"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Prénom</label>
                <input
                  type="text"
                  placeholder="Votre prénom"
                  className="w-full px-4 py-3.5 bg-dark-3 border-[1.5px] border-dark-5 rounded-lg text-foreground text-sm outline-none focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all placeholder:text-text-dim"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Email</label>
              <input
                type="email"
                placeholder="nom@exemple.com"
                className="w-full px-4 py-3.5 bg-dark-3 border-[1.5px] border-dark-5 rounded-lg text-foreground text-sm outline-none focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all placeholder:text-text-dim"
              />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Mot de passe</label>
              <input
                type="password"
                placeholder="Créer un mot de passe"
                className="w-full px-4 py-3.5 bg-dark-3 border-[1.5px] border-dark-5 rounded-lg text-foreground text-sm outline-none focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all placeholder:text-text-dim"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-white/12 to-transparent" />
              <span className="relative">Créer mon compte</span>
            </button>
            <p className="text-center text-sm text-text-dim mt-5">
              Déjà un compte ?{" "}
              <button onClick={() => onTabChange("login")} className="text-primary hover:underline">
                Connectez-vous
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Email</label>
              <input
                type="email"
                placeholder="nom@exemple.com"
                className="w-full px-4 py-3.5 bg-dark-3 border-[1.5px] border-dark-5 rounded-lg text-foreground text-sm outline-none focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all placeholder:text-text-dim"
              />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">Mot de passe</label>
              <input
                type="password"
                placeholder="Votre mot de passe"
                className="w-full px-4 py-3.5 bg-dark-3 border-[1.5px] border-dark-5 rounded-lg text-foreground text-sm outline-none focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all placeholder:text-text-dim"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-white/12 to-transparent" />
              <span className="relative">Se connecter</span>
            </button>
            <p className="text-center text-sm text-text-dim mt-5">
              Pas encore de compte ?{" "}
              <button onClick={() => onTabChange("signup")} className="text-primary hover:underline">
                Créer un compte
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
