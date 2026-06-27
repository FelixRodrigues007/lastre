import { useId } from "react";
import { CSPR_PACKAGE_URL, GITHUB_URL } from "../../site-links";
import { Button } from "../ui/Button";
import "./final-cta.css";

const TRUST_ITEMS = [
  "Simulated assets only",
  "No asset offer",
  "Valid and Invalid on-chain",
  "Seal decides verdict",
] as const;

function CheckGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Section 10 — Final CTA. Dark editorial block: headline, subhead, three
 *  technical actions, and a compliance trust rail at the bottom. */
export function FinalCta() {
  const baseId = useId();

  return (
    <section
      className="final-cta section"
      id="cta"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="shell final-cta__shell">
        <div className="final-cta__panel reveal-scroll">
          <div className="final-cta__main">
            <h2 id={`${baseId}-title`} className="final-cta__headline">
              Proof before token.
            </h2>

            <div className="final-cta__aside">
              <p className="final-cta__subhead">See provenance verified in real time.</p>

              <div className="final-cta__actions">
                <Button
                  href="#proof"
                  variant="inverse"
                  trailing={<span aria-hidden="true">→</span>}
                >
                  Try the live demo
                </Button>
                <Button href={GITHUB_URL} variant="ghost" external>
                  GitHub
                </Button>
                <Button href={CSPR_PACKAGE_URL} variant="ghost" external>
                  Casper Testnet
                </Button>
              </div>
            </div>
          </div>

          <ul className="final-cta__trust" aria-label="Protocol guardrails">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="final-cta__trust-item">
                <CheckGlyph />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
