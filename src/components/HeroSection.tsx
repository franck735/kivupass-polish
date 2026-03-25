import { motion } from "framer-motion";
import heroEvent from "@/assets/hero-event.jpg";
import heroCard from "@/assets/hero-card.jpg";

interface HeroProps {
  onOpenModal: (tab: "signup") => void;
}

const HeroSection = ({ onOpenModal }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 pt-[120px] pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroEvent})`,
            filter: "brightness(0.12) saturate(0.6)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-background/85 to-primary/5" />
        <div className="absolute -bottom-[200px] -right-[200px] w-[700px] h-[700px] bg-[radial-gradient(circle,hsl(var(--primary)/0.1)_0%,transparent_65%)]" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-foreground/4 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[760px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/12 border border-primary/25 rounded-full text-xs font-semibold text-primary uppercase tracking-wider mb-8"
        >
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-dot" />
          Numéro #1 Afrique Centrale
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-extrabold text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.95] tracking-tight text-foreground mb-8"
        >
          La billetterie<br />
          qui <span className="text-primary italic">change</span> la<br />
          <span className="text-transparent" style={{ WebkitTextStroke: "2px hsl(var(--foreground) / 0.3)" }}>
            donne.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg text-muted-foreground leading-relaxed max-w-[520px] mb-10"
        >
          Plonge dans l'extraordinaire avec KivuPass — la plateforme qui transforme
          chaque événement en une aventure mémorable. Simple, rapide, sécurisé.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex items-center gap-4 flex-wrap mb-16"
        >
          <a
            href="#events"
            className="inline-flex items-center justify-center px-9 py-4 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_hsl(var(--primary)/0.35)] transition-all relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-br from-white/12 to-transparent" />
            <span className="relative">Explorer les événements</span>
          </a>
          <button
            onClick={() => onOpenModal("signup")}
            className="inline-flex items-center justify-center px-9 py-4 rounded-full text-base font-semibold border-[1.5px] border-foreground/25 text-foreground hover:border-foreground hover:bg-foreground/5 transition-all"
          >
            Créer votre billetterie
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex items-center gap-10"
        >
          {[
            { number: "500", label: "Événements" },
            { number: "50k", label: "Billets vendus" },
            { number: "100", label: "Organisateurs" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-10">
              {i > 0 && <div className="w-px h-10 bg-dark-5" />}
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-4xl text-foreground leading-none">
                  {stat.number}<span className="text-primary">+</span>
                </span>
                <span className="text-xs text-text-dim font-medium uppercase tracking-wider mt-1">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Hero visual - desktop only */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute right-16 top-1/2 -translate-y-1/2 z-10 w-[420px] hidden lg:block"
      >
        <div className="w-full rounded-2xl overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <img
            src={heroCard}
            alt="Événement KivuPass"
            className="w-full h-[520px] object-cover saturate-[0.9]"
            width={700}
            height={900}
          />
          <div className="absolute inset-0 rounded-2xl border border-foreground/8 pointer-events-none" />
        </div>

        {/* Floating card 1 */}
        <div className="absolute -bottom-6 -left-12 flex items-center gap-3 bg-dark-2/92 backdrop-blur-xl border border-foreground/8 rounded-lg px-4 py-3.5">
          <div className="w-10 h-10 bg-primary rounded-[10px] flex items-center justify-center text-lg shrink-0">
            🎟️
          </div>
          <div>
            <strong className="block text-sm font-semibold text-foreground">Billet sécurisé</strong>
            <span className="text-xs text-muted-foreground">QR Code unique</span>
          </div>
        </div>

        {/* Floating card 2 */}
        <div className="absolute top-10 -right-8 text-center bg-dark-2/92 backdrop-blur-xl border border-foreground/8 rounded-lg px-4 py-3.5">
          <div className="font-display font-extrabold text-3xl text-primary leading-none">4.9★</div>
          <div className="text-[0.72rem] text-muted-foreground mt-1">Note moyenne</div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
