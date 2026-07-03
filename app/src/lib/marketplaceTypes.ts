export type MarketplacePersona = "public" | "buyer" | "defi" | "operator";

export type AssetStatus = "minted" | "proven" | "pending";

export type MapPoint = {
  assetId: string;
  label: string;
  lat: number;
  lng: number;
  category: "mineral" | "carbon_credit";
  status: AssetStatus;
  detail: string;
};

export type EnrichedAsset = {
  asset: Record<string, unknown>;
  lot: Record<string, unknown> | undefined;
  isCarbon: boolean;
  quantity: number | undefined;
  unit: string;
  provScore: number;
  isValidProof: boolean;
  isMinted: boolean;
  mintTx: string | undefined;
  computedSeal: string;
  mapPoint: MapPoint | null;
  label: string;
  detail: string;
  status: AssetStatus;
  coverUrl: string;
};
