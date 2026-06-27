import { useId } from "react";
import type { CSSProperties } from "react";
import { Button } from "../ui/Button";
import { MineVisual } from "./MineVisual";
import "./minerals.css";

/** Section f7 — Against illegal mining: centered editorial CTA over a full-bleed
 *  simulated mineral supply-chain illustration. Light band; fictional assets only. */
export function Minerals() {
  const baseId = useId();

  return (
    <section
      className="minerals section section--band"
      id="minerals"
      data-theme="light"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="shell section__header section__header--center minerals__copy">
        <p className="kicker reveal-scroll">Against illegal mining</p>

        <h2
          id={`${baseId}-title`}
          className="section-title section-title--fill-center section-title--editorial reveal-scroll"
          style={{ "--reveal-delay": "60ms" } as CSSProperties}
        >
          Provenance for the minerals the world runs on.
        </h2>

        <p
          className="section-lead section-lead--center reveal-scroll"
          style={{ "--reveal-delay": "120ms" } as CSSProperties}
        >
          From gold to lithium to niobium, Lastro traces a lot from a licensed,
          authorized, cleared origin — mine, processing, transport, export — and
          anchors the proof at every step. The trust layer for a legal mineral
          supply chain.
        </p>

        <div
          className="minerals__actions reveal-scroll"
          style={{ "--reveal-delay": "180ms" } as CSSProperties}
        >
          <Button href="#proof">Verify proof</Button>
        </div>
      </div>

      <figure
        className="minerals__figure reveal-scroll reveal-scroll--clip"
        style={{ "--reveal-delay": "200ms" } as CSSProperties}
        data-scroll-shift="0.05"
      >
        <MineVisual />
        <figcaption className="minerals__caption mono-label">
          Shown with simulated assets for demonstration.
        </figcaption>
      </figure>
    </section>
  );
}
