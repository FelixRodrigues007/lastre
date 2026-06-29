import type { CSSProperties } from "react";
import { useSite } from "../../context/SiteContext";
import { TrustGlobeVisual } from "./TrustGlobeVisual";
import "./problem.css";
import "../visual/visual.css";

const LANE_ICONS = ["globe", "claim", "scale"] as const;

function LaneIcon({ kind }: { kind: (typeof LANE_ICONS)[number] }) {
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

export function Problem() {
  const { content } = useSite();
  const c = content.problem;

  return (
    <section className="problem section section--bordered" id="problem">
      <div className="shell problem__layout">
        <div className="problem__cinematic">
          <div className="problem__pin">
            <header className="problem__header">
              <p className="kicker reveal-scroll">{c.kicker}</p>

              <h2 className="section-title reveal-scroll" style={{ "--reveal-delay": "60ms" } as CSSProperties}>
                {c.titlePrefix}
                <span className="accent-strike accent-strike--scroll">{c.titleStrike}</span>
                {c.titleSuffix}
              </h2>

              <p
                className="problem__subtitle reveal-scroll"
                style={{ "--reveal-delay": "90ms" } as CSSProperties}
              >
                {c.subtitle}
              </p>
            </header>

            <div
              className="problem__globe reveal-scroll reveal-scroll--scale"
              style={{ "--reveal-delay": "120ms" } as CSSProperties}
              data-scroll-shift="0.12"
            >
              <TrustGlobeVisual />
            </div>
          </div>
        </div>

        <div
          className="problem__lanes reveal-stagger"
          style={{ "--reveal-delay": "80ms" } as CSSProperties}
        >
          {c.lanes.map((lane, i) => (
            <article key={lane.title} className="problem__lane interactive-lift">
              <span className="problem__lane-icon" aria-hidden="true">
                <LaneIcon kind={LANE_ICONS[i] ?? "globe"} />
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
              <p>{c.lead1}</p>
              <p>
                {c.lead2Prefix}
                <span className="accent-emphasis accent-emphasis--invalid">{c.lead2Emphasis}</span>
                {c.lead2Suffix}
              </p>
            </div>
          </div>

          <aside
            className="problem__panel panel panel--elevated split-grid__aside--sticky reveal-scroll"
            style={{ "--reveal-delay": "180ms" } as CSSProperties}
            aria-label={c.panelAria}
          >
            <span className="mono-label problem__panel-title">{c.panelTitle}</span>

            <ol className="gap gap--animate">
              {c.gapSteps.map((step, i) => (
                <li
                  key={step.label}
                  className={`gap__step${"missing" in step && step.missing ? " gap__step--broken" : ""}${i === c.gapSteps.length - 1 ? " gap__step--last" : ""}`}
                >
                  {"missing" in step && step.missing ? (
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
                  ) : (
                    <span
                      className={`gap__node${i === c.gapSteps.length - 1 ? " gap__node--inherit" : ""}`}
                      aria-hidden="true"
                    />
                  )}
                  <span className="gap__body">
                    <span className={`gap__label${"missing" in step && step.missing ? " gap__label--missing" : ""}`}>
                      {step.label}
                    </span>
                    <span className={`gap__detail${"fiction" in step && step.fiction ? " gap__detail--fiction" : ""}`}>
                      {step.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </section>
  );
}
