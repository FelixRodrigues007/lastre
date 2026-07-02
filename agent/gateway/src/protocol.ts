import { execFile, type ExecFileOptions } from "node:child_process";
import path from "node:path";
import { computeSeal, type ProvenanceArtifact } from "../../sealer/dist/src/sealer.js";
import type { AnchorResponse, Catalog, MintStatus, ProofResponse, RecentAttestation, Verdict, VerdictResponse } from "./types.js";

export type ExecFileFn = (
  command: string,
  args: string[],
  options: ExecFileOptions,
) => Promise<string>;

export interface ProtocolClientOptions {
  packageHash: string;
  contractDir: string;
  queryBinary?: string;
  attestBinary?: string;
  nodeAddress?: string;
  chainName?: string;
  sandboxSecretKeyPath?: string;
  casperClientBin?: string;
  execFile?: ExecFileFn;
  recentAttestations?: ProofResponse["recentAttestations"];
}

export interface GatewayDependencies {
  readVerdict(assetId: string): Promise<VerdictResponse>;
  computeSeal(artifact: ProvenanceArtifact): string;
  anchor(assetId: string, seal: string): Promise<AnchorResponse>;
  readProof(): Promise<ProofResponse>;
  readMintStatus(assetId: string): Promise<MintStatus>;
  loadCatalog(): Promise<Catalog>;
}

const DEFAULT_NODE_ADDRESS = "https://node.testnet.casper.network/rpc";
const DEFAULT_CHAIN_NAME = "casper-test";
const DEFAULT_EVENTS_URL = "https://node.testnet.casper.network/events/main";

export const DEFAULT_RECENT_ATTESTATIONS: ProofResponse["recentAttestations"] = [
  {
    assetId: "MINA-VALEDOURO-LOTE-001",
    verdict: "Invalid",
    tx: "5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd",
    timestamp: null,
  },
  {
    assetId: "MINA-VALEDOURO-LOTE-002",
    verdict: "Valid",
    tx: "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
    timestamp: null,
  },
];

