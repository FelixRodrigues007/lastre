import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Button } from "../ui/Button";
import { SealMark } from "../ui/SealMark";
import { StepVisual } from "./StepVisual";
import "./how.css";

/** Section 4 — How it works, in the Superhuman pattern: one bordered panel
 *  holding a sticky tab bar and a stack of step cards. The card crossing the
 *  viewport's middle band lights up its tab — the step "in evidence". Each
 *  card pairs padded copy (left) with a full-bleed diagram (right). */
type Step = {
  key: "seal" | "anchor" | "attest" | "verdict";
  index: string;
  tab: string;
  state: string;
  headline: string;
  body: ReactNode;
};

const STEPS: readonly Step[] = [
  {
    key: "seal",
    index: "01",
    tab: "Seal",
    state: "Offline",
    headline: "Seal the origin, offline.",
    body: (
      <>
        A canonical SHA-256 of the field reading. Same reading, same seal —{" "}
        <span className="accent-emphasis">anywhere, with no network and no server</span>.
      </>
    ),
  },
  {
    key: "anchor",
    index: "02",
    tab: "Anchor",
    state: "On-chain",
    headline: "Register the reference, on-chain.",
    body: (
      <>
        The genuine seal is anchored to the asset on{" "}
        <span className="accent-emphasis">Casper</span> — the reference every future
        reading is measured against.
      </>
    ),
  },
  {
    key: "attest",
    index: "03",
    tab: "Attest",
    state: "Agent",
    headline: "The agent attests.",
    body: (
      <>
        An autonomous agent submits a reading. The seal decides the verdict —
        the agent, and its LLM, only decide{" "}
        <span className="accent-emphasis">what to do next</span>. Never the truth.
      </>
    ),
  },
  {
    key: "verdict",
    index: "04",
    tab: "Verdict",
    state: "Permanent",
    headline: "Valid or Invalid, both permanent.",
    body: (
      <>
        A match is accepted, a mismatch is rejected, and both are written to
        Casper forever. A rejection is{" "}
        <span className="accent-emphasis">proof, not a deleted error</span>.
      </>
    ),
  },
] as const;

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  /** The card crossing the middle 10% band of the viewport is the active one. */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActive(index);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const goToStep = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      className="how section section--band"
      id="how"
      data-theme="light"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="shell">
        <header className="section__header section__header--fill how__header">
          <div className="section__header-bar reveal-scroll">
            <p className="kicker">How it works</p>
            <Button href="#proof" variant="ghost" trailing={<span aria-hidden="true">→</span>}>
              Verify proof
            </Button>
          </div>

          <h2
            id={`${baseId}-title`}
            className="section-title section-title--fill reveal-scroll"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            From a physical reading to a permanent verdict.
          </h2>
        </header>

        <div className="how__panel panel panel--light reveal-scroll" style={{ "--reveal-delay": "160ms" } as CSSProperties}>
          <nav
            className="how__tabs"
            aria-label="The four steps of the provenance loop"
          >
            {STEPS.map((step, i) => {
              const isActive = i === active;
              return (
                <button
                  key={step.key}
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  className={`how__tab${isActive ? " how__tab--active" : ""}`}
                  onClick={() => goToStep(i)}
                >
                  <SealMark size={18} />
                  <span className="how__tab-text">
                    <span className="how__tab-name">
                      <span className="how__tab-index">{step.index}</span>
                      {step.tab}
                    </span>
                    <span className="how__tab-state">{step.state}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <ol className="how__cards">
            {STEPS.map((step, i) => (
              <li
                key={step.key}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                id={`${baseId}-card-${step.key}`}
                data-index={i}
                className={`how__card${i === active ? " how__card--active" : ""}`}
              >
                <div className="how__card-copy">
                  <div className="how__card-head">
                    <SealMark size={18} />
                    <span className="how__card-name">{step.tab}</span>
                    <span className="how__card-state mono-label">{step.state}</span>
                  </div>

                  <span className="how__card-index mono-label">Step {step.index}</span>
                  <h3 className="how__headline">{step.headline}</h3>
                  <p className="how__body">{step.body}</p>
                </div>

                <div className="how__card-viz" aria-hidden="true">
                  <StepVisual step={step.key} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
