import "./process-trust-boundary.css";

const LAYERS = [
  {
    key: "artifact",
    title: "Artifact",
    owner: "Structured fields",
    note: "Document → data",
  },
  {
    key: "seal",
    title: "Seal",
    owner: "SHA-256 deterministic",
    note: "Seal decides verdict",
  },
  {
    key: "agent",
    title: "Agent action",
    owner: "pay · skip · escalate",
    note: "Agent chooses action",
  },
  {
    key: "verdict",
    title: "Verdict",
    owner: "Valid or Invalid",
    note: "From seal match",
  },
  {
    key: "casper",
    title: "Casper",
    owner: "On-chain proof",
    note: "Records attestation",
  },
] as const;

export function ProcessTrustBoundary() {
  return (
    <section className="process-trust-boundary panel" aria-label="Trust boundary legend">
      <header className="process-trust-boundary__head">
        <p className="process-trust-boundary__kicker">Trust boundary</p>
        <p className="process-trust-boundary__lead">
          <strong>The agent chooses the action.</strong> The seal decides the verdict. Invalid is
          permanent proof — not a hidden error.
        </p>
      </header>

      <ol className="process-trust-boundary__rail">
        {LAYERS.map((layer, index) => (
          <li key={layer.key} className="process-trust-boundary__step">
            <span className={`process-trust-boundary__dot process-trust-boundary__dot--${layer.key}`} />
            <div className="process-trust-boundary__copy">
              <span className="process-trust-boundary__title">{layer.title}</span>
              <span className="process-trust-boundary__owner">{layer.owner}</span>
              <span className="process-trust-boundary__note">{layer.note}</span>
            </div>
            {index < LAYERS.length - 1 ? (
              <span className="process-trust-boundary__arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
