/**
 * Public Casper Testnet JSON-RPC helpers (no API key).
 * Used to live-verify canonical ProofOfOrigin transactions when the local
 * query_snapshot binary is not available (typical on Render/Vercel).
 */

export const DEFAULT_CASPER_RPC =
  process.env.CASPER_RPC_URL?.trim() || "https://node.testnet.casper.network/rpc";

/** Canonical evidence from the buildathon deploy (must match README / SDD). */
export const CANONICAL_EVIDENCE = {
  packageHash: "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561",
  installTx: "c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10",
  invalidTx: "5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd",
  validTx: "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
  register002: "bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101",
  /** Carbon VCS demo lot — asset-specific Valid attest (same seal as /api simulate). */
  carbonRegister: "f9fdf121951d95c2d10dff6843ef3b7d6d92e292bef21b73aaf103b822c22c88",
  carbonValidTx: "a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e",
  /** Field sealer key write — proves sealer ≠ attester on-chain. */
  sealerIdentityTx: "e82e5738d604fcd7f0bf68e27e8f458ecf046bbf97fe8fb29690e88a6767b83e",
  /** x402 real CSPR settles (CasperFacilitator native transfer) — verified on explorer. */
  x402PayProd20260715: "27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c",
  x402PayProd20260719: "4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6",
  /** Additional densify settles (Final Round). */
  x402PayProd20260719b: "fd23cf3f76d212094da74f3d1f7ad54bad2b07265643a1434857a925dc4b23e1",
  x402PayProd20260721: "5c12586dd5b61fc82f5c818d46b0141af68ea8610f715d47653544540526649c",
  /** Plan-exec densify settle (2026-07-21). */
  x402PayProd20260721b: "b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106",
  /** Priority-close densify settle (2026-07-22). */
  x402PayProd20260722: "25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a",
} as const;

/** Newest canonical real CSPR settle for jury evidence pack (update when densifying). */
export const LATEST_CANONICAL_SETTLE_TX = CANONICAL_EVIDENCE.x402PayProd20260722;

/**
 * Every Casper Testnet transaction hash we have confirmed exists on-chain via
 * public JSON-RPC. Only these may be rendered as live cspr.live links. Session
 * `synthetic_receipt` and simulated `mint-*` hashes are intentionally excluded
 * so we never publish a dead explorer link.
 *
 * Note: new casper_deploy settles are real on-chain but only get explorer links
 * after we add their hash here (or switch to "64-hex + live RPC verify" later).
 */
export const CANONICAL_TESTNET_TX_HASHES: ReadonlySet<string> = new Set([
  CANONICAL_EVIDENCE.installTx,
  "23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede", // register001
  CANONICAL_EVIDENCE.invalidTx,
  CANONICAL_EVIDENCE.register002,
  CANONICAL_EVIDENCE.validTx,
  "8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f", // earlier valid001
  CANONICAL_EVIDENCE.carbonRegister,
  CANONICAL_EVIDENCE.carbonValidTx,
  CANONICAL_EVIDENCE.sealerIdentityTx,
  CANONICAL_EVIDENCE.x402PayProd20260715,
  CANONICAL_EVIDENCE.x402PayProd20260719,
  CANONICAL_EVIDENCE.x402PayProd20260719b,
  CANONICAL_EVIDENCE.x402PayProd20260721,
  CANONICAL_EVIDENCE.x402PayProd20260721b,
  CANONICAL_EVIDENCE.x402PayProd20260722,
  "a30d83c78c269caf922d020a96d2ffd8e3eb4654d3c53e8faf3059ea80101f02", // local x402 pay sample
]);

/** True only for a confirmed on-chain tx hash (not synthetic/mock receipts). */
export function isCanonicalTestnetTx(hash: string | null | undefined): boolean {
  if (!hash) return false;
  return CANONICAL_TESTNET_TX_HASHES.has(hash.trim().toLowerCase());
}

/** True for a plausible Casper deploy hash (64 hex) — not synthetic mint-* / sha labels. */
export function isPlausibleDeployHash(hash: string | null | undefined): boolean {
  if (!hash) return false;
  const h = hash.trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(h);
}

