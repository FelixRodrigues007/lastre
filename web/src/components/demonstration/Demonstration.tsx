import { useId, useState } from "react";
import type { CSSProperties } from "react";
import { CSPR_EXPLORER_EMBED, CSPR_PACKAGE_URL, GITHUB_URL } from "../../site-links";
import { useSite } from "../../context/SiteContext";
import { Button } from "../ui/Button";
import { BoundaryVisual } from "./BoundaryVisual";
import { ExplorerVisual } from "./ExplorerVisual";
import "./demonstration.css";
import "../content/content-sections.css";

export function Demonstration() {
  const baseId = useId();
  const { t } = useSite();
  const [showEmbed, setShowEmbed] = useState(false);

  return (
    <div className="demonstration section--band">
      <section
        className="demonstration__row"
        id="honesty"
        aria-labelledby={`${baseId}-honesty-title`}
      >
        <div className="shell split-grid demonstration__grid">
          <div className="demonstration__copy">
            <p className="kicker reveal-scroll">A demonstration, by design</p>
            <p className="section-intro">Honesty is part of the protocol boundary.</p>

            <h2
              id={`${baseId}-honesty-title`}
              className="section-title reveal-scroll"
              style={{ "--reveal-delay": "60ms" } as CSSProperties}
            >
              We verify provenance. We don't sell anything.
            </h2>

            <p
              className="section-lead section-lead--rule reveal-scroll body-max-ch"
              style={{ "--reveal-delay": "120ms" } as CSSProperties}
            >
              Everything here uses simulated assets and offers no investment, no
              token sale, and no yield. Lastro is a proof layer — it confers no
              ownership and no financial right.
            </p>
          </div>

          <div
            className="demonstration__visual reveal-scroll"
            style={{ "--reveal-delay": "180ms" } as CSSProperties}
          >
            <BoundaryVisual />
          </div>
        </div>
      </section>

      <section
        className="demonstration__row demonstration__row--reverse"
        id="demo"
        aria-labelledby={`${baseId}-live-title`}
      >
        <div className="shell split-grid demonstration__grid demonstration__grid--reverse">
          <div className="demonstration__copy">
            <p className="kicker reveal-scroll">Verify it yourself</p>

            <h2
              id={`${baseId}-live-title`}
              className="section-title reveal-scroll"
              style={{ "--reveal-delay": "60ms" } as CSSProperties}
            >
              Live on Casper Testnet. Provable by anyone.
            </h2>

            <p
              className="section-lead section-lead--rule reveal-scroll body-max-ch"
              style={{ "--reveal-delay": "120ms" } as CSSProperties}
            >
              The contract is deployed. Real attestations — accepted and rejected
              — sit on-chain right now.
            </p>

            <div
              className="demonstration__actions btn-row reveal-scroll"
              style={{ "--reveal-delay": "180ms" } as CSSProperties}
            >
              <Button href="#proof">{t("tryTamperDemo")}</Button>
              <Button href={CSPR_PACKAGE_URL} variant="secondary" external>
                View on cspr.live
              </Button>
              <Button href={GITHUB_URL} variant="tertiary" external>
                Read the code
              </Button>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowEmbed((v) => !v)}>
                {showEmbed ? "Hide" : "Show"} live explorer
              </button>
            </div>
          </div>

          <div
            className="demonstration__visual reveal-scroll"
            style={{ "--reveal-delay": "240ms" } as CSSProperties}
          >
            {showEmbed ? (
              <>
                <iframe
                  className="expl__embed"
                  src={CSPR_EXPLORER_EMBED}
                  title="Casper Testnet explorer — ProofOfOrigin package"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  loading="lazy"
                />
                <p className="expl__embed-fallback">
                  If the embed is blocked,{" "}
                  <a href={CSPR_PACKAGE_URL} target="_blank" rel="noopener noreferrer">
                    open cspr.live directly
                  </a>
                  .
                </p>
              </>
            ) : (
              <ExplorerVisual />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
