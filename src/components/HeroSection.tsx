import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, CalendarDays, MapPin, Search, ShieldCheck, TicketCheck } from "lucide-react";
import heroEvent from "@/assets/hero-event.jpg";

interface HeroProps { onOpenModal: (tab: "signup") => void; onExplore: (query: string) => void }

const HeroSection = ({ onOpenModal, onExplore }: HeroProps) => {
  const [search, setSearch] = useState("");
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); onExplore(search.trim()); };

  return <section className="kp-hero relative isolate min-h-[740px] h-[100svh] max-h-[1080px] overflow-hidden bg-slate-950" aria-label="Bienvenue sur KivuPass">
    <img src={heroEvent} alt="Concert en plein air au coucher du soleil" fetchPriority="high" className="absolute inset-0 -z-30 h-full w-full object-cover object-center saturate-[.62]" />
    <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(12,68,67,.54)_0%,rgba(12,54,56,.36)_40%,rgba(8,31,32,.78)_100%)]" />
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_12%,rgba(30,151,149,.36),transparent_55%)] mix-blend-screen" />
    <div className="kp-hero__copy absolute inset-x-5 top-[19%] mx-auto flex max-w-4xl flex-col items-center text-center sm:top-[20%]">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-medium tracking-wide text-white backdrop-blur-md"><MapPin size={13} />Partout en République démocratique du Congo</span>
        <h1 className="mt-7 font-display text-[clamp(2.7rem,7.1vw,5.7rem)] font-semibold leading-[.98] tracking-[-.06em] text-white drop-shadow-lg">La scène est à vous.<br /><span className="text-[#d5eee8]">Vivez-la en vrai.</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">Concerts, festivals et rencontres : découvrez les événements qui font vibrer la région des Grands Lacs.</p>
        <form onSubmit={submitSearch} className="mx-auto mt-7 flex w-full max-w-[310px] items-center rounded-full border border-white/30 bg-white/95 p-1.5 pl-4 shadow-xl shadow-black/15 sm:max-w-[340px]">
          <Search size={17} className="shrink-0 text-slate-500" /><input aria-label="Rechercher un événement" value={search} onChange={event => setSearch(event.target.value)} placeholder="Une sortie vous tente ?" className="min-w-0 flex-1 bg-transparent px-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-500" />
          <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#147a79] text-white transition hover:bg-[#0f6362]" aria-label="Rechercher"><ArrowRight size={17} /></button>
        </form>
      </motion.div>
    </div>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-slate-950/55 to-transparent" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto flex max-w-[1440px] items-end justify-between gap-4 px-5 pb-8 sm:px-8 lg:px-14 lg:pb-10">
      <article className="kp-glass-card pointer-events-auto hidden w-[300px] rounded-2xl p-5 text-white sm:block md:w-[330px] md:p-6">
        <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-[#167b79]"><TicketCheck size={19} /></span>
        <h2 className="font-display text-lg font-semibold">Un billet. Toute la soirée.</h2>
        <p className="mt-2 text-xs leading-[1.65] text-white/75">Réservez en quelques instants, gardez votre billet dans votre compte et présentez votre QR code à l’entrée.</p>
      </article>
      <a href="#events" className="pointer-events-auto ml-auto flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-medium text-white backdrop-blur-lg transition hover:bg-white/20 sm:hidden">Explorer les sorties<ArrowDownRight size={16} /></a>
      <article className="kp-glass-card pointer-events-auto hidden w-[300px] rounded-2xl p-5 text-white sm:block md:w-[330px] md:p-6">
        <div className="flex items-center gap-2 text-xs font-medium text-white/80"><CalendarDays size={14} />La prochaine histoire commence ici</div>
        <h2 className="mt-3 font-display text-lg font-semibold">La culture, tout près.</h2>
        <p className="mt-2 text-xs leading-[1.65] text-white/75">Parcourez les rendez-vous partout en République démocratique du Congo.</p>
        <button type="button" onClick={() => onOpenModal("signup")} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#d7f1e9] hover:text-white">Rejoindre KivuPass <ArrowRight size={14} /></button>
      </article>
    </div>
    <div className="absolute bottom-[27px] left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] tracking-[.12em] text-white/65 lg:flex"><ShieldCheck size={13} /> BILLETTERIE ET CONTRÔLE SÉCURISÉS</div>
  </section>;
};

export default HeroSection;
