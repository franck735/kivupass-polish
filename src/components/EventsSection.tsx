import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import eventFestival from "@/assets/event-festival.jpg";
import eventConcert from "@/assets/event-concert.jpg";
import eventConference from "@/assets/event-conference.jpg";

const filters = ["Tout", "Concert", "Conférence", "Sport", "Festival"];

const fallbackEvents = [
  {
    id: "demo-1",
    image: eventFestival,
    category: "festival",
    date: "15 Avril 2025",
    time: "18:00",
    title: "Festival Africa Style — Édition Kinshasa",
    address: "Palais du Peuple, Kinshasa",
    price: 15,
    currency: "USD",
  },
  {
    id: "demo-2",
    image: eventConcert,
    category: "concert",
    date: "22 Avril 2025",
    time: "20:00",
    title: "Nuit de la Rumba Congolaise",
    address: "Centre Culturel, Goma",
    price: 10,
    currency: "USD",
  },
  {
    id: "demo-3",
    image: eventConference,
    category: "conference",
    date: "5 Mai 2025",
    time: "09:00",
    title: "Forum Innovation Afrique 2025",
    address: "Hotel Fleuve Congo, Kinshasa",
    price: 25,
    currency: "USD",
  },
];

interface EventsSectionProps {
  onOpenModal: (tab: "signup") => void;
}

const EventsSection = ({ onOpenModal }: EventsSectionProps) => {
  const [active, setActive] = useState("Tout");
  const [events, setEvents] = useState(fallbackEvents);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .eq("approved", true)
        .limit(6);

      if (data && data.length > 0) {
        setEvents(
          data.map((e) => ({
            id: e.id,
            image: e.image || eventFestival,
            category: e.category,
            date: e.date || "",
            time: e.time || "",
            title: e.title,
            address: e.address || "",
            price: Number(e.price),
            currency: e.currency,
          }))
        );
      }
    };
    fetchEvents();
  }, []);

  const filtered =
    active === "Tout"
      ? events
      : events.filter((e) => e.category.toLowerCase() === active.toLowerCase());

  return (
    <section className="container py-10 md:py-14" id="events">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-display font-bold text-foreground"
          >
            Événements <span className="text-primary">à venir</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-muted-foreground mt-1"
          >
            Découvrez et réservez vos places.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary transition-colors duration-150"
          >
            <div className="relative h-[200px] overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-primary rounded-md text-xs font-bold text-primary-foreground uppercase tracking-wide">
                {event.category}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2">
                <Calendar className="w-3.5 h-3.5" />
                {event.date} · {event.time}
              </div>
              <h3 className="font-display font-semibold text-card-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {event.address}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <span className="font-display font-bold text-foreground">
                    {event.price}$
                  </span>
                  <small className="block text-xs text-muted-foreground mt-0.5">
                    {event.currency}
                  </small>
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

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-10">
          Aucun événement dans cette catégorie pour le moment.
        </p>
      )}
    </section>
  );
};

export default EventsSection;
