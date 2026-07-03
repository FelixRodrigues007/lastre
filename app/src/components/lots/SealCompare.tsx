import { CopyBlock } from "../ui/CopyBlock";
import "./seal-compare.css";

type SealCompareProps = {
  computed: string;
  reference: string;
  matches: boolean | null;
};

export function SealCompare({ computed, reference, matches }: SealCompareProps) {
  const statusLabel =
    matches === true
      ? "Seals match"
      : matches === false
        ? "Seals diverge"
        : "No reference seal";

  const statusIcon = matches === true ? "✓" : matches === false ? "✗" : "—";

  return (
    <section
      className={`seal-compare panel${matches === false ? " seal-compare--mismatch" : matches ? " seal-compare--match" : ""}`}
      aria-label="Seal comparison"
    >
      <header className="seal-compare__head">
        <div>
          <p className="mono-label">Seal comparison</p>
          <p className="seal-compare__lead">SHA-256 over artifact fields — the seal decides verdict</p>
        </div>
      </header>

      <div
        className={`seal-compare__verdict${matches === false ? " seal-compare__verdict--mismatch" : matches ? " seal-compare__verdict--match" : " seal-compare__verdict--pending"}`}
        role="status"
      >
        <span className="seal-compare__verdict-icon" aria-hidden="true">
          {statusIcon}
        </span>
        <div className="seal-compare__verdict-copy">
          <p className="seal-compare__verdict-title">{statusLabel}</p>
          <p className="seal-compare__verdict-detail">
            {matches === true
              ? "Computed and reference seals are identical."
              : matches === false
                ? "Recomputed seal differs from the registered reference."
                : "Reference seal was not registered for this lot."}
          </p>
        </div>
      </div>

      {matches === false ? (
        <p className="seal-compare__callout">
          Invalid is permanent proof of tamper — not a system error.
        </p>
      ) : null}

      <details className="seal-compare__technical">
        <summary className="seal-compare__technical-summary">View technical detail</summary>
        <div className="seal-compare__technical-body">
          <CopyBlock label="Computed seal" value={computed} />
          <CopyBlock label="Reference seal" value={reference} />
        </div>
      </details>
    </section>
  );
}
