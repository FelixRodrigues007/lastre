export const GITHUB_URL = "https://github.com/FelixRodrigues007/lastro";

export const CSPR_PACKAGE_URL =
  "https://testnet.cspr.live/contract-package/hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

export const CSPR_EXPLORER_EMBED = CSPR_PACKAGE_URL;

export const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;

export const DOCS_URL = `${GITHUB_URL}#readme`;

// The product console (app/) is deployed separately from this landing page.
// On the Cloudflare Pages landing, "/app" does NOT exist: the SPA fallback
// (_redirects: /* /index.html 200) would just re-serve the landing. Set
// VITE_APP_URL to the deployed console URL (e.g. https://app.lastre.io) so the
// "App" link actually opens the console. Falls back to "/app" for local dev
// where a reverse proxy may map it.
export const APP_URL = import.meta.env.VITE_APP_URL || "/app";

/** True when APP_URL points to a different origin and should open with target. */
export const APP_URL_IS_EXTERNAL = /^https?:\/\//.test(APP_URL);

export const TRUST_URL = "#trust";

export const CHANGELOG_URL = `${GITHUB_URL}/commits/main`;

export const CASE_STUDY_URL = `${GITHUB_URL}/blob/main/README.md`;

export const STATUS_URL = "https://status.casper.network";

export const CONTRACT_PACKAGE_HASH =
  "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

export const PROTOCOL_VERSION = "v0.2.0";

/** Live on-chain attestation counts — Casper Testnet ProofOfOrigin (fallback) */
export const ON_CHAIN_ACCEPTED = 2;
export const ON_CHAIN_REJECTED = 1;

export const DEMO_TERMINAL_CMD = "make demo";
