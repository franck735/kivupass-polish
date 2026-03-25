const partners = ["AquaSplash", "CMCT TCG", "ICI & AILLEURS", "Makutano", "Festival Africa Style", "Jeux Francophonie"];

const PartnersSection = () => (
  <section className="px-6 md:px-16 py-16 bg-dark-2">
    <p className="text-center font-display font-bold text-xs tracking-[2.5px] uppercase text-text-dim mb-11">
      Ils nous font confiance
    </p>
    <div className="flex items-center justify-center gap-10 md:gap-14 flex-wrap">
      {partners.map((p) => (
        <span
          key={p}
          className="font-display font-extrabold text-lg tracking-tight text-text-dim hover:text-muted-foreground transition-colors"
        >
          {p}
        </span>
      ))}
    </div>
  </section>
);

export default PartnersSection;
