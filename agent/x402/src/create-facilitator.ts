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

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CasperFacilitator } from "./casper-facilitator.js";
import { MockFacilitator, type Facilitator } from "./facilitator.js";

export type X402Mode = "mock" | "casper";

const PEM_BOOTSTRAP_PATH = join(tmpdir(), "lastre-x402-secret_key.pem");

export function resolveX402Mode(raw = process.env.LASTRE_X402_MODE): X402Mode {
  const mode = (raw ?? "mock").trim().toLowerCase();
  return mode === "casper" ? "casper" : "mock";
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

function writeSecretFile(body: string, env: NodeJS.ProcessEnv): string | null {
  try {
    mkdirSync(tmpdir(), { recursive: true });
    writeFileSync(PEM_BOOTSTRAP_PATH, body, { mode: 0o600 });
    env.LASTRE_X402_SECRET_KEY_PATH = PEM_BOOTSTRAP_PATH;
    return PEM_BOOTSTRAP_PATH;
  } catch (error) {
    console.warn(
      "[lastre-x402] failed to write secret key file:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/**
 * Materialize secret key material into LASTRE_X402_SECRET_KEY_PATH.
 * Prefer B64/PEM over a pre-existing path so mangled entrypoint files get fixed.
 * Mutates `env` (default process.env).
 */
export function prepareX402SecretsFromEnv(env: NodeJS.ProcessEnv = process.env): string | null {
  const b64 = env.LASTRE_X402_SECRET_KEY_B64?.trim();
  if (b64) {
    try {
      const decoded = Buffer.from(b64.replace(/\s+/g, ""), "base64").toString("utf8");
      const body = normalizePem(decoded);
      if (!body.includes("BEGIN")) {
        console.warn("[lastre-x402] LASTRE_X402_SECRET_KEY_B64 did not decode to a PEM");
        return null;
      }
      return writeSecretFile(body, env);
    } catch (error) {
      console.warn(
        "[lastre-x402] failed to decode LASTRE_X402_SECRET_KEY_B64:",
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  const pem = env.LASTRE_X402_SECRET_KEY_PEM?.trim();
  if (pem) {
    const body = normalizePem(pem);
    if (!body.includes("BEGIN") || !body.includes("END")) {
      console.warn(
        "[lastre-x402] LASTRE_X402_SECRET_KEY_PEM missing BEGIN/END markers; check the secret value",
      );
      return null;
    }
    return writeSecretFile(body, env);
  }

  const existing =
    env.LASTRE_X402_SECRET_KEY_PATH?.trim() || env.SANDBOX_SECRET_KEY_PATH?.trim() || "";
  if (existing && existsSync(existing)) {
    return existing;
  }
  return existing || null;
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

export function createFacilitatorFromEnv(env: NodeJS.ProcessEnv = process.env): Facilitator {
  prepareX402SecretsFromEnv(env);
  const mode = resolveX402Mode(env.LASTRE_X402_MODE);

  if (mode !== "casper") {
    return new MockFacilitator();
  }

  const secretKeyPath =
    env.LASTRE_X402_SECRET_KEY_PATH?.trim() || env.SANDBOX_SECRET_KEY_PATH?.trim() || "";
  const targetAccount =
    env.LASTRE_X402_PAY_TO?.trim() || env.LASTRE_X402_TARGET_ACCOUNT?.trim() || "";

  if (!secretKeyPath || !existsSync(secretKeyPath)) {
    console.warn(
      "[lastre-x402] LASTRE_X402_MODE=casper but secret key path is missing or unreadable; falling back to MockFacilitator.",
    );
    return new MockFacilitator();
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
