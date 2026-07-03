import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { AppRuntime, type DeciderMode } from "./runtime.js";
import { getLiveTestnetSnapshot } from "./casper-read.js";
import { computeSeal } from "../../agent/sealer/dist/src/sealer.js";

const PORT = readPort();
const HOST = process.env.LASTRO_APP_API_HOST ?? "0.0.0.0";
const runtime = new AppRuntime();
let demoSeedPromise: Promise<void> | null = null;

function ensureDemoSeeded(): Promise<void> {
  if (!demoSeedPromise) {
    demoSeedPromise = runtime.seedDemoSessionIfEmpty();
  }
  return demoSeedPromise;
}

export function createAppServer() {
  return createServer(async (req, res) => {
    applyCorsHeaders(req, res);

    try {
      if ((req.method ?? "GET") === "OPTIONS") {
        sendOptions(res, req);
        return;
      }

      await handleRequest(req, res);
    } catch (error) {
      sendJson(res, 500, {
        error: "internal_error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}

function readPort(): number {
  const raw = process.env.PORT ?? process.env.LASTRO_APP_API_PORT ?? "3001";
  const port = Number(raw);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid API port: ${raw}`);
  }

  return port;
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "127.0.0.1"}`);
  const { pathname } = url;
  const method = req.method ?? "GET";

  if ((method === "GET" || method === "HEAD") && pathname === "/api/health") {
    if (method === "HEAD") {
      sendEmptyJson(res, 200);
      return;
    }

    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname.startsWith("/api/")) {
    await ensureDemoSeeded();
  }

  if (method === "GET" && pathname === "/api/chain/summary") {
    sendJson(res, 200, await runtime.getChainSummary());
    return;
  }

  if (method === "GET" && pathname === "/api/chain/testnet") {
    sendJson(res, 200, await getLiveTestnetSnapshot());
    return;
  }

  const testnetAttestMatch = pathname.match(/^\/api\/chain\/testnet\/([^/]+)$/u);
  if (method === "GET" && testnetAttestMatch) {
    const assetId = decodeURIComponent(testnetAttestMatch[1]);
    const attestation = await runtime.getTestnetAttestationForAsset(assetId);
    if (!attestation) {
      sendJson(res, 404, { error: "not_found", message: "No testnet attestation for asset" });
      return;
    }
    sendJson(res, 200, attestation);
    return;
  }

  if (method === "GET" && pathname === "/api/audit/summary") {
    sendJson(res, 200, {
      ...runtime.getAuditSummary(),
      lastBatch: runtime.getLastBatch()?.summary ?? null,
    });
    return;
  }

  if (method === "GET" && pathname === "/api/lots") {
    sendJson(res, 200, { lots: runtime.listLots() });
    return;
  }

  const lotMatch = pathname.match(/^\/api\/lots\/([^/]+)$/u);
  if (method === "GET" && lotMatch) {
    const assetId = decodeURIComponent(lotMatch[1]);
    const lot = runtime.getLot(assetId);
    if (!lot) {
      sendJson(res, 404, { error: "not_found", message: "Unknown lot" });
      return;
    }
    const testnetAttestation = await runtime.getTestnetAttestationForAsset(assetId);
    sendJson(res, 200, { ...lot, testnetAttestation });
    return;
  }

  if (method === "GET" && pathname === "/api/audit/export") {
    const payload = runtime.exportAudit();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="lastro-audit-${payload.exportedAt.slice(0, 10)}.json"`,
    );
    res.end(JSON.stringify(payload, null, 2));
    return;
  }

  if (method === "GET" && pathname === "/api/settings") {
    sendJson(res, 200, runtime.getSettings());
    return;
  }

  if (method === "POST" && pathname === "/api/settings") {
    const body = await readJsonBody<{ decider?: DeciderMode }>(req);
    if (body.decider && body.decider !== "rule" && body.decider !== "llm") {
      sendJson(res, 400, { error: "invalid_decider" });
      return;
    }
    if (body.decider) {
      runtime.setDeciderMode(body.decider);
    }
    sendJson(res, 200, runtime.getSettings());
    return;
  }

  if (method === "GET" && pathname === "/api/audit") {
    sendJson(res, 200, { records: runtime.listAudit() });
    return;
  }

  const auditMatch = pathname.match(/^\/api\/audit\/([^/]+)$/u);
  if (method === "GET" && auditMatch) {
    const record = runtime.getAuditRecord(decodeURIComponent(auditMatch[1]));
    if (!record) {
      sendJson(res, 404, { error: "not_found", message: "No audit record for asset" });
      return;
    }
    sendJson(res, 200, record);
    return;
  }

  if (method === "GET" && pathname === "/api/escalations") {
    sendJson(res, 200, { records: runtime.listEscalations() });
    return;
  }

  const escalationMatch = pathname.match(/^\/api\/escalations\/([^/]+)\/(requeue|discard|override)$/u);
  if (method === "POST" && escalationMatch) {
    const assetId = decodeURIComponent(escalationMatch[1]);
    const action = escalationMatch[2];

    try {
      if (action === "requeue") {
        const result = await runtime.resolveEscalationRequeue(assetId);
        sendJson(res, 200, result);
        return;
      }

      if (action === "discard") {
        sendJson(res, 200, runtime.resolveEscalationDiscard(assetId));
        return;
      }

      const body = await readJsonBody<{ overrideAction?: "pay" | "skip" }>(req);
      if (body.overrideAction !== "pay" && body.overrideAction !== "skip") {
        sendJson(res, 400, { error: "invalid_override", message: "overrideAction must be pay or skip" });
        return;
      }

      const result = await runtime.resolveEscalationOverride(assetId, body.overrideAction);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 404, {
        error: "not_found",
        message: error instanceof Error ? error.message : "Escalation not found",
      });
    }
    return;
  }

  if (method === "GET" && pathname === "/api/process/defaults") {
    sendJson(res, 200, {
      assetIds: runtime.getDefaultBatchAssetIds(),
      decider: runtime.getDeciderMode(),
      lastBatch: runtime.getLastBatch(),
    });
    return;
  }

  if (method === "POST" && pathname === "/api/process/batch") {
    const body = await readJsonBody<{ assetIds?: string[]; decider?: DeciderMode }>(req);
    const assetIds = body.assetIds?.length ? body.assetIds : runtime.getDefaultBatchAssetIds();
    const decider = body.decider ?? runtime.getDeciderMode();

    if (decider !== "rule" && decider !== "llm") {
      sendJson(res, 400, { error: "invalid_decider" });
      return;
    }

    const result = await runtime.processBatch(assetIds, decider);
    sendJson(res, 200, result);
    return;
  }

  // Create new artifact from upload / camera flow (adds to queue, ready for Process)
  if (method === "POST" && pathname === "/api/artifacts") {
    const artifact = await readJsonBody<any>(req);
    if (!artifact || !artifact.assetId || !artifact.category || !artifact.origin) {
      sendJson(res, 400, { error: "invalid_artifact", message: "assetId, category and origin required" });
      return;
    }
    // ensure category
    artifact.category = artifact.category === "carbon_credit" ? "carbon_credit" : "mineral";
    runtime.addArtifact(artifact as any);
    const lot = runtime.getLot(artifact.assetId);
    sendJson(res, 200, lot ?? { success: true, assetId: artifact.assetId });
    return;
  }

  // Instant seal computation for passport preview (client builds artifact, gets seal + passport)
  if (method === "POST" && pathname === "/api/seal") {
    const artifact = await readJsonBody<any>(req);
    if (!artifact || !artifact.assetId) {
      sendJson(res, 400, { error: "invalid" });
      return;
    }
    const seal = computeSeal(artifact as any);
    const passport = {
      artifact,
      seal,
      sealAlgo: "SHA-256",
      version: "1.0.0",
    };
    sendJson(res, 200, { seal, passport });
    return;
  }

  // Mint via MintGate simulation (only after Valid proof)
  if (method === "POST" && pathname === "/api/mint") {
    const body = await readJsonBody<{ assetId: string; minter?: string }>(req);
    if (!body?.assetId) {
      sendJson(res, 400, { error: "assetId required" });
      return;
    }
    const result = runtime.mintAsset(body.assetId, body.minter);
    if (result.success) {
      const lot = runtime.getLot(body.assetId);
      sendJson(res, 200, { success: true, txHash: result.txHash, lot });
    } else {
      sendJson(res, 400, { success: false, error: result.error });
    }
    return;
  }

  // DeFi collateral lock (demo)
  if (method === "POST" && pathname === "/api/defi/lock") {
    const body = await readJsonBody<{ assetId: string; owner: string }>(req);
    if (!body?.assetId || !body?.owner) {
      sendJson(res, 400, { error: "assetId and owner required" });
      return;
    }
    const result = runtime.lockCollateral(body.assetId, body.owner);
    sendJson(res, result.success ? 200 : 400, result);
    return;
  }

  if (method === "POST" && pathname === "/api/defi/release") {
    const body = await readJsonBody<{ assetId: string; owner: string }>(req);
    if (!body?.assetId || !body?.owner) {
      sendJson(res, 400, { error: "assetId and owner required" });
      return;
    }
    const result = runtime.releaseCollateral(body.assetId, body.owner);
    sendJson(res, result.success ? 200 : 400, result);
    return;
  }

  sendJson(res, 404, { error: "not_found" });
}

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://app.lastre.io",
];

function configuredAllowedOrigins(): Set<string> {
  const configured = [
    process.env.LASTRO_APP_ALLOWED_ORIGINS,
    process.env.CORS_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);
}

function getHeaderValue(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function resolveAllowedOrigin(origin: string | null): string | null {
  if (!origin) return null;

  const allowedOrigins = configuredAllowedOrigins();
  if (allowedOrigins.has("*")) return origin;
  if (allowedOrigins.has(origin)) return origin;

  return null;
}

function applyCorsHeaders(req: IncomingMessage, res: ServerResponse): void {
  const origin = getHeaderValue(req.headers.origin);
  const allowedOrigin = resolveAllowedOrigin(origin);

  if (!allowedOrigin) return;

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Vary", "Origin");
}

function sendOptions(res: ServerResponse, req: IncomingMessage): void {
  const requestedHeaders =
    getHeaderValue(req.headers["access-control-request-headers"]) ?? "Content-Type";

  res.statusCode = 204;
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", requestedHeaders);
  res.setHeader("Access-Control-Max-Age", "86400");
  res.end();
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function sendEmptyJson(res: ServerResponse, statusCode: number): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end();
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {} as T;
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as T;
}

const server = createAppServer();

async function bootstrap(): Promise<void> {
  await ensureDemoSeeded();
  server.listen(PORT, HOST, () => {
    console.info(`[lastro-app] API listening on http://${HOST}:${PORT}`);
  });
}

void bootstrap();
