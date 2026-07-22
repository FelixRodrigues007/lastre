/**
 * Factory: LASTRE_X402_MODE=mock|casper (default mock).
 *
 * casper mode requires a payer secret key + LASTRE_X402_PAY_TO (target public
 * key / account-hash). Secret material may be:
 *   - LASTRE_X402_SECRET_KEY_PATH / SANDBOX_SECRET_KEY_PATH (file path), or
 *   - LASTRE_X402_SECRET_KEY_B64 (base64 of the whole PEM file — best for Render), or
 *   - LASTRE_X402_SECRET_KEY_PEM (PEM body — newlines often mangled by secret UIs)
 *
 * If casper is requested but misconfigured, logs a warning and falls back to
 * MockFacilitator so the judge demo never dies.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CasperFacilitator } from "./casper-facilitator.js";
import { CsprCloudFacilitator } from "./cspr-cloud-facilitator.js";
import { MockFacilitator, type Facilitator } from "./facilitator.js";
import { WCSPR_TESTNET_PACKAGE_HASH } from "./cspr-cloud-types.js";

export type X402Mode = "mock" | "casper" | "cspr_cloud";

export type SecretMaterialStatus = {
  mode: X402Mode;
  source: "b64" | "pem" | "path" | "none";
  pathSet: boolean;
  pathExists: boolean;
  /** Structural PEM check only — never logs key bytes. */
  pemLooksValid: boolean;
  bytes: number | null;
  newlines: number | null;
  hasBegin: boolean;
  hasEnd: boolean;
  hint: string | null;
};

const PEM_BOOTSTRAP_PATH = join(tmpdir(), "lastre-x402-secret_key.pem");
const SECRETS_BOOTSTRAP_PATH = "/secrets/x402_secret_key.pem";

export function resolveX402Mode(raw = process.env.LASTRE_X402_MODE): X402Mode {
  const mode = (raw ?? "mock").trim().toLowerCase().replace(/-/g, "_");
  if (mode === "casper") return "casper";
  if (mode === "cspr_cloud" || mode === "csprcloud" || mode === "cloud" || mode === "wcspr") {
    return "cspr_cloud";
  }
  return "mock";
}

/**
 * Normalize PEM text from secret stores (Render, etc.).
 * Handles: wrapped quotes, literal \n, CRLF, single-line PEM, extra spaces.
 */
export function normalizePem(raw: string): string {
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  // Literal escape sequences from env UIs that collapse multiline.
  s = s.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n");
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Single-line: -----BEGIN …-----BASE64-----END …-----
  if (!s.includes("\n") && /BEGIN [A-Z0-9 ]+-----/.test(s) && /-----END /.test(s)) {
    s = s
      .replace(/(-----BEGIN [A-Z0-9 ]+-----)\s*/, "$1\n")
      .replace(/\s*(-----END [A-Z0-9 ]+-----)/, "\n$1");
  }

  // Drop empty lines; keep structure BEGIN / body / END.
  const lines = s
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  s = `${lines.join("\n")}\n`;
  return s;
}

/** True when text looks like a framed PEM casper-client can parse. */
export function pemLooksValid(text: string): boolean {
  const t = text.replace(/\r/g, "");
  if (!t.includes("-----BEGIN ") || !t.includes("-----END ")) return false;
  // casper-client rejects single-line / unframed bodies ("malformedframing")
  if (!t.includes("\n")) return false;
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return false;
  if (!lines[0].startsWith("-----BEGIN ")) return false;
  if (!lines[lines.length - 1].startsWith("-----END ")) return false;
  return true;
}

function writeSecretFile(body: string, env: NodeJS.ProcessEnv): string | null {
  const targets = [PEM_BOOTSTRAP_PATH, SECRETS_BOOTSTRAP_PATH];
  let written: string | null = null;
  for (const target of targets) {
    try {
      const dir = target.includes("/") ? target.slice(0, target.lastIndexOf("/")) : ".";
      if (dir && dir !== ".") {
        try {
          mkdirSync(dir, { recursive: true });
        } catch {
          /* /secrets may not exist or not be writable outside Docker */
        }
      }
      writeFileSync(target, body, { mode: 0o600 });
      written = target;
    } catch {
      /* try next target */
    }
  }
  if (written) {
    env.LASTRE_X402_SECRET_KEY_PATH = written;
  }
  return written;
}

