import { motion } from "framer-motion";
import { Ticket, Smartphone, CreditCard, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Ticket,
    title: "Billetterie instantanée",
    desc: "Créez votre billetterie en quelques minutes. Interface intuitive, personnalisation complète, disponible 24h/24.",
  },
  {
    icon: Smartphone,
    title: "QR Code & validation",
    desc: "Chaque billet génère un QR Code unique pour une vérification rapide à l'entrée. Zéro fraude, 100% fiable.",
  },
  {
    icon: CreditCard,
    title: "Paiement mobile money",
    desc: "Airtel Money, M-Pesa, Orange Money et carte bancaire. Payez comme vous le souhaitez, en toute sécurité.",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord analytique",
    desc: "Suivez vos ventes en temps réel, gérez vos participants et optimisez vos campagnes depuis un seul endroit.",
  },
];

const FeaturesSection = () => (
  <section className="section-padding bg-dark-2" id="about">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <div className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[2px] uppercase text-primary mb-5">
        <span className="w-7 h-[1.5px] bg-primary" />
        Pourquoi KivuPass
      </div>
      <h2 className="font-display font-extrabold text-[clamp(2.2rem,4vw,3.6rem)] leading-[1.05] tracking-tight text-foreground">
        La plateforme pensée<br />pour l'Afrique centrale
      </h2>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-dark-3 rounded-xl overflow-hidden border border-dark-3">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="bg-dark-2 p-10 md:p-12 relative group hover:bg-secondary transition-colors"
        >
          <span className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-400" />
          <div className="w-[52px] h-[52px] bg-primary/10 border border-primary/20 rounded-[14px] flex items-center justify-center mb-6">
            <f.icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display font-bold text-xl text-foreground mb-3">{f.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
