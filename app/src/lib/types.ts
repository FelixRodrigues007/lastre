/** Mirrors agent/orchestrator/src/types.ts — browser-safe copies. */

export type Action = "pay" | "skip" | "escalate";
export type VerificationVerdict = "Valid" | "Invalid";
export type Outcome = "tokenizable" | "rejected" | "skipped" | "escalated";
export type DeciderMode = "rule" | "llm";

export type ProvenanceArtifact = {
  assetId: string;
  origin: { lat: number; lng: number; site: string };
  frameHash: string;
  massGrams: number;
  capturedAtISO: string;
  operator: string;
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
  referenceSeal: string | null;
  computedSeal: string;
  sealMatchesReference: boolean | null;
  attested: boolean;
  latestVerdict: VerificationVerdict | null;
  demoRole: string;
  auditRecord: AuditRecord | null;
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

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