function decodeB64ToPem(b64: string): string | null {
  try {
    const cleaned = b64
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/\s+/g, "");
    const decoded = Buffer.from(cleaned, "base64").toString("utf8");
    const body = normalizePem(decoded);
    return pemLooksValid(body) ? body : null;
  } catch {
    return null;
  }
}

/**
 * Materialize secret key material into LASTRE_X402_SECRET_KEY_PATH.
 * Prefer B64/PEM over a pre-existing path so mangled entrypoint files get fixed.
 * Mutates `env` (default process.env).
 */
export function prepareX402SecretsFromEnv(env: NodeJS.ProcessEnv = process.env): string | null {
  // 1) Base64 of entire PEM file (recommended for Render)
  const b64 = env.LASTRE_X402_SECRET_KEY_B64?.trim();
  if (b64) {
    const body = decodeB64ToPem(b64);
    if (!body) {
      console.warn(
        "[lastre-x402] LASTRE_X402_SECRET_KEY_B64 did not decode to a valid framed PEM. " +
          "Regenerate with: base64 -i secret_key.pem | tr -d '\\n'",
      );
      // fall through — maybe PEM/path still works
    } else {
      const path = writeSecretFile(body, env);
      if (path) return path;
    }
  }

  // 2) Raw PEM (often mangled)
  const pem = env.LASTRE_X402_SECRET_KEY_PEM?.trim();
  if (pem) {
    // Maybe the "PEM" field actually contains base64 of the file
    if (!pem.includes("BEGIN") && /^[A-Za-z0-9+/=\s]+$/.test(pem) && pem.replace(/\s/g, "").length > 80) {
      const fromB64 = decodeB64ToPem(pem);
      if (fromB64) {
        const path = writeSecretFile(fromB64, env);
        if (path) return path;
      }
    }
    const body = normalizePem(pem);
    if (!pemLooksValid(body)) {
      console.warn(
        "[lastre-x402] LASTRE_X402_SECRET_KEY_PEM failed framing checks after normalize. Prefer LASTRE_X402_SECRET_KEY_B64.",
      );
    } else {
      const path = writeSecretFile(body, env);
      if (path) return path;
    }
  }

  // 3) Existing path — try to repair in place if framing is bad
  const existing =
    env.LASTRE_X402_SECRET_KEY_PATH?.trim() || env.SANDBOX_SECRET_KEY_PATH?.trim() || "";
  if (existing && existsSync(existing)) {
    try {
      const raw = readFileSync(existing, "utf8");
      if (pemLooksValid(raw)) {
        return existing;
      }
      // File might be raw base64 of PEM
      if (!raw.includes("BEGIN") && /^[A-Za-z0-9+/=\s]+$/.test(raw)) {
        const fromB64 = decodeB64ToPem(raw);
        if (fromB64) {
          const path = writeSecretFile(fromB64, env);
          if (path) return path;
        }
      }
      const fixed = normalizePem(raw);
      if (pemLooksValid(fixed)) {
        const path = writeSecretFile(fixed, env);
        if (path) return path;
      }
      console.warn(
        "[lastre-x402] secret key file at path exists but PEM framing is invalid (casper-client will fail with malformedframing).",
      );
    } catch (error) {
      console.warn(
        "[lastre-x402] could not read secret key path:",
        error instanceof Error ? error.message : error,
      );
    }
    return existing;
  }

  return existing || null;
}

/**
 * Safe diagnostic for /api/health — never includes key material.
 */
