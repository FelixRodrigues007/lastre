import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AnchorRequest, ComputeRequest, ProvenanceCredentialResponse } from "./types.js";
import {
  buildArtifactFromMeasurement,
  createProtocolClient,
  makeCatalogLoader,
  resolveFromRepo,
  type GatewayDependencies,
} from "./protocol.js";
import { FraudGame, normalizeDifficulty } from "./fraud.js";

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

  const fraudGame = new FraudGame({ loadCatalog: () => dependencies.loadCatalog() });

  // Shared SANDBOX anchor guard. Both /sandbox/anchor and /fraud/anchor-tampered
  // must pass exactly the same protections before any on-chain write happens.
  type AnchorGuard = { ok: true } | { ok: false; status: number; error: string };
  function guardAnchor(assetId: string, seal: string | null): AnchorGuard {
    if (!assetId || !seal) {
      return { ok: false, status: 400, error: "assetId and a valid 64-hex seal are required" };
    }
    if (!assetId.startsWith("SANDBOX-") && !allowAnyAnchor) {
      return { ok: false, status: 403, error: "Public sandbox anchor is restricted to SANDBOX-* asset ids." };
    }
    if (!anchorEnabled) {
      return {
        ok: false,
        status: 403,
        error: "Sandbox anchor is disabled. Set SANDBOX_ANCHOR_ENABLED=true only for a controlled demo run.",
      };
    }
    if (!anchorSecretKeyPath) {
      return {
        ok: false,
        status: 503,
        error: "SANDBOX_SECRET_KEY_PATH is not configured. Demo keys must come from environment only.",
      };
    }
    if (!anchorLimiter()) {
      return { ok: false, status: 429, error: "Sandbox anchor rate limit exceeded. Try again later." };
    }
    return { ok: true };
  }

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


  app.get("/certificate/:assetId", async (req, res, next) => {
    try {
      const assetId = req.params.assetId;
      const verdict = await dependencies.readVerdict(assetId);
      if (verdict.verdict !== "Valid" || !verdict.seal || !verdict.attester) {
        res.status(404).json({
          error: "certificate_not_available",
          reason: "A symbolic provenance credential requires a Valid ProofOfOrigin verdict.",
        });
        return;
      }

      const mintStatus = await dependencies.readMintStatus(assetId);
      if (!mintStatus.isMinted) {
        res.status(404).json({
          error: "certificate_not_available",
          reason: "MintGate has not symbolically recorded this lot.",
        });
        return;
      }

      const attestationTx = verdict.attestationTx ?? mintStatus.mintTx;
      if (!attestationTx) {
        res.status(404).json({
          error: "certificate_not_available",
          reason: "No MintGate or attestation transaction hash is available for this symbolic credential.",
        });
        return;
      }

      const credential: ProvenanceCredentialResponse = {
        assetId: verdict.assetId,
        verdict: "Valid",
        seal: verdict.seal,
        attester: verdict.attester,
        attestationTx,
        type: "ProvenanceCredential",
        transferable: false,
      };
      res.json(credential);
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

      const guard = guardAnchor(assetId, seal);
      if (!guard.ok) {
        res.status(guard.status).json({ error: guard.error });
        return;
      }

      const anchor = await dependencies.anchor(assetId, seal as string);
      res.json(anchor);
    } catch (error) {
      next(error);
    }
  });

  // Spot-the-Fraud: generate a genuine/tampered seal pair for a fictional lot.
  app.get("/fraud-challenge", async (req, res, next) => {
    try {
      const assetIdRaw = req.query.assetId;
      const assetId = typeof assetIdRaw === "string" && assetIdRaw.length > 0 ? assetIdRaw : undefined;
      const difficulty = normalizeDifficulty(req.query.difficulty);
      const result = await fraudGame.createChallenge(assetId, difficulty);
      if (!result.ok) {
        const status = result.error === "asset_not_in_catalog" ? 404 : 503;
        res.status(status).json({ error: result.error, disclaimer: DEMO_DISCLAIMER });
        return;
      }
      res.json(result.value);
    } catch (error) {
      next(error);
    }
  });

  // Spot-the-Fraud: score a guess. The seal is the sole source of the verdict.
  app.post("/fraud/guess", (req, res, next) => {
    try {
      const body = (req.body ?? {}) as { challengeId?: unknown; userChoice?: unknown; currentStreak?: unknown };
      const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
      const result = fraudGame.resolveGuess(challengeId, body.userChoice, body.currentStreak);
      if (!result.ok) {
        const status = result.error === "invalid_choice" ? 400 : result.error === "challenge_not_found" ? 404 : 409;
        res.status(status).json({ error: result.error });
        return;
      }
      res.json(result.value);
    } catch (error) {
      next(error);
    }
  });

  // Spot-the-Fraud (optional, controlled): anchor the tampered seal as Invalid.
  // Reuses the exact SANDBOX anchor guard so no protection can be bypassed.
  app.post("/fraud/anchor-tampered", async (req, res, next) => {
    try {
      const body = (req.body ?? {}) as { challengeId?: unknown; assetId?: unknown };
      const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
      const challenge = fraudGame.getTampered(challengeId);
      if (!challenge) {
        res.status(404).json({ error: "challenge_not_found" });
        return;
      }

      const assetId = typeof body.assetId === "string" && body.assetId.length > 0 ? body.assetId : challenge.assetId;

      // Spot-the-Fraud anchors a TAMPERED seal, which must land as Invalid.
      // If sandbox auto-register is enabled, the attest path would register this
      // very seal as the reference and produce Valid — refuse to avoid that.
      if (readConfig("SANDBOX_REGISTER_REFERENCE", "false") === "true") {
        res.status(409).json({
          error: "Fraud anchoring needs a pre-registered reference. Disable SANDBOX_REGISTER_REFERENCE so the tampered seal records Invalid.",
        });
        return;
      }

      const guard = guardAnchor(assetId, challenge.tamperedSeal);
      if (!guard.ok) {
        res.status(guard.status).json({ error: guard.error });
        return;
      }

      const anchor = await dependencies.anchor(assetId, challenge.tamperedSeal);

      // Honesty guard: never claim a fraud "rejection" if the chain says Valid.
      if (anchor.verdict !== "Invalid") {
        res.status(409).json({
          error: "tampered_anchor_not_invalid",
          actualVerdict: anchor.verdict,
          txHash: anchor.txHash,
          explorerUrl: anchor.explorerUrl,
        });
        return;
      }

      res.json({ ...anchor, assetId, tamperedSeal: challenge.tamperedSeal });
    } catch (error) {
      next(error);
    }
  });

  app.get("/proof", async (req, res, next) => {
    const accept = req.get("accept") ?? "";
    if (accept.includes("text/html") && !accept.includes("application/json")) {
      res.sendFile(path.join(webDir, "demo.html"));
      return;
    }

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
  app.get("/map", (_req, res) => {
    res.sendFile(path.join(webDir, "map.html"));
  });
  app.get("/spot-fraud", (_req, res) => {
    res.sendFile(path.join(webDir, "spot-fraud.html"));
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
