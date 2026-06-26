import { useId } from "react";
import type { CSSProperties } from "react";
import "./different.css";

type Card = {
  key: string;
  label: string;
  accent: "seal" | "sage" | "valid";
  title: string;
  body: string;
  featured?: boolean;
};

const CARDS: readonly Card[] = [
  {
    key: "provenance",
    label: "Provenance",
    accent: "seal",
    title: "Physical provenance",
    body:
      "Not another API feed or a model's claim. Proof tied to a real-world reading.",
    featured: true,
  },
  {
    key: "offline",
    label: "Offline",
    accent: "sage",
    title: "Offline determinism",
    body:
      "No cloud, no clock, no LLM deciding the verdict. A seal a machine can't fake.",
  },
  {
    key: "onchain",
    label: "On-chain",
    accent: "valid",
    title: "On-chain rejection",
    body:
      'Valid and Invalid are both permanent on Casper. Almost no one records the "no."',
  },
] as const;

const READING_SOURCES = ["Sensor", "Document", "API"] as const;

function CategoryIcon({ accent }: { accent: Card["accent"] }) {
  return <span className={`diff__icon diff__icon--${accent}`} aria-hidden="true" />;
}

/** Section — Why it's different: a 2:1:1 feature grid that contrasts Lastro's
 *  physical proof model with the industry's agent-first consumption pattern. */
export function Different() {
  const baseId = useId();

  return (
    <section
      className="diff section section--band"
      id="different"
      data-theme="light"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="shell">
        <header className="section__header section__header--fill">
          <p className="kicker reveal-scroll">Why it's different</p>
          <h2
            id={`${baseId}-title`}
            className="section-title section-title--fill reveal-scroll"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            Others build agents that consume real-world data.{" "}
            <span className="accent-emphasis">
              Lastro proves the data came from reality first.
            </span>
          </h2>
        </header>

        <ul
          className="diff__grid reveal-scroll"
          style={{ "--reveal-delay": "140ms" } as CSSProperties}
          aria-label="What makes Lastro different"
        >
          {CARDS.map((card) => (
            <li
              key={card.key}
              className={`diff__card${card.featured ? " diff__card--featured" : ""}`}
            >
              <div className="diff__card-inner">
                <div className="diff__card-top">
                  <span className="diff__category">
                    <CategoryIcon accent={card.accent} />
                    <span className="mono-label">{card.label}</span>
                  </span>

                  <h3 className="diff__card-title">{card.title}</h3>

                  {!card.featured && (
                    <p className="diff__card-body">{card.body}</p>
                  )}
                </div>

                {card.featured && (
                  <>
                    <p className="diff__card-body diff__card-body--featured">
                      {card.body}
                    </p>

                    <footer className="diff__footer" aria-label="Reading sources">
                      <ul className="diff__sources">
                        {READING_SOURCES.map((source) => (
                          <li key={source} className="diff__source">
                            <span className="diff__source-mark" aria-hidden="true" />
                            <span className="diff__source-name">{source}</span>
                          </li>
                        ))}
                      </ul>
                    </footer>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
