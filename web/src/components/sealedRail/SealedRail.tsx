import type { CSSProperties } from "react";
import { useSite } from "../../context/SiteContext";
import { Button } from "../ui/Button";
import { trackEvent } from "../../lib/analytics";
import { APP_URL, APP_URL_IS_EXTERNAL, CSPR_PACKAGE_URL } from "../../site-links";
import "./sealed-rail.css";

/** Small right-pointing chevron — step connector, desktop rail only. */
function ConnectorArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M4 2.5L9.5 7L4 11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Blocked-circle glyph — the Invalid branch marker. */
function BlockedGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.8 4.8L13.2 13.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Section 2 — Sealed Market Rail. The wedge: proof before token, proof before
 * finance. Five gated steps (live seal → demo mint/collateral), plus the
 * Invalid branch — the differentiator that keeps the rail closed on-chain. */
export function SealedRail() {
  const { content } = useSite();
  const c = content.sealedRail;
  const lastIndex = c.steps.length - 1;
  // Deep-link into the marketplace rail — strip any trailing slash from
  // APP_URL first so we never emit a double slash before the path.
  const marketplaceUrl = `${APP_URL.replace(/\/$/, "")}/marketplace?rail=1`;

  return (
    <section
      className="sealed-rail section section--bordered"
      id="sealed-rail"
      aria-labelledby="sealed-rail-title"
    >
      <div className="shell">
        <div className="sealed-rail__eyebrow reveal-scroll">
          <p className="kicker">{c.eyebrow}</p>
          <span className="sealed-rail__demo-badge mono-label">{content.boundary.chip}</span>
        </div>

        <h2
          id="sealed-rail-title"
          className="section-title reveal-scroll"
          style={{ "--reveal-delay": "60ms" } as CSSProperties}
        >
          {c.title}
        </h2>

        <p className="section-lead reveal-scroll" style={{ "--reveal-delay": "110ms" } as CSSProperties}>
          {c.body}
        </p>

        <ol
          className="sealed-rail__steps reveal-stagger"
          style={{ "--reveal-delay": "170ms" } as CSSProperties}
          aria-label={c.stepsAria}
        >
          {c.steps.map((step, i) => (
            <li key={step.n} className="sealed-rail__step">
              <div className="sealed-rail__step-card interactive-lift">
                <div className="sealed-rail__step-head">
                  <span className="sealed-rail__step-n" aria-hidden="true">
                    {step.n}
                  </span>
                  <span
                    className={`sealed-rail__chip sealed-rail__chip--${i === 0 ? "live" : "demo"}`}
                  >
                    {step.chip}
                  </span>
                </div>
                <h3 className="sealed-rail__step-title">{step.title}</h3>
                <p className="sealed-rail__step-detail">{step.detail}</p>
              </div>

              {i < lastIndex ? (
                <span className="sealed-rail__connector" aria-hidden="true">
                  <ConnectorArrow />
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="sealed-rail__invalid reveal-scroll" style={{ "--reveal-delay": "230ms" } as CSSProperties}>
          <span className="sealed-rail__invalid-icon" aria-hidden="true">
            <BlockedGlyph />
          </span>
          <div className="sealed-rail__invalid-body">
            <span className="sealed-rail__invalid-label mono-label">{c.invalid.label}</span>
            <h3 className="sealed-rail__invalid-title">{c.invalid.title}</h3>
            <p className="sealed-rail__invalid-detail">{c.invalid.detail}</p>
          </div>
        </div>

        <div className="btn-row sealed-rail__ctas reveal-scroll" style={{ "--reveal-delay": "280ms" } as CSSProperties}>
          <Button
            href={marketplaceUrl}
            external={APP_URL_IS_EXTERNAL}
            onDark
            onClick={() => trackEvent("cta_click", { target: "sealed-rail-app" })}
          >
            {c.ctaPrimary}
          </Button>
          <Button
            href="#proof"
            variant="secondary"
            onDark
            onClick={() => trackEvent("cta_click", { target: "sealed-rail-fraud" })}
          >
            {c.ctaSecondary}
          </Button>
          <Button href={CSPR_PACKAGE_URL} variant="tertiary" onDark external>
            {c.ctaTertiary}
          </Button>
        </div>

        <ul className="sealed-rail__honesty">
          {c.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
