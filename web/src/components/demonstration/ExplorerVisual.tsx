import { useCountUp } from "../../hooks/useCountUp";
import { useOnChainStats } from "../../hooks/useOnChainStats";
import { useSite } from "../../context/SiteContext";
import { CONTRACT_PACKAGE_HASH } from "../../site-links";

const ATTESTATIONS = [
  { asset: "MINA-VALEDOURO-LOTE-001", verdict: "invalid" as const },
  { asset: "MINA-VALEDOURO-LOTE-002", verdict: "valid" as const },
] as const;

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
  const stats = useOnChainStats();
  const accepted = useCountUp(stats.accepted);
  const rejected = useCountUp(stats.rejected);
  const { content } = useSite();
  const c = content.explorer;

  return (
    <div className="expl__stage" aria-hidden="true">
      <div className="expl">
        <div className="expl__chrome">
          <span className="expl__dots">
            <i /> <i /> <i />
          </span>
          <span className="expl__url">testnet.cspr.live</span>
        </div>

        <div className="expl__body">
          <header className="expl__head">
            <div>
              <p className="expl__eyebrow mono-label">ProofOfOrigin</p>
              <p className="expl__network">{c.network}</p>
            </div>
            <span className="expl__live" aria-live="polite">
              {stats.live ? c.live : c.sync}
            </span>
          </header>

          <p className="expl__package">
            <span className="expl__package-key">{c.package}</span>
            <span className="expl__package-val">{truncateHash(CONTRACT_PACKAGE_HASH)}</span>
          </p>

          <dl className="expl__counts tabular-nums">
            <div className="expl__count">
              <dt>{c.accepted}</dt>
              <dd>{accepted}</dd>
            </div>
            <div className="expl__count expl__count--reject">
              <dt>{c.rejected}</dt>
              <dd>{rejected}</dd>
            </div>
          </dl>

          <ul className="expl__rows">
            {ATTESTATIONS.map((row) => (
              <li key={row.asset} className="expl__row">
                <span className="expl__asset">{row.asset}</span>
                <span className={`expl__verdict expl__verdict--${row.verdict}`}>
                  <VerdictGlyph verdict={row.verdict} />
                  {row.verdict === "valid" ? c.valid : c.invalid}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
