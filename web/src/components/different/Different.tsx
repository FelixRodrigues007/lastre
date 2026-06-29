import { useId } from "react";
import { useSite } from "../../context/SiteContext";
import { MEDIA } from "../../site-media";
import { ShaderImage } from "../visual/ShaderImage";
import "./different.css";
import "../visual/visual.css";

const PILLAR_KEYS = ["provenance", "offline", "onchain"] as const;
const PILLAR_IMAGES = [MEDIA.heroMiner, MEDIA.depthBack, MEDIA.layerFront] as const;

export function Different() {
  const baseId = useId();
  const { content } = useSite();
  const c = content.different;

  return (
    <section
      className="diff section section--band"
      id="different"
      data-theme="light"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="shell">
        <header className="section__header section__header--fill">
          <p className="kicker reveal-scroll">{c.kicker}</p>
          <h2 id={`${baseId}-title`} className="section-title section-title--fill reveal-scroll">
            {c.titlePrefix}
            <span className="accent-emphasis">{c.titleEmphasis}</span>
          </h2>
        </header>

        <ul className="diff__pillars reveal-stagger" aria-label={c.pillarsAria}>
          {c.pillars.map((pillar, i) => (
            <li key={PILLAR_KEYS[i] ?? pillar.title} className="diff__pillar">
              <div className="diff__pillar-visual" aria-hidden="true">
                <ShaderImage
                  src={PILLAR_IMAGES[i] ?? MEDIA.heroMiner}
                  shader={i === 1 ? "glow" : "mesh"}
                  drift={i !== 2}
                />
              </div>
              <h3 className="diff__pillar-title">{pillar.title}</h3>
              <p className="diff__pillar-body">{pillar.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
