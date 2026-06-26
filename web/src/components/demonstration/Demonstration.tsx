import { useId } from "react";
import type { CSSProperties } from "react";
import { CSPR_PACKAGE_URL, GITHUB_URL } from "../../site-links";
import { Button } from "../ui/Button";
import { BoundaryVisual } from "./BoundaryVisual";
import { ExplorerVisual } from "./ExplorerVisual";
import "./demonstration.css";

/** Sections 8–9 — Honesty by design, then live testnet proof. Z-pattern editorial
 *  rows on the dark band: copy ↔ product console, ending in verifiable CTAs. */
export function Demonstration() {
  const baseId = useId();

  return (
    <div className="demonstration section--band">
      {/* Section 8 — A demonstration, by design */}
      <section
        className="demonstration__row"
        id="honesty"
        aria-labelledby={`${baseId}-honesty-title`}
      >
        <div className="shell split-grid demonstration__grid">
          <div className="demonstration__copy">
            <p className="kicker reveal-scroll">A demonstration, by design</p>

            <h2
              id={`${baseId}-honesty-title`}
              className="section-title reveal-scroll"
              style={{ "--reveal-delay": "60ms" } as CSSProperties}
            >
              We verify provenance. We don't sell anything.
            </h2>

            <p
              className="section-lead section-lead--rule reveal-scroll"
              style={{ "--reveal-delay": "120ms" } as CSSProperties}
            >
              Everything here uses simulated assets and offers no investment, no
              token sale, and no yield. Lastro is a proof layer — it confers no
              ownership and no financial right. Knowing exactly where that line
              sits is part of the protocol.
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

      {/* Section 9 — Verify it yourself */}
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
              className="section-lead section-lead--rule reveal-scroll"
              style={{ "--reveal-delay": "120ms" } as CSSProperties}
            >
              The contract is deployed. Real attestations — accepted and rejected
              — sit on-chain right now. Open the explorer, read the verdicts, run
              the sandbox. Nothing here asks for your trust; all of it earns it.
            </p>

            <div
              className="demonstration__actions reveal-scroll"
              style={{ "--reveal-delay": "180ms" } as CSSProperties}
            >
              <Button href="#proof" trailing={<span aria-hidden="true">→</span>}>
                Verify proof
              </Button>
              <Button href={CSPR_PACKAGE_URL} variant="ghost" external>
                View on cspr.live
              </Button>
              <Button href={GITHUB_URL} variant="ghost" external>
                Read the code on GitHub
              </Button>
            </div>
          </div>

          <div
            className="demonstration__visual reveal-scroll"
            style={{ "--reveal-delay": "240ms" } as CSSProperties}
          >
            <ExplorerVisual />
          </div>
        </div>
      </section>
    </div>
  );
}
