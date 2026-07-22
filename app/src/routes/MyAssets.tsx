import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AssetAnalyticsReport } from "../components/my-assets/AssetAnalyticsReport";
import { CollateralControl } from "../components/my-assets/CollateralControl";
import { MyAssetsAssetList } from "../components/my-assets/MyAssetsAssetList";
import { SealedRailBanner } from "../components/my-assets/SealedRailBanner";
import { EmptyState } from "../components/ui/EmptyState";
import { BtnIcon } from "../components/ui/BtnIcon";
import { StatePanel } from "../components/layout/StatePanel";
import { useLocaleContext } from "../context/LocaleContext";
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
  const { t } = useLocaleContext();
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
            </div>
          }
        />
      ) : (
        <div className="my-assets-layout">
          <MyAssetsAssetList
            assets={myMinted}
            selectedId={effectiveAssetId}
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
                <p className="my-assets-page__detail-empty panel">{t("myassets.detail.selectPrompt")}</p>
              )}
            </StatePanel>
          </div>
        </div>
      )}

    </div>
  );
}
