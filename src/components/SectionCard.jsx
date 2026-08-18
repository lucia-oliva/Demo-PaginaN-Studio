export default function SectionCard({ icon: Icon, title, subtitle, accent = false, children }) {
  return (
    <section className={`section-card ${accent ? 'section-card--accent' : ''}`}>
      <div className="section-card__header">
        <div className={`section-card__icon ${accent ? 'section-card__icon--accent' : ''}`}>
          <Icon size={18} />
        </div>
        <div>
          <div className="section-card__eyebrow">{subtitle}</div>
          <h3 className="section-card__title">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}
