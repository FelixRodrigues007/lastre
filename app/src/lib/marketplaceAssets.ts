import { DEMO_CATALOG, demoSeal } from "./demoCatalog";
import { getMarketplaceCoverFromAsset } from "./marketplaceCovers";
import type { AssetStatus, EnrichedAsset, MapPoint } from "./marketplaceTypes";

type LotRecord = Record<string, unknown> & {
  artifact: Record<string, unknown> & { assetId: string };
};

export function buildLotMap(lots: LotRecord[]): Map<string, LotRecord> {
  const map = new Map<string, LotRecord>();
  lots.forEach((lot) => map.set(lot.artifact.assetId, lot));
  return map;
}

export function mergeMarketplaceAssets(lots: LotRecord[]): Record<string, unknown>[] {
  const map = new Map<string, Record<string, unknown>>();
  [...DEMO_CATALOG, ...lots.map((lot) => lot.artifact)].forEach((asset) => {
    const record = asset as Record<string, unknown>;
    const assetId = String(record.assetId);
    if (!map.has(assetId)) map.set(assetId, record);
  });
  return Array.from(map.values());
}

export function buildMapPoints(
  assets: Record<string, unknown>[],
  lotMap: Map<string, LotRecord>,
): MapPoint[] {
  return assets
    .map((asset): MapPoint | null => {
      const origin = asset.origin as { lat?: number; lng?: number; site?: string; label?: string } | undefined;
      if (!origin || typeof origin.lat !== "number" || typeof origin.lng !== "number") {
        return null;
      }

      const assetId = String(asset.assetId);
      const category =
        asset.category === "carbon_credit" || asset.creditType ? "carbon_credit" : "mineral";
      const lot = lotMap.get(assetId);
      const isInvalidProof =
        lot?.latestVerdict === "Invalid" || lot?.sealMatchesReference === false;
      const isMinted = Boolean(lot?.isMinted || asset.isMinted);
      const isValidProof =
        !isInvalidProof &&
        (lot?.latestVerdict === "Valid" || (asset.expectedOnChain === "Valid" && !lot));
      const status: AssetStatus = isMinted ? "minted" : isValidProof ? "proven" : "pending";
      const label = String(asset.name || origin.site || origin.label || assetId);
      const detail =
        category === "carbon_credit"
          ? `${asset.creditType || "Carbon"} · ${asset.tonnesCO2e ? `${Number(asset.tonnesCO2e).toLocaleString()} tCO₂e` : "demo credit"}`
          : `${asset.mineral || asset.mineralType || "Mineral"} · ${asset.massGrams ? `${Number(asset.massGrams).toLocaleString()} g` : "demo lot"}`;

      return {
        assetId,
        label,
        lat: origin.lat,
        lng: origin.lng,
        category,
        status,
        detail,
      };
    })
    .filter((point): point is MapPoint => point !== null);
}

export function enrichMarketplaceAsset(
  asset: Record<string, unknown>,
  lotMap: Map<string, LotRecord>,
  mapPoints: MapPoint[],
): EnrichedAsset {
  const assetId = String(asset.assetId);
  const lot = lotMap.get(assetId);
  const isCarbon = asset.category === "carbon_credit" || Boolean(asset.creditType);
  const quantity = (isCarbon ? asset.tonnesCO2e : asset.massGrams) as number | undefined;
  const unit = isCarbon ? "tCO₂e" : "g";
  const isInvalidProof =
    lot?.latestVerdict === "Invalid" || lot?.sealMatchesReference === false;
  const isValidProof =
    !isInvalidProof &&
    (lot?.latestVerdict === "Valid" || (asset.expectedOnChain === "Valid" && !lot));
  const isMinted = Boolean(lot?.isMinted || asset.isMinted);
  const provScore = lot
    ? Math.min(
        99,
        68 +
          (lot.attested ? 18 : 0) +
          (lot.sealMatchesReference ? 8 : 0) +
          (lot.latestVerdict === "Valid" ? 5 : 0),
      )
    : asset.expectedOnChain === "Valid"
      ? 91
      : 62;
  const status: AssetStatus = isMinted ? "minted" : isValidProof ? "proven" : "pending";
  const origin = asset.origin as { site?: string; label?: string } | undefined;
  const label = String(asset.name || origin?.site || asset.operator || assetId);
  const mapPoint = mapPoints.find((point) => point.assetId === assetId) ?? null;
  const detail = mapPoint?.detail ?? (isCarbon ? String(asset.creditType || "Carbon") : "Mineral");

  return {
    asset,
    lot,
    isCarbon,
    quantity,
    unit,
    provScore,
    isValidProof,
    isMinted,
    mintTx: (lot?.mintTx || asset.mintTx) as string | undefined,
    computedSeal: String(lot?.computedSeal || demoSeal(assetId)),
    mapPoint,
    label,
    detail,
    status,
    coverUrl: getMarketplaceCoverFromAsset(asset),
  };
}

export function enrichMarketplaceAssets(
  assets: Record<string, unknown>[],
  lotMap: Map<string, LotRecord>,
): EnrichedAsset[] {
  const mapPoints = buildMapPoints(assets, lotMap);
  return assets.map((asset) => enrichMarketplaceAsset(asset, lotMap, mapPoints));
}

export function findMarketplaceAsset(
  assetId: string,
  lots: LotRecord[],
): EnrichedAsset | null {
  const lotMap = buildLotMap(lots);
  const merged = mergeMarketplaceAssets(lots);
  const asset = merged.find((item) => String(item.assetId) === assetId);
  if (!asset) return null;
  const mapPoints = buildMapPoints(merged, lotMap);
  return enrichMarketplaceAsset(asset, lotMap, mapPoints);
}