/**
 * Build a live cspr.live `/transaction/` link only for a canonical on-chain
 * hash; otherwise null so callers omit the link instead of publishing a dead
 * explorer page.
 */
export function explorerTxUrlIfCanonical(hash: string | null | undefined): string | null {
  return isCanonicalTestnetTx(hash) ? explorerTx((hash as string).trim().toLowerCase()) : null;
}

/**
 * Explorer link for a real casper_deploy settlement (any new 64-hex hash).
 * Prefer this over the allowlist for payment settles so every live transfer links.
 */
export function explorerTxUrlIfDeployHash(hash: string | null | undefined): string | null {
  if (!isPlausibleDeployHash(hash)) return null;
  return explorerTx((hash as string).trim().toLowerCase());
}

export type RpcTxCheck = {
  hash: string;
  purpose: string;
  verified: boolean;
  explorerUrl: string;
  error?: string;
};

export type LiveRpcEvidence = {
  source: "live-rpc" | "rpc-partial" | "rpc-unavailable";
  rpcUrl: string;
  verifiedAt: string | null;
  packageHash: string;
  transactions: RpcTxCheck[];
  /** True when install + Invalid + Valid sample txs all verified on the public node. */
  fullyVerified: boolean;
};

function explorerTx(hash: string): string {
  return `https://testnet.cspr.live/transaction/${hash}`;
}

async function rpcCall(method: string, params: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(DEFAULT_CASPER_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`RPC HTTP ${res.status}`);
    }
    const json = (await res.json()) as { result?: unknown; error?: { message?: string } };
    if (json.error) {
      throw new Error(json.error.message || "rpc_error");
    }
    return json.result;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Verify a Version1 transaction hash exists on Casper Testnet via public RPC.
 */
export async function verifyTransactionOnTestnet(hash: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await rpcCall("info_get_transaction", {
      transaction_hash: { Version1: hash },
    });
    if (!result || typeof result !== "object") {
      return { ok: false, error: "empty_result" };
    }
    // Presence of transaction payload is enough — we do not re-parse execution tree.
    const tx = (result as { transaction?: unknown }).transaction;
    if (!tx) {
      return { ok: false, error: "missing_transaction" };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "rpc_failed",
    };
  }
}

/**
 * Live-check the canonical install + Invalid + Valid txs used in judge materials.
 * Does not invent hashes — only verifies the documented ones.
 */
export async function getLiveRpcEvidence(): Promise<LiveRpcEvidence> {
  const targets: Array<{ hash: string; purpose: string }> = [
    { hash: CANONICAL_EVIDENCE.installTx, purpose: "Install ProofOfOrigin package" },
    { hash: CANONICAL_EVIDENCE.invalidTx, purpose: "Tampered attest → Invalid (permanent proof)" },
    { hash: CANONICAL_EVIDENCE.validTx, purpose: "Agent-driven attest MINA-002 → Valid" },
    {
      hash: CANONICAL_EVIDENCE.carbonValidTx,
      purpose: "Agent-driven attest CARBON-VCS-AMAZONIA-2024-001 → Valid",
    },
    {
      hash: CANONICAL_EVIDENCE.sealerIdentityTx,
      purpose: "Field sealer identity write (dual-key, sealer ≠ attester)",
    },
  ];

  const checks = await Promise.all(
    targets.map(async (t) => {
      const v = await verifyTransactionOnTestnet(t.hash);
      return {
        hash: t.hash,
        purpose: t.purpose,
        verified: v.ok,
        explorerUrl: explorerTx(t.hash),
        error: v.error,
      } satisfies RpcTxCheck;
    }),
  );

  const verifiedCount = checks.filter((c) => c.verified).length;
  const fullyVerified = verifiedCount === checks.length;

  return {
    source: fullyVerified ? "live-rpc" : verifiedCount > 0 ? "rpc-partial" : "rpc-unavailable",
    rpcUrl: DEFAULT_CASPER_RPC,
    verifiedAt: fullyVerified || verifiedCount > 0 ? new Date().toISOString() : null,
    packageHash: CANONICAL_EVIDENCE.packageHash,
    transactions: checks,
    fullyVerified,
  };
}
