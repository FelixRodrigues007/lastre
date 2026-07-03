import type { ProofLayer } from "../../lib/provenanceScore";
import "./proof-vitals-sidebar.css";

type ProofVitalsSidebarProps = {
  layers: ProofLayer[];
  score: number;
  mintTx?: string | null;
};

function vitalFill(status: ProofLayer["status"]): number {
  switch (status) {
    case "good":
      return 100;
    case "partial":
      return 55;
    default:
      return 12;
  }
}

export function ProofVitalsSidebar({ layers, score, mintTx }: ProofVitalsSidebarProps) {
  return (
    <aside className="proof-vitals panel" aria-label="Proof vitals">
      <header className="proof-vitals__head">
        <p className="mono-label">Proof vitals</p>
        <span className="proof-vitals__score">{score}</span>
      </header>

      <ul className="proof-vitals__list">
        {layers.map((layer) => (
          <li key={layer.id} className="proof-vitals__item">
            <div className="proof-vitals__row">
              <span className="proof-vitals__label">{layer.label}</span>
              <span className={`proof-vitals__badge proof-vitals__badge--${layer.status}`}>
                {layer.status === "good" ? "Good" : layer.status === "partial" ? "Partial" : "Poor"}
              </span>
            </div>
            <div className="proof-vitals__track" aria-hidden="true">
              <span
                className={`proof-vitals__fill proof-vitals__fill--${layer.status}`}
                style={{ width: `${vitalFill(layer.status)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <footer className="proof-vitals__foot">
        {mintTx ? (
          <a
            className="proof-vitals__link"
            href={`https://testnet.cspr.live/transaction/${mintTx}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View mint tx ↗
          </a>
        ) : (
          <span className="proof-vitals__hint">Demo session · symbolic NFT</span>
        )}
      </footer>
    </aside>
  );
}
