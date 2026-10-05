import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PricingProps {
  onOpenModal: (tab: "signup") => void;
}

const PricingSection = ({ onOpenModal }: PricingProps) => {
  const [publicationFee, setPublicationFee] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.from("settings").select("value").eq("key", "publication_fee_usd").single()
      .then(({ data }) => { if (active && data?.value) setPublicationFee(data.value); });
    return () => { active = false; };
  }, []);
  const plans = [
    { name: "Accès Agora", price: "Gratuit", desc: "Pour découvrir les événements et gérer vos billets", features: ["Explorer les événements", "Commander un billet", "Retrouver vos billets et commandes", "Recevoir les mises à jour de vos billets"], cta: "Créer un compte", highlighted: false },
    { name: "Publication", price: publicationFee ? `${Number(publicationFee).toLocaleString("fr-FR")} USD` : "Voir dans votre espace", desc: "Frais de publication par événement, affichés avant la soumission", features: ["Créer et soumettre un événement", "Suivre les commandes de billets", "Vérifier les entrées par QR code", "Consulter les ventes dans votre espace"], cta: "Organiser un événement", highlighted: true },
  ];
  return (
  <section className="container py-10 md:py-14" id="pricing">
    <div className="mb-10 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-display font-bold text-foreground"
      >
        Tarifs <span className="text-primary">simples</span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="text-muted-foreground mt-2 max-w-md mx-auto"
      >
        L'accès est gratuit. Les frais de publication en vigueur sont affichés avant la soumission de votre événement.
      </motion.p>
    </div>

    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {plans.map((plan, i) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className={`p-6 rounded-xl border ${
            plan.highlighted
              ? "border-primary bg-primary/5"
              : "border-border bg-card"
          }`}
        >
          <h3 className="font-display font-bold text-xl text-foreground">{plan.name}</h3>
          <div className="mt-2 mb-1">
            <span className="font-display font-extrabold text-4xl text-primary">{plan.price}</span>
            {plan.highlighted && publicationFee && <span className="text-sm text-muted-foreground ml-1">/ événement</span>}
          </div>
          <p className="text-sm text-muted-foreground mb-5">{plan.desc}</p>
          <ul className="space-y-2.5 mb-6">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onOpenModal("signup")}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              plan.highlighted
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {plan.cta}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
    </div>
  </section>
  );
};

export default PricingSection;
