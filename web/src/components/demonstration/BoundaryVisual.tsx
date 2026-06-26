/** Decorative panel for section 8 — the protocol boundary: what Lastro is and
 *  explicitly is not. Fictional demo scope only; no financial claims. */
const IN_SCOPE = [
  "Deterministic provenance seal",
  "On-chain Valid / Invalid verdict",
  "Simulated demo assets",
] as const;

const OUT_OF_SCOPE = [
  "Investment or yield",
  "Token sale or ownership",
  "Financial rights of any kind",
] as const;

function CheckGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M4 4L10 10M10 4L4 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BoundaryVisual() {
  return (
    <div className="bound__stage" aria-hidden="true">
      <div className="bound">
        <header className="bound__head">
          <span className="mono-label">Protocol boundary</span>
          <span className="bound__chip">DEMO ONLY</span>
        </header>

        <div className="bound__cols">
          <div className="bound__col">
            <p className="bound__col-label">In scope</p>
            <ul className="bound__list">
              {IN_SCOPE.map((item) => (
                <li key={item} className="bound__item bound__item--in">
                  <span className="bound__mark">
                    <CheckGlyph />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bound__col">
            <p className="bound__col-label">Out of scope</p>
            <ul className="bound__list">
              {OUT_OF_SCOPE.map((item) => (
                <li key={item} className="bound__item bound__item--out">
                  <span className="bound__mark">
                    <CrossGlyph />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="bound__foot">
          <span className="bound__foot-rule" aria-hidden="true" />
          <p className="bound__foot-text">
            Lastro confers proof, not ownership. The line is part of the protocol.
          </p>
        </footer>
      </div>
    </div>
  );
}
