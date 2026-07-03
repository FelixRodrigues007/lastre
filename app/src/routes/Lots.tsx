import { Link, useSearchParams } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { CaptureWizardTrigger } from "../components/capture/CaptureWizardTrigger";
import { LotDrawer } from "../components/lots/LotDrawer";
import { LotListRow } from "../components/lots/LotListRow";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { VerdictBadge } from "../components/proof/Badges";
import { DataToolbar, ViewToggle } from "../components/ui/DataToolbar";
import { OutcomeBreakdown } from "../components/ui/OutcomeBreakdown";
import { SearchInput } from "../components/ui/SearchInput";
import { SectionHead } from "../components/ui/SectionHead";
import { useLocaleContext } from "../context/LocaleContext";
import { getLots } from "../lib/api";
import { matchesSearch } from "../lib/filters";
import { shortHash } from "../lib/format";
import { countLotOutcomes } from "../lib/lotOutcomes";
import type { LotListItem } from "../lib/types";
import { useAsyncData } from "../hooks/useAsyncData";
import "./lots.css";

type SortKey = "assetId" | "quantity" | "verdict" | "attested";
type ViewMode = "list" | "cards";

function lotTone(lot: LotListItem): "valid" | "invalid" | "pending" {
  if (lot.latestVerdict === "Invalid" || lot.sealMatchesReference === false) return "invalid";
  if (lot.latestVerdict === "Valid" || lot.attested) return "valid";
  return "pending";
}

function sortLots(lots: LotListItem[], key: SortKey): LotListItem[] {
  return [...lots].sort((a, b) => {
    switch (key) {
      case "quantity":
        const qa = (a.artifact as any).tonnesCO2e ?? a.artifact.massGrams ?? 0;
        const qb = (b.artifact as any).tonnesCO2e ?? b.artifact.massGrams ?? 0;
        return qb - qa;
      case "verdict":
        return (a.latestVerdict ?? "Z").localeCompare(b.latestVerdict ?? "Z");
      case "attested":
        return Number(b.attested) - Number(a.attested);
      default:
        return a.artifact.assetId.localeCompare(b.artifact.assetId);
    }
  });
}

function lotHref(assetId: string) {
  return `/lots?lot=${encodeURIComponent(assetId)}`;
}

export function Lots() {
  const { t } = useLocaleContext();
  const lots = useAsyncData(getLots);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("assetId");
  const [view, setView] = useState<ViewMode>("list");

  const selectedLotId = searchParams.get("lot");

  const closeDrawer = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("lot");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const outcomes = useMemo(() => countLotOutcomes(lots.data?.lots ?? []), [lots.data]);

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
    <div className="page lots-page">
      <PageHeader
        kicker="Lots"
        title="Lot queue"
        lead="Minerals and carbon credits. Capture new via camera or upload, then process."
        actions={
          <>
            <CaptureWizardTrigger className="route-cta route-cta--ghost">
              Capture / New
            </CaptureWizardTrigger>
            <Link className="route-cta" to="/process">Run batch</Link>
            <Link className="route-cta" to="/marketplace">Marketplace</Link>
          </>
        }
      />

      <StatePanel loading={lots.loading} error={lots.error} skeleton="table" onRetry={lots.reload}>
        {lots.data ? (
          <>
            <div className="lots-outcomes">
              <OutcomeBreakdown
                title={t("lots.outcomes.title")}
                tokenizable={outcomes.tokenizable}
                rejected={outcomes.rejected}
                skipped={outcomes.skipped}
                escalated={outcomes.escalated}
              />
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
                    <option value="quantity">Sort: Quantity</option>
                    <option value="verdict">Sort: Verdict</option>
                    <option value="attested">Sort: Attested</option>
                  </select>
                  <ViewToggle value={view} onChange={setView} />
                </>
              }
            />

            <SectionHead label="Artifacts" aside={`${visible.length} shown`} />

            <div className={`lots-view lots-view--${view}`}>
              <div className="lots-list panel">
                {visible.map((lot) => {
                  const assetId = lot.artifact.assetId;
                  return (
                    <LotListRow
                      key={assetId}
                      lot={lot}
                      tone={lotTone(lot)}
                      href={lotHref(assetId)}
                      isSelected={selectedLotId === assetId}
                    />
                  );
                })}
              </div>

              <div className="lots-grid">
                {visible.map((lot) => {
                  const tone = lotTone(lot);
                  const assetId = lot.artifact.assetId;
                  const isSelected = selectedLotId === assetId;
                  return (
                    <article
                      key={assetId}
                      className={`panel lot-card lot-card--${tone}${isSelected ? " lot-card--selected" : ""}`}
                    >
                      <header className="lot-card__head">
                        <div>
                          <p className="lot-card__mass">
                            {lot.artifact.tonnesCO2e != null
                              ? lot.artifact.tonnesCO2e.toLocaleString()
                              : lot.artifact.massGrams != null
                                ? lot.artifact.massGrams.toLocaleString()
                                : "—"}
                            <span className="lot-card__unit"> {lot.artifact.tonnesCO2e != null ? "tCO₂e" : "g"}</span>
                          </p>
                          <h2 className="lot-card__title">
                            <Link to={lotHref(assetId)}>{assetId}</Link>
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

      {selectedLotId ? <LotDrawer assetId={selectedLotId} onClose={closeDrawer} /> : null}
    </div>
  );
}
