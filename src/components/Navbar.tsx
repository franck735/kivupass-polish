import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 h-[72px] border-b border-border/10 backdrop-blur-xl transition-colors duration-300 ${
        scrolled ? "bg-background/97" : "bg-background/80"
      }`}
    >
      <a href="#" className="font-display font-extrabold text-[1.6rem] text-foreground tracking-tight">
        Kivu<span className="text-primary">Pass</span>
      </a>

      <ul className="hidden md:flex items-center gap-9">
        {[
          { href: "#events", label: "Explorer" },
          { href: "#how", label: "Comment ça marche" },
          { href: "#about", label: "À propos" },
          { href: "#contact", label: "Contact" },
        ].map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
          </li>
        ))}
      </ul>

      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={() => onOpenModal("login")}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-muted-foreground border border-dark-5 hover:border-foreground/20 hover:text-foreground transition-all"
        >
          Connexion
        </button>
        <button
          onClick={() => onOpenModal("signup")}
          className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_hsl(var(--primary)/0.35)] transition-all relative overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-br from-white/12 to-transparent" />
          <span className="relative">Créer un compte</span>
        </button>
      </div>

      <button
        className="md:hidden text-foreground"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border/10 md:hidden p-6 flex flex-col gap-4">
          {["Explorer", "Comment ça marche", "À propos", "Contact"].map((label) => (
            <a
              key={label}
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { onOpenModal("login"); setMobileOpen(false); }}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-muted-foreground border border-dark-5"
            >
              Connexion
            </button>
            <button
              onClick={() => { onOpenModal("signup"); setMobileOpen(false); }}
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground"
            >
              Créer un compte
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
