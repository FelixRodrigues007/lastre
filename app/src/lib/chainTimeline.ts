import type { AuditRecord, TestnetAttestation, VerificationVerdict } from "./types";

/** Verified Casper Testnet transactions — stable explorer links when API omits them. */
export const KNOWN_ATTESTATION_URLS: Record<string, string> = {
  "MINA-VALEDOURO-LOTE-001":
    "https://testnet.cspr.live/transaction/5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd",
  "MINA-VALEDOURO-LOTE-002":
    "https://testnet.cspr.live/transaction/43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
};

export function resolveAttestationUrl(assetId: string, explorerUrl: string | null): string | null {
  return explorerUrl ?? KNOWN_ATTESTATION_URLS[assetId] ?? null;
}

export type ChainTimelineScope = "session" | "history";

export type ChainTimelineEntry = {
  key: string;
  assetId: string;
  verdict: VerificationVerdict;
  providedSeal: string;
  explorerUrl: string | null;
  scope: ChainTimelineScope;
};

export type VerdictFilter = "all" | "valid" | "invalid";

export function explorerUrlFromTx(txHash: string): string {
  if (txHash.startsWith("http")) return txHash;
  return `https://testnet.cspr.live/deploy/${txHash}`;
}

export function buildSessionEntries(records: AuditRecord[]): ChainTimelineEntry[] {
  return records
    .filter((record) => record.onChain !== null)
    .map((record) => {
      const onChain = record.onChain!;
      const seal = record.verification?.seal ?? "";
      return {
        key: `session-${record.assetId}`,
        assetId: record.assetId,
        verdict: onChain.verdict,
        providedSeal: seal,
        explorerUrl: resolveAttestationUrl(
          record.assetId,
          onChain.txHash && !onChain.txHash.startsWith("demo")
            ? explorerUrlFromTx(onChain.txHash)
            : null,
        ),
        scope: "session" as const,
      };
    })
    .reverse();
}

export function buildHistoryEntries(attestations: TestnetAttestation[]): ChainTimelineEntry[] {
  return [...attestations]
    .reverse()
    .map((row) => ({
      key: `history-${row.assetId}`,
      assetId: row.assetId,
      verdict: row.verdict,
      providedSeal: row.providedSeal,
      explorerUrl: resolveAttestationUrl(row.assetId, row.explorerUrl),
      scope: "history" as const,
    }));
}

export function matchesVerdictFilter(entry: ChainTimelineEntry, filter: VerdictFilter): boolean {
  if (filter === "all") return true;
  if (filter === "valid") return entry.verdict === "Valid";
  return entry.verdict === "Invalid";
}

export function countByVerdict(entries: ChainTimelineEntry[]): { all: number; valid: number; invalid: number } {
  let valid = 0;
  let invalid = 0;
  for (const entry of entries) {
    if (entry.verdict === "Valid") valid += 1;
    else invalid += 1;
  }
  return { all: entries.length, valid, invalid };
}
