import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";

interface CTAProps {
  onOpenModal: (tab: "signup") => void;
}

const CTASection = ({ onOpenModal }: CTAProps) => (
  <section className="container pb-12">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-card border border-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-primary transition-colors"
      style={{ boxShadow: "2px 2px 0px 0px hsl(var(--primary) / 0.05)" }}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <MapPin className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-display font-semibold text-card-foreground">Prêt à créer votre événement ?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Rejoignez des centaines d'organisateurs en RDC. Gratuit, sans carte bancaire, prêt en 5 minutes.
        </p>
      </div>
      <button
        onClick={() => onOpenModal("signup")}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shrink-0 flex items-center gap-2"
      >
        Commencer
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  </section>
);

export default CTASection;
