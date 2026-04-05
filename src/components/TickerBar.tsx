const items = [
  "Concerts", "Festivals", "Théâtre", "Sport", "Gastronomie",
  "Arts visuels", "Cinéma", "Danse", "Conférences", "Expositions",
];

const TickerBar = () => (
  <div className="bg-card border-b border-border overflow-hidden py-2.5 relative">
    <div className="flex gap-0 animate-ticker w-max">
      {[...items, ...items].map((item, i) => (
        <div key={i} className="flex items-center gap-4 px-6 font-display font-semibold text-xs tracking-wider uppercase text-muted-foreground whitespace-nowrap">
          {item}
          <div className="w-1 h-1 bg-primary/40 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export default TickerBar;