export function inspectSecretMaterial(env: NodeJS.ProcessEnv = process.env): SecretMaterialStatus {
  const mode = resolveX402Mode(env.LASTRE_X402_MODE);
  let source: SecretMaterialStatus["source"] = "none";
  if (env.LASTRE_X402_SECRET_KEY_B64?.trim()) source = "b64";
  else if (env.LASTRE_X402_SECRET_KEY_PEM?.trim()) source = "pem";
  else if (env.LASTRE_X402_SECRET_KEY_PATH?.trim() || env.SANDBOX_SECRET_KEY_PATH?.trim()) {
    source = "path";
  }

  const path =
    env.LASTRE_X402_SECRET_KEY_PATH?.trim() || env.SANDBOX_SECRET_KEY_PATH?.trim() || "";
  const pathExists = Boolean(path && existsSync(path));

  let bytes: number | null = null;
  let newlines: number | null = null;
  let hasBegin = false;
  let hasEnd = false;
  let pemOk = false;

  if (pathExists) {
    try {
      const raw = readFileSync(path, "utf8");
      bytes = raw.length;
      newlines = (raw.match(/\n/g) ?? []).length;
      hasBegin = raw.includes("-----BEGIN ");
      hasEnd = raw.includes("-----END ");
      pemOk = pemLooksValid(raw);
    } catch {
      /* ignore */
    }
  }

  let hint: string | null = null;
  if (mode === "cspr_cloud") {
    if (!env.CSPR_CLOUD_API_TOKEN?.trim() && !env.LASTRE_CSPR_CLOUD_TOKEN?.trim()) {
      hint = "Set CSPR_CLOUD_API_TOKEN for CSPR.cloud facilitator (docs.cspr.cloud).";
    } else if (!env.LASTRE_X402_PAY_TO?.trim() && !env.LASTRE_X402_TARGET_ACCOUNT?.trim()) {
      hint = "Set LASTRE_X402_PAY_TO to WCSPR payee account hash (00 + 64 hex).";
    } else {
      hint =
        "cspr_cloud mode: settle needs EIP-712 payment.cloud body (make-software/casper-x402). UI/simulate stays mock.";
    }
  } else if (mode === "casper" && !pemOk) {
    if (source === "none") {
      hint = "Set LASTRE_X402_SECRET_KEY_B64 (preferred) or PEM/path.";
    } else if (source === "pem") {
      hint =
        "PEM secret likely lost newlines. Use LASTRE_X402_SECRET_KEY_B64 from: base64 -i secret_key.pem | tr -d '\\n'";
    } else if (source === "b64") {
      hint =
        "B64 present but file still invalid after decode — re-copy base64 (single line, no quotes) and redeploy.";
    } else {
      hint = "Key path set but PEM framing invalid (malformedframing).";
    }
  }

  return {
    mode,
    source,
    pathSet: Boolean(path),
    pathExists,
    pemLooksValid: pemOk,
    bytes,
    newlines,
    hasBegin,
    hasEnd,
    hint,
  };
}

function isMockPayTo(target: string): boolean {
  return (
    !target ||
    target.includes("payto-mock") ||
    target.includes("lastre-payto-mock") ||
    // legacy mock account-hash style (not a real transfer target)
    target.startsWith("casper-test-account-hash-last")
  );
}

/**
 * Resolve WCSPR payTo account-hash form (`00` + 64 hex).
 * Prefers LASTRE_WCSPR_PAY_TO; falls back to LASTRE_X402_PAY_TO if already account-hash shaped.
 */
export function resolveWcsprPayTo(env: NodeJS.ProcessEnv = process.env): string {
  const explicit =
    env.LASTRE_WCSPR_PAY_TO?.trim() ||
    env.LASTRE_X402_WCSPR_PAY_TO?.trim() ||
    "";
  if (explicit) return explicit;
  const payTo = env.LASTRE_X402_PAY_TO?.trim() || env.LASTRE_X402_TARGET_ACCOUNT?.trim() || "";
  // Already account-hash style for CSPR.cloud (00 + 64 hex)
  if (/^00[0-9a-fA-F]{64}$/.test(payTo)) return payTo;
  // account-hash-<64hex>
  const m = payTo.match(/^account-hash-([0-9a-fA-F]{64})$/i);
  if (m) return `00${m[1].toLowerCase()}`;
  return payTo;
}

