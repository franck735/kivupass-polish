import { motion } from "framer-motion";

const testimonials = [
  {
    text: "Je suis convaincu que KivuPass propose une solution de billetterie moderne répondant aux besoins du secteur culturel congolais. Elle remplace les méthodes obsolètes par une approche numérique conforme aux normes internationales.",
    name: "Patrick Lakwe",
    role: "Responsable billetterie, Jeux de la Francophonie Kinshasa",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
  },
  {
    text: "Depuis 2019, ma collaboration avec KivuPass est très positive. Ensemble, nous avons réussi à vendre des billets de manière efficace pour divers événements, et leur service d'enregistrement est excellent.",
    name: "Linda Kabomb",
    role: "CEO, ICI ET AILLEURS Magazine",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80",
  },
  {
    text: "KivuPass a été une expérience exceptionnelle lors de mon festival Africa Style. Cette plateforme a grandement facilité la gestion des billets et des bases de données. Je la recommande vivement.",
    name: "Eric Mpoyi",
    role: "Fondateur, Festival Africa Style",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
];

const TestimonialsSection = () => (
  <section className="section-padding bg-background">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[2px] uppercase text-primary mb-5">
          <span className="w-7 h-[1.5px] bg-primary" />
          Témoignages
        </div>
        <h2 className="font-display font-extrabold text-[clamp(2.2rem,4vw,3.6rem)] leading-[1.05] tracking-tight text-foreground">
          Avec qui nous<br />collaborons
        </h2>
      </motion.div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="bg-secondary border border-dark-3 rounded-xl p-8 md:p-9 relative group hover:border-primary/25 hover:-translate-y-1 transition-all duration-300"
        >
          <span className="absolute top-7 right-7 font-display font-extrabold text-6xl leading-none text-primary/12 select-none">
            "
          </span>
          <p className="text-sm leading-[1.75] text-muted-foreground mb-7 relative z-10">{t.text}</p>
          <div className="flex items-center gap-3.5">
            <img
              src={t.avatar}
              alt={t.name}
              loading="lazy"
              className="w-11 h-11 rounded-full object-cover border-2 border-dark-4 shrink-0"
            />
            <div>
              <div className="font-display font-bold text-sm text-foreground">{t.name}</div>
              <div className="text-xs text-text-dim mt-0.5">{t.role}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default TestimonialsSection;
