import { motion } from "framer-motion";
import { ArrowUpRight, QrCode, Smartphone, Ticket, UsersRound } from "lucide-react";

const features = [
  { icon: Ticket, title: "Réservez facilement", desc: "Choisissez un événement et suivez votre commande depuis votre espace." },
  { icon: Smartphone, title: "Payez par Mobile Money", desc: "Retrouvez les consignes de paiement de l'organisateur au moment de l'achat." },
  { icon: QrCode, title: "Présentez votre billet", desc: "Votre QR code apparaît une fois le paiement confirmé." },
  { icon: UsersRound, title: "Organisez au même endroit", desc: "Publiez vos événements et retrouvez les commandes de votre billetterie." },
];

const FeaturesSection = () => <section className="container py-16 md:py-24" id="features">
  <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start lg:gap-16">
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .4 }} className="lg:sticky lg:top-28">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Une billetterie pensée pour vos sorties</p>
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Tout commence par une bonne sortie.</h2>
      <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">KivuPass réunit les étapes essentielles, de la découverte d’un événement au contrôle des billets à l’entrée.</p>
      <a href="#how" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3">Découvrir le fonctionnement<ArrowUpRight size={16} /></a>
    </motion.div>
    <div className="grid gap-3 sm:grid-cols-2">{features.map((feature, index) => <motion.article key={feature.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .35, delay: index * .04 }} className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white"><feature.icon size={20} /></span><h3 className="mt-5 font-display text-base font-bold text-slate-900">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p></motion.article>)}</div>
  </div>
</section>;

export default FeaturesSection;
