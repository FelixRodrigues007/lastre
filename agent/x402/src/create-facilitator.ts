/**
 * Factory: LASTRE_X402_MODE=mock|casper (default mock).
 *
 * casper mode requires a payer secret key + LASTRE_X402_PAY_TO (target public
 * key / account-hash). Secret material may be:
 *   - LASTRE_X402_SECRET_KEY_PATH / SANDBOX_SECRET_KEY_PATH (file path), or
 *   - LASTRE_X402_SECRET_KEY_PEM (PEM body — written to a temp file; for Render)
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
 * Materialize LASTRE_X402_SECRET_KEY_PEM into a file path env var when needed.
 * Safe to call multiple times; no-op when path already exists or PEM unset.
 * Mutates `env` (default process.env).
 */
export function prepareX402SecretsFromEnv(env: NodeJS.ProcessEnv = process.env): string | null {
  const existing =
    env.LASTRE_X402_SECRET_KEY_PATH?.trim() || env.SANDBOX_SECRET_KEY_PATH?.trim() || "";
  if (existing && existsSync(existing)) {
    return existing;
  }

  const pem = env.LASTRE_X402_SECRET_KEY_PEM?.trim();
  if (!pem) return existing || null;

  // Accept raw PEM or PEM with escaped newlines from secret stores.
  const normalized = pem.includes("\\n") ? pem.replace(/\\n/g, "\n") : pem;
  const body = normalized.endsWith("\n") ? normalized : `${normalized}\n`;

  try {
    mkdirSync(tmpdir(), { recursive: true });
    writeFileSync(PEM_BOOTSTRAP_PATH, body, { mode: 0o600 });
    env.LASTRE_X402_SECRET_KEY_PATH = PEM_BOOTSTRAP_PATH;
    return PEM_BOOTSTRAP_PATH;
  } catch (error) {
    console.warn(
      "[lastre-x402] failed to materialize LASTRE_X402_SECRET_KEY_PEM:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
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
