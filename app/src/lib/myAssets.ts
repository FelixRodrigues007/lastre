export type CollateralFilter = "all" | "available" | "locked";

type CollateralEstimateInput = {
  category?: string;
  tonnesCO2e?: number | null;
  massGrams?: number | null;
};

/**
 * Fictional DeFi demo value. This is not pricing, appraisal, yield, or advice.
 * It exists only so judges can see how a proven asset would pass into a DeFi UI.
 */
export function estimateDemoCollateralCspr(asset: CollateralEstimateInput): number {
  if (asset.category === "carbon_credit" || asset.tonnesCO2e != null) {
    return Math.max(1, Math.floor((asset.tonnesCO2e ?? 1000) / 40));
  }

  return Math.max(1, Math.floor((asset.massGrams ?? 100000) / 200));
}

export function formatDemoCollateralValue(value: number): string {
  return `~${Math.round(value).toLocaleString()} CSPR demo`;
}

export function filterAssetByCollateralStatus(filter: CollateralFilter, locked: boolean): boolean {
  if (filter === "locked") return locked;
  if (filter === "available") return !locked;
  return true;
}
