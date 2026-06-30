import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { AppRuntime, type DeciderMode } from "./runtime.js";
import { getLiveTestnetSnapshot } from "./casper-read.js";

const PORT = readPort();
const HOST = process.env.LASTRO_APP_API_HOST ?? "0.0.0.0";
const runtime = new AppRuntime();

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

  if (method === "GET" && pathname === "/api/process/defaults") {
    sendJson(res, 200, {
      assetIds: runtime.getDefaultBatchAssetIds(),
      decider: runtime.getDeciderMode(),
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
server.listen(PORT, HOST, () => {
  console.info(`[lastro-app] API listening on http://${HOST}:${PORT}`);
});
