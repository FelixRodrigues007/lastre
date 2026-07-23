import type { AuditRecord, VerificationVerdict } from "./types";
import { explorerUrlFromTx, resolveAttestationUrl } from "./chainTimeline";

const CSPR_TX_BASE = "https://testnet.cspr.live/transaction/";

/** Fallback sample links when an asset has no asset-specific on-chain attest yet. */
const CANONICAL_SAMPLE_URLS: Record<VerificationVerdict, string> = {
  Invalid: `${CSPR_TX_BASE}5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd`,
  Valid: `${CSPR_TX_BASE}a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e`,
};

export type AuditOnChainLinks = {
  /** Asset-specific canonical attestation, when one exists. */
  attestationUrl: string | null;
  /** Canonical evidence-pack sample link, only when no asset-specific URL. */
  sampleUrl: string | null;
};

/**
 * Resolve Audit-table links without turning session/mock receipts into dead
 * Casper explorer URLs.
 *
 * Prefer asset-specific canonical attests (mineral + carbon). Session receipts
 * stay labeled honest; sample link is only a fallback for unknown lots.
 */
export function resolveAuditOnChainLinks(record: AuditRecord): AuditOnChainLinks {
  const onChain = record.onChain;
  if (!onChain) return { attestationUrl: null, sampleUrl: null };

  const attestationUrl = resolveAttestationUrl(
    record.assetId,
    explorerUrlFromTx(onChain.txHash),
    onChain.verdict,
  );

  return {
    attestationUrl,
    sampleUrl: attestationUrl ? null : CANONICAL_SAMPLE_URLS[onChain.verdict] ?? null,
  };
}
