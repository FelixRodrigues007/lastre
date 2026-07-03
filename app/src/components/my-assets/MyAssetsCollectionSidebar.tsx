import { computeProvScore } from "../../lib/provenanceScore";
import type { LotListItem } from "../../lib/types";
import "./my-assets-collection-sidebar.css";

type MyAssetsCollectionSidebarProps = {
  assets: LotListItem[];
  connectedAccount: string;
};

export function MyAssetsCollectionSidebar({
  assets,
  connectedAccount,
}: MyAssetsCollectionSidebarProps) {
  const total = assets.length;
  const avgScore =
    total > 0
      ? Math.round(assets.reduce((sum, lot) => sum + computeProvScore(lot), 0) / total)
      : 0;
  const carbonCount = assets.filter(
    (lot) => lot.artifact.category === "carbon_credit" || lot.artifact.creditType,
  ).length;
  const mineralCount = total - carbonCount;
  const attestedCount = assets.filter((lot) => lot.attested).length;

  return (
    <aside className="my-assets-sidebar panel" aria-label="Collection summary">
      <header className="my-assets-sidebar__head">
        <p className="mono-label">Collection vitals</p>
        <span className="my-assets-sidebar__score">{avgScore}</span>
      </header>

      <p className="my-assets-sidebar__hint">Avg provenance score (demo)</p>

      <ul className="my-assets-sidebar__stats">
        <li>
          <span className="my-assets-sidebar__stat-label">Minted</span>
          <span className="my-assets-sidebar__stat-value">{total}</span>
          <div className="my-assets-sidebar__track" aria-hidden="true">
            <span className="my-assets-sidebar__fill my-assets-sidebar__fill--minted" style={{ width: "100%" }} />
          </div>
        </li>
        <li>
          <span className="my-assets-sidebar__stat-label">Attested</span>
          <span className="my-assets-sidebar__stat-value">{attestedCount}</span>
          <div className="my-assets-sidebar__track" aria-hidden="true">
            <span
              className="my-assets-sidebar__fill my-assets-sidebar__fill--attested"
              style={{ width: total > 0 ? `${(attestedCount / total) * 100}%` : "0%" }}
            />
          </div>
        </li>
        <li>
          <span className="my-assets-sidebar__stat-label">Carbon credits</span>
          <span className="my-assets-sidebar__stat-value">{carbonCount}</span>
          <div className="my-assets-sidebar__track" aria-hidden="true">
            <span
              className="my-assets-sidebar__fill my-assets-sidebar__fill--carbon"
              style={{ width: total > 0 ? `${(carbonCount / total) * 100}%` : "0%" }}
            />
          </div>
        </li>
        <li>
          <span className="my-assets-sidebar__stat-label">Minerals</span>
          <span className="my-assets-sidebar__stat-value">{mineralCount}</span>
          <div className="my-assets-sidebar__track" aria-hidden="true">
            <span
              className="my-assets-sidebar__fill my-assets-sidebar__fill--mineral"
              style={{ width: total > 0 ? `${(mineralCount / total) * 100}%` : "0%" }}
            />
          </div>
        </li>
      </ul>

      <footer className="my-assets-sidebar__foot">
        <span className="my-assets-sidebar__account">{connectedAccount.slice(0, 16)}…</span>
        <span className="my-assets-sidebar__network">Casper testnet · demo</span>
      </footer>
    </aside>
  );
}
