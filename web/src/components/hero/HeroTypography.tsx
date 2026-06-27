import { type CSSProperties, type ReactNode } from "react";

type SplitHeadlineProps = {
  lead: string;
  rest: string;
  className?: string;
};

/** Word-stagger headline — Awwwards / Apple keynote typography. */
export function SplitHeadline({ lead, rest, className = "" }: SplitHeadlineProps) {
  const words = rest.split(/\s+/).filter(Boolean);

  return (
    <h1 className={`hero__headline ${className}`.trim()} aria-label={`${lead} ${rest}`}>
      <span className="hero__headline-line" aria-hidden="true">
        {lead.split("").map((char, i) => (
          <span
            key={`${char}-${i}`}
            className={`hero__char${char === " " ? " hero__char--space" : ""} hero__char--accent`}
            style={{ "--char-i": i } as CSSProperties}
          >
            {char === " " ? "\u00a0" : char}
          </span>
        ))}
      </span>
      <span className="hero__headline-line hero__headline-line--dim" aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="hero__word-wrap">
            <span className="hero__word" style={{ "--word-i": i + 1 } as CSSProperties}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </h1>
  );
}

export function HeroEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="hero__eyebrow">
      <span className="hero__eyebrow-track">
        <span className="hero__eyebrow-dot" aria-hidden="true" />
        {children}
      </span>
    </p>
  );
}