export function createProtocolClient(options: ProtocolClientOptions): Pick<GatewayDependencies, "readVerdict" | "anchor" | "readProof" | "readMintStatus" | "computeSeal"> {
  const execFileImpl = options.execFile ?? execFilePromise;
  const queryBinary = options.queryBinary ?? path.join(options.contractDir, "target", "debug", "query");
  const attestBinary = options.attestBinary ?? path.join(options.contractDir, "target", "debug", "attest");
  const nodeAddress = options.nodeAddress ?? DEFAULT_NODE_ADDRESS;
  const chainName = options.chainName ?? DEFAULT_CHAIN_NAME;
  const casperClientBin = options.casperClientBin ?? "casper-client";
  const recentAttestations = options.recentAttestations ?? DEFAULT_RECENT_ATTESTATIONS;

  async function readVerdict(assetId: string): Promise<VerdictResponse> {
    const output = await execFileImpl(
      queryBinary,
      [assetId, "--json"],
      {
        cwd: options.contractDir,
        encoding: "utf8",
        timeout: 120_000,
        maxBuffer: 1024 * 1024,
        env: buildReadEnv(options.packageHash, nodeAddress, chainName),
      },
    );

    const data = parseJsonObject(output);
    const verdict = normalizeVerdict(data.verdict);

    return {
      assetId: stringValue(data.assetId) ?? assetId,
      verdict,
      seal: nullableString(data.seal),
      referenceSeal: nullableString(data.referenceSeal),
      attester: nullableString(data.attester),
      attestationTx: nullableString(data.attestationTx),
      packageHash: stringValue(data.packageHash) ?? options.packageHash,
      readAt: new Date().toISOString(),
      accepted: numberValue(data.accepted),
      rejected: numberValue(data.rejected),
      recentAttestations: parseRecentAttestations(data.recentAttestations),
    } as VerdictResponse & { recentAttestations?: RecentAttestation[] };
  }

  async function readProof(): Promise<ProofResponse> {
    const counters = await readVerdict("MINA-VALEDOURO-LOTE-001");
    const liveEvents = (counters as VerdictResponse & { recentAttestations?: RecentAttestation[] }).recentAttestations;

    return {
      packageHash: counters.packageHash,
      accepted: counters.accepted ?? 0,
      rejected: counters.rejected ?? 0,
      // The contract event itself does not store transaction hashes/timestamps.
      // `query --json` supplies live OriginAttested event bodies; the gateway
      // enriches the public demo events with known tx hashes when available.
      recentAttestations: enrichRecentAttestations(liveEvents ?? recentAttestations),
    };
  }


  async function readMintStatus(assetId: string): Promise<MintStatus> {
    return knownSymbolicMintStatus(assetId);
  }

  async function anchor(assetId: string, seal: string): Promise<AnchorResponse> {
    if (!options.sandboxSecretKeyPath) {
      throw new Error("SANDBOX_SECRET_KEY_PATH is required for sandbox anchor writes");
    }

    const env = buildReadEnv(options.packageHash, nodeAddress, chainName);
    env.ODRA_CASPER_LIVENET_SECRET_KEY_PATH = options.sandboxSecretKeyPath;
    env.LASTRO_CASPER_CLIENT_BIN = casperClientBin;
    env.LASTRO_AGENT_ASSET_ID = assetId;
    env.LASTRO_AGENT_PROVIDED_SEAL = seal;

    if (process.env.SANDBOX_REGISTER_REFERENCE === "true") {
      env.LASTRO_AGENT_REFERENCE_SEAL = seal;
    } else {
      env.LASTRO_AGENT_SKIP_REGISTER = "1";
    }

    const output = await execFileImpl(
      attestBinary,
      [],
      {
        cwd: options.contractDir,
        encoding: "utf8",
        timeout: 420_000,
        maxBuffer: 1024 * 1024,
        env,
      },
    );

    const txHash = extractAttestTxHash(output);
    if (!txHash) {
      throw new Error("attest transaction hash not found in bin/attest output");
    }

    const after = await readVerdict(assetId);
    const verdict: "Valid" | "Invalid" = after.verdict === "Valid" ? "Valid" : "Invalid";

    return {
      txHash,
      verdict,
      explorerUrl: `https://testnet.cspr.live/transaction/${txHash}`,
    };
  }

  return { readVerdict, readProof, readMintStatus, anchor, computeSeal };
}

export function buildArtifactFromMeasurement(assetId: string, measurement: Record<string, unknown> | undefined): ProvenanceArtifact {
  const origin = objectValue(measurement?.origin);

  return {
    assetId,
    category: "mineral",
    origin: {
      lat: numericValue(origin?.lat, -30.05),
      lng: numericValue(origin?.lng, -53.2),
      site: stringValue(origin?.site) ?? stringValue(origin?.label) ?? "Fictional demo sector",
    },
    frameHash:
      stringValue(measurement?.frameHash) ??
      "0000000000000000000000000000000000000000000000000000000000000000",
    massGrams: numericValue(measurement?.massGrams, 100_000),
    capturedAtISO: stringValue(measurement?.capturedAtISO) ?? "2026-06-25T00:00:00.000Z",
    operator: stringValue(measurement?.operator) ?? "Fictional Demo Operator",
  };
}

export function extractAttestTxHash(output: string): string | null {
  const attestMatch = output.match(/attest\s+tx\s*:\s*([0-9a-fA-F]{64})/i);
  if (attestMatch) {
    return attestMatch[1].toLowerCase();
  }

  const fallback = output.match(/transaction_hash["':\s]+([0-9a-fA-F]{64})/i) ?? output.match(/\b([0-9a-fA-F]{64})\b/);
  return fallback ? fallback[1].toLowerCase() : null;
}

export function makeCatalogLoader(catalogPath: string): () => Promise<Catalog> {
  return async () => {
    const fs = await import("node:fs");
    const raw = fs.readFileSync(catalogPath).toString("utf8");
    const data = JSON.parse(raw) as Catalog;
    if (!Array.isArray(data.assets)) {
      throw new Error(`Invalid catalog: ${catalogPath}`);
    }
    return data;
  };
}

function execFilePromise(command: string, args: string[], options: ExecFileOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error) {
        const stderrText = typeof stderr === "string" ? stderr : stderr.toString("utf8");
        const message = stderrText ? `${error.message}\n${stderrText}` : error.message;
        reject(new Error(message));
        return;
      }
      resolve(typeof stdout === "string" ? stdout : stdout.toString("utf8"));
    });
  });
}

