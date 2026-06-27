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

const PERSONAS = [
  {
    title: "Technical evaluator",
    body: "Run the end-to-end demo and inspect audit output in under five minutes.",
    image: MEDIA.heroMiner,
    label: "Evaluator",
  },
  {
    title: "RWA builder",
    body: "See how a lot moves from artifact → decision → on-chain attestation.",
    image: MEDIA.layerFront,
    label: "Builder",
  },
  {
    title: "Compliance reviewer",
    body: "Trace rejected lots and permanent Invalid records — not hidden failures.",
    image: MEDIA.footerMine,
    label: "Compliance",
  },
] as const;

export function Personas() {
  const { t } = useSite();
  return (
    <section className="personas section section--bordered" id="personas" aria-labelledby="personas-title">
      <div className="shell">
        <p className="kicker reveal-scroll">{t("builtFor")}</p>
        <h2 id="personas-title" className="section-title section-title--narrow reveal-scroll">
          Built for the people who verify — not speculate.
        </h2>
        <ul className="card-grid card-grid--3 reveal-stagger" style={{ marginTop: "var(--lastro-space-8)" }}>
          {PERSONAS.map((p) => (
            <li key={p.title}>
              <MediaCard
                image={p.image}
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
  const { t } = useSite();
  const items = [
    "Deterministic seal — no LLM verdict",
    "Invalid is permanent proof on Casper",
    "Simulated assets only in public demo",
    "No investment or token sale language",
  ];
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
              {items.map((item) => (
                <li key={item} className="security__item">
                  {item}
                </li>
              ))}
            </ul>
            <div className="compliance-chips">
              {["EU critical raw materials", "OECD due diligence", "Offline chain-of-custody"].map((c) => (
                <span key={c} className="compliance-chip mono-label">
                  {c}
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
  const { t } = useSite();
  return (
    <div className="gh-stats panel panel--elevated" aria-label={t("githubStats")}>
      <div className="gh-stats__row">
        <span className="mono-label">License</span>
        <span>Apache-2.0</span>
      </div>
      <div className="gh-stats__row">
        <span className="mono-label">Stack</span>
        <span>Rust · Casper · TypeScript</span>
      </div>
      <div className="gh-stats__row">
        <span className="mono-label">Demo</span>
        <span>Fictional lots only</span>
      </div>
    </div>
  );
}

const QUOTES = [
  {
    text: "The seal vs. action separation clicked immediately — Invalid as proof is the insight.",
    role: "Simulated protocol evaluator",
    image: MEDIA.heroMiner,
  },
  {
    text: "Finally a demo that shows rejection on-chain instead of hiding failures.",
    role: "Simulated compliance reviewer",
    image: MEDIA.depthFront,
  },
] as const;

export function Testimonials() {
  const { t } = useSite();
  return (
    <section className="testimonials section" id="testimonials" aria-label="Evaluator feedback">
      <div className="shell">
        <p className="kicker">{t("simulatedOnly")}</p>
        <ul className="card-grid card-grid--2">
          {QUOTES.map((q) => (
            <li key={q.role}>
              <blockquote className="testimonials__card panel panel--light">
                <div className="testimonials__card-media" aria-hidden="true">
                  <img src={q.image} alt="" loading="lazy" />
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
  return (
    <aside className="pull-quote pull-quote--media shell" id="quote" aria-label="Highlight">
      <div className="pull-quote__bg" aria-hidden="true">
        <img src={MEDIA.heroOriginWide} alt="" loading="lazy" />
      </div>
      <p className="pull-quote__text">
        "When the data is wrong, the entire stack runs on fiction — unless origin is proven first."
      </p>
    </aside>
  );
}
