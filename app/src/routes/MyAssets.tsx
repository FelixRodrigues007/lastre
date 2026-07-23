import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AssetAnalyticsReport } from "../components/my-assets/AssetAnalyticsReport";
import { MyAssetsAssetList } from "../components/my-assets/MyAssetsAssetList";
import { SealedRailBanner } from "../components/my-assets/SealedRailBanner";
import { EmptyState } from "../components/ui/EmptyState";
import { BtnIcon } from "../components/ui/BtnIcon";
import { StatePanel } from "../components/layout/StatePanel";
import { useLocaleContext } from "../context/LocaleContext";
import {
  getLockedCollateral,
  getLot,
  getLots,
  getMintSummary,
  lockCollateral,
  releaseCollateral,
  type MintSummary,
} from "../lib/api";
import {
  applyDemoMint,
  buildDemoMintedLotListItem,
  markDemoCollectionInitialized,
  readDemoMintIds,
  seedDemoCollection,
  shouldAutoSeedDemoCollection,
} from "../lib/demoMints";
import { buildMarketplaceDemoUrl } from "../lib/fullDemo";
import {
  estimateDemoCollateralCspr,
  filterAssetByCollateralStatus,
  formatDemoCollateralValue,
  type CollateralFilter,
} from "../lib/myAssets";
import { buildProofLayers, computeProvScore } from "../lib/provenanceScore";
import type { LotListItem } from "../lib/types";
import { useAsyncData } from "../hooks/useAsyncData";
import "../components/my-assets/my-assets-asset-list.css";
import "../components/my-assets/asset-analytics-report.css";

const DEMO_ACCOUNT_KEY = "casper-demo-account";
const DEMO_LOCKS_KEY_PREFIX = "casper-demo-collateral-locks";

function readDemoAccount(): string {
  if (typeof localStorage === "undefined") return "casper-demo-account-preview";
  return localStorage.getItem(DEMO_ACCOUNT_KEY) || "casper-demo-account-preview";
}

function locksKey(owner: string) {
  return `${DEMO_LOCKS_KEY_PREFIX}:${owner}`;
}

function readDemoLocks(owner: string): Record<string, string> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(locksKey(owner)) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function writeDemoLocks(owner: string, locks: Record<string, string>): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(locksKey(owner), JSON.stringify(locks));
}

function mergeMintedLots(lots: LotListItem[]): LotListItem[] {
  const apiMinted = lots.filter((lot) => lot.isMinted).map((lot) => applyDemoMint(lot));
  const seen = new Set(apiMinted.map((lot) => lot.artifact.assetId));

  const demoOnly = readDemoMintIds()
    .filter((assetId) => !seen.has(assetId))
    .map((assetId) => buildDemoMintedLotListItem(assetId))
    .filter((lot): lot is LotListItem => lot !== null);

  return [...apiMinted, ...demoOnly];
}

