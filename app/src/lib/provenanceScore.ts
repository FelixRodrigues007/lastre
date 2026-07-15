import type { LotDetail, LotListItem } from "./types";
import { explorerUrlFromTx, resolveAttestationUrl } from "./chainTimeline";

export type ProofLayerId = "capture" | "seal" | "verify" | "casper" | "mint";
export type ProofLayerStatus = "good" | "partial" | "poor";

export type ProofLayer = {
  id: ProofLayerId;
  label: string;
  status: ProofLayerStatus;
  scoreContribution: number;
  detail: string;
};

export type ScoreComponent = {
  id: string;
  label: string;
  points: number;
  earned: boolean;
};

export type TimelineEvent = {
  id: string;
  label: string;
  timestamp: string | null;
  status: ProofLayerStatus;
  href?: string;
};

const BASE_SCORE = 68;
const ATTESTED_BONUS = 18;
const SEAL_BONUS = 8;
const VERDICT_BONUS = 5;

export function computeProvScore(lot: Pick<LotListItem, "attested" | "sealMatchesReference" | "latestVerdict">): number {
  return Math.min(
    99,
    BASE_SCORE +
      (lot.attested ? ATTESTED_BONUS : 0) +
      (lot.sealMatchesReference ? SEAL_BONUS : 0) +
      (lot.latestVerdict === "Valid" ? VERDICT_BONUS : 0),
  );
}

export function scoreTier(score: number): "strong" | "moderate" | "weak" {
  if (score >= 85) return "strong";
  if (score >= 70) return "moderate";
  return "weak";
}

export function scoreTierLabel(tier: ReturnType<typeof scoreTier>): string {
  switch (tier) {
    case "strong":
      return "Strong";
    case "moderate":
      return "Moderate";
    default:
      return "Developing";
  }
}

export function buildScoreComponents(lot: LotListItem): ScoreComponent[] {
  return [
    { id: "base", label: "Base confidence", points: BASE_SCORE, earned: true },
    {
      id: "attested",
      label: "Casper attestation",
      points: ATTESTED_BONUS,
      earned: lot.attested,
    },
    {
      id: "seal",
      label: "Seal match",
      points: SEAL_BONUS,
      earned: lot.sealMatchesReference === true,
    },
    {
      id: "verdict",
      label: "Valid verdict",
      points: VERDICT_BONUS,
      earned: lot.latestVerdict === "Valid",
    },
  ];
}

export function buildProofLayers(lot: LotDetail): ProofLayer[] {
  const hasCapture = Boolean(lot.artifact.capturedAtISO);
  const sealGood = lot.sealMatchesReference === true;
  const sealPoor = lot.sealMatchesReference === false;
  const verifyGood = lot.latestVerdict === "Valid";
  const verifyPoor = lot.latestVerdict === "Invalid";
  const casperGood = lot.attested || Boolean(lot.auditRecord?.onChain ?? lot.testnetAttestation);
  const casperPartial = Boolean(lot.auditRecord?.verification) && !casperGood;
  const mintGood = Boolean(lot.isMinted);

  return [
    {
      id: "capture",
      label: "Capture",
      status: hasCapture ? "good" : "poor",
      scoreContribution: 0,
      detail: hasCapture ? lot.artifact.capturedAtISO : "No capture timestamp",
    },
    {
      id: "seal",
      label: "Seal",
      status: sealGood ? "good" : sealPoor ? "poor" : "partial",
      scoreContribution: sealGood ? SEAL_BONUS : 0,
      detail: sealGood
        ? "Computed seal matches reference"
        : sealPoor
          ? "Seal mismatch detected"
          : "Awaiting reference comparison",
    },
    {
      id: "verify",
      label: "Verify",
      status: verifyGood ? "good" : verifyPoor ? "poor" : "partial",
      scoreContribution: verifyGood ? VERDICT_BONUS : 0,
      detail: verifyGood
        ? "Verification returned Valid"
        : verifyPoor
          ? "Verification returned Invalid"
          : "Not yet verified",
    },
    {
      id: "casper",
      label: "Casper",
      status: casperGood ? "good" : casperPartial ? "partial" : "poor",
      scoreContribution: casperGood ? ATTESTED_BONUS : 0,
      detail: casperGood
        ? "On-chain attestation recorded"
        : casperPartial
          ? "Off-chain verification only"
          : "No attestation yet",
    },
    {
      id: "mint",
      label: "Mint",
      status: mintGood ? "good" : verifyGood ? "partial" : "poor",
      scoreContribution: 0,
      detail: mintGood
        ? lot.mintTx
          ? "Minted via MintGate (demo)"
          : "Marked minted in session"
        : verifyGood
          ? "Eligible — claim in Marketplace"
          : "Requires valid proof first",
    },
  ];
}

export function layerStatusCounts(layers: ProofLayer[]) {
  return layers.reduce(
    (acc, layer) => {
      acc[layer.status] += 1;
      return acc;
    },
    { good: 0, partial: 0, poor: 0 } as Record<ProofLayerStatus, number>,
  );
}

export function buildTimeline(lot: LotDetail): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: "capture",
      label: "Captured",
      timestamp: lot.artifact.capturedAtISO,
      status: lot.artifact.capturedAtISO ? "good" : "poor",
    },
    {
      id: "process",
      label: "Batch processed",
      timestamp: lot.auditRecord ? lot.artifact.capturedAtISO : null,
      status: lot.auditRecord ? "good" : "partial",
    },
    {
      id: "verify",
      label: "Seal verified",
      timestamp: lot.latestVerdict ? lot.artifact.capturedAtISO : null,
      status:
        lot.latestVerdict === "Valid" ? "good" : lot.latestVerdict === "Invalid" ? "poor" : "partial",
    },
    {
      id: "casper",
      label: "Casper attested",
      timestamp: lot.attested ? lot.artifact.capturedAtISO : null,
      status: lot.attested ? "good" : "partial",
      href:
        resolveAttestationUrl(
          lot.artifact.assetId,
          lot.testnetAttestation?.explorerUrl ?? null,
          lot.testnetAttestation?.verdict ?? lot.latestVerdict ?? null,
        ) ?? undefined,
    },
    {
      id: "mint",
      label: "NFT minted",
      timestamp: lot.isMinted ? lot.artifact.capturedAtISO : null,
      status: lot.isMinted ? "good" : "partial",
      // MintGate mints are simulated; only link a mint tx if it is canonical.
      href: explorerUrlFromTx(lot.mintTx) ?? undefined,
    },
  ];

  return events;
}

export function formatTimelineDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
