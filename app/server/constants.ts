export const PACKAGE_HASH =
  "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

export const PACKAGE_URL = `https://testnet.cspr.live/contract-package/${PACKAGE_HASH}`;

/** Verified README snapshot when live Casper query is unavailable. */
export const TESTNET_SNAPSHOT = {
  accepted: 2,
  rejected: 1,
} as const;
