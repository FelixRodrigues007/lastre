import type { AuditRecord } from "./types";

/** Vanta-style auditor readiness — mapped from Lastre proof outcomes. */
export type EvidenceStatus = "not_ready" | "flagged" | "ready" | "accepted" | "na";

export type EvidenceType = "seal" | "agent" | "chain";

export type EvidenceStatusFilter = "all" | EvidenceStatus;

export type EvidenceTypeFilter = "all" | EvidenceType;

export function getEvidenceStatus(record: AuditRecord): EvidenceStatus {
  if (record.outcome === "skipped") return "na";
  if (record.outcome === "escalated") return "flagged";
  if (!record.verification) return "not_ready";
  if (record.outcome === "tokenizable" && record.onChain) return "accepted";
  return "ready";
}

export function getEvidenceType(record: AuditRecord): EvidenceType {
  if (record.onChain) return "chain";
  if (record.verification) return "seal";
  return "agent";
}

export function evidenceSubtitle(record: AuditRecord): string {
  const verdict = record.verification?.verdict ?? record.onChain?.verdict;
  if (verdict === "Invalid") return "Seal mismatch — field divergence detected";
  if (verdict === "Valid" && record.onChain) return "Seal valid · on-chain attestation recorded";
  if (verdict === "Valid") return "Seal valid — awaiting chain attestation";
  if (record.outcome === "escalated") return "Out of policy — manual review required";
  if (record.outcome === "skipped") return "Duplicate or excluded from batch";
  if (!record.verification) return "Awaiting seal verification";
  return record.decision.reasoning;
}

export function matchesEvidenceStatusFilter(
  record: AuditRecord,
  filter: EvidenceStatusFilter,
): boolean {
  return filter === "all" || getEvidenceStatus(record) === filter;
}

export function matchesEvidenceTypeFilter(
  record: AuditRecord,
  filter: EvidenceTypeFilter,
): boolean {
  return filter === "all" || getEvidenceType(record) === filter;
}

export function countByEvidenceStatus(records: AuditRecord[]) {
  return records.reduce(
    (acc, record) => {
      const status = getEvidenceStatus(record);
      acc[status] += 1;
      acc.all += 1;
      return acc;
    },
    {
      all: 0,
      not_ready: 0,
      flagged: 0,
      ready: 0,
      accepted: 0,
      na: 0,
    },
  );
}
