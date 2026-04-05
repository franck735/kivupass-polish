import { motion } from "framer-motion";
import { Search, ArrowRight, Shield, Zap, Users } from "lucide-react";
import heroEvent from "@/assets/hero-event.jpg";

interface HeroProps {
  onOpenModal: (tab: "signup") => void;
}

const HeroSection = ({ onOpenModal }: HeroProps) => {
  return (
    <section className="bg-primary py-16 md:py-24 relative overflow-hidden">
      {/* Subtle background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
        style={{ backgroundImage: `url(${heroEvent})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-deep" />

      <div className="container relative z-10 text-center space-y-7">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full text-xs font-semibold text-primary-foreground uppercase tracking-wider"
        >
          <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse-dot" />
          Plateforme #1 en Afrique Centrale
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-3xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight max-w-3xl mx-auto"
        >
          Votre billetterie événementielle, simplifiée.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-primary-foreground/80 text-lg max-w-xl mx-auto leading-relaxed"
        >
          Créez, gérez et vendez vos billets en ligne. Paiement mobile money,
          QR Codes sécurisés, et tableau de bord en temps réel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
        >
          <button
            onClick={() => onOpenModal("signup")}
            className="px-8 py-3.5 rounded-lg text-base font-bold bg-primary-foreground text-primary hover:bg-foreground transition-all active:scale-95 flex items-center gap-2"
          >
            Commencer gratuitement
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#events"
            className="px-8 py-3.5 rounded-lg text-base font-semibold border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition-all active:scale-95 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Explorer les événements
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-6 md:gap-12 pt-8 flex-wrap"
        >
          {[
            { icon: Shield, number: "500+", label: "Événements" },
            { icon: Users, number: "50k+", label: "Billets vendus" },
            { icon: Zap, number: "100+", label: "Organisateurs" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 text-primary-foreground/80">
              <stat.icon className="w-5 h-5 text-primary-foreground/50" />
              <div>
                <span className="font-display font-bold text-xl text-primary-foreground">{stat.number}</span>
                <span className="text-xs ml-1.5 text-primary-foreground/60">{stat.label}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
