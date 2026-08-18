const defaultFooterContent = {
  logoSrc: "/assets/logo_1v1_cup_in_nova1.svg",
  logoAlt: "1V1 Cup In Nova",
  tagline: "Esto es un 1V1",
  legal: ["© 2026 Nova Esports", "Todos los derechos reservados"],
  eyebrow: "Sistema de puntuacion",
  formulaTitle: "¿Como puntuamos?",
  formulaText: "Puntos kills + Puntos posicion - Sanciones =",
  formulaStrong: "TOTAL",
  scoringRules: [
    { label: "Kill", value: "2 puntos" },
    { label: "Posición 1", value: "10 puntos" },
    { label: "Posición 2", value: "6 puntos" },
    { label: "Posición 3", value: "4 puntos" },
  ],
};

export default function TournamentFooter({ content = defaultFooterContent }) {
  const footer = { ...defaultFooterContent, ...content };

  return (
    <footer className="tournament-footer">
      <div className="tournament-footer__line" />

      <div className="tournament-footer__inner">
        <section className="tournament-footer__brand">
          <img
            src={footer.logoSrc}
            alt={footer.logoAlt}
            className="tournament-footer__logo"
          />

          <div className="tournament-footer__brand-line" />

          <p className="tournament-footer__tagline">{footer.tagline}</p>

          <div className="tournament-footer__legal">
            {footer.legal.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="tournament-footer__rules-card">
          <div className="tournament-footer__card-glow" />

          <div className="tournament-footer__card-content">
            <p className="tournament-footer__eyebrow">{footer.eyebrow}</p>

            <div className="tournament-footer__rules-list">
              {footer.scoringRules.map((rule) => (
                <div className="tournament-footer__rule-row" key={rule.label}>
                  <span>{rule.label}</span>
                  <strong>{rule.value}</strong>
                </div>
              ))}
            </div>

            <div className="tournament-footer__formula">
              <span className="tournament-footer__formula-title">
                {footer.formulaTitle}
              </span>

              <p>
                {footer.formulaText} <strong>{footer.formulaStrong}</strong>
              </p>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}
