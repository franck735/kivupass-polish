import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";

interface NavbarProps {
  onOpenModal: (tab: "login" | "signup") => void;
}

const Navbar = ({ onOpenModal }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "#events", label: "Événements" },
    { href: "#about", label: "Services" },
    { href: "#how", label: "Comment ça marche" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_8px_rgba(0,0,0,0.4)]" : ""
      }`}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-2.5 font-display font-bold text-xl tracking-tight text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">KP</span>
          </div>
          Kivu<span className="text-primary">Pass</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => onOpenModal("login")}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-muted-foreground border border-border hover:border-primary hover:text-foreground transition-all active:scale-95"
          >
            Connexion
          </button>
          <button
            onClick={() => onOpenModal("signup")}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
          >
            Créer un compte
          </button>
        </div>

        <button
          className="md:hidden p-2 active:scale-95 transition-transform"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 text-muted-foreground font-medium hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2.5 pt-3 border-t border-border">
            <button
              onClick={() => { onOpenModal("login"); setMobileOpen(false); }}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-muted-foreground border border-border"
            >
              Connexion
            </button>
            <button
              onClick={() => { onOpenModal("signup"); setMobileOpen(false); }}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground"
            >
              Créer un compte
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
