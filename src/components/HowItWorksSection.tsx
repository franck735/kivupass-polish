import { motion } from "framer-motion";
import { User, Search, CreditCard, Ticket } from "lucide-react";

const steps = [
  { num: "01", icon: User, title: "Créez votre compte", desc: "Inscription rapide en 30 secondes. Email ou Google, à vous de choisir." },
  { num: "02", icon: Search, title: "Explorez les événements", desc: "Parcourez notre catalogue d'événements près de chez vous." },
  { num: "03", icon: CreditCard, title: "Payez en sécurité", desc: "Mobile money, carte bancaire — paiement sécurisé instantané." },
  { num: "04", icon: Ticket, title: "Recevez votre billet", desc: "QR Code unique envoyé sur votre téléphone. Présentez à l'entrée, c'est tout." },
];

const HowItWorksSection = () => (
  <section className="section-padding bg-dark-2 relative" id="how">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--primary)/0.05)_0%,transparent_70%)] pointer-events-none" />

    <div className="text-center max-w-[600px] mx-auto mb-16 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[2px] uppercase text-primary mb-5 justify-center"
      >
        <span className="w-7 h-[1.5px] bg-primary" />
        Comment ça marche
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display font-extrabold text-[clamp(2.2rem,4vw,3.6rem)] leading-[1.05] tracking-tight text-foreground"
      >
        Simple comme<br />bonjour
      </motion.h2>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
      {steps.map((step, i) => (
        <motion.div
          key={step.num}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="relative text-center group"
        >
          <span className="font-display font-extrabold text-[5rem] leading-none text-primary/7 absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none select-none">
            {step.num}
          </span>
          <div className="w-16 h-16 bg-secondary border-[1.5px] border-dark-4 rounded-[18px] flex items-center justify-center mx-auto mb-5 relative z-10 group-hover:border-primary group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all">
            <step.icon className="w-7 h-7 text-primary" />
          </div>
          <h4 className="font-display font-bold text-base text-foreground mb-2.5 relative z-10">{step.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default HowItWorksSection;
