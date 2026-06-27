import { useId } from "react";
import type { CSSProperties } from "react";
import { useSite } from "../../context/SiteContext";
import { Button } from "../ui/Button";
import { MineVisual } from "./MineVisual";
import "./minerals.css";

export function Minerals() {
  const baseId = useId();
  const { t, content } = useSite();
  const c = content.minerals;

  return (
    <section
      className="minerals section section--band"
      id="minerals"
      data-theme="light"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="shell section__header section__header--center minerals__copy">
        <p className="kicker reveal-scroll">{c.kicker}</p>

        <h2
          id={`${baseId}-title`}
          className="section-title section-title--fill-center section-title--editorial reveal-scroll"
          style={{ "--reveal-delay": "60ms" } as CSSProperties}
        >
          {c.title}
        </h2>

        <p
          className="section-lead section-lead--center reveal-scroll"
          style={{ "--reveal-delay": "120ms" } as CSSProperties}
        >
          {c.lead}
        </p>

        <div
          className="minerals__actions reveal-scroll"
          style={{ "--reveal-delay": "180ms" } as CSSProperties}
        >
          <Button href="#proof">{t("verifyProof")}</Button>
        </div>
      </div>

      <figure
        className="minerals__figure reveal-scroll reveal-scroll--clip"
        style={{ "--reveal-delay": "200ms" } as CSSProperties}
        data-scroll-shift="0.05"
      >
        <MineVisual />
        <figcaption className="minerals__caption mono-label">{c.caption}</figcaption>
      </figure>
    </section>
  );
}
