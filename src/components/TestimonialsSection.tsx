import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    text: "KivuPass propose une solution de billetterie moderne répondant aux besoins du secteur culturel congolais. Elle remplace les méthodes obsolètes par une approche numérique conforme aux normes internationales.",
    name: "Patrick Lakwe",
    role: "Responsable billetterie, Jeux de la Francophonie",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
  },
  {
    text: "Depuis 2019, ma collaboration avec KivuPass est très positive. Ensemble, nous avons réussi à vendre des billets efficacement pour divers événements, et leur service est excellent.",
    name: "Linda Kabomb",
    role: "CEO, ICI ET AILLEURS Magazine",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80",
  },
  {
    text: "KivuPass a grandement facilité la gestion des billets et des bases de données lors de mon festival. Je la recommande vivement à tout organisateur en RDC.",
    name: "Eric Mpoyi",
    role: "Fondateur, Festival Africa Style",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
];

const TestimonialsSection = () => (
  <section className="container py-12 md:py-16">
    <div className="mb-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-display font-bold text-foreground"
      >
        Témoignages
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="text-muted-foreground mt-1"
      >
        Ce que disent nos partenaires et organisateurs.
      </motion.p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="p-6 bg-card border border-border rounded-xl hover:border-primary transition-colors"
          style={{ boxShadow: "2px 2px 0px 0px hsl(var(--primary) / 0.05)" }}
        >
          <Quote className="w-8 h-8 text-primary/20 mb-4" />
          <p className="text-sm leading-relaxed text-muted-foreground mb-6">{t.text}</p>
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <img
              src={t.avatar}
              alt={t.name}
              loading="lazy"
              className="w-10 h-10 rounded-full object-cover border-2 border-border shrink-0"
            />
            <div>
              <div className="font-display font-semibold text-sm text-foreground">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default TestimonialsSection;
