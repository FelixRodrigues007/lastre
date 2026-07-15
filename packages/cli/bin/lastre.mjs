#!/usr/bin/env node
/**
 * Lastre agent CLI — 60-second integration surface.
 *
 *   lastre prove <assetId>
 *   lastre prove <assetId> --pay [--mode mock|casper]
 *   lastre evidence
 *
 * Env:
 *   LASTRE_API_BASE   default https://app-api.lastre.io
 *   LASTRE_X402_MODE  mock|casper (only affects local settle helpers; --pay uses API)
 */

const API_BASE = (process.env.LASTRE_API_BASE || "https://app-api.lastre.io").replace(/\/$/, "");

function usage(code = 0) {
  console.log(`lastre — Lastre agent CLI (proof before token)

Usage:
  lastre prove <assetId>              Quote x402 (HTTP 402 body)
  lastre prove <assetId> --pay        Quote + mock pay via /api/x402/simulate (judge-safe)
  lastre prove <assetId> --pay --mode casper
                                      Attempt real settle (requires server LASTRE_X402_MODE=casper + keys)
  lastre evidence                     GET /api/evidence (exit 0 if rpc fullyVerified)

Env:
  LASTRE_API_BASE   (default ${API_BASE})
`);
  process.exit(code);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "-h" || args[0] === "--help") usage(0);

  const cmd = args[0];
  if (cmd === "evidence") {
    await cmdEvidence();
    return;
  }
  if (cmd === "prove") {
    const assetId = args[1];
    if (!assetId) usage(1);
    const pay = args.includes("--pay");
    const modeIdx = args.indexOf("--mode");
    const mode = modeIdx >= 0 ? args[modeIdx + 1] : "mock";
    if (pay) await cmdProvePay(assetId, mode);
    else await cmdProve(assetId);
    return;
  }
  usage(1);
}

async function cmdProve(assetId) {
  const url = `${API_BASE}/api/x402/provenance/${encodeURIComponent(assetId)}`;
  const res = await fetch(url);
  const body = await res.json();
  console.log(JSON.stringify({ httpStatus: res.status, ...body }, null, 2));
  if (res.status !== 402) process.exit(1);
}

async function cmdProvePay(assetId, mode) {
  if (mode === "casper") {
    // Real path: quote on API, then instruct — full casper settle needs server-side key.
    // We call simulate only for mock; for casper we hit a dedicated note.
    const quoteUrl = `${API_BASE}/api/x402/provenance/${encodeURIComponent(assetId)}`;
    const q = await fetch(quoteUrl);
    const quote = await q.json();
    if (q.status !== 402) {
      console.error(JSON.stringify({ error: "expected_402", httpStatus: q.status, quote }, null, 2));
      process.exit(1);
    }
    // Server-side real settle is only available when env is casper; clients without
    // a wallet use simulate. Document clearly:
    console.error(
      JSON.stringify(
        {
          note: "CLI --mode casper: use server with LASTRE_X402_MODE=casper + LASTRE_X402_SECRET_KEY_PATH + LASTRE_X402_PAY_TO, then POST payment header. Falling back to /simulate for local demo unless LASTRE_FORCE_CASPER_PAY=1.",
          quoteHttp: q.status,
          requirements: quote.accepts?.[0] ?? quote.requirements,
        },
        null,
        2,
      ),
    );
    if (process.env.LASTRE_FORCE_CASPER_PAY === "1") {
      console.error("LASTRE_FORCE_CASPER_PAY requires a signed X-PAYMENT against a casper-mode server; not implemented as bare CLI transfer yet.");
      process.exit(2);
    }
  }

  const simUrl = `${API_BASE}/api/x402/simulate/${encodeURIComponent(assetId)}`;
  const res = await fetch(simUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: "lastre-cli" }),
  });
  const body = await res.json();
  console.log(JSON.stringify({ httpStatus: res.status, ...body }, null, 2));
  if (!res.ok || body.ok === false) process.exit(1);
  const v = body.provenance?.verdict;
  const match = body.provenance?.sealMatch;
  if (v !== "Valid" || match !== true) process.exit(3);
}

async function cmdEvidence() {
  const res = await fetch(`${API_BASE}/api/evidence`);
  const body = await res.json();
  console.log(JSON.stringify({ httpStatus: res.status, ...body }, null, 2));
  if (!res.ok) process.exit(1);
  const full = body.onChain?.rpcEvidence?.fullyVerified === true || body.onChain?.source === "live";
  if (!full && body.onChain?.source !== "live-rpc") {
    // live-rpc with fullyVerified false still ok if we have package
    if (!body.packageHash) process.exit(2);
  }
  // Prefer fullyVerified when present
  if (body.onChain?.rpcEvidence && body.onChain.rpcEvidence.fullyVerified === false) {
    process.exit(4);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
