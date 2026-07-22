import { useId } from "react";
import type { CSSProperties } from "react";
import { useSite } from "../../context/SiteContext";
import "./capabilities.css";

/* Presentation-only mapping — the lamp position each card's glass layers share,
 * and which cards render a coloured signal pill vs. a neutral mono chip.
 * Copy stays pure in content.ts; this is layout, not content. */
const CARD_LAMPS = [
  { pos: "22% 100%", x: "22%" },
  { pos: "50% 100%", x: "50%" },
  { pos: "78% 100%", x: "78%" },
] as const;

const SIGNAL_VARIANTS = ["neutral", "success", "neutral"] as const;

function splitSignal(signal: string): [string, string] {
  const [tag, ...rest] = signal.split(" · ");
  return [tag ?? signal, rest.join(" · ")];
}

export function Capabilities() {
  const baseId = useId();
  const { content } = useSite();
  const c = content.capabilities;

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
          {c.cards.map((card, i) => {
            const [tag, rest] = splitSignal(card.signal);
            const lamp = CARD_LAMPS[i] ?? CARD_LAMPS[1];
            const variant = SIGNAL_VARIANTS[i] ?? "neutral";

            return (
              <li
                key={card.title}
                className="cap-card interactive-lift"
                style={
                  {
                    "--cap-lamp": lamp.pos,
                    "--cap-lamp-x": lamp.x,
                  } as CSSProperties
                }
              >
                <div className="cap-card__base" aria-hidden="true" />
                <div className="cap-card__glow" aria-hidden="true" />
                <div className="cap-card__hotspot" aria-hidden="true" />
                <div className="cap-card__grain cap-card__grain--coarse" aria-hidden="true" />
                <div className="cap-card__grain cap-card__grain--fine" aria-hidden="true" />
                <div className="cap-card__edgelight" aria-hidden="true" />

                <div className="cap-card__content">
                  <p className="cap-card__signal">
                    <span
                      className={`cap-card__signal-tag${
                        variant === "success" ? " cap-card__signal-tag--success" : ""
                      }`}
                    >
                      {tag}
                    </span>
                    {rest ? <span className="cap-card__signal-rest">{rest}</span> : null}
                  </p>

                  <h3 className="cap-card__title">{card.title}</h3>
                  <p className="cap-card__body">{card.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
