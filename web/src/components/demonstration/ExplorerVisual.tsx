/** Decorative panel for section 9 — a read-only snapshot of the live Casper
 *  Testnet contract state. Counts and verdicts match README / make query output. */
const ATTESTATIONS = [
  { asset: "MINA-VALEDOURO-LOTE-001", verdict: "invalid" as const },
  { asset: "MINA-VALEDOURO-LOTE-002", verdict: "valid" as const },
] as const;

const PACKAGE_HASH =
  "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

function truncateHash(hash: string) {
  return `${hash.slice(0, 12)}…${hash.slice(-8)}`;
}

function VerdictGlyph({ verdict }: { verdict: "valid" | "invalid" }) {
  if (verdict === "valid") {
    return (
      <svg width="11" height="11" viewBox="0 0 14 14" aria-hidden="true">
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

  return (
    <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M4 4L10 10M10 4L4 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ExplorerVisual() {
  return (
    <div className="expl__stage" aria-hidden="true">
      <div className="expl">
        <div className="expl__chrome">
          <span className="expl__dots">
            <i /> <i /> <i />
          </span>
          <span className="expl__url">
            <svg width="9" height="11" viewBox="0 0 10 12" aria-hidden="true">
              <rect
                x="1.5"
                y="5"
                width="7"
                height="5.5"
                rx="1.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M3 5V3.4A2 2 0 0 1 7 3.4V5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            testnet.cspr.live
          </span>
        </div>

        <div className="expl__body">
          <header className="expl__head">
            <div>
              <p className="expl__eyebrow mono-label">ProofOfOrigin</p>
              <p className="expl__network">Casper Testnet · casper-test</p>
            </div>
            <span className="expl__live">LIVE</span>
          </header>

          <p className="expl__package">
            <span className="expl__package-key">Package</span>
            <span className="expl__package-val">{truncateHash(PACKAGE_HASH)}</span>
          </p>

          <dl className="expl__counts">
            <div className="expl__count">
              <dt>Accepted</dt>
              <dd>2</dd>
            </div>
            <div className="expl__count expl__count--reject">
              <dt>Rejected</dt>
              <dd>1</dd>
            </div>
          </dl>

          <ul className="expl__rows">
            {ATTESTATIONS.map((row) => (
              <li key={row.asset} className="expl__row">
                <span className="expl__asset">{row.asset}</span>
                <span className={`expl__verdict expl__verdict--${row.verdict}`}>
                  <VerdictGlyph verdict={row.verdict} />
                  {row.verdict === "valid" ? "Valid" : "Invalid"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
