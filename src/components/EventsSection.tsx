import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import eventFestival from "@/assets/event-festival.jpg";
import eventConcert from "@/assets/event-concert.jpg";
import eventConference from "@/assets/event-conference.jpg";

const filters = ["Tout", "Musique", "Théâtre", "Festivals", "Sports", "Arts visuels"];

const events = [
  {
    image: eventFestival,
    tag: "Festival",
    date: "15 Avril 2025 · 18:00",
    name: "Festival Africa Style — Édition Kinshasa",
    location: "Palais du Peuple, Kinshasa",
    price: "15,000 FC",
  },
  {
    image: eventConcert,
    tag: "Concert",
    date: "22 Avril 2025 · 20:00",
    name: "Nuit de la Rumba Congolaise",
    location: "Centre Culturel, Goma",
    price: "10,000 FC",
  },
  {
    image: eventConference,
    tag: "Conférence",
    date: "5 Mai 2025 · 09:00",
    name: "Forum Innovation Afrique 2025",
    location: "Hotel Fleuve Congo, Kinshasa",
    price: "25,000 FC",
  },
];

interface EventsSectionProps {
  onOpenModal: (tab: "signup") => void;
}

const EventsSection = ({ onOpenModal }: EventsSectionProps) => {
  const [active, setActive] = useState("Tout");

  return (
    <section className="section-padding bg-background" id="events">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[2px] uppercase text-primary mb-5">
            <span className="w-7 h-[1.5px] bg-primary" />
            Découvrir
          </div>
          <h2 className="font-display font-extrabold text-[clamp(2.2rem,4vw,3.6rem)] leading-[1.05] tracking-tight text-foreground">
            Événements à venir
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap gap-2.5"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                active === f
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-transparent border border-dark-5 text-muted-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, i) => (
          <motion.div
            key={event.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="bg-secondary rounded-xl overflow-hidden border border-dark-3 group hover:-translate-y-2 hover:border-primary/30 transition-all duration-300"
          >
            <div className="relative h-[220px] overflow-hidden">
              <img
                src={event.image}
                alt={event.name}
                loading="lazy"
                width={800}
                height={600}
                className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 to-transparent" />
              <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-primary rounded-full text-[0.72rem] font-bold text-primary-foreground uppercase tracking-wide z-10">
                {event.tag}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-text-dim font-medium mb-2.5 tracking-wide">
                <Calendar className="w-3.5 h-3.5" />
                {event.date}
              </div>
              <h3 className="font-display font-bold text-lg text-foreground leading-snug mb-2">{event.name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-dark-4">
                <div>
                  <span className="font-display font-bold text-base text-foreground">{event.price}</span>
                  <small className="block text-xs text-text-dim mt-0.5">à partir de</small>
                </div>
                <button
                  onClick={() => onOpenModal("signup")}
                  className="px-4 py-2 bg-dark-4 border border-dark-5 rounded-full text-xs font-semibold text-muted-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
                >
                  Commander
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mt-14"
      >
        <a
          href="#"
          className="inline-flex items-center justify-center px-9 py-4 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_hsl(var(--primary)/0.35)] transition-all relative overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-br from-white/12 to-transparent" />
          <span className="relative">Explorer tous les événements →</span>
        </a>
      </motion.div>
    </section>
  );
};

export default EventsSection;
