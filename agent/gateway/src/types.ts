export type Verdict = "Valid" | "Invalid" | "Unverified";

export interface VerdictResponse {
  assetId: string;
  verdict: Verdict;
  seal: string | null;
  referenceSeal: string | null;
  attester: string | null;
  attestationTx: string | null;
  packageHash: string;
  readAt: string;
  accepted?: number;
  rejected?: number;
}

export interface ComputeRequest {
  assetId?: string;
  measurement?: {
    assetId?: string;
    origin?: { lat?: number; lng?: number; site?: string; label?: string };
    frameHash?: string;
    massGrams?: number;
    capturedAtISO?: string;
    operator?: string;
  };
  seal?: string;
}

export interface ComputeResponse {
  computedSeal: string;
  referenceSeal: string | null;
  match: boolean;
  verdict: "Valid" | "Invalid";
}

export interface AnchorRequest {
  assetId?: string;
  seal?: string;
}

export interface AnchorResponse {
  txHash: string;
  verdict: "Valid" | "Invalid";
  explorerUrl: string;
}

export interface RecentAttestation {
  assetId: string;
  verdict: "Valid" | "Invalid";
  tx: string | null;
  timestamp: string | null;
}

export interface ProofResponse {
  packageHash: string;
  accepted: number;
  rejected: number;
  recentAttestations: RecentAttestation[];
}

export interface CatalogAsset {
  assetId: string;
  name?: string;
  mineral?: string;
  mineralType?: string;
  operator?: string;
  origin?: { lat: number; lng: number; label: string };
  custodyPath?: Array<{ lat: number; lng: number; step?: string; label?: string }>;
  referenceRegistered?: boolean;
  expectedOnChain?: Verdict;
  simulated?: boolean;
}

export interface Catalog {
  disclaimer?: string;
  perimeter?: unknown;
  assets: CatalogAsset[];
}
