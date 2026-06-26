import type { CSSProperties } from "react";
import { TrustGlobeVisual } from "./TrustGlobeVisual";
import "./problem.css";

const LANES = [
  {
    icon: "globe",
    title: "Readings everywhere",
    body: "Sensors, documents, and APIs emit data from every continent — often with no chain of custody.",
  },
  {
    icon: "claim",
    title: "Claims accepted as-is",
    body: "Models and middleware treat the source as given. The origin question is rarely asked.",
  },
  {
    icon: "scale",
    title: "Fiction at scale",
    body: "Agents, escrows, and settlements inherit whatever was claimed — valid or not.",
  },
] as const;

function LaneIcon({ kind }: { kind: (typeof LANES)[number]["icon"] }) {
  if (kind === "globe") {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle cx="11" cy="11" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <ellipse cx="11" cy="11" rx="3.5" ry="8.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <path d="M2.5 11h17M3.5 6.5h15M3.5 15.5h15" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    );
  }

  if (kind === "claim") {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <path
          d="M11 2.5c-3.2 0-5.8 2.4-5.8 5.4 0 4.1 5.8 11.6 5.8 11.6s5.8-7.5 5.8-11.6c0-3-2.6-5.4-5.8-5.4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <circle cx="11" cy="7.8" r="2" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path
        d="M4 6.5h14v11H4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 3.5h7v3h-7zM8 10.5h6M8 14h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The stack the industry runs today: a claim accepted as-is, a missing
 *  proof-of-origin, and everything downstream inheriting the gap. This panel
 *  is the deliberate inverse of the hero's valid proof pipeline. */
export function Problem() {
  return (
    <section className="problem section section--bordered" id="problem">
      <div className="shell problem__layout">
        <header className="problem__header">
          <p className="kicker reveal-scroll">The trust gap</p>

          <h2 className="section-title reveal-scroll" style={{ "--reveal-delay": "60ms" } as CSSProperties}>
            The agent economy is being built on{" "}
            <span className="accent-strike">unverified claims</span>.
          </h2>

          <p
            className="problem__subtitle reveal-scroll"
            style={{ "--reveal-delay": "90ms" } as CSSProperties}
          >
            One smart network for agents and assets — close to users, far from
            proof.
          </p>
        </header>

        <div
          className="problem__globe reveal-scroll"
          style={{ "--reveal-delay": "120ms" } as CSSProperties}
        >
          <TrustGlobeVisual />
        </div>

        <div
          className="problem__lanes reveal-scroll"
          style={{ "--reveal-delay": "150ms" } as CSSProperties}
        >
          {LANES.map((lane) => (
            <article key={lane.title} className="problem__lane">
              <span className="problem__lane-icon" aria-hidden="true">
                <LaneIcon kind={lane.icon} />
              </span>
              <h3 className="problem__lane-title">{lane.title}</h3>
              <p className="problem__lane-body">{lane.body}</p>
            </article>
          ))}
        </div>

        <div className="split-grid problem__grid">
          <div className="problem__lead">
            <div
              className="section-lead section-lead--stack reveal-scroll"
              style={{ "--reveal-delay": "180ms" } as CSSProperties}
            >
              <p>
                Autonomous agents and tokenized real-world assets are already
                interacting with physical data. Yet almost nothing proves that a
                reading came from a real, legal origin. Most systems accept
                whatever an API or model claims.
              </p>
              <p>
                When the data is wrong, the entire stack — agents, escrows,
                settlements —{" "}
                <span className="accent-emphasis accent-emphasis--invalid">runs on fiction</span>.
              </p>
            </div>
          </div>

          <aside
            className="problem__panel panel panel--elevated split-grid__aside--sticky reveal-scroll"
            aria-label="Today's stack: an unverified claim propagating through the system without a proof of origin"
          >
            <span className="mono-label problem__panel-title">Without proof</span>

            <ol className="gap">
              <li className="gap__step">
                <span className="gap__node" aria-hidden="true" />
                <span className="gap__body">
                  <span className="gap__label">Physical reading</span>
                  <span className="gap__detail">sensor · document · API</span>
                </span>
              </li>

              <li className="gap__step">
                <span className="gap__node" aria-hidden="true" />
                <span className="gap__body">
                  <span className="gap__label">API / model claim</span>
                  <span className="gap__detail">accepted as-is</span>
                </span>
              </li>

              <li className="gap__step gap__step--broken">
                <span className="gap__node gap__node--missing" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
                    <path
                      d="M4 4L10 10M10 4L4 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="gap__body">
                  <span className="gap__label gap__label--missing">
                    No proof of origin
                  </span>
                  <span className="gap__detail">the question is skipped</span>
                </span>
              </li>

              <li className="gap__step gap__step--last">
                <span className="gap__node gap__node--inherit" aria-hidden="true" />
                <span className="gap__body">
                  <span className="gap__label">Agents · escrows · settlements</span>
                  <span className="gap__detail gap__detail--fiction">
                    running on fiction
                  </span>
                </span>
              </li>
            </ol>
          </aside>
        </div>
      </div>
    </section>
  );
}
