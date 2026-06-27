import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { VerdictBadge } from "../components/proof/Badges";
import { DataToolbar, ViewToggle } from "../components/ui/DataToolbar";
import { MetricCard } from "../components/ui/MetricCard";
import { SearchInput } from "../components/ui/SearchInput";
import { SectionHead } from "../components/ui/SectionHead";
import { getLots } from "../lib/api";
import { matchesSearch } from "../lib/filters";
import { shortHash } from "../lib/format";
import type { LotListItem } from "../lib/types";
import { useAsyncData } from "../hooks/useAsyncData";
import "./lots.css";

type SortKey = "assetId" | "massGrams" | "verdict" | "attested";
type ViewMode = "table" | "cards";

function lotTone(lot: LotListItem): "valid" | "invalid" | "pending" {
  if (lot.latestVerdict === "Invalid" || lot.sealMatchesReference === false) return "invalid";
  if (lot.latestVerdict === "Valid" || lot.attested) return "valid";
  return "pending";
}

function sortLots(lots: LotListItem[], key: SortKey): LotListItem[] {
  return [...lots].sort((a, b) => {
    switch (key) {
      case "massGrams":
        return b.artifact.massGrams - a.artifact.massGrams;
      case "verdict":
        return (a.latestVerdict ?? "Z").localeCompare(b.latestVerdict ?? "Z");
      case "attested":
        return Number(b.attested) - Number(a.attested);
      default:
        return a.artifact.assetId.localeCompare(b.artifact.assetId);
    }
  });
}

export function Lots() {
  const lots = useAsyncData(getLots);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("assetId");
  const [view, setView] = useState<ViewMode>("table");

  const stats = useMemo(() => {
    const items = lots.data?.lots ?? [];
    return {
      total: items.length,
      attested: items.filter((l) => l.attested).length,
      valid: items.filter((l) => l.latestVerdict === "Valid").length,
      invalid: items.filter((l) => l.latestVerdict === "Invalid").length,
    };
  }, [lots.data]);

  const visible = useMemo(() => {
    const items = lots.data?.lots ?? [];
    const filtered = items.filter((lot) =>
      matchesSearch(
        `${lot.artifact.assetId} ${lot.artifact.operator} ${lot.artifact.origin.site}`,
        search,
      ),
    );
    return sortLots(filtered, sort);
  }, [lots.data, search, sort]);

  return (
    <div className="page">
      <PageHeader
        kicker="Lots"
        title="Lot queue"
        lead="Demo assets from Mineradora Vale do Ouro — inspect artifacts before attestation."
        actions={
          <Link className="route-cta" to="/process">
            Run batch
          </Link>
        }
      />

      <StatePanel loading={lots.loading} error={lots.error} skeleton="table" onRetry={lots.reload}>
        {lots.data ? (
          <>
            <div className="lots-summary">
              <MetricCard label="Total lots" value={stats.total} size="lg" />
              <MetricCard
                label="Attested"
                value={stats.attested}
                hint={`${stats.total - stats.attested} pending`}
                tone="accent"
              />
              <MetricCard label="Valid verdict" value={stats.valid} tone="valid" />
              <MetricCard label="Invalid verdict" value={stats.invalid} tone="invalid" />
            </div>

            <DataToolbar
              search={
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search asset, operator, site…"
                  ariaLabel="Search lots"
                />
              }
              actions={
                <>
                  <select
                    className="sort-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    aria-label="Sort lots"
                  >
                    <option value="assetId">Sort: Asset ID</option>
                    <option value="massGrams">Sort: Mass</option>
                    <option value="verdict">Sort: Verdict</option>
                    <option value="attested">Sort: Attested</option>
                  </select>
                  <ViewToggle value={view} onChange={setView} />
                </>
              }
            />

            <SectionHead label="Artifacts" aside={`${visible.length} shown`} />

            <div className={`lots-view lots-view--${view}`}>
              <div className="lots-table-wrap panel">
                <table className="lots-table">
                  <thead>
                    <tr>
                      <th scope="col">Asset</th>
                      <th scope="col" className="lots-table__num">
                        Mass (g)
                      </th>
                      <th scope="col">Operator</th>
                      <th scope="col">Site</th>
                      <th scope="col">Verdict</th>
                      <th scope="col">Attested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((lot) => (
                      <tr key={lot.artifact.assetId} className={`lots-table__row--${lotTone(lot)}`}>
                        <td>
                          <Link to={`/lots/${encodeURIComponent(lot.artifact.assetId)}`}>
                            {lot.artifact.assetId}
                          </Link>
                          <span className="lots-table__role">{lot.demoRole}</span>
                        </td>
                        <td className="lots-table__num">
                          {lot.artifact.massGrams.toLocaleString()}
                        </td>
                        <td>{lot.artifact.operator}</td>
                        <td>{lot.artifact.origin.site}</td>
                        <td>
                          <VerdictBadge verdict={lot.latestVerdict} />
                        </td>
                        <td>{lot.attested ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lots-grid">
                {visible.map((lot) => {
                  const tone = lotTone(lot);
                  return (
                    <article
                      key={lot.artifact.assetId}
                      className={`panel lot-card lot-card--${tone}`}
                    >
                      <header className="lot-card__head">
                        <div>
                          <p className="lot-card__mass">
                            {lot.artifact.massGrams.toLocaleString()}
                            <span className="lot-card__unit"> g</span>
                          </p>
                          <h2 className="lot-card__title">
                            <Link to={`/lots/${encodeURIComponent(lot.artifact.assetId)}`}>
                              {lot.artifact.assetId}
                            </Link>
                          </h2>
                        </div>
                        <VerdictBadge verdict={lot.latestVerdict} />
                      </header>
                      <p className="lot-card__role">{lot.demoRole}</p>
                      <dl className="lot-card__meta">
                        <div>
                          <dt>Operator</dt>
                          <dd>{lot.artifact.operator}</dd>
                        </div>
                        <div>
                          <dt>Site</dt>
                          <dd>{lot.artifact.origin.site}</dd>
                        </div>
                        <div>
                          <dt>Seal</dt>
                          <dd className="lot-card__seal">
                            {shortHash(lot.computedSeal, 10, 6)}
                            {lot.sealMatchesReference === false ? (
                              <span className="lot-card__mismatch"> mismatch</span>
                            ) : null}
                          </dd>
                        </div>
                        <div>
                          <dt>Attested</dt>
                          <dd>{lot.attested ? "Yes" : "No"}</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </StatePanel>
    </div>
  );
}
