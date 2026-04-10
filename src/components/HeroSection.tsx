import { motion } from "framer-motion";
import { ArrowRight, Search, Shield, Zap, Users } from "lucide-react";

interface HeroProps {
  onOpenModal: (tab: "signup") => void;
}

const HeroSection = ({ onOpenModal }: HeroProps) => (
  <section className="relative overflow-hidden bg-background py-14 md:py-20">
    {/* Gold gradient accent */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

    <div className="container relative z-10 text-center space-y-7">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary uppercase tracking-wider"
      >
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-dot" />
        La billetterie numérique du Congo
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight max-w-4xl mx-auto"
      >
        Créez, gérez et vendez vos{" "}
        <span className="text-primary">billets</span> en ligne.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed"
      >
        Paiement Mobile Money, QR Codes sécurisés anti-fraude, et tableau de bord en temps réel.
        Simple, rapide, sécurisé.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
      >
        <button
          onClick={() => onOpenModal("signup")}
          className="px-8 py-3.5 rounded-lg text-base font-bold bg-primary text-primary-foreground hover:bg-primary-light transition-all active:scale-95 flex items-center gap-2"
        >
          Commencer gratuitement
          <ArrowRight className="w-4 h-4" />
        </button>
        <a
          href="#events"
          className="px-8 py-3.5 rounded-lg text-base font-semibold border border-border text-foreground hover:border-primary hover:text-primary transition-all active:scale-95 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Explorer les événements
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex items-center justify-center gap-8 md:gap-14 pt-10 flex-wrap"
      >
        {[
          { icon: Shield, number: "500+", label: "Événements" },
          { icon: Users, number: "1k+", label: "Billets vendus" },
          { icon: Zap, number: "100+", label: "Organisateurs" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 text-muted-foreground">
            <stat.icon className="w-5 h-5 text-primary/60" />
            <div>
              <span className="font-display font-bold text-2xl text-foreground">{stat.number}</span>
              <span className="text-xs ml-1.5 text-muted-foreground">{stat.label}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
