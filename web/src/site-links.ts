export const GITHUB_URL = "https://github.com/FelixRodrigues007/lastre";

export const CONTRACT_PACKAGE_HASH =
  "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

export const CONTRACT_PACKAGE_ID =
  "b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

export const CSPR_PACKAGE_URL =
  "https://testnet.cspr.live/contract-package/b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

export const CSPR_EXPLORER_EMBED = CSPR_PACKAGE_URL;

export const CSPR_TX_URL = (hash: string) => `https://testnet.cspr.live/transaction/${hash}`;

export const CASPER_TESTNET_EVIDENCE = [
  {
    kind: "package",
    label: "ProofOfOrigin package",
    hash: CONTRACT_PACKAGE_HASH,
    href: CSPR_PACKAGE_URL,
    verdict: "Live",
  },
  {
    kind: "install",
    label: "Install ProofOfOrigin",
    hash: "c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10",
    href: CSPR_TX_URL("c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10"),
    verdict: "Package installed",
  },
  {
    kind: "register",
    label: "LOTE-001 reference registered",
    hash: "23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede",
    href: CSPR_TX_URL("23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede"),
    verdict: "Reference seal",
  },
  {
    kind: "invalid",
    label: "LOTE-001 tampered attest",
    hash: "5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd",
    href: CSPR_TX_URL("5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd"),
    verdict: "Invalid on-chain",
  },
  {
    kind: "register",
    label: "LOTE-002 reference registered",
    hash: "bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101",
    href: CSPR_TX_URL("bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101"),
    verdict: "Reference seal",
  },
  {
    kind: "valid",
    label: "LOTE-002 agent attest",
    hash: "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
    href: CSPR_TX_URL("43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4"),
    verdict: "Valid on-chain",
  },
  {
    kind: "valid",
    label: "LOTE-001 earlier genuine attest",
    hash: "8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f",
    href: CSPR_TX_URL("8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f"),
    verdict: "Valid on-chain",
  },
] as const;

export const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;

export const DOCS_URL = `${GITHUB_URL}#readme`;

// The product console (app/) is deployed separately from this landing page.
// On the Cloudflare Pages landing, "/app" does NOT exist: the SPA fallback
// (_redirects: /* /index.html 200) would just re-serve the landing. Set
// VITE_APP_URL to the deployed console URL (e.g. https://app.lastre.io) so the
// "App" link actually opens the console. Falls back to "/app" for local dev
// where a reverse proxy may map it.
//
// .trim() is required: Cloudflare / dashboard env values have shipped with a
// leading space (" https://app.lastre.io"), which breaks:
//   - APP_URL_IS_EXTERNAL (regex expects ^https?)
//   - href navigation (browser treats " https://..." as a broken relative path)
export const APP_URL = String(import.meta.env.VITE_APP_URL ?? "/app").trim();

/** True when APP_URL points to a different origin and should open with target. */
export const APP_URL_IS_EXTERNAL = /^https?:\/\//.test(APP_URL);

export const TRUST_URL = "#trust";

export const CHANGELOG_URL = `${GITHUB_URL}/commits/main`;

export const CASE_STUDY_URL = `${GITHUB_URL}/blob/main/README.md`;

export const STATUS_URL = "https://status.casper.network";

export const PROTOCOL_VERSION = "v0.2.0";

/** Live on-chain attestation counts — Casper Testnet ProofOfOrigin (fallback) */
export const ON_CHAIN_ACCEPTED = 2;
export const ON_CHAIN_REJECTED = 1;

export const DEMO_TERMINAL_CMD = "make demo";
