import { motion } from "framer-motion";

interface CTAProps {
  onOpenModal: (tab: "signup") => void;
}

const CTASection = ({ onOpenModal }: CTAProps) => (
  <section className="px-6 md:px-16 py-20 bg-background">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="bg-primary rounded-2xl p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10"
    >
      <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] bg-primary-foreground/6 rounded-full pointer-events-none" />
      <div className="absolute -bottom-[80px] left-[40%] w-[300px] h-[300px] bg-background/10 rounded-full pointer-events-none" />

      <div className="relative z-10">
        <h2 className="font-display font-extrabold text-[clamp(2rem,4vw,3rem)] tracking-tight text-primary-foreground leading-[1.05] mb-4">
          Prêt à créer votre<br />prochain événement ?
        </h2>
        <p className="text-base text-primary-foreground/75 leading-relaxed max-w-[480px]">
          Rejoignez des centaines d'organisateurs qui font confiance à KivuPass pour gérer leur billetterie en RDC et en Afrique centrale.
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-start md:items-end gap-3.5 shrink-0">
        <button
          onClick={() => onOpenModal("signup")}
          className="px-9 py-4 rounded-full text-base font-bold bg-primary-foreground text-primary hover:bg-foreground hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.25)] transition-all"
        >
          Créer votre billetterie →
        </button>
        <span className="text-sm text-primary-foreground/60">
          ✓ Gratuit · ✓ Sans carte bancaire · ✓ Prêt en 5 min
        </span>
      </div>
    </motion.div>
  </section>
);

export default CTASection;
