import type { AuditRecord } from "./types";

/**
 * Fictional session audit records shown on Overview when the API log is still
 * empty — gives reviewers a sense of trust layers and recent activity.
 */
export const DEMO_OVERVIEW_AUDIT_RECORDS: AuditRecord[] = [
  {
    assetId: "MINA-VALEDOURO-LOTE-001",
    decision: {
      action: "pay",
      reasoning:
        "Mass and geolocation are within known limits; proceed with paid seal verification.",
      decidedBy: "rule",
    },
    verification: {
      verdict: "Valid",
      seal: "96e69d1a25f714b03dbe5e7ac8102654f921d16b8c71e1ecae15384a3a9989a4",
      referenceSeal: "96e69d1a25f714b03dbe5e7ac8102654f921d16b8c71e1ecae15384a3a9989a4",
      txHash: "demo-tx-a1b2c3d4e5f6",
    },
    onChain: { verdict: "Valid", txHash: "demo-tx-a1b2c3d4e5f6" },
    outcome: "tokenizable",
  },
  {
    assetId: "CARBON-VCS-AMAZONIA-2024-001",
    decision: {
      action: "pay",
      reasoning:
        "Carbon credit fields complete; VCS REDD+ lot within demo perimeter — pay for verification.",
      decidedBy: "rule",
    },
    verification: {
      verdict: "Valid",
      seal: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
      referenceSeal: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
      txHash: "demo-tx-carbon-vcs-01",
    },
    onChain: { verdict: "Valid", txHash: "demo-tx-carbon-vcs-01" },
    outcome: "tokenizable",
  },
  {
    assetId: "MINA-VALEDOURO-LOTE-001-TAMPERED",
    decision: {
      action: "pay",
      reasoning:
        "Mass and geolocation are within known limits; proceed with paid seal verification.",
      decidedBy: "rule",
    },
    verification: {
      verdict: "Invalid",
      seal: "7f3c9e2b1a8d4f6e0c5b9a3d7e1f4c8b2a6d0e4f8c1b5a9d3e7f0c4b8a2d6e0f4",
      referenceSeal: "96e69d1a25f714b03dbe5e7ac8102654f921d16b8c71e1ecae15384a3a9989a4",
      txHash: "demo-tx-tampered-9f8e",
    },
    onChain: { verdict: "Invalid", txHash: "demo-tx-tampered-9f8e" },
    outcome: "rejected",
  },
  {
    assetId: "LOTE-OUTOFREGION",
    decision: {
      action: "escalate",
      reasoning:
        "Geolocation is outside the known mine perimeter; escalate to a human before verification.",
      decidedBy: "rule",
    },
    verification: null,
    onChain: null,
    outcome: "escalated",
  },
  {
    assetId: "MINA-VALEDOURO-LOTE-001",
    decision: {
      action: "skip",
      reasoning:
        "The assetId was already attested; skipping avoids paying for and recording the same verification twice.",
      decidedBy: "rule",
    },
    verification: null,
    onChain: null,
    outcome: "skipped",
  },
];

export function getDemoOverviewAuditRecord(assetId: string): AuditRecord | null {
  for (let i = DEMO_OVERVIEW_AUDIT_RECORDS.length - 1; i >= 0; i -= 1) {
    if (DEMO_OVERVIEW_AUDIT_RECORDS[i].assetId === assetId) {
      return DEMO_OVERVIEW_AUDIT_RECORDS[i];
    }
  }
  return null;
}

export function computeTrustLayersFromRecords(records: AuditRecord[]) {
  return {
    agentActions: records.length,
    sealChecks: records.filter((r) => r?.verification).length,
    onChain: records.filter((r) => r?.onChain).length,
    valid: records.filter(
      (r) => (r?.verification?.verdict ?? r?.onChain?.verdict) === "Valid",
    ).length,
    invalid: records.filter(
      (r) => (r?.verification?.verdict ?? r?.onChain?.verdict) === "Invalid",
    ).length,
  };
}
