import { motion } from "framer-motion";
import { User, Search, CreditCard, Ticket } from "lucide-react";

const steps = [
  { num: "01", icon: User, title: "Créez votre compte", desc: "Inscription rapide en 30 secondes. Email ou Google." },
  { num: "02", icon: Search, title: "Explorez les événements", desc: "Parcourez notre catalogue d'événements." },
  { num: "03", icon: CreditCard, title: "Payez en sécurité", desc: "Mobile money ou carte bancaire — instantané." },
  { num: "04", icon: Ticket, title: "Recevez votre billet", desc: "QR Code unique envoyé sur votre téléphone." },
];

const HowItWorksSection = () => (
  <section className="bg-card border-y border-border py-12 md:py-16" id="how">
    <div className="container">
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-display font-bold text-foreground"
        >
          Comment ça marche
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-muted-foreground mt-1"
        >
          Simple comme bonjour — 4 étapes pour votre billet.
        </motion.p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="p-6 bg-background border border-border rounded-xl hover:border-primary transition-colors group"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--primary) / 0.05)" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
              <step.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-primary mb-2 block">Étape {step.num}</span>
            <h4 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {step.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
