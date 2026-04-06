const Footer = () => (
  <footer className="border-t border-border bg-card py-10">
    <div className="container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="font-display font-bold text-lg text-foreground">
            Kivu<span className="text-primary">Pass</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            La billetterie numérique du Congo
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">CGU</a>
          <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
          <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          <a href="#" className="hover:text-primary transition-colors">Remboursements</a>
          <a href="#" className="hover:text-primary transition-colors">À propos</a>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Goma · Bukavu · Kinshasa — RD Congo & Afrique Centrale
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} KivuPass. Tous droits réservés.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
