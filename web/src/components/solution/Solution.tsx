import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { LayerShowcase } from "./LayerShowcase";
import "./solution.css";

type Feature = {
  key: string;
  icon: ReactNode;
  title: string;
  body: string;
};

function ReadingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SealIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M3.5 6.5L9 3.5L14.5 6.5V11.5L9 14.5L3.5 11.5V6.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 9L8 10.5L11.5 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnchorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M14 9A5 5 0 1 1 9 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M9 2V9H14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURES: readonly Feature[] = [
  {
    key: "reading",
    icon: <ReadingIcon />,
    title: "Physical readings, not claims",
    body:
      "See which sensors, documents, and API responses drive the most proofs — and which origin gaps keep surfacing across every asset class, in real time.",
  },
  {
    key: "seal",
    icon: <SealIcon />,
    title: "Verdicts nothing can fake",
    body:
      "Lastre seals readings offline with deterministic cryptography. No cloud, no clock, no LLM deciding the outcome — only a chain-judged Valid or Invalid.",
  },
  {
    key: "layer",
    icon: <AnchorIcon />,
    title: "The layer everything builds on",
    body:
      "Agents, escrows, and tokenization finally run on verified origin. Lastre learns from each attestation — building the proof foundation your economy depends on.",
  },
] as const;

/** Section 3 — Split masthead, cinematic proof feed, and three-column value grid. */
export function Solution() {
  const baseId = useId();

  return (
    <section className="sol section section--bordered" id="solution" aria-labelledby={`${baseId}-title`}>
      <div className="shell">
        <header className="sol__header">
          <div className="sol__header-main reveal-scroll">
            <span className="sol__badge">
              <span className="sol__badge-dot" aria-hidden="true" />
              Origin proof
            </span>

            <h2
              id={`${baseId}-title`}
              className="sol__title"
              style={{ "--reveal-delay": "60ms" } as CSSProperties}
            >
              Lastre proves the origin before any token or agent touches the data.
            </h2>
          </div>

          <p
            className="sol__aside reveal-scroll"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            Lastre sits beneath the agent economy. It turns physical readings into
            chain-judged proof, so tokens and agents act on verified origin — never
            on unverified claims.
          </p>
        </header>

        <div
          className="sol__showcase-wrap reveal-scroll"
          style={{ "--reveal-delay": "180ms" } as CSSProperties}
        >
          <LayerShowcase />
        </div>

        <ul
          className="sol__features reveal-scroll"
          style={{ "--reveal-delay": "240ms" } as CSSProperties}
          aria-label="What the proof layer delivers"
        >
          {FEATURES.map((feature) => (
            <li key={feature.key} className="sol__feature">
              <span className="sol__feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="sol__feature-title">{feature.title}</h3>
              <p className="sol__feature-body">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
