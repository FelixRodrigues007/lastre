import { Link } from "react-router-dom";

type RoutePlaceholderProps = {
  phase: string;
  blocks?: { label: string; hint: string }[];
  cta?: { label: string; to: string };
};

export function RoutePlaceholder({ phase, blocks, cta }: RoutePlaceholderProps) {
  return (
    <>
      <p className="mono-label" style={{ marginBottom: "1rem" }}>
        Phase 1 · {phase}
      </p>

      {blocks ? (
        <div className="placeholder-grid">
          {blocks.map((block) => (
            <article key={block.label} className="panel placeholder-card">
              <p className="placeholder-card__label">{block.label}</p>
              <p className="placeholder-card__value">—</p>
              <p className="placeholder-card__hint">{block.hint}</p>
            </article>
          ))}
        </div>
      ) : null}

      {cta ? (
        <p style={{ marginTop: "1.5rem" }}>
          <Link className="route-cta" to={cta.to}>
            {cta.label}
          </Link>
        </p>
      ) : null}
    </>
  );
}
