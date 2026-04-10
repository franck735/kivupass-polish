import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    text: "KivuPass a transformé la gestion de mes événements. Plus de billets papier, tout est numérique et sécurisé !",
    name: "Patrick M.",
    role: "Organisateur, Goma",
  },
  {
    text: "J'ai acheté mon billet en 2 minutes avec Airtel Money. Le QR code a fonctionné parfaitement à l'entrée.",
    name: "Grace N.",
    role: "Participante, Kinshasa",
  },
  {
    text: "Le tableau de bord est incroyable. Je vois mes ventes en temps réel et je peux exporter les données facilement.",
    name: "Jean-Claude K.",
    role: "Organisateur, Bukavu",
  },
];

const TestimonialsSection = () => (
  <section className="container py-10 md:py-14">
    <div className="mb-10 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-display font-bold text-foreground"
      >
        Ce qu'ils en <span className="text-primary">disent</span>
      </motion.h2>
    </div>

    <div className="grid md:grid-cols-3 gap-5">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="p-6 bg-card border border-border rounded-xl hover:border-primary transition-colors"
        >
          <Quote className="w-8 h-8 text-primary/20 mb-3" />
          <p className="text-sm text-foreground leading-relaxed mb-5">"{t.text}"</p>
          <div>
            <p className="font-display font-semibold text-foreground text-sm">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default TestimonialsSection;