/** Optional side-car CSPR.cloud facilitator (can run alongside casper mode). */
export function createOptionalCsprCloudFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): CsprCloudFacilitator | null {
  const apiToken =
    env.CSPR_CLOUD_API_TOKEN?.trim() ||
    env.LASTRE_CSPR_CLOUD_TOKEN?.trim() ||
    env.FACILITATOR_API_KEY?.trim() ||
    "";
  if (!apiToken) return null;

  const payTo = resolveWcsprPayTo(env);
  if (isMockPayTo(payTo) || !/^00[0-9a-fA-F]{64}$/.test(payTo)) {
    console.warn(
      "[lastre-x402] CSPR_CLOUD_API_TOKEN set but LASTRE_WCSPR_PAY_TO / payTo is not `00`+64hex account hash; cloud facilitator disabled.",
    );
    return null;
  }

  try {
    return new CsprCloudFacilitator({
      apiToken,
      payTo,
      facilitatorUrl: env.CSPR_CLOUD_FACILITATOR_URL?.trim() || undefined,
      assetPackage:
        env.LASTRE_WCSPR_PACKAGE?.trim() ||
        env.ASSET_PACKAGE?.trim() ||
        WCSPR_TESTNET_PACKAGE_HASH,
      amountBaseUnits: env.LASTRE_WCSPR_AMOUNT?.trim() || undefined,
      network:
        env.LASTRE_CAIP2_NETWORK?.trim() === "casper:casper"
          ? "casper:casper"
          : "casper:casper-test",
    });
  } catch (error) {
    console.warn(
      "[lastre-x402] Optional CsprCloudFacilitator init failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export function createFacilitatorFromEnv(env: NodeJS.ProcessEnv = process.env): Facilitator {
  prepareX402SecretsFromEnv(env);
  const mode = resolveX402Mode(env.LASTRE_X402_MODE);

  if (mode === "mock") {
    return new MockFacilitator();
  }

  const targetAccount =
    env.LASTRE_X402_PAY_TO?.trim() || env.LASTRE_X402_TARGET_ACCOUNT?.trim() || "";

  // ---- Official MAKE path as PRIMARY (mode=cspr_cloud only) ------------------
  if (mode === "cspr_cloud") {
    const cloud = createOptionalCsprCloudFromEnv(env);
    if (cloud) return cloud;
    console.warn(
      "[lastre-x402] LASTRE_X402_MODE=cspr_cloud but cloud facilitator unavailable; falling back to MockFacilitator.",
    );
    return new MockFacilitator();
  }

  // ---- Native CSPR path as PRIMARY (casper mode) -----------------------------
  // Note: when CSPR_CLOUD_API_TOKEN is also set, AppRuntime attaches cloud as side-car.
  const secretKeyPath =
    env.LASTRE_X402_SECRET_KEY_PATH?.trim() || env.SANDBOX_SECRET_KEY_PATH?.trim() || "";

  if (!secretKeyPath || !existsSync(secretKeyPath)) {
    console.warn(
      "[lastre-x402] LASTRE_X402_MODE=casper but secret key path is missing or unreadable; falling back to MockFacilitator.",
    );
    return new MockFacilitator();
  }

  const status = inspectSecretMaterial(env);
  if (!status.pemLooksValid) {
    console.warn(
      "[lastre-x402] secret key PEM framing looks invalid — casper-client will fail at settle:",
      status.hint,
    );
  }

  if (isMockPayTo(targetAccount)) {
    console.warn(
      "[lastre-x402] LASTRE_X402_MODE=casper but LASTRE_X402_PAY_TO is missing or still mock; falling back to MockFacilitator.",
    );
    return new MockFacilitator();
  }

  try {
    return new CasperFacilitator({
      secretKeyPath,
      targetAccount,
      nodeAddress:
        env.CASPER_RPC_URL?.trim() ||
        env.LASTRE_CASPER_NODE?.trim() ||
        env.NODE_ADDRESS?.trim(),
      chainName: env.LASTRE_CHAIN_NAME?.trim() || env.CHAIN_NAME?.trim() || "casper-test",
      casperClientBin:
        env.CASPER_CLIENT_BIN?.trim() ||
        env.LASTRO_CASPER_CLIENT_BIN?.trim() ||
        "casper-client",
    });
  } catch (error) {
    console.warn(
      "[lastre-x402] CasperFacilitator init failed; falling back to mock:",
      error instanceof Error ? error.message : error,
    );
    return new MockFacilitator();
  }
}
