type CoverInput = {
  assetId: string;
  isCarbon: boolean;
  creditType?: string;
  mineral?: string;
};

const MEDIA = "/media/marketplace";

/** Local demo photos (Unsplash, bundled for reliability). */
const COVERS = {
  mineOpenPit: `${MEDIA}/mine-open-pit.jpg`,
  mineExcavator: `${MEDIA}/mine-excavator.jpg`,
  mineSite: `${MEDIA}/mine-site.jpg`,
  goldNuggets: `${MEDIA}/gold-nuggets.jpg`,
  amazonForest: `${MEDIA}/amazon-forest.jpg`,
  rainforestCanopy: `${MEDIA}/rainforest-canopy.jpg`,
  solarFarm: `${MEDIA}/solar-farm.jpg`,
  solarPanels: `${MEDIA}/solar-panels.jpg`,
  windTurbines: `${MEDIA}/wind-turbines.jpg`,
  windFarm: `${MEDIA}/wind-farm.jpg`,
} as const;

export const MARKETPLACE_COVER_FALLBACK = COVERS.mineOpenPit;

/** Demo site photos mapped to fictional marketplace assets. */
const COVER_BY_ASSET: Record<string, string> = {
  "MINA-VALEDOURO-LOTE-001": COVERS.mineOpenPit,
  "MINA-VALEDOURO-LOTE-002": COVERS.mineExcavator,
  "MINA-VALEDOURO-LOTE-002-TAMPERED": COVERS.mineSite,
  "LOTE-OUTOFREGION": COVERS.goldNuggets,
  "CARBON-VCS-AMAZONIA-2024-001": COVERS.amazonForest,
  "CARBON-GOLDSTANDARD-SOLAR-2025-002": COVERS.solarFarm,
  "CARBON-IREC-WIND-2024-004": COVERS.windTurbines,
};

export function getMarketplaceCoverUrl(input: CoverInput): string {
  const known = COVER_BY_ASSET[input.assetId];
  if (known) return known;

  if (!input.isCarbon) {
    const mineral = (input.mineral ?? "").toLowerCase();
    if (mineral.includes("gold")) return COVERS.goldNuggets;
    return COVERS.mineOpenPit;
  }

  const credit = (input.creditType ?? "").toLowerCase();
  if (credit.includes("solar") || credit.includes("renewable")) return COVERS.solarPanels;
  if (credit.includes("wind") || credit.includes("irec")) return COVERS.windFarm;
  if (credit.includes("redd") || credit.includes("vcs") || credit.includes("arr")) {
    return COVERS.rainforestCanopy;
  }
  return COVERS.amazonForest;
}

export function getMarketplaceCoverFromAsset(asset: Record<string, unknown>): string {
  const assetId = String(asset.assetId);
  const isCarbon = asset.category === "carbon_credit" || Boolean(asset.creditType);
  return getMarketplaceCoverUrl({
    assetId,
    isCarbon,
    creditType: asset.creditType as string | undefined,
    mineral: (asset.mineral || asset.mineralType) as string | undefined,
  });
}
