import { Link } from 'react-router-dom';

const defaultHeaderContent = {
  navLogoSrc: '/assets/logo_sin_fondo.svg',
  navLogoAlt: 'NOVA Esports',
  titleMain: '1V1 CUP',
  titleMainGradient: false,
  titleSub: 'Tournament',
  brandLogoSrc: '/assets/logo_nova_blanco.svg',
  brandLogoAlt: '',
  brandText: 'esports',
  showcaseSrc: '/assets/gunzo.png',
  showcaseAlt: '',
};

export default function Header({ content = defaultHeaderContent }) {
  const header = { ...defaultHeaderContent, ...content };

  const normalizedTitle = header.titleMain.trim().toUpperCase();
  const isEclipseTitle = normalizedTitle === 'ECLIPSE';

  const titleGradientId = isEclipseTitle
    ? 'eclipse-title-gradient'
    : 'novarush-title-gradient';

  const titleStroke = isEclipseTitle ? '#160d2b' : '#210c2f';

  return (
    <header className="hero-header">
      <nav className="hero-header__nav" aria-label="Principal">
        <Link className="hero-header__nav-logo" to="/">
          <img src={header.navLogoSrc} alt={header.navLogoAlt} />
        </Link>

        <div className="hero-header__nav-links">
          <Link to="/">1V1</Link>
          <Link to="/eclipse">ECLIPSE</Link>
          <Link to="/novarush">NOVA RUSH</Link>
        </div>
      </nav>

      <div className="hero-header__content">
        <div className="hero-header__copy">
          <h1 className="hero-header__title">
            {header.titleMainGradient ? (
              <svg
                className="hero-header__title-main hero-header__title-main-svg"
                viewBox="0 0 920 190"
                role="img"
                aria-label={header.titleMain}
              >
                <defs>
                  <linearGradient
                    id="novarush-title-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#fff7ff" />
                    <stop offset="16%" stopColor="#ffc5ef" />
                    <stop offset="34%" stopColor="#e94094" />
                    <stop offset="58%" stopColor="#e2166b" />
                    <stop offset="78%" stopColor="#f1317b" />
                    <stop offset="100%" stopColor="#ff2fff" />
                  </linearGradient>

                  <linearGradient
                    id="eclipse-title-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="16%" stopColor="#f4ecff" />
                    <stop offset="34%" stopColor="#d8c3ff" />
                    <stop offset="56%" stopColor="#a874f5" />
                    <stop offset="78%" stopColor="#7440c9" />
                    <stop offset="100%" stopColor="#4c218c" />
                  </linearGradient>
                </defs>

                <text
                  x="50%"
                  y="72%"
                  textAnchor="middle"
                  fill={`url(#${titleGradientId})`}
                  stroke={titleStroke}
                  strokeWidth="7"
                  paintOrder="stroke fill"
                >
                  {header.titleMain}
                </text>
              </svg>
            ) : (
              <span className="hero-header__title-main">
                {header.titleMain}
              </span>
            )}

            <span className="hero-header__title-sub">
              {header.titleSub}
            </span>
          </h1>

          <div className="hero-header__brand-row">
            <div className="hero-header__logo-mark" aria-hidden="true">
              <img
                src={header.brandLogoSrc}
                alt={header.brandLogoAlt}
                className="hero-header__logo-image"
              />
            </div>

            <p className="hero-header__esports">
              {header.brandText}
            </p>
          </div>

          <div className="hero-header__accent-line" />
        </div>

        <div className="hero-header__showcase" aria-hidden="true">
          <img
            src={header.showcaseSrc}
            alt={header.showcaseAlt}
          />
        </div>
      </div>
    </header>
  );
}