export function MyAssets() {
  const { t } = useLocaleContext();
  const lotsData = useAsyncData(getLots);
  const [searchParams, setSearchParams] = useSearchParams();
  const [connectedAccount, setConnectedAccount] = useState<string | null>(readDemoAccount);
  const [demoMintTick, setDemoMintTick] = useState(0);
  const [collateralFilter, setCollateralFilter] = useState<CollateralFilter>("all");
  const [lockedMap, setLockedMap] = useState<Record<string, string>>(() =>
    readDemoLocks(readDemoAccount()),
  );
  const [collateralBusy, setCollateralBusy] = useState<string | null>(null);
  const [collateralMessage, setCollateralMessage] = useState<string>("");
  const [mintSummary, setMintSummary] = useState<MintSummary | null>(null);

  const railFocus = searchParams.get("rail") === "1";

  const apiLots = lotsData.data?.lots ?? [];
  const apiMintedCount = apiLots.filter((lot) => lot.isMinted).length;

  const myMinted = useMemo(
    () => mergeMintedLots(apiLots),
    [apiLots, demoMintTick],
  );
  const visibleMinted = useMemo(
    () =>
      myMinted.filter((lot) =>
        filterAssetByCollateralStatus(collateralFilter, Boolean(lockedMap[lot.artifact.assetId])),
      ),
    [myMinted, collateralFilter, lockedMap],
  );

  const selectedAssetId = searchParams.get("asset");
  const selectedInCollection =
    selectedAssetId != null && myMinted.some((lot) => lot.artifact.assetId === selectedAssetId);
  // While the API collection is still loading, honor a deep-linked ?asset= (e.g.
  // the Marketplace rail handoff to a freshly-locked Valid lot) instead of
  // clobbering it with the first demo-seeded lot — the target usually arrives
  // once apiLots resolves. Only fall back once loading is done and it's absent.
  const effectiveAssetId = selectedInCollection
    ? selectedAssetId
    : selectedAssetId && lotsData.loading
      ? selectedAssetId
      : visibleMinted[0]?.artifact.assetId ?? myMinted[0]?.artifact.assetId ?? null;

  const lotLoader = useCallback(
    () => (effectiveAssetId ? getLot(effectiveAssetId) : Promise.resolve(null)),
    [effectiveAssetId],
  );
  const lotState = useAsyncData(lotLoader, [effectiveAssetId]);

  const lot = lotState.data;
  const layers = useMemo(() => (lot ? buildProofLayers(lot) : []), [lot]);
  const score = lot ? computeProvScore(lot) : 0;
  const selectedLockedAt = lot ? lockedMap[lot.artifact.assetId] ?? null : null;
  const selectedCollateralValue = lot
    ? estimateDemoCollateralCspr({
        category: lot.artifact.category,
        tonnesCO2e: lot.artifact.tonnesCO2e,
        massGrams: lot.artifact.massGrams,
      })
    : 0;
  const lockedCount = myMinted.filter((item) => lockedMap[item.artifact.assetId]).length;

  const selectAsset = useCallback(
    (assetId: string) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("asset", assetId);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (!effectiveAssetId || selectedAssetId === effectiveAssetId) return;
    selectAsset(effectiveAssetId);
  }, [effectiveAssetId, selectedAssetId, selectAsset]);

  useEffect(() => {
    if (!connectedAccount) return;
    if (readDemoMintIds().length > 0) return;
    seedDemoCollection();
    markDemoCollectionInitialized();
    setDemoMintTick((tick) => tick + 1);
  }, [connectedAccount]);

  useEffect(() => {
    if (!connectedAccount) return;
    const localLocks = readDemoLocks(connectedAccount);
    setLockedMap(localLocks);
    getLockedCollateral(connectedAccount)
      .then((result) => {
        const apiLocks = Object.fromEntries(
          result.positions.map((position) => [position.assetId, position.lockedAt]),
        );
        const merged = { ...localLocks, ...apiLocks };
        setLockedMap(merged);
        writeDemoLocks(connectedAccount, merged);
      })
      .catch(() => {
        setLockedMap(localLocks);
      });
  }, [connectedAccount]);

  useEffect(() => {
    getMintSummary()
      .then(setMintSummary)
      .catch(() => setMintSummary(null));
  }, [demoMintTick]);

  useEffect(() => {
    if (!connectedAccount || lotsData.loading) return;
    if (!shouldAutoSeedDemoCollection(apiMintedCount)) return;
    seedDemoCollection();
    markDemoCollectionInitialized();
    setDemoMintTick((tick) => tick + 1);
  }, [connectedAccount, lotsData.loading, apiMintedCount]);

  function connectDemo() {
    const fake = `casper-test-account-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEMO_ACCOUNT_KEY, fake);
    setConnectedAccount(fake);
    setLockedMap(readDemoLocks(fake));
    seedDemoCollection();
    markDemoCollectionInitialized();
    setDemoMintTick((tick) => tick + 1);
    lotsData.reload();
  }

  function loadDemoCollection() {
    seedDemoCollection();
    markDemoCollectionInitialized();
    setDemoMintTick((tick) => tick + 1);
  }

  async function handleLockSelected() {
    if (!lot || !connectedAccount) return;
    const assetId = lot.artifact.assetId;
    setCollateralBusy(assetId);
    setCollateralMessage("");
    try {
      const result = await lockCollateral(assetId, connectedAccount);
      if (!result.success) throw new Error(result.error || "Lock failed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("Already locked")) {
        setCollateralMessage(`Runtime lock unavailable; keeping a local demo lock. Reason: ${message || "demo fallback"}`);
      }
    } finally {
      const next = { ...lockedMap, [assetId]: new Date().toISOString() };
      setLockedMap(next);
      writeDemoLocks(connectedAccount, next);
      setCollateralBusy(null);
    }
  }

  async function handleReleaseSelected() {
    if (!lot || !connectedAccount) return;
    const assetId = lot.artifact.assetId;
    setCollateralBusy(assetId);
    setCollateralMessage("");
    try {
      await releaseCollateral(assetId, connectedAccount);
    } catch {
      // The runtime can restart on free hosting. For the demo, releasing the
      // local lock is still the correct UX outcome.
    } finally {
      const next = { ...lockedMap };
      delete next[assetId];
      setLockedMap(next);
      writeDemoLocks(connectedAccount, next);
      setCollateralMessage(`Released ${assetId} from demo collateral.`);
      setCollateralBusy(null);
    }
  }

  if (!connectedAccount) {
    return (
      <div className="page my-assets-page">
        <SealedRailBanner emphasize={railFocus} />
        <EmptyState
          icon="shield"
          title={t("myassets.empty.noAccount.title")}
          hint={t("myassets.empty.noAccount.hint")}
          action={
            <div className="my-assets-empty__actions">
              <button type="button" onClick={connectDemo} className="route-cta">
                <BtnIcon icon="chain">{t("myassets.empty.noAccount.connectCta")}</BtnIcon>
              </button>
              <Link className="route-cta route-cta--ghost" to="/marketplace">
                <BtnIcon icon="globe">{t("myassets.empty.noAccount.marketplaceCta")}</BtnIcon>
              </Link>
              <Link className="route-cta route-cta--ghost" to={buildMarketplaceDemoUrl()}>
                <BtnIcon icon="process">Run full demo</BtnIcon>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="page my-assets-page my-assets-page--split">
      <SealedRailBanner emphasize={railFocus} />
      {myMinted.length === 0 ? (
        <EmptyState
          icon="shield"
          title={t("myassets.empty.noAssets.title")}
          hint={t("myassets.empty.noAssets.hint")}
          action={
            <div className="my-assets-empty__actions">
              <button type="button" onClick={loadDemoCollection} className="route-cta">
                <BtnIcon icon="shield">{t("myassets.empty.noAssets.loadCta")}</BtnIcon>
              </button>
              <Link className="route-cta route-cta--ghost" to="/marketplace">
                <BtnIcon icon="globe">{t("myassets.empty.noAssets.marketplaceCta")}</BtnIcon>
              </Link>
              <Link className="route-cta route-cta--ghost" to={buildMarketplaceDemoUrl()}>
                <BtnIcon icon="process">Run full demo</BtnIcon>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="my-assets-layout">
          <header className="my-assets-summary panel">
            <div>
              <span className="mono-label">My Proven Assets</span>
              <h2>{myMinted.length} claimed • {lockedCount} locked</h2>
              <p>
                Provenance NFT representations only. Collateral values are simulated for demo UX.
                {mintSummary?.paidX402Queries != null
                  ? ` Paid x402 queries this runtime: ${mintSummary.paidX402Queries}.`
                  : ""}
              </p>
            </div>
            <div className="my-assets-filter" role="group" aria-label="Filter collateral status">
              {(["all", "available", "locked"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={filter === collateralFilter ? "is-active" : ""}
                  onClick={() => setCollateralFilter(filter)}
                >
                  {filter === "all" ? "All" : filter === "available" ? "Available" : "Locked"}
                </button>
              ))}
            </div>
          </header>

          <MyAssetsAssetList
            assets={visibleMinted}
            selectedId={effectiveAssetId}
            lockedIds={new Set(Object.keys(lockedMap))}
            onSelect={selectAsset}
            selectHint={t("myassets.list.selectHint")}
          />

          <div className="my-assets-analytics">
            <StatePanel
              loading={lotState.loading}
              error={lotState.error}
              skeleton="detail"
              onRetry={lotState.reload}
            >
              {lot ? (
                <div className="my-assets-detail-stack">
                  <section className="my-assets-collateral panel" aria-label="Collateral status">
                    <div className="my-assets-collateral__main">
                      <span className={`my-assets-collateral__badge${selectedLockedAt ? " is-locked" : ""}`}>
                        {selectedLockedAt ? "Locked as Collateral" : "Available for Collateral"}
                      </span>
                      <h3>{formatDemoCollateralValue(selectedCollateralValue)}</h3>
                      <p>
                        {lot.artifact.category === "carbon_credit"
                          ? `${lot.artifact.tonnesCO2e?.toLocaleString() ?? "—"} tCO₂e • ${lot.artifact.creditType ?? "carbon"} • ${lot.artifact.vintage ?? "demo vintage"}`
                          : `${lot.artifact.massGrams?.toLocaleString() ?? "—"} g • ${lot.artifact.mineral ?? "mineral"}`
                        }
                      </p>
                      <dl>
                        <div>
                          <dt>Verdict</dt>
                          <dd>{lot.latestVerdict ?? "Unverified"}</dd>
                        </div>
                        <div>
                          <dt>Seal</dt>
                          <dd><code>{lot.computedSeal.slice(0, 12)}…</code></dd>
                        </div>
                        <div>
                          <dt>On-chain mode</dt>
                          <dd>{mintSummary?.onChain?.source === "live" ? "Live ProofOfOrigin" : "Hybrid demo"}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="my-assets-collateral__actions">
                      {selectedLockedAt ? (
                        <button
                          type="button"
                          className="route-cta route-cta--ghost"
                          disabled={collateralBusy === lot.artifact.assetId}
                          onClick={handleReleaseSelected}
                        >
                          Release Collateral
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="route-cta"
                          disabled={collateralBusy === lot.artifact.assetId}
                          onClick={handleLockSelected}
                        >
                          Lock as Collateral
                        </button>
                      )}
                      <Link className="route-cta route-cta--ghost" to={`/marketplace/${encodeURIComponent(lot.artifact.assetId)}`}>
                        View Marketplace Card
                      </Link>
                    </div>
                    {collateralMessage ? <p className="my-assets-collateral__message">{collateralMessage}</p> : null}
                  </section>

                  <AssetAnalyticsReport lot={lot} layers={layers} score={score} />
                </div>
              ) : (
                <p className="my-assets-page__detail-empty panel">{t("myassets.detail.selectPrompt")}</p>
              )}
            </StatePanel>
          </div>
        </div>
      )}

    </div>
  );
}
