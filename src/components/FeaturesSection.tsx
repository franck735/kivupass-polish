import { motion } from "framer-motion";
import { Ticket, Smartphone, CreditCard, BarChart3, Clock, DollarSign } from "lucide-react";

const features = [
  {
    icon: Ticket,
    title: "Billetterie instantanée",
    desc: "Créez votre billetterie en quelques minutes. Interface intuitive, personnalisation complète.",
    duration: "Prêt en 5 min",
    price: "Gratuit",
  },
  {
    icon: Smartphone,
    title: "QR Code & validation",
    desc: "Chaque billet génère un QR Code unique pour une vérification rapide à l'entrée.",
    duration: "Instantané",
    price: "Inclus",
  },
  {
    icon: CreditCard,
    title: "Paiement mobile money",
    desc: "Airtel Money, M-Pesa, Orange Money et carte bancaire. Payez en toute sécurité.",
    duration: "Instantané",
    price: "2% frais",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord analytique",
    desc: "Suivez vos ventes en temps réel, gérez vos participants depuis un seul endroit.",
    duration: "Temps réel",
    price: "Inclus",
  },
];

const FeaturesSection = () => (
  <section className="container py-12 md:py-16" id="about">
    <div className="mb-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-display font-bold text-foreground"
      >
        Nos Services
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="text-muted-foreground mt-1"
      >
        Tout ce qu'il faut pour gérer vos événements de A à Z.
      </motion.p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="p-6 bg-card border border-border rounded-xl transition-colors duration-150 hover:border-primary group"
          style={{ boxShadow: "2px 2px 0px 0px hsl(var(--primary) / 0.05)" }}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-card-foreground group-hover:text-primary transition-colors">
                {f.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  {f.price}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {f.duration}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
