const items = [
  "Concerts", "Festivals", "Théâtre", "Sport", "Gastronomie",
  "Arts visuels", "Cinéma", "Danse", "Conférences", "Expositions",
];

const TickerBar = () => (
  <div className="bg-primary overflow-hidden py-3.5 relative">
    <div className="flex gap-0 animate-ticker w-max">
      {[...items, ...items].map((item, i) => (
        <div key={i} className="flex items-center gap-5 px-7 font-display font-bold text-sm tracking-wider uppercase text-primary-foreground/90 whitespace-nowrap">
          {item}
          <div className="w-1 h-1 bg-primary-foreground/50 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export default TickerBar;
