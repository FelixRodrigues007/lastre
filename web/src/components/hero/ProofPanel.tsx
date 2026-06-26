import "./proof-panel.css";

/** The deterministic chain of proof, top to bottom. Kept deliberately sparse —
 *  three steps and the verdict, which is the only node that carries status. */
const STEPS = ["Physical origin", "SHA-256 seal", "Casper anchor"] as const;

export function ProofPanel() {
  return (
    <figure
      className="proof panel panel--elevated"
      aria-label="A provenance seal anchored on Casper with a valid verdict"
    >
      <header className="proof__head panel__head">
        <span className="mono-label">Provenance seal</span>
        <span className="status-chip status-chip--valid">LIVE</span>
      </header>

      <p className="proof__hash">
        <span className="proof__hash-key">sha256</span>
        <span className="proof__hash-val">9f2a4c1b…e41c</span>
      </p>

      <ol className="proof__pipe">
        {STEPS.map((label) => (
          <li className="proof__step" key={label}>
            <span className="proof__node" aria-hidden="true" />
            <span className="proof__step-label">{label}</span>
          </li>
        ))}

        <li className="proof__step proof__step--verdict">
          <span className="proof__node proof__node--valid" aria-hidden="true" />
          <span className="proof__verdict">
            Valid
            <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M2.5 7.5L5.5 10.5L11.5 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </li>
      </ol>
    </figure>
  );
}
