const partners = ["AquaSplash", "CMCT TCG", "ICI & AILLEURS", "Makutano", "Festival Africa Style", "Jeux Francophonie"];

const PartnersSection = () => (
  <section className="border-y border-border bg-card py-10">
    <div className="container">
      <p className="text-center font-display font-bold text-xs tracking-[2.5px] uppercase text-muted-foreground mb-8">
        Ils nous font confiance
      </p>
      <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
        {partners.map((p) => (
          <span
            key={p}
            className="font-display font-bold text-base tracking-tight text-muted-foreground/50 hover:text-primary transition-colors"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default PartnersSection;
