import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "../ui/Button";
import { SealMark } from "../ui/SealMark";
import { useSite } from "../../context/SiteContext";
import { StepVisual } from "./StepVisual";
import "./how.css";

const STEP_KEYS = ["seal", "anchor", "attest", "verdict"] as const;

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const { content, t } = useSite();
  const c = content.how;

  const goToStep = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActive(index);
            const key = STEP_KEYS[index];
            if (key && !window.location.hash.includes("how")) {
              history.replaceState(null, "", `#how/${key}`);
            }
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#how/", "");
    const idx = STEP_KEYS.findIndex((s) => s === hash);
    if (idx >= 0) {
      setActive(idx);
      requestAnimationFrame(() => goToStep(idx));
    }
  }, []);

  return (
    <section
      className="how section section--band"
      id="how"
      data-theme="light"
      aria-labelledby={`${baseId}-title`}
    >
      <span className="section-number mono-label" aria-hidden="true">
        03
      </span>
      <div className="shell">
        <header className="section__header section__header--fill how__header">
          <div className="section__header-bar reveal-scroll">
            <p className="kicker">{c.kicker}</p>
            <Button href="#proof" variant="secondary" size="sm">
              {t("tryTamperDemo")}
            </Button>
          </div>

          <h2
            id={`${baseId}-title`}
            className="section-title section-title--fill reveal-scroll"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            {c.title}
          </h2>
        </header>

        <div className="how__panel panel panel--light reveal-scroll" style={{ "--reveal-delay": "160ms" } as CSSProperties}>
          <nav className="how__tabs" aria-label={c.tabsAria}>
            {c.steps.map((step, i) => {
              const isActive = i === active;
              return (
                <button
                  key={STEP_KEYS[i]}
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  className={`how__tab${isActive ? " how__tab--active" : ""}`}
                  onClick={() => goToStep(i)}
                >
                  <SealMark size={18} />
                  <span className="how__tab-text">
                    <span className="how__tab-name">
                      <span className="how__tab-index">{String(i + 1).padStart(2, "0")}</span>
                      {step.tab}
                    </span>
                    <span className="how__tab-state">{step.state}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <ol className="how__cards">
            {c.steps.map((step, i) => (
              <li
                key={STEP_KEYS[i]}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                id={`how-${STEP_KEYS[i]}`}
                data-index={i}
                className={`how__card${i === active ? " how__card--active" : ""}`}
              >
                <div className="how__card-copy">
                  <div className="how__card-head">
                    <SealMark size={18} />
                    <span className="how__card-name">{step.tab}</span>
                    <span className="how__card-state mono-label">{step.state}</span>
                  </div>

                  <span className="how__card-index mono-label">
                    {c.stepLabel} {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="how__headline">{step.headline}</h3>
                  <p className="how__body">
                    {step.bodyLead}
                    <span className="accent-emphasis">{step.bodyEmphasis}</span>
                    {step.bodyTail}
                  </p>
                </div>

                <div className="how__card-viz" aria-hidden="true">
                  <StepVisual step={STEP_KEYS[i] ?? "seal"} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
