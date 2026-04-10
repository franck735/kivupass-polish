import { motion } from "framer-motion";
import { UserPlus, Search, CreditCard, QrCode } from "lucide-react";

const steps = [
  { number: "01", icon: UserPlus, title: "Créez un compte", desc: "Inscription gratuite en 30 secondes." },
  { number: "02", icon: Search, title: "Explorez", desc: "Parcourez les événements disponibles." },
  { number: "03", icon: CreditCard, title: "Payez Mobile Money", desc: "Airtel, Orange, Vodacom, Africel." },
  { number: "04", icon: QrCode, title: "Recevez votre QR", desc: "Billet numérique anti-fraude." },
];

const HowItWorksSection = () => (
  <section className="container py-10 md:py-14" id="how">
    <div className="mb-10 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-display font-bold text-foreground"
      >
        Comment ça <span className="text-primary">marche</span> ?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="text-muted-foreground mt-2"
      >
        4 étapes simples pour obtenir votre billet.
      </motion.p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {steps.map((step, i) => (
        <motion.div
          key={step.number}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="relative p-6 bg-card border border-border rounded-xl group hover:border-primary transition-colors text-center"
        >
          <span className="font-bebas text-5xl text-primary/10 absolute top-3 right-4">{step.number}</span>
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
            <step.icon className="h-6 w-6" />
          </div>
          <h3 className="font-display font-semibold text-card-foreground group-hover:text-primary transition-colors mb-1">
            {step.title}
          </h3>
          <p className="text-sm text-muted-foreground">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default HowItWorksSection;
