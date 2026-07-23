/** Mirrors agent/orchestrator/src/types.ts — browser-safe copies. */

export type Action = "pay" | "skip" | "escalate";
export type VerificationVerdict = "Valid" | "Invalid";
export type Outcome = "tokenizable" | "rejected" | "skipped" | "escalated";
export type DeciderMode = "rule" | "llm";

export type AssetCategory = 'mineral' | 'carbon_credit';

export type CarbonCreditType =
  | 'VCU'              // Créditos de Carbono Voluntários
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

export type ProvenanceArtifact = {
  assetId: string;
  category: AssetCategory;
  origin: { lat: number; lng: number; site: string };
  frameHash: string;
  massGrams?: number; // optional for credits (use tonnesCO2e)
  capturedAtISO: string;
  operator: string;
  // Mineral-specific (backward compat)
  mineral?: string;
  mineralType?: string;
  // Carbon credit specific
  creditType?: CarbonCreditType;
  tonnesCO2e?: number;
  vintage?: string; // e.g. "2024"
  methodology?: string;
  projectId?: string;
  verifier?: string; // e.g. "Verra", "Gold Standard"
};

export type Decision = {
  action: Action;
  reasoning: string;
  decidedBy: "rule" | "llm";
};

export type VerificationResult = {
  verdict: VerificationVerdict;
  seal: string;
  referenceSeal: string;
  txHash: string;
};

export type OnChainAudit = {
  verdict: VerificationVerdict;
  txHash: string;
};

export type AuditRecord = {
  assetId: string;
  decision: Decision;
  verification: VerificationResult | null;
  onChain: OnChainAudit | null;
  outcome: Outcome;
};

export type BatchSummary = {
  tokenizable: number;
  rejected: number;
  skipped: number;
  escalated: number;
  onChainAccepted: number;
  onChainRejected: number;
};

export type BatchResult = {
  records: AuditRecord[];
  summary: BatchSummary;
};

export type LotListItem = {
  artifact: ProvenanceArtifact;
  referenceArtifact: ProvenanceArtifact | null;
  referenceSeal: string | null;
  computedSeal: string;
  sealMatchesReference: boolean | null;
  attested: boolean;
  latestVerdict: VerificationVerdict | null;
  demoRole: string;
  auditRecord: AuditRecord | null;
  isMinted?: boolean;
  mintTx?: string | null;
  creditType?: CarbonCreditType;  // for carbon credits
};

export type KnownLimits = {
  minePerimeter: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  massGrams: { minExclusive: number; maxInclusive: number };
};

export type AppSettings = {
  decider: DeciderMode;
  limits: KnownLimits;
  persistence: "session";
  llmConfigured: boolean;
};

export type AuditExport = {
  exportedAt: string;
  records: AuditRecord[];
  lastBatch: BatchResult | null;
  summary: Omit<AuditSummary, "lastBatch">;
};

export type TestnetAttestation = {
  assetId: string;
  verdict: VerificationVerdict;
  providedSeal: string;
  referenceSeal: string | null;
  attester: string;
  explorerUrl: string | null;
};

export type LiveTestnetSnapshot = {
  packageHash: string;
  packageUrl: string;
  network: "casper-test";
  accepted: number;
  rejected: number;
  attestations: TestnetAttestation[];
  source: "live" | "fallback";
  fetchedAt: string | null;
};

export type ChainSummary = {
  packageHash: string;
  packageUrl: string;
  network: "casper-test";
  session: { accepted: number; rejected: number };
  testnet: LiveTestnetSnapshot;
};

export type LotDetail = LotListItem & {
  testnetAttestation: TestnetAttestation | null;
};

export type AuditSummary = {
  total: number;
  tokenizable: number;
  rejected: number;
  skipped: number;
  escalated: number;
  lastBatch: BatchSummary | null;
};

export type EscalationResolutionAction = "requeued" | "discarded" | "overridden";

export type EscalationActionResult = {
  assetId: string;
  action: EscalationResolutionAction;
  record: AuditRecord;
  previousReasoning: string | null;
  requeuedEscalated: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Machine code from API body when present (e.g. ALREADY_MINTED). */
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
