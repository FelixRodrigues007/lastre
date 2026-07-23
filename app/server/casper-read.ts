import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { PACKAGE_HASH, PACKAGE_URL, TESTNET_SNAPSHOT } from "./constants.js";
import { getLiveRpcEvidence, type LiveRpcEvidence } from "./casper-rpc.js";

const execFileAsync = promisify(execFile);

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACT_DIR = path.resolve(APP_ROOT, "../contracts/lastro_origin");

/** Verified Casper Testnet transactions from README — stable explorer links. */
export const TESTNET_TX_LINKS: Record<string, string> = {
  "MINA-VALEDOURO-LOTE-001": "https://testnet.cspr.live/transaction/5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd",
  "MINA-VALEDOURO-LOTE-002": "https://testnet.cspr.live/transaction/43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
};

export type TestnetAttestation = {
  assetId: string;
  verdict: "Valid" | "Invalid";
  providedSeal: string;
  referenceSeal: string | null;
  attester: string;
  explorerUrl: string | null;
};

export type LiveTestnetSnapshot = {
  packageHash: string;
  packageUrl: string;
  network: "casper-test";
  accepted: number;
  rejected: number;
  attestations: TestnetAttestation[];
  /**
   * - live: query_snapshot binary / cargo livenet
   * - live-rpc: public JSON-RPC verified canonical txs (no local binary)
   * - fallback: README constants only (RPC + binary both unavailable)
   */
  source: "live" | "live-rpc" | "fallback";
  fetchedAt: string | null;
  rpcEvidence?: LiveRpcEvidence;
};

type CliSnapshot = {
  package_hash: string;
  network: string;
  accepted: number;
  rejected: number;
  attestations: Array<{
    asset_id: string;
    verdict: string;
    provided_seal: string;
    reference_seal: string | null;
    attester: string;
  }>;
};

let cache: { data: LiveTestnetSnapshot; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

function baseAttestations(): TestnetAttestation[] {
  return [
    {
      assetId: "MINA-VALEDOURO-LOTE-001",
      verdict: "Invalid",
      providedSeal: "fffec9b8d7e6f50123456789abcdef00112233445566778899aabbccddeeff11",
      referenceSeal: "a3f1c9b8d7e6f50123456789abcdef00112233445566778899aabbccddeeff00",
      attester: "account-hash-6de6ee75f7d41407d9e0643d24fe7debc36bbe75695950e544c4ebd11850e1b2",
      explorerUrl: TESTNET_TX_LINKS["MINA-VALEDOURO-LOTE-001"],
    },
    {
      assetId: "MINA-VALEDOURO-LOTE-002",
      verdict: "Valid",
      providedSeal: "a3f1c9b8d7e6f50123456789abcdef00112233445566778899aabbccddeeff00",
      referenceSeal: "a3f1c9b8d7e6f50123456789abcdef00112233445566778899aabbccddeeff00",
      attester: "account-hash-6de6ee75f7d41407d9e0643d24fe7debc36bbe75695950e544c4ebd11850e1b2",
      explorerUrl: TESTNET_TX_LINKS["MINA-VALEDOURO-LOTE-002"],
    },
  ];
}

function fallbackSnapshot(rpcEvidence?: LiveRpcEvidence): LiveTestnetSnapshot {
  const liveRpc = rpcEvidence?.fullyVerified === true;
  return {
    packageHash: PACKAGE_HASH,
    packageUrl: PACKAGE_URL,
    network: "casper-test",
    accepted: TESTNET_SNAPSHOT.accepted,
    rejected: TESTNET_SNAPSHOT.rejected,
    attestations: baseAttestations(),
    source: liveRpc ? "live-rpc" : "fallback",
    fetchedAt: liveRpc ? rpcEvidence?.verifiedAt ?? new Date().toISOString() : null,
    rpcEvidence,
  };
}

function mapCliSnapshot(raw: CliSnapshot, fetchedAt: string): LiveTestnetSnapshot {
  return {
    packageHash: raw.package_hash,
    packageUrl: PACKAGE_URL,
    network: "casper-test",
    accepted: raw.accepted,
    rejected: raw.rejected,
    attestations: raw.attestations
      .filter((row) => row?.asset_id)
      .map((row) => ({
        assetId: row.asset_id,
        verdict: row.verdict === "Valid" ? "Valid" : "Invalid",
        providedSeal: row.provided_seal,
        referenceSeal: row.reference_seal,
        attester: row.attester,
        explorerUrl: TESTNET_TX_LINKS[row.asset_id] ?? null,
      })),
    source: "live",
    fetchedAt,
    rpcEvidence: undefined,
  };
}

function snapshotBinaryPath(): string {
  const configured = process.env.LASTRO_QUERY_SNAPSHOT_BIN?.trim();
  if (configured) return configured;

  const debug = path.join(CONTRACT_DIR, "target/debug/query_snapshot");
  const release = path.join(CONTRACT_DIR, "target/release/query_snapshot");
  if (existsSync(release)) return release;
  if (existsSync(debug)) return debug;
  return debug;
}

async function runQuerySnapshot(): Promise<CliSnapshot> {
  const binary = snapshotBinaryPath();

  if (existsSync(binary)) {
    const { stdout } = await execFileAsync(binary, [], {
      cwd: CONTRACT_DIR,
      timeout: 45_000,
      maxBuffer: 1024 * 1024,
    });
    return JSON.parse(stdout.trim()) as CliSnapshot;
  }

  const { stdout } = await execFileAsync(
    "cargo",
    ["run", "--quiet", "--features", "livenet", "--bin", "query_snapshot"],
    { cwd: CONTRACT_DIR, timeout: 120_000, maxBuffer: 1024 * 1024 },
  );

  const line = stdout
    .trim()
    .split("\n")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("{"))
    .at(-1);

  if (!line) {
    throw new Error("query_snapshot produced no JSON output");
  }

  return JSON.parse(line) as CliSnapshot;
}

export async function getLiveTestnetSnapshot(): Promise<LiveTestnetSnapshot> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.data;
  }

  try {
    const raw = await runQuerySnapshot();
    const data = mapCliSnapshot(raw, new Date().toISOString());
    // Best-effort RPC attach for explorer proof links (does not block live binary path).
    try {
      data.rpcEvidence = await getLiveRpcEvidence();
    } catch {
      /* optional */
    }
    cache = { data, expiresAt: now + CACHE_TTL_MS };
    return data;
  } catch (error) {
    console.warn(
      "[lastro-app] query_snapshot unavailable; trying public RPC evidence.",
      error instanceof Error ? error.message : error,
    );
    try {
      const rpcEvidence = await getLiveRpcEvidence();
      const data = fallbackSnapshot(rpcEvidence);
      // live-rpc is a stronger source than plain fallback — cache longer when fully verified.
      cache = { data, expiresAt: now + (rpcEvidence.fullyVerified ? CACHE_TTL_MS : 15_000) };
      return data;
    } catch (rpcError) {
      console.warn(
        "[lastro-app] public RPC evidence failed; using README fallback.",
        rpcError instanceof Error ? rpcError.message : rpcError,
      );
      const data = fallbackSnapshot();
      cache = { data, expiresAt: now + 15_000 };
      return data;
    }
  }
}

export function getTestnetAttestation(
  snapshot: LiveTestnetSnapshot,
  assetId: string,
): TestnetAttestation | null {
  return snapshot.attestations.find((row) => row.assetId === assetId) ?? null;
}
