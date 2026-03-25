const Footer = () => (
  <footer className="bg-secondary border-t border-dark-3 px-6 md:px-16 pt-20 pb-10">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 pb-16 border-b border-dark-4">
      <div>
        <div className="font-display font-extrabold text-xl text-foreground mb-3">
          Kivu<span className="text-primary">Pass</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
          La plateforme de billetterie #1 en Afrique centrale. Transformez chaque événement en une expérience mémorable.
        </p>
        <div className="flex gap-2.5 mt-6">
          {["f", "in", "📸"].map((icon) => (
            <a
              key={icon}
              href="#"
              className="w-9 h-9 bg-dark-4 border border-dark-5 rounded-[10px] flex items-center justify-center text-muted-foreground text-sm hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>

      {[
        {
          title: "Découvrir KivuPass",
          links: ["Créez votre compte", "Mes billets", "Créez votre billetterie", "Explorer les événements", "Contact"],
        },
        {
          title: "Mentions légales",
          links: ["Conditions de vente", "Confidentialité", "Company", "Cookies"],
        },
        {
          title: "Support",
          links: ["Centre d'aide", "Comment ça marche", "Remboursements", "Contacter l'équipe"],
        },
      ].map((col) => (
        <div key={col.title}>
          <h4 className="font-display font-bold text-sm text-foreground mb-5 tracking-wide">{col.title}</h4>
          <ul className="flex flex-col gap-3">
            {col.links.map((link) => (
              <li key={link}>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-9">
      <p className="text-sm text-text-dim">
        © 2025 <span className="text-primary">KIVUPASS</span> — Tous droits réservés.
      </p>
      <div className="flex gap-6">
        {["Conditions", "Confidentialité", "Cookies"].map((link) => (
          <a key={link} href="#" className="text-sm text-text-dim hover:text-muted-foreground transition-colors">
            {link}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
