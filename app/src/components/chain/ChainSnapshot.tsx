import { Link } from "react-router-dom";
import { VerdictBadge } from "../proof/Badges";
import { SealChip } from "../proof/SealChip";
import type { LiveTestnetSnapshot } from "../../lib/types";
import { truncateMiddle } from "../../lib/format";
import "./chain-snapshot.css";

type ChainSnapshotProps = {
  snapshot: LiveTestnetSnapshot;
};

export function ChainSnapshot({ snapshot }: ChainSnapshotProps) {
  return (
    <div className="chain-snap panel panel--elevated">
      <header className="chain-snap__head">
        <div>
          <p className="mono-label">Casper Testnet</p>
          <p className="chain-snap__title">ProofOfOrigin</p>
        </div>
        <span className={`chain-snap__source chain-snap__source--${snapshot.source}`}>
          {snapshot.source === "live" ? "Live" : "Fallback"}
        </span>
      </header>

      <div className="chain-snap__counts">
        <div>
          <span className="chain-snap__count-label">Accepted</span>
          <span className="chain-snap__count-value">{snapshot.accepted}</span>
        </div>
        <div>
          <span className="chain-snap__count-label">Rejected</span>
          <span className="chain-snap__count-value chain-snap__count-value--invalid">
            {snapshot.rejected}
          </span>
        </div>
      </div>

      <p className="chain-snap__package">
        <span className="mono-label">Package</span>
        <code>{truncateMiddle(snapshot.packageHash, 44)}</code>
      </p>

      <ul className="chain-snap__list">
        {snapshot.attestations.map((row) => (
          <li key={row.assetId} className="chain-snap__row">
            <div className="chain-snap__row-head">
              <Link to={`/lots/${encodeURIComponent(row.assetId)}`}>{row.assetId}</Link>
              <VerdictBadge verdict={row.verdict} />
            </div>
            <SealChip hash={row.providedSeal} label="seal on-chain" />
            {row.explorerUrl ? (
              <a
                className="chain-snap__tx"
                href={row.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View attestation tx ↗
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      <footer className="chain-snap__foot">
        <a href={snapshot.packageUrl} target="_blank" rel="noopener noreferrer">
          Open package on cspr.live ↗
        </a>
        {snapshot.fetchedAt ? (
          <span className="chain-snap__fetched">
            Fetched {new Date(snapshot.fetchedAt).toLocaleTimeString()}
          </span>
        ) : null}
      </footer>
    </div>
  );
}
