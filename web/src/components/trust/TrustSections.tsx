import { useSite } from "../../context/SiteContext";
import { MediaCard } from "../ui/MediaCard";
import { GlyphField, type GlyphShape } from "../visual/GlyphField";
import { MEDIA } from "../../site-media";
import "./trust-sections.css";
import "../ui/media-card.css";
import "../visual/visual.css";

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

const PERSONA_GLYPHS: readonly GlyphShape[] = ["magnifier", "blocks", "shield"];

export function Personas() {
  const { content } = useSite();
  const c = content.trust;

  return (
    <section className="personas section section--bordered" id="personas" aria-labelledby="personas-title">
      <div className="shell">
        <h2 id="personas-title" className="section-title section-title--narrow reveal-scroll">
          {c.personasTitle}
        </h2>
        <p className="personas__lede reveal-scroll">
          {content.different.titlePrefix}
          <span className="accent-emphasis">{content.different.titleEmphasis}</span>
        </p>
        <ul className="card-grid card-grid--3 reveal-stagger" style={{ marginTop: "var(--lastro-space-8)" }}>
          {c.personas.map((p, i) => (
            <li key={p.title}>
              <MediaCard
                media={<GlyphField shape={PERSONA_GLYPHS[i] ?? "magnifier"} />}
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

