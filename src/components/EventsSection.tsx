import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import eventFestival from "@/assets/event-festival.jpg";
import eventConcert from "@/assets/event-concert.jpg";
import eventConference from "@/assets/event-conference.jpg";

const filters = ["Tout", "Musique", "Théâtre", "Festivals", "Sports"];

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
    <section className="container py-12 md:py-16" id="events">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-display font-bold text-foreground"
          >
            Événements à venir
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-muted-foreground mt-1"
          >
            Découvrez et réservez vos places pour les meilleurs événements.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap gap-2"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                active === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event, i) => (
          <motion.div
            key={event.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary transition-colors duration-150"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--primary) / 0.05)" }}
          >
            <div className="relative h-[200px] overflow-hidden">
              <img
                src={event.image}
                alt={event.name}
                loading="lazy"
                width={800}
                height={600}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-primary rounded-md text-xs font-bold text-primary-foreground uppercase tracking-wide">
                {event.tag}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2">
                <Calendar className="w-3.5 h-3.5" />
                {event.date}
              </div>
              <h3 className="font-display font-semibold text-card-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                {event.name}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <span className="font-display font-bold text-foreground">{event.price}</span>
                  <small className="block text-xs text-muted-foreground mt-0.5">à partir de</small>
                </div>
                <button
                  onClick={() => onOpenModal("signup")}
                  className="px-4 py-2 bg-primary rounded-lg text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  Commander
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mt-10"
      >
        <a
          href="#"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
        >
          Explorer tous les événements
          <ArrowRight className="w-4 h-4" />
        </a>
      </motion.div>
    </section>
  );
};

export default EventsSection;
