import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

interface CTAProps {
  onOpenModal: (tab: "signup") => void;
}

const CTASection = ({ onOpenModal }: CTAProps) => (
  <section className="container py-10 md:py-14">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-primary p-10 md:p-14 text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-deep" />
      <div className="relative z-10">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-primary-foreground/10 mb-5">
          <Zap className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="font-display font-bold text-3xl text-primary-foreground mb-3">
          Prêt à lancer votre événement ?
        </h2>
        <p className="text-primary-foreground/80 max-w-md mx-auto mb-6">
          Rejoignez des centaines de membres Agora en RDC. Gratuit, sans carte bancaire, prêt en 5 minutes.
        </p>
        <button
          onClick={() => onOpenModal("signup")}
          className="px-8 py-3.5 rounded-lg text-base font-bold bg-primary-foreground text-primary hover:bg-foreground transition-all active:scale-95 inline-flex items-center gap-2"
        >
          Commencer gratuitement
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  </section>
);

export default CTASection;
