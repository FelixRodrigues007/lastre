import { useId } from "react";
import {
  APP_URL,
  CASE_STUDY_URL,
  CSPR_PACKAGE_URL,
  GITHUB_URL,
} from "../../site-links";
import { useSite } from "../../context/SiteContext";
import { trackEvent } from "../../lib/analytics";
import { MEDIA } from "../../site-media";
import { Button } from "../ui/Button";
import "./final-cta.css";

const TRUST_ITEMS = [
  "Simulated assets only",
  "No investment or token sale",
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

export function FinalCta() {
  const baseId = useId();
  const { t } = useSite();

  return (
    <section className="final-cta section on-dark" id="cta" aria-labelledby={`${baseId}-title`}>
      <div className="shell final-cta__shell">
        <div className="final-cta__panel reveal-scroll reveal-scroll--scale">
          <div className="final-cta__panel-media" aria-hidden="true">
            <img src={MEDIA.heroMiner} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="final-cta__main">
            <h2 id={`${baseId}-title`} className="final-cta__headline">
              Proof before token.
            </h2>

            <div className="final-cta__aside">
              <p className="final-cta__subhead">See provenance verified in real time.</p>

              <div className="final-cta__actions">
                <div className="btn-row">
                  <Button
                    href={APP_URL}
                    onDark
                    onClick={() => trackEvent("cta_click", { target: "final-app" })}
                  >
                    {t("openApp")}
                  </Button>
                  <Button
                    href={CASE_STUDY_URL}
                    variant="secondary"
                    onDark
                    external
                    onClick={() => trackEvent("cta_click", { target: "final-case" })}
                  >
                    Case study
                  </Button>
                </div>
                <div className="btn-links">
                  <Button
                    href={GITHUB_URL}
                    variant="tertiary"
                    onDark
                    external
                    onClick={() => trackEvent("cta_click", { target: "final-github" })}
                  >
                    GitHub
                  </Button>
                  <Button href={CSPR_PACKAGE_URL} variant="tertiary" onDark external>
                    Casper Testnet
                  </Button>
                  <Button
                    href="mailto:hello@lastro.dev?subject=Technical%20walkthrough"
                    variant="tertiary"
                    onDark
                  >
                    {t("bookWalkthrough")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <ul className="final-cta__trust reveal-stagger" aria-label="Protocol guardrails">
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
