import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AnchorRequest, ComputeRequest } from "./types.js";
import {
  buildArtifactFromMeasurement,
  createProtocolClient,
  makeCatalogLoader,
  resolveFromRepo,
  type GatewayDependencies,
} from "./protocol.js";

export type { GatewayDependencies } from "./protocol.js";

const DEFAULT_PACKAGE_HASH =
  "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";
const DEFAULT_NODE_ADDRESS = "https://node.testnet.casper.network/rpc";
const DEFAULT_CHAIN_NAME = "casper-test";
const DEFAULT_PORT = 3456;
const DEMO_DISCLAIMER = "DEMONSTRATION — simulated assets, no investment offered";

export type AnchorLimiter = () => boolean;

export interface CreateGatewayAppOptions {
  packageHash?: string;
  dependencies?: GatewayDependencies;
  anchorEnabled?: boolean;
  anchorSecretKeyPath?: string;
  anchorLimiter?: AnchorLimiter;
  allowAnyAnchor?: boolean;
  webDir?: string;
  catalogPath?: string;
}

export interface MemoryAnchorLimiterOptions {
  windowMs: number;
  max: number;
}

export function createMemoryAnchorLimiter(options: MemoryAnchorLimiterOptions): AnchorLimiter {
  let windowStartedAt = 0;
  let used = 0;

  return () => {
    const now = Date.now();
    if (now - windowStartedAt >= options.windowMs) {
      windowStartedAt = now;
      used = 0;
    }

    if (used >= options.max) {
      return false;
    }

    used += 1;
    return true;
  };
}

