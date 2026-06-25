import type { ProvenanceArtifact } from "../../sealer/dist/src/sealer.js";

/** Action the agent can choose before any cryptographic verification. */
export type Action = "pay" | "skip" | "escalate";

/** Agentic decision result: what to do and why. */
export type Decision = {
  action: Action;
  reasoning: string;
  decidedBy: "rule" | "llm";
};

/** Known operational limits for metadata triage. */
export type KnownLimits = {
  minePerimeter: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  massGrams: {
    minExclusive: number;
    maxInclusive: number;
  };
};

/** Context passed to the Decider: operational facts, not an authenticity verdict. */
export type DecisionContext = {
  artifact: ProvenanceArtifact;
  alreadyAttested: boolean;
  limits: KnownLimits;
};

export interface Decider {
  decide(context: DecisionContext): Promise<Decision>;
}

export type VerificationVerdict = "Valid" | "Invalid";

/** Paid-verification result. The verdict comes from the seal, never from the LLM. */
export type VerificationResult = {
  verdict: VerificationVerdict;
  seal: string;
  referenceSeal: string;
  txHash: string;
};

export interface VerificationGateway {
  verifyAndSettle(assetId: string, artifact: ProvenanceArtifact): Promise<VerificationResult>;
}

export interface OriginChain {
  registerReference(assetId: string, seal: string): void;
  attest(assetId: string, providedSeal: string): { verdict: VerificationVerdict };
  acceptedCount(): number;
  rejectedCount(): number;
  isAttested(assetId: string): boolean;
}

export type Outcome = "tokenizable" | "rejected" | "skipped" | "escalated";

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

export const DEFAULT_LIMITS: KnownLimits = {
  minePerimeter: {
    minLat: -21.0,
    maxLat: -19.0,
    minLng: -44.5,
    maxLng: -43.0,
  },
  massGrams: {
    minExclusive: 0,
    maxInclusive: 1_000_000,
  },
};
