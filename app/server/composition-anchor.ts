import { createHash } from "node:crypto";

const TX_RE = /^[0-9a-f]{64}$/;
const CHAIN_ROOT_RE = /^[0-9a-f]{64}$/;

/** Real Casper Testnet deploy anchoring the demo 2-hop chainRoot. */
export const DEFAULT_COMPOSITION_CHAIN_ROOT =
  "0c40eb1b4164b95305b0c98908dd6c17ce6bfa37b3900095d87304ea566f8d33";
export const DEFAULT_COMPOSITION_ANCHOR_TX =
  "915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a";

export function isCanonicalTxHash(value: string | null | undefined): value is string {
  return typeof value === "string" && TX_RE.test(value.trim().toLowerCase());
}

export function anchorExplorerUrl(txHash: string | null | undefined): string | null {
  if (!isCanonicalTxHash(txHash)) return null;
  return `https://testnet.cspr.live/transaction/${txHash.trim().toLowerCase()}`;
}

export function isChainRoot(value: string | null | undefined): value is string {
  return typeof value === "string" && CHAIN_ROOT_RE.test(value.trim().toLowerCase());
}

/** Deterministically maps a 64-hex chainRoot to a Casper native transfer-id (u64). */
export function transferIdFromChainRoot(chainRoot: string): string {
  if (!isChainRoot(chainRoot)) {
    throw new Error("chainRoot must be a 64-hex SHA-256 root");
  }
  const hex = createHash("sha256").update(`lastre-composition-anchor:${chainRoot}`).digest("hex").slice(0, 16);
  return BigInt(`0x${hex}`).toString(10);
}

export type CompositionAnchorEvidence = {
  chainRoot: string | null;
  anchorTx: string | null;
  anchorExplorerUrl: string | null;
  anchored: boolean;
  note: string;
};

export function getCompositionAnchorEvidence(): CompositionAnchorEvidence {
  const root =
    process.env.LASTRE_COMPOSITION_CHAIN_ROOT?.trim().toLowerCase() ||
    DEFAULT_COMPOSITION_CHAIN_ROOT;
  const tx =
    process.env.LASTRE_COMPOSITION_ANCHOR_TX?.trim().toLowerCase() ||
    DEFAULT_COMPOSITION_ANCHOR_TX;
  const validRoot = isChainRoot(root) ? root : null;
  const validTx = isCanonicalTxHash(tx) ? tx : null;
  return {
    chainRoot: validRoot,
    anchorTx: validTx,
    anchorExplorerUrl: anchorExplorerUrl(validTx),
    anchored: Boolean(validRoot && validTx),
    note: validRoot && validTx
      ? "Composition chainRoot anchored on Casper Testnet by native transfer-id (legacy Deploy hash; get-deploy confirms execution)."
      : "Composition root is computed off-chain; set LASTRE_COMPOSITION_CHAIN_ROOT and LASTRE_COMPOSITION_ANCHOR_TX only after a real Casper transaction exists.",
  };
}
