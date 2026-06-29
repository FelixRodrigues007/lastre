import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useSite } from "../../context/SiteContext";
import { SectionMarker } from "../ui/SectionMarker";
import { LayerShowcase } from "./LayerShowcase";
import "./solution.css";

const FEATURE_ICONS = ["reading", "seal", "layer"] as const;

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

const ICONS: Record<(typeof FEATURE_ICONS)[number], ReactNode> = {
  reading: <ReadingIcon />,
  seal: <SealIcon />,
  layer: <AnchorIcon />,
};

export function Solution() {
  const baseId = useId();
  const { content } = useSite();
  const c = content.solution;

  return (
    <section className="sol section section--bordered" id="solution" aria-labelledby={`${baseId}-title`}>
      <div className="shell">
        <SectionMarker index="01" label="The layer" keyword="Proof" />

        <header className="sol__header">
          <div className="sol__header-main reveal-scroll">
            <span className="sol__badge">
              <span className="sol__badge-dot" aria-hidden="true" />
              {c.badge}
            </span>

            <h2
              id={`${baseId}-title`}
              className="sol__title sol__title--split"
              style={{ "--reveal-delay": "60ms" } as CSSProperties}
            >
              <span className="sol__title-line">{c.titleLine1}</span>
              <span className="sol__title-line sol__title-line--accent">{c.titleLine2}</span>
            </h2>
          </div>

          <p
            className="sol__aside reveal-scroll"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            {c.aside}
          </p>
        </header>

        <div className="sol__showcase-wrap" data-scroll-shift="0.06">
          <LayerShowcase />
        </div>

        <ul
          className="sol__features reveal-stagger"
          style={{ "--reveal-delay": "120ms" } as CSSProperties}
          aria-label={c.featuresAria}
        >
          {c.features.map((feature, i) => (
            <li key={FEATURE_ICONS[i] ?? feature.title} className="sol__feature interactive-lift">
              <span className="sol__feature-icon" aria-hidden="true">
                {ICONS[FEATURE_ICONS[i] ?? "reading"]}
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