export function createGatewayApp(options: CreateGatewayAppOptions = {}): Express {
  const repoRoot = resolveRepoRoot();
  const packageHash = options.packageHash ?? readConfig("PACKAGE_HASH", readConfig("LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH", DEFAULT_PACKAGE_HASH));
  const webDir = options.webDir ?? resolveFromRepo(repoRoot, "web");
  const catalogPath = options.catalogPath ?? resolveFromRepo(repoRoot, "web", "public", "catalog.json");
  const anchorSecretKeyPath = options.anchorSecretKeyPath ?? readConfig("SANDBOX_SECRET_KEY_PATH", readConfig("LASTRO_DEMO_SECRET_KEY_PATH", ""));
  const anchorEnabled = options.anchorEnabled ?? readConfig("SANDBOX_ANCHOR_ENABLED", "false") === "true";
  const allowAnyAnchor = options.allowAnyAnchor ?? readConfig("SANDBOX_ALLOW_ANY_ASSET", "false") === "true";
  const anchorLimiter = options.anchorLimiter ?? createMemoryAnchorLimiter({ windowMs: 60_000, max: 1 });
  const dependencies =
    options.dependencies ??
    createDefaultDependencies({
      packageHash,
      repoRoot,
      catalogPath,
      anchorSecretKeyPath,
    });

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", packageHash, disclaimer: DEMO_DISCLAIMER });
  });

  app.get("/verdict/:assetId", async (req, res, next) => {
    try {
      const assetId = req.params.assetId;
      const verdict = await dependencies.readVerdict(assetId);
      res.json({
        assetId: verdict.assetId,
        verdict: verdict.verdict,
        seal: verdict.seal,
        referenceSeal: verdict.referenceSeal,
        attester: verdict.attester,
        attestationTx: verdict.attestationTx,
        packageHash: verdict.packageHash || packageHash,
        readAt: verdict.readAt,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/sandbox/compute", async (req, res, next) => {
    try {
      const body = req.body as ComputeRequest;
      const assetId = body.assetId ?? body.measurement?.assetId;
      if (!assetId) {
        res.status(400).json({ error: "assetId is required" });
        return;
      }

      const computedSeal = normalizeProvidedSeal(body.seal) ?? dependencies.computeSeal(buildArtifactFromMeasurement(assetId, body.measurement));
      const chain = await dependencies.readVerdict(assetId);
      const referenceSeal = chain.referenceSeal;
      const match = Boolean(referenceSeal && computedSeal.toLowerCase() === referenceSeal.toLowerCase());

      res.json({
        computedSeal,
        referenceSeal,
        match,
        verdict: match ? "Valid" : "Invalid",
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/sandbox/anchor", async (req, res, next) => {
    try {
      const body = req.body as AnchorRequest;
      const assetId = body.assetId ?? "";
      const seal = normalizeProvidedSeal(body.seal);

      if (!assetId || !seal) {
        res.status(400).json({ error: "assetId and a valid 64-hex seal are required" });
        return;
      }

      if (!assetId.startsWith("SANDBOX-") && !allowAnyAnchor) {
        res.status(403).json({
          error: "Public sandbox anchor is restricted to SANDBOX-* asset ids.",
        });
        return;
      }

      if (!anchorEnabled) {
        res.status(403).json({
          error: "Sandbox anchor is disabled. Set SANDBOX_ANCHOR_ENABLED=true only for a controlled demo run.",
        });
        return;
      }

      if (!anchorSecretKeyPath) {
        res.status(503).json({
          error: "SANDBOX_SECRET_KEY_PATH is not configured. Demo keys must come from environment only.",
        });
        return;
      }

      if (!anchorLimiter()) {
        res.status(429).json({ error: "Sandbox anchor rate limit exceeded. Try again later." });
        return;
      }

      const anchor = await dependencies.anchor(assetId, seal);
      res.json(anchor);
    } catch (error) {
      next(error);
    }
  });

  app.get("/proof", async (_req, res, next) => {
    try {
      const proof = await dependencies.readProof();
      res.json({ ...proof, packageHash: proof.packageHash || packageHash });
    } catch (error) {
      next(error);
    }
  });

  app.get("/catalog", async (_req, res, next) => {
    try {
      const catalog = await dependencies.loadCatalog();
      res.json(catalog);
    } catch (error) {
      next(error);
    }
  });

  app.get("/", (_req, res) => {
    res.sendFile(path.join(webDir, "demo.html"));
  });
  app.get("/demo", (_req, res) => {
    res.sendFile(path.join(webDir, "demo.html"));
  });
  app.get("/marketplace", (_req, res) => {
    res.sendFile(path.join(webDir, "marketplace.html"));
  });
  app.use(express.static(webDir, { index: false }));

  app.use((error: unknown, _req: Request, res: Response, _next: unknown) => {
    res.status(500).json({
      error: "internal_error",
      message: error instanceof Error ? error.message : "Unknown gateway error",
    });
  });

  return app;
}

export function createDefaultDependencies(options: {
  packageHash: string;
  repoRoot: string;
  catalogPath: string;
  anchorSecretKeyPath: string;
}): GatewayDependencies {
  const protocol = createProtocolClient({
    packageHash: options.packageHash,
    contractDir: resolveFromRepo(options.repoRoot, "contracts", "lastro_origin"),
    nodeAddress: readConfig("NODE_ADDRESS", readConfig("ODRA_CASPER_LIVENET_NODE_ADDRESS", DEFAULT_NODE_ADDRESS)),
    chainName: readConfig("CHAIN_NAME", readConfig("ODRA_CASPER_LIVENET_CHAIN_NAME", DEFAULT_CHAIN_NAME)),
    sandboxSecretKeyPath: options.anchorSecretKeyPath,
    casperClientBin: readConfig("CASPER_CLIENT_BIN", readConfig("LASTRO_CASPER_CLIENT_BIN", "casper-client")),
  });

  return {
    ...protocol,
    loadCatalog: makeCatalogLoader(options.catalogPath),
  };
}

function normalizeProvidedSeal(value: unknown): string | null {
  return typeof value === "string" && /^[0-9a-fA-F]{64}$/.test(value) ? value.toLowerCase() : null;
}

function readConfig(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function resolveRepoRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), "..", "..", "..");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const portRaw = readConfig("PORT", String(DEFAULT_PORT));
  const port = Number.parseInt(portRaw, 10);
  const app = createGatewayApp();

  app.listen(Number.isFinite(port) ? port : DEFAULT_PORT, () => {
    console.log(`Lastro gateway listening on http://localhost:${Number.isFinite(port) ? port : DEFAULT_PORT}`);
    console.log(`ProofOfOrigin: ${readConfig("PACKAGE_HASH", readConfig("LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH", DEFAULT_PACKAGE_HASH))}`);
    console.log(DEMO_DISCLAIMER);
  });
}
