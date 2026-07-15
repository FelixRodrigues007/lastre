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
} as const;

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
    { hash: CANONICAL_EVIDENCE.validTx, purpose: "Agent-driven attest → Valid" },
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
