import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AssetAnalyticsReport } from "../components/my-assets/AssetAnalyticsReport";
import { CollateralControl } from "../components/my-assets/CollateralControl";
import { MyAssetsAssetList } from "../components/my-assets/MyAssetsAssetList";
import { SealedRailBanner } from "../components/my-assets/SealedRailBanner";
import { EmptyState } from "../components/ui/EmptyState";
import { BtnIcon } from "../components/ui/BtnIcon";
import { StatePanel } from "../components/layout/StatePanel";
import { getLot, getLots } from "../lib/api";
import {
  applyDemoMint,
  buildDemoMintedLotListItem,
  markDemoCollectionInitialized,
  readDemoMintIds,
  seedDemoCollection,
  shouldAutoSeedDemoCollection,
} from "../lib/demoMints";
import { buildProofLayers, computeProvScore } from "../lib/provenanceScore";
import type { LotListItem } from "../lib/types";
import { useAsyncData } from "../hooks/useAsyncData";
import "../components/my-assets/my-assets-asset-list.css";
import "../components/my-assets/asset-analytics-report.css";

const DEMO_ACCOUNT_KEY = "casper-demo-account";

function readDemoAccount(): string {
  if (typeof localStorage === "undefined") return "casper-demo-account-preview";
  return localStorage.getItem(DEMO_ACCOUNT_KEY) || "casper-demo-account-preview";
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
  const lotsData = useAsyncData(getLots);
  const [searchParams, setSearchParams] = useSearchParams();
  const [connectedAccount, setConnectedAccount] = useState<string | null>(readDemoAccount);
  const [demoMintTick, setDemoMintTick] = useState(0);
  const [lockedMap, setLockedMap] = useState<Record<string, boolean>>({});

  const railFocus = searchParams.get("rail") === "1";

  const setLockedFor = useCallback((assetId: string, locked: boolean) => {
    setLockedMap((prev) => ({ ...prev, [assetId]: locked }));
  }, []);

  const apiLots = lotsData.data?.lots ?? [];
  const apiMintedCount = apiLots.filter((lot) => lot.isMinted).length;

  const myMinted = useMemo(
    () => mergeMintedLots(apiLots),
    [apiLots, demoMintTick],
  );

  const selectedAssetId = searchParams.get("asset");
  const effectiveAssetId =
    selectedAssetId && myMinted.some((lot) => lot.artifact.assetId === selectedAssetId)
      ? selectedAssetId
      : myMinted[0]?.artifact.assetId ?? null;

  const lotLoader = useCallback(
    () => (effectiveAssetId ? getLot(effectiveAssetId) : Promise.resolve(null)),
    [effectiveAssetId],
  );
  const lotState = useAsyncData(lotLoader, [effectiveAssetId]);

  const lot = lotState.data;
  const layers = useMemo(() => (lot ? buildProofLayers(lot) : []), [lot]);
  const score = lot ? computeProvScore(lot) : 0;

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

  if (!connectedAccount) {
    return (
      <div className="page my-assets-page">
        <SealedRailBanner emphasize={railFocus} />
        <EmptyState
          icon="shield"
          title="No demo account connected"
          hint="Connect to load a symbolic demo collection with two provenance NFTs — no Marketplace claim required."
          action={
            <div className="my-assets-empty__actions">
              <button type="button" onClick={connectDemo} className="route-cta">
                <BtnIcon icon="chain">Connect & load demo collection</BtnIcon>
              </button>
              <Link className="route-cta route-cta--ghost" to="/marketplace">
                <BtnIcon icon="globe">Open Marketplace (demo)</BtnIcon>
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
          title="No claimed representations yet"
          hint="Load the demo collection to preview provenance analytics, or claim your own after Valid proof in Marketplace."
          action={
            <div className="my-assets-empty__actions">
              <button type="button" onClick={loadDemoCollection} className="route-cta">
                <BtnIcon icon="shield">Load demo collection (2 assets)</BtnIcon>
              </button>
              <Link className="route-cta route-cta--ghost" to="/marketplace">
                <BtnIcon icon="globe">Browse Marketplace (demo)</BtnIcon>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="my-assets-layout">
          <MyAssetsAssetList
            assets={myMinted}
            selectedId={effectiveAssetId}
            onSelect={selectAsset}
          />

          <div className="my-assets-analytics">
            <StatePanel
              loading={lotState.loading}
              error={lotState.error}
              skeleton="detail"
              onRetry={lotState.reload}
            >
              {lot ? (
                <>
                  <CollateralControl
                    lot={lot}
                    account={connectedAccount}
                    locked={Boolean(lockedMap[lot.artifact.assetId])}
                    onLockedChange={setLockedFor}
                  />
                  <AssetAnalyticsReport lot={lot} layers={layers} score={score} />
                </>
              ) : (
                <p className="my-assets-page__detail-empty panel">Select an asset to view provenance analytics.</p>
              )}
            </StatePanel>
          </div>
        </div>
      )}

    </div>
  );
}
