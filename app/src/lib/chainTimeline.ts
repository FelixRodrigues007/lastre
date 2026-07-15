import type { AuditRecord, TestnetAttestation, VerificationVerdict } from "./types";

/**
 * Canonical Casper Testnet transaction hashes that actually exist on-chain
 * (verified via public JSON-RPC `info_get_transaction`). These are the ONLY
 * hashes we are allowed to render as live cspr.live explorer links.
 *
 * Why an allowlist and not a shape check: the session `MockFacilitator` returns
 * a `synthetic_receipt` txHash that is a 64-hex SHA-256 digest — shape-identical
 * to a real Casper Version1 hash but NOT on chain. Linking it to cspr.live
 * produces a dead "No such transaction/deploy" page. Honesty requires that we
 * only link hashes we have confirmed exist.
 */
export const CANONICAL_TESTNET_TX_HASHES: ReadonlySet<string> = new Set([
  // Install ProofOfOrigin package
  "c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10",
  // Register reference MINA-VALEDOURO-LOTE-001
  "23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede",
  // Tampered attest MINA-VALEDOURO-LOTE-001 -> Invalid (permanent proof)
  "5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd",
  // Register reference MINA-VALEDOURO-LOTE-002
  "bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101",
  // Agent-driven attest MINA-VALEDOURO-LOTE-002 -> Valid
  "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
  // Earlier genuine attest MINA-VALEDOURO-LOTE-001 -> Valid
  "8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f",
]);

const CSPR_TX_BASE = "https://testnet.cspr.live/transaction/";

/**
 * Verified Casper Testnet attestation links keyed by known lot id.
 *
 * Compatibility map for callers that do not know the verdict. Prefer
 * `KNOWN_ATTESTATION_URLS_BY_VERDICT` when rendering an attestation result,
 * because the same lot can have both a historical Valid attest and a later
 * tampered Invalid attest.
 */
export const KNOWN_ATTESTATION_URLS: Record<string, string> = {
  "MINA-VALEDOURO-LOTE-001": `${CSPR_TX_BASE}5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd`,
  "MINA-VALEDOURO-LOTE-002": `${CSPR_TX_BASE}43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4`,
};

/** Verified Casper Testnet attestation links keyed by lot id + verdict. */
export const KNOWN_ATTESTATION_URLS_BY_VERDICT: Partial<
  Record<string, Partial<Record<VerificationVerdict, string>>>
> = {
  "MINA-VALEDOURO-LOTE-001": {
    Valid: `${CSPR_TX_BASE}8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f`,
    Invalid: `${CSPR_TX_BASE}5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd`,
  },
  "MINA-VALEDOURO-LOTE-001-TAMPERED": {
    Invalid: `${CSPR_TX_BASE}5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd`,
  },
  "MINA-VALEDOURO-LOTE-002": {
    Valid: `${CSPR_TX_BASE}43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4`,
  },
};

/**
 * Extract the raw hash from either a bare hash or a full cspr.live URL.
 * Returns null for empty input.
 */
function extractHash(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http")) {
    // Accept .../transaction/<hash> or legacy .../deploy/<hash>.
    const match = trimmed.match(/\/(?:transaction|deploy)\/([0-9a-fA-F]{64})(?:[/?#].*)?$/);
    return match ? match[1].toLowerCase() : null;
  }
  return trimmed.toLowerCase();
}

/**
 * True only for a hash we have confirmed exists on Casper Testnet. Synthetic
 * `synthetic_receipt` / `demo-*` / `mint-*` receipts are never canonical.
 */
export function isCanonicalTestnetTx(value: string | null | undefined): boolean {
  const hash = extractHash(value);
  return hash !== null && CANONICAL_TESTNET_TX_HASHES.has(hash);
}

/**
 * Build a live cspr.live explorer URL for a transaction, but ONLY for a
 * canonical on-chain hash. Always uses `/transaction/` (never the dead
 * `/deploy/` path). Returns null for synthetic/unknown hashes so callers can
 * fall back to an honest "session receipt" label instead of a dead link.
 */
export function explorerUrlFromTx(txHash: string | null | undefined): string | null {
  const hash = extractHash(txHash);
  if (!hash || !CANONICAL_TESTNET_TX_HASHES.has(hash)) return null;
  return `${CSPR_TX_BASE}${hash}`;
}

/**
 * Resolve the honest attestation link for a lot:
 *  1. a provided explorerUrl, but only if it points at a canonical on-chain tx;
 *  2. otherwise the known-lot canonical URL (MINA-*-001/002);
 *  3. otherwise null (no live link — caller shows a session-receipt label).
 */
export function resolveAttestationUrl(
  assetId: string,
  explorerUrl: string | null | undefined,
  verdict?: VerificationVerdict | null,
): string | null {
  if (explorerUrl && isCanonicalTestnetTx(explorerUrl)) {
    const hash = extractHash(explorerUrl);
    if (hash) return `${CSPR_TX_BASE}${hash}`;
  }
  if (verdict) {
    return KNOWN_ATTESTATION_URLS_BY_VERDICT[assetId]?.[verdict] ?? null;
  }
  return KNOWN_ATTESTATION_URLS[assetId] ?? null;
}

export type ChainTimelineScope = "session" | "history";

export type ChainTimelineEntry = {
  key: string;
  assetId: string;
  verdict: VerificationVerdict;
  providedSeal: string;
  explorerUrl: string | null;
  /**
   * True when this row has a session/mock receipt hash that is NOT anchored on
   * Casper (no live explorer link). UI must label it as a demo/session receipt.
   */
  sessionReceipt: boolean;
  /** The raw session/mock receipt hash, when present but not on-chain. */
  receiptTxHash: string | null;
  scope: ChainTimelineScope;
};

export type VerdictFilter = "all" | "valid" | "invalid";

export function buildSessionEntries(records: AuditRecord[]): ChainTimelineEntry[] {
  return records
    .filter((record) => record.onChain !== null)
    .map((record) => {
      const onChain = record.onChain!;
      const seal = record.verification?.seal ?? "";
      const explorerUrl = resolveAttestationUrl(
        record.assetId,
        explorerUrlFromTx(onChain.txHash),
        onChain.verdict,
      );
      return {
        key: `session-${record.assetId}`,
        assetId: record.assetId,
        verdict: onChain.verdict,
        providedSeal: seal,
        explorerUrl,
        sessionReceipt: explorerUrl === null && Boolean(onChain.txHash),
        receiptTxHash: explorerUrl === null ? onChain.txHash ?? null : null,
        scope: "session" as const,
      };
    })
    .reverse();
}

export function buildHistoryEntries(attestations: TestnetAttestation[]): ChainTimelineEntry[] {
  return [...attestations]
    .reverse()
    .map((row) => {
      const explorerUrl = resolveAttestationUrl(row.assetId, row.explorerUrl, row.verdict);
      return {
        key: `history-${row.assetId}`,
        assetId: row.assetId,
        verdict: row.verdict,
        providedSeal: row.providedSeal,
        explorerUrl,
        sessionReceipt: false,
        receiptTxHash: null,
        scope: "history" as const,
      };
    });
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
