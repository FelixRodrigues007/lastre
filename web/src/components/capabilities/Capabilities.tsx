import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useSite } from "../../context/SiteContext";
import "./capabilities.css";

/* Presentation-only mapping — the lamp position each card's glass layers share
 * and the brand tint the card's glass refracts. Copy stays pure in content.ts;
 * this is layout, not content. */
const CARD_STYLE = [
  { lamp: "24% 100%", lampX: "24%", tint: "120, 190, 170" }, // jade / on-chain teal
  { lamp: "50% 100%", lampX: "50%", tint: "212, 232, 120" }, // lime / verdict
  { lamp: "76% 100%", lampX: "76%", tint: "150, 220, 190" }, // seal mint
] as const;

/* Verdict chart — anchored verdicts per period, valid (lime) stacked with the
 * few rejected (amber). Illustrative data; the shape tells the story: a growing,
 * mostly-valid record where rejections are recorded, not hidden. */
const VERDICT_BARS = [
  { v: 6, i: 0 },
  { v: 7, i: 1 },
  { v: 5, i: 0 },
  { v: 8, i: 0 },
  { v: 7, i: 1 },
  { v: 9, i: 0 },
  { v: 8, i: 0 },
  { v: 10, i: 1 },
  { v: 9, i: 0 },
  { v: 11, i: 1 },
] as const;
const BAR_MAX = 12;
const CHART_H = 46;
const VALID_TOTAL = VERDICT_BARS.reduce((s, b) => s + b.v, 0);
const INVALID_TOTAL = VERDICT_BARS.reduce((s, b) => s + b.i, 0);

/** Outer frosted-glass card: the 5 stacked light layers + the content slot. */
function GlassCard({
  index,
  labelledBy,
  children,
}: {
  index: number;
  labelledBy: string;
  children: ReactNode;
}) {
  const s = CARD_STYLE[index] ?? CARD_STYLE[1];
  return (
    <li
      className="cap-card interactive-lift"
      aria-labelledby={labelledBy}
      style={
        {
          "--cap-lamp": s.lamp,
          "--cap-lamp-x": s.lampX,
          "--cap-tint": s.tint,
        } as CSSProperties
      }
    >
      <div className="cap-card__base" aria-hidden="true" />
      <div className="cap-card__tint" aria-hidden="true" />
      <div className="cap-card__glow" aria-hidden="true" />
      <div className="cap-card__hotspot" aria-hidden="true" />
      <div className="cap-card__grain cap-card__grain--coarse" aria-hidden="true" />
      <div className="cap-card__grain cap-card__grain--fine" aria-hidden="true" />
      <div className="cap-card__edgelight" aria-hidden="true" />
      <div className="cap-card__content">{children}</div>
    </li>
  );
}

export function Capabilities() {
  const baseId = useId();
  const { content } = useSite();
  const c = content.capabilities;

  const [seal, verdict, mint] = c.cards;

  return (
    <section
      className="cap section section--bordered"
      id="capabilities"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="shell">
        <p className="kicker reveal-scroll">{c.kicker}</p>

        <header className="cap__header">
          <h2
            id={`${baseId}-title`}
            className="section-title section-title--wide reveal-scroll"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            {c.title}
          </h2>
          <p
            className="section-lead reveal-scroll"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            {c.subtitle}
          </p>
        </header>

        <ul
          className="cap__grid reveal-stagger"
          style={{ "--reveal-delay": "160ms" } as CSSProperties}
          aria-label={c.cardsAria}
        >
          {/* 1 · Offline Seal — the Sealer panel */}
          <GlassCard index={0} labelledBy={`${baseId}-c0`}>
            <header className="cap-card__head">
              <h3 id={`${baseId}-c0`} className="cap-card__title">
                {seal.title}
              </h3>
              <p className="cap-card__body">{seal.body}</p>
            </header>

            <div className="mock" aria-hidden="true">
              <div className="mock__bar">
                <span className="mock__name">
                  <span className="mock__dot" /> {seal.mock.panel}
                </span>
                <span className="mock__tag">{seal.mock.tag}</span>
              </div>
              <p className="mock__caption">{seal.mock.readingLabel}</p>
              <dl className="mock__rows">
                {seal.mock.rows.map((r) => (
                  <div key={r.label} className="mock__row">
                    <dt>{r.label}</dt>
                    <dd className="mock__mono">{r.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mock__rule" />
              <p className="mock__caption">{seal.mock.hashLabel}</p>
              <p className="mock__hash">{seal.mock.hash}</p>
              <p className="mock__note">
                <span className="mock__spark">✦</span> {seal.mock.note}
              </p>
            </div>
          </GlassCard>

          {/* 2 · Permanent Verdict — the on-chain ledger */}
          <GlassCard index={1} labelledBy={`${baseId}-c1`}>
            <header className="cap-card__head">
              <h3 id={`${baseId}-c1`} className="cap-card__title">
                {verdict.title}
              </h3>
              <p className="cap-card__body">{verdict.body}</p>
            </header>

            <div className="mock" aria-hidden="true">
              <div className="mock__bar">
                <span className="mock__name">
                  <span className="mock__dot" /> {verdict.mock.panel}
                </span>
                <span className="mock__tag">{verdict.mock.tag}</span>
              </div>
              <p className="mock__caption">{verdict.mock.caption}</p>
              <div className="mock__chart">
                {VERDICT_BARS.map((b, i) => (
                  <span
                    key={i}
                    className="mock__col"
                    style={
                      {
                        "--i": String(i),
                        "--vh": `${(b.v / BAR_MAX) * CHART_H}px`,
                        "--ih": `${(b.i / BAR_MAX) * CHART_H}px`,
                      } as CSSProperties
                    }
                  >
                    <span className="mock__seg mock__seg--invalid" />
                    <span className="mock__seg mock__seg--valid" />
                  </span>
                ))}
              </div>
              <div className="mock__legend">
                <span className="mock__leg mock__leg--valid">
                  {verdict.mock.validLabel} {VALID_TOTAL}
                </span>
                <span className="mock__leg mock__leg--invalid">
                  {verdict.mock.invalidLabel} {INVALID_TOTAL}
                </span>
              </div>
              <div className="mock__rule" />
              <div className="mock__foot">
                <span className="mock__note">
                  <span className="mock__spark">✦</span> {verdict.mock.note}
                </span>
                <span className="mock__mono mock__dim">{verdict.mock.tx}</span>
              </div>
            </div>
          </GlassCard>

          {/* 3 · Provenance Marketplace — the MintGate */}
          <GlassCard index={2} labelledBy={`${baseId}-c2`}>
            <header className="cap-card__head">
              <h3 id={`${baseId}-c2`} className="cap-card__title">
                {mint.title}
              </h3>
              <p className="cap-card__body">{mint.body}</p>
            </header>

            <div className="mock" aria-hidden="true">
              <div className="mock__bar">
                <span className="mock__name">
                  <span className="mock__dot" /> {mint.mock.panel}
                </span>
              </div>
              <div className="mock__asset">
                <span className="mock__asset-label">{mint.mock.assetLabel}</span>
                <span className="mock__mono">{mint.mock.asset}</span>
              </div>
              <p className="mock__prov">
                <span className="mock__check">✓</span> {mint.mock.provenance}
              </p>
              <div className="mock__rule" />
              <p className="mock__gate">{mint.mock.gate}</p>
              <span className="mock__cta">{mint.mock.cta}</span>
            </div>
          </GlassCard>
        </ul>
      </div>
    </section>
  );
}
