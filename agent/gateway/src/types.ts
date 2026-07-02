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

export interface MintStatus {
  isMinted: boolean;
  mintTx: string | null;
}

export interface ProvenanceCredentialResponse {
  assetId: string;
  verdict: "Valid";
  seal: string;
  attester: string;
  attestationTx: string;
  type: "ProvenanceCredential";
  transferable: false;
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

export type AssetCategory = 'mineral' | 'carbon_credit';

export type CarbonCreditType =
  | 'VCU'              // Créditos de Carbono Voluntários (VCUs)
  | 'VCS'              // Créditos Verra (VCS)
  | 'GoldStandard'     // Créditos Gold Standard
  | 'CER'              // Créditos UNFCCC (CERs)
  | 'REDD+'            // Créditos REDD+
  | 'ARR'              // Créditos de Reflorestamento (ARR)
  | 'RenewableEnergy'  // Créditos de Energia Renovável
  | 'Biomass'          // Créditos de Biomassa
  | 'Wind'             // Créditos de Energia Eólica
  | 'Solar'            // Créditos de Energia Solar
  | 'PCH'              // Créditos de Pequenas Centrais Hidrelétricas (PCH)
  | 'IREC';            // I-REC (International Renewable Energy Certificate)

export interface CatalogAsset {
  assetId: string;
  name?: string;
  category?: AssetCategory;
  mineral?: string;
  mineralType?: string;
  // Carbon credit fields
  creditType?: CarbonCreditType;
  tonnesCO2e?: number;
  vintage?: string;
  methodology?: string;
  projectId?: string;
  verifier?: string;
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