function buildReadEnv(packageHash: string, nodeAddress: string, chainName: string): Record<string, string | undefined> {
  return {
    ...process.env,
    PACKAGE_HASH: packageHash,
    LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH: packageHash,
    NODE_ADDRESS: nodeAddress,
    CHAIN_NAME: chainName,
    ODRA_CASPER_LIVENET_NODE_ADDRESS: nodeAddress,
    ODRA_CASPER_LIVENET_CHAIN_NAME: chainName,
    ODRA_CASPER_LIVENET_EVENTS_URL: DEFAULT_EVENTS_URL,
  };
}

function parseJsonObject(output: string): Record<string, unknown> {
  const trimmed = output.trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error(`query did not return JSON: ${trimmed.slice(0, 200)}`);
  }
  return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
}

function normalizeVerdict(value: unknown): Verdict {
  if (value === "Valid" || value === "Invalid" || value === "Unverified") {
    return value;
  }
  return "Unverified";
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function numericValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

export function resolveFromRepo(repoRoot: string, ...segments: string[]): string {
  return path.resolve(repoRoot, ...segments);
}


const KNOWN_PUBLIC_TXS = new Map<string, string>([
  ["MINA-VALEDOURO-LOTE-001:Valid", "8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f"],
  ["MINA-VALEDOURO-LOTE-001:Invalid", "5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd"],
  ["MINA-VALEDOURO-LOTE-002:Valid", "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4"],
]);

function parseRecentAttestations(value: unknown): RecentAttestation[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const parsed = value.flatMap((entry): RecentAttestation[] => {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }
    const object = entry as Record<string, unknown>;
    const assetId = stringValue(object.assetId);
    const verdict = normalizeStrictVerdict(object.verdict);
    if (!assetId || !verdict) {
      return [];
    }
    return [
      {
        assetId,
        verdict,
        tx: nullableString(object.tx),
        timestamp: nullableString(object.timestamp),
      },
    ];
  });

  return parsed.length > 0 ? parsed : undefined;
}

function enrichRecentAttestations(attestations: RecentAttestation[]): RecentAttestation[] {
  return attestations.map((attestation) => ({
    ...attestation,
    tx: attestation.tx ?? KNOWN_PUBLIC_TXS.get(`${attestation.assetId}:${attestation.verdict}`) ?? null,
  }));
}

function normalizeStrictVerdict(value: unknown): "Valid" | "Invalid" | null {
  return value === "Valid" || value === "Invalid" ? value : null;
}


const DEFAULT_SYMBOLIC_MINTED_ASSETS = new Set<string>(["MINA-VALEDOURO-LOTE-002"]);
const KNOWN_SYMBOLIC_MINT_TXS = new Map<string, string>([
  ["MINA-VALEDOURO-LOTE-002", "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4"],
]);

function knownSymbolicMintStatus(assetId: string): MintStatus {
  const configured = process.env.LASTRO_SYMBOLIC_MINTED_ASSETS
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const mintedAssets = configured && configured.length > 0
    ? new Set(configured)
    : DEFAULT_SYMBOLIC_MINTED_ASSETS;

  if (!mintedAssets.has(assetId)) {
    return { isMinted: false, mintTx: null };
  }

  return {
    isMinted: true,
    mintTx: KNOWN_SYMBOLIC_MINT_TXS.get(assetId) ?? null,
  };
}
