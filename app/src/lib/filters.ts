import type { Outcome } from "./types";

export function escalationReasonLabel(reasoning: string): string {
  const lower = reasoning.toLowerCase();
  if (lower.includes("lat") || lower.includes("lng") || lower.includes("region") || lower.includes("perimeter")) {
    return "Geo";
  }
  if (lower.includes("mass")) return "Mass";
  if (lower.includes("missing") || lower.includes("field")) return "Missing";
  return "Review";
}

export type AuditOutcomeFilter = "all" | Outcome;

export function matchesAuditFilter(outcome: Outcome, filter: AuditOutcomeFilter): boolean {
  return filter === "all" || outcome === filter;
}

export function matchesSearch(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystack.toLowerCase().includes(q);
}
