import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { VerdictBadge } from "../proof/Badges";
import { SealChip } from "../proof/SealChip";
import { Icon } from "../ui/Icon";
import type { LiveTestnetSnapshot } from "../../lib/types";
import { truncateMiddle } from "../../lib/format";
import "./chain-snapshot.css";

type ChainSnapshotProps = {
  snapshot: LiveTestnetSnapshot;
};

type SortKey = "assetId" | "verdict";

export function ChainSnapshot({ snapshot }: ChainSnapshotProps) {
  const [sort, setSort] = useState<SortKey>("assetId");

  const rows = useMemo(() => {
    const items = [...snapshot.attestations];
    if (sort === "verdict") {
      return items.sort((a, b) => a.verdict.localeCompare(b.verdict));
    }
    return items.sort((a, b) => a.assetId.localeCompare(b.assetId));
  }, [snapshot.attestations, sort]);

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

      <div className="chain-snap__toolbar">
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort attestations"
        >
          <option value="assetId">Sort: Asset ID</option>
          <option value="verdict">Sort: Verdict</option>
        </select>
      </div>

      <div className="chain-snap__table-wrap">
        <table className="chain-snap__table">
          <thead>
            <tr>
              <th scope="col">Asset</th>
              <th scope="col">Verdict</th>
              <th scope="col">Seal</th>
              <th scope="col" className="chain-snap__col-action">
                Tx
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.assetId}>
                <td>
                  <Link to={`/lots/${encodeURIComponent(row.assetId)}`}>{row.assetId}</Link>
                </td>
                <td>
                  <VerdictBadge verdict={row.verdict} />
                </td>
                <td className="chain-snap__seal">
                  <SealChip hash={row.providedSeal} label="on-chain" />
                </td>
                <td className="chain-snap__col-action">
                  {row.explorerUrl ? (
                    <a
                      className="chain-snap__icon-link"
                      href={row.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${row.assetId} attestation`}
                    >
                      <Icon name="external" size={14} />
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="chain-snap__list">
        {rows.map((row) => (
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
                View attestation
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      <footer className="chain-snap__foot">
        <a href={snapshot.packageUrl} target="_blank" rel="noopener noreferrer">
          Open package on cspr.live
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
