/**
 * Factory: LASTRE_X402_MODE=mock|casper (default mock).
 *
 * casper mode requires LASTRE_X402_SECRET_KEY_PATH (or SANDBOX_SECRET_KEY_PATH)
 * and LASTRE_X402_PAY_TO (target public key / account). If missing, logs a
 * warning and falls back to MockFacilitator so the judge demo never dies.
 */

import { existsSync } from "node:fs";
import { CasperFacilitator } from "./casper-facilitator.js";
import { MockFacilitator, type Facilitator } from "./facilitator.js";

export type X402Mode = "mock" | "casper";

export function resolveX402Mode(raw = process.env.LASTRE_X402_MODE): X402Mode {
  const mode = (raw ?? "mock").trim().toLowerCase();
  return mode === "casper" ? "casper" : "mock";
}

export function createFacilitatorFromEnv(env: NodeJS.ProcessEnv = process.env): Facilitator {
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

  // Mock payTo account-hash is not a valid transfer target — require a real pay-to.
  if (
    !targetAccount ||
    targetAccount.includes("payto-mock") ||
    targetAccount.includes("lastro-payto") ||
    targetAccount.includes("lastre-payto-mock")
  ) {
    console.warn(
      "[lastre-x402] LASTRE_X402_MODE=casper but LASTRE_X402_PAY_TO is missing or still mock; falling back to MockFacilitator.",
    );
    return new MockFacilitator();
  }

  try {
    return new CasperFacilitator({
      secretKeyPath,
      targetAccount,
      nodeAddress: env.CASPER_RPC_URL?.trim() || env.LASTRE_CASPER_NODE?.trim(),
      chainName: env.LASTRE_CHAIN_NAME?.trim() || "casper-test",
      casperClientBin: env.CASPER_CLIENT_BIN?.trim() || env.LASTRO_CASPER_CLIENT_BIN?.trim() || "casper-client",
    });
  } catch (error) {
    console.warn(
      "[lastre-x402] CasperFacilitator init failed; falling back to mock:",
      error instanceof Error ? error.message : error,
    );
    return new MockFacilitator();
  }
}
