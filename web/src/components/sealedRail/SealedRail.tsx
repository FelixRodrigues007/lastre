import type { CSSProperties } from "react";
import { useSite } from "../../context/SiteContext";
import { Button } from "../ui/Button";
import { trackEvent } from "../../lib/analytics";
import { APP_URL, APP_URL_IS_EXTERNAL, CSPR_PACKAGE_URL } from "../../site-links";
import "./sealed-rail.css";

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
 * finance. Five gated steps rendered as one continuous progress rail (live seal
 * → demo mint/collateral), plus the Invalid branch — the differentiator that
 * keeps the rail closed on-chain. */
export function SealedRail() {
  const { content } = useSite();
  const c = content.sealedRail;
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
        {/* Header — big title left, lead right (reference rhythm). */}
        <div className="sealed-rail__header">
          <h2
            id="sealed-rail-title"
            className="section-title sealed-rail__title reveal-scroll"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            {c.title}
          </h2>
          <p
            className="section-lead sealed-rail__lead reveal-scroll"
            style={{ "--reveal-delay": "110ms" } as CSSProperties}
          >
            {c.body}
          </p>
        </div>

        {/* Panel — card subheading + primary CTA, then the progress rail. */}
        <div
          className="sealed-rail__panel reveal-scroll"
          style={{ "--reveal-delay": "170ms" } as CSSProperties}
        >
          <div className="sealed-rail__panel-head">
            <p className="sealed-rail__panel-title">{c.railHeading}</p>
            <Button
              href={marketplaceUrl}
              external={APP_URL_IS_EXTERNAL}
              onDark
              onClick={() => trackEvent("cta_click", { target: "sealed-rail-app" })}
            >
              {c.ctaPrimary}
            </Button>
          </div>

          <ol className="sealed-rail__track" aria-label={c.stepsAria}>
            {c.steps.map((step, i) => (
              <li
                key={step.n}
                className={`sealed-rail__col sealed-rail__col--${i === 0 ? "live" : "demo"}`}
              >
                <span className="sealed-rail__node" aria-hidden="true" />
                <span className="sealed-rail__badge">
                  <span className="sealed-rail__badge-n">{step.n.padStart(2, "0")}</span>
                  <span className="sealed-rail__badge-label">{step.title}</span>
                </span>
                <p className="sealed-rail__col-detail">{step.detail}</p>
                <span className="sealed-rail__col-meta">{step.chip}</span>
              </li>
            ))}
          </ol>
        </div>

        <div
          className="sealed-rail__invalid reveal-scroll"
          style={{ "--reveal-delay": "230ms" } as CSSProperties}
        >
          <span className="sealed-rail__invalid-icon" aria-hidden="true">
            <BlockedGlyph />
          </span>
          <div className="sealed-rail__invalid-body">
            <span className="sealed-rail__invalid-label mono-label">{c.invalid.label}</span>
            <h3 className="sealed-rail__invalid-title">{c.invalid.title}</h3>
            <p className="sealed-rail__invalid-detail">{c.invalid.detail}</p>
          </div>
        </div>

        <div
          className="btn-row sealed-rail__ctas reveal-scroll"
          style={{ "--reveal-delay": "280ms" } as CSSProperties}
        >
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
      </div>
    </section>
  );
}
