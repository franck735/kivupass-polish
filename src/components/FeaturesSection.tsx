import { motion } from "framer-motion";
import { Ticket, QrCode, Smartphone, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Ticket,
    title: "Billetterie instantanée",
    desc: "Créez votre billetterie en quelques minutes. Interface intuitive, personnalisation complète.",
  },
  {
    icon: QrCode,
    title: "QR Code anti-fraude",
    desc: "Chaque billet génère un QR Code unique pour une vérification rapide. Zéro fraude, validation instantanée.",
  },
  {
    icon: Smartphone,
    title: "Paiement Mobile Money",
    desc: "Airtel Money, Orange Money, Vodacom M-Pesa, Africel. Payez en toute sécurité depuis votre téléphone.",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord temps réel",
    desc: "Suivez vos ventes en temps réel, gérez vos participants et exportez vos données depuis un seul endroit.",
  },
];

const FeaturesSection = () => (
  <section className="container py-10 md:py-14" id="about">
    <div className="mb-10 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-display font-bold text-foreground"
      >
        Pourquoi <span className="text-primary">KivuPass</span> ?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="text-muted-foreground mt-2 max-w-lg mx-auto"
      >
        Tout ce qu'il faut pour gérer vos événements de A à Z.
      </motion.p>
    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="p-6 bg-card border border-border rounded-xl transition-colors duration-150 hover:border-primary group text-center"
        >
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <f.icon className="h-7 w-7" />
          </div>
          <h3 className="font-display font-semibold text-card-foreground group-hover:text-primary transition-colors mb-2">
            {f.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
