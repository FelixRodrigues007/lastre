/**
 * Sealed Market Rail — idempotent demo gate helpers.
 *
 * POST /api/mint returns HTTP 400 with code ALREADY_MINTED when the demo
 * MintGate already has the lot. That is a completed MintGate step for the
 * rail (not a judge-facing failure). Same idea for ALREADY_LOCKED on lock.
 */

import { ApiError } from "./types";

/** True when mint failure means "already claimed this demo session". */
export function isAlreadyMintedError(error: unknown): boolean {
  if (error instanceof ApiError && error.code === "ALREADY_MINTED") {
    return true;
  }
  if (!(error instanceof Error)) return false;
  const message = error.message;
  // Match: "AlreadyMinted", "already minted", "ALREADY_MINTED", "already tokenized"
  return /already\s*minted|ALREADY_MINTED|already tokenized/iu.test(message);
}

/** True when lock failure means "already locked as demo collateral". */
export function isAlreadyLockedError(error: unknown): boolean {
  if (error instanceof ApiError && error.code === "ALREADY_LOCKED") {
    return true;
  }
  if (!(error instanceof Error)) return false;
  return /already\s*locked|ALREADY_LOCKED/iu.test(error.message);
}

/** True when release failure means "not locked under this account". */
export function isNotLockedError(error: unknown): boolean {
  if (error instanceof ApiError && (error.code === "NOT_LOCKED" || error.code === "NOT_OWNER")) {
    return true;
  }
  if (!(error instanceof Error)) return false;
  return /not locked|NOT_LOCKED|not the locker/iu.test(error.message);
}
