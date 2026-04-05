const Footer = () => (
  <footer className="border-t border-border bg-card py-8 mt-8">
    <div className="container text-center text-sm text-muted-foreground space-y-2">
      <p className="font-display font-semibold text-foreground">
        Kivu<span className="text-primary">Pass</span> — Billetterie Événementielle
      </p>
      <p>Goma · Bukavu · Kinshasa — RD Congo & Afrique Centrale</p>
      <p className="text-xs">© {new Date().getFullYear()} KivuPass. Tous droits réservés.</p>
    </div>
  </footer>
);

export default Footer;
