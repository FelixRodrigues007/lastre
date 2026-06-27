import { useId } from "react";
import "./different.css";

const PILLARS = [
  {
    key: "provenance",
    title: "Physical provenance",
    body: "Not another API feed or a model's claim. Proof tied to a real-world reading.",
  },
  {
    key: "offline",
    title: "Offline determinism",
    body: "No cloud, no clock, no LLM deciding the verdict. A seal a machine can't fake.",
  },
  {
    key: "onchain",
    title: "On-chain rejection",
    body: 'Valid and Invalid are both permanent on Casper. Almost no one records the "no."',
  },
] as const;

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
          <h2 id={`${baseId}-title`} className="section-title section-title--fill reveal-scroll">
            Others build agents that consume real-world data.{" "}
            <span className="accent-emphasis">
              Lastro proves the data came from reality first.
            </span>
          </h2>
        </header>

        <ul className="diff__pillars reveal-stagger" aria-label="What makes Lastro different">
          {PILLARS.map((pillar) => (
            <li key={pillar.key} className="diff__pillar">
              <h3 className="diff__pillar-title">{pillar.title}</h3>
              <p className="diff__pillar-body">{pillar.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
