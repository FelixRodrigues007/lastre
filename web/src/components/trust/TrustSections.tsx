import { useSite } from "../../context/SiteContext";
import { MediaCard } from "../ui/MediaCard";
import { MEDIA } from "../../site-media";
import "./trust-sections.css";
import "../ui/media-card.css";

const PARTNERS = ["Casper Network", "Open Source", "SHA-256", "Web Crypto"] as const;

export function PartnersBar() {
  const { t } = useSite();
  return (
    <section className="partners section--compact" id="partners" aria-label={t("partners")}>
      <div className="shell partners__inner">
        <p className="partners__label mono-label">{t("partners")}</p>
        <ul className="partners__logos">
          {PARTNERS.map((name) => (
            <li key={name} className="partners__logo">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const PERSONA_IMAGES = [MEDIA.heroMiner, MEDIA.layerFront, MEDIA.footerMine] as const;

export function Personas() {
  const { t, content } = useSite();
  const c = content.trust;

  return (
    <section className="personas section section--bordered" id="personas" aria-labelledby="personas-title">
      <div className="shell">
        <p className="kicker reveal-scroll">{t("builtFor")}</p>
        <h2 id="personas-title" className="section-title section-title--narrow reveal-scroll">
          {c.personasTitle}
        </h2>
        <ul className="card-grid card-grid--3 reveal-stagger" style={{ marginTop: "var(--lastro-space-8)" }}>
          {c.personas.map((p, i) => (
            <li key={p.title}>
              <MediaCard
                image={PERSONA_IMAGES[i] ?? MEDIA.heroMiner}
                alt=""
                label={p.label}
                title={p.title}
                body={p.body}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SecurityPosture() {
  const { t, content } = useSite();
  const c = content.trust;

  return (
    <section className="security section section--band" id="trust" data-theme="light">
      <div className="shell">
        <div className="split-media split-media--reverse">
          <figure className="split-media__figure">
            <img src={MEDIA.layerBack} alt="" loading="lazy" decoding="async" />
            <figcaption className="split-media__frame" aria-hidden="true" />
          </figure>
          <div>
            <h2 className="section-title">{t("security")}</h2>
            <ul className="security__list">
              {c.securityItems.map((item) => (
                <li key={item} className="security__item">
                  {item}
                </li>
              ))}
            </ul>
            <div className="compliance-chips">
              {c.complianceChips.map((chip) => (
                <span key={chip} className="compliance-chip mono-label">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GitHubStats() {
  const { t, content } = useSite();
  const c = content.trust;

  return (
    <div className="gh-stats panel panel--elevated" aria-label={t("githubStats")}>
      <div className="gh-stats__row">
        <span className="mono-label">{c.ghLicense}</span>
        <span>Apache-2.0</span>
      </div>
      <div className="gh-stats__row">
        <span className="mono-label">{c.ghStack}</span>
        <span>Rust · Casper · TypeScript</span>
      </div>
      <div className="gh-stats__row">
        <span className="mono-label">{c.ghDemo}</span>
        <span>{c.ghDemoVal}</span>
      </div>
    </div>
  );
}

const QUOTE_IMAGES = [MEDIA.heroMiner, MEDIA.depthFront] as const;

export function Testimonials() {
  const { t, content } = useSite();
  const c = content.trust;

  return (
    <section className="testimonials section" id="testimonials" aria-label={c.testimonialsAria}>
      <div className="shell">
        <p className="kicker">{t("simulatedOnly")}</p>
        <ul className="card-grid card-grid--2">
          {c.quotes.map((q, i) => (
            <li key={q.role}>
              <blockquote className="testimonials__card panel panel--light">
                <div className="testimonials__card-media" aria-hidden="true">
                  <img src={QUOTE_IMAGES[i] ?? MEDIA.heroMiner} alt="" loading="lazy" />
                </div>
                <p className="testimonials__quote">"{q.text}"</p>
                <cite className="testimonials__cite mono-label">{q.role}</cite>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PullQuote() {
  const { content } = useSite();

  return (
    <aside className="pull-quote pull-quote--media shell" id="quote" aria-label={content.trust.pullQuoteAria}>
      <div className="pull-quote__bg" aria-hidden="true">
        <img src={MEDIA.heroOriginWide} alt="" loading="lazy" />
      </div>
      <p className="pull-quote__text">"{content.trust.pullQuote}"</p>
    </aside>
  );
}
