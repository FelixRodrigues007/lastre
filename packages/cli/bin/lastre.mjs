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
 *   LASTRE_X402_MODE  mock|casper (hint for --pay default when --mode omitted)
 */

import { createHash } from "node:crypto";

const API_BASE = (process.env.LASTRE_API_BASE || "https://app-api.lastre.io").replace(/\/$/, "");
const MOCK_PAYMENT_SECRET = "lastre-local-x402-mock-secret";

function usage(code = 0) {
  console.log(`lastre — Lastre agent CLI (proof before token)

Usage:
  lastre prove <assetId>              Quote x402 (HTTP 402 body)
  lastre prove <assetId> --pay        Quote + mock pay via /api/x402/simulate (judge-safe)
  lastre prove <assetId> --pay --mode casper
                                      Real settle: X-PAYMENT against casper-mode API
                                      (or POST /api/x402/settle when server has keys)
  lastre evidence                     GET /api/evidence (exit 0 if rpc fullyVerified)

Env:
  LASTRE_API_BASE   (default ${API_BASE})
`);
  process.exit(code);
}

function signMockPayment({ nonce, amount, from }) {
  return createHash("sha256")
    .update(["lastre-x402-payment", nonce, String(amount), from, MOCK_PAYMENT_SECRET].join("|"))
    .digest("hex");
}

function encodePaymentPayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function createPaymentHeader(requirements, from = "lastre-cli") {
  const amount = requirements.maxAmountRequired;
  return encodePaymentPayload({
    nonce: requirements.nonce,
    amount,
    from,
    sig: signMockPayment({ nonce: requirements.nonce, amount, from }),
  });
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
    const modeEnv = (process.env.LASTRE_X402_MODE || "mock").trim().toLowerCase();
    const mode = modeIdx >= 0 ? args[modeIdx + 1] : modeEnv === "casper" ? "casper" : "mock";
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
    await cmdProvePayCasper(assetId);
    return;
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

/**
 * Real path:
 * 1) Prefer POST /api/x402/settle (server-as-agent with casper facilitator)
 * 2) Fallback: quote 402 → mock X-PAYMENT header → GET provenance (server settles)
 */
async function cmdProvePayCasper(assetId) {
  const settleUrl = `${API_BASE}/api/x402/settle/${encodeURIComponent(assetId)}`;
  const settleRes = await fetch(settleUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: "lastre-cli" }),
  });
  const settleBody = await settleRes.json().catch(() => ({}));

  if (settleRes.ok && settleBody.ok) {
    printCasperResult(settleRes.status, settleBody);
    assertPaidProof(settleBody);
    return;
  }

  // 409 = server still mock — fall through to header path with clear error if mock again
  if (settleRes.status === 409 || settleBody.reason === "facilitator_not_casper") {
    // Try classic X-PAYMENT path in case only settle endpoint is missing
  } else if (settleRes.status !== 404) {
    // settle failed for real (502/402) — surface it
    console.error(
      JSON.stringify(
        {
          error: "casper_settle_failed",
          httpStatus: settleRes.status,
          body: settleBody,
          hint: "Ensure API has LASTRE_X402_MODE=casper, LASTRE_X402_PAY_TO, secret key, and casper-client.",
        },
        null,
        2,
      ),
    );
    process.exit(2);
  }

  // Classic agent path: quote → X-PAYMENT → paid proof
  const quoteUrl = `${API_BASE}/api/x402/provenance/${encodeURIComponent(assetId)}`;
  const q = await fetch(quoteUrl);
  const quote = await q.json();
  if (q.status !== 402) {
    console.error(JSON.stringify({ error: "expected_402", httpStatus: q.status, quote }, null, 2));
    process.exit(1);
  }

  const requirements = quote.accepts?.[0] ?? quote.requirements;
  if (!requirements?.nonce) {
    console.error(JSON.stringify({ error: "missing_requirements", quote }, null, 2));
    process.exit(1);
  }

  const header = createPaymentHeader(requirements, "lastre-cli");
  const paidRes = await fetch(quoteUrl, {
    headers: { "X-PAYMENT": header },
  });
  const paidBody = await paidRes.json().catch(() => ({}));

  if (!paidRes.ok || !paidBody.paid) {
    console.error(
      JSON.stringify(
        {
          error: "casper_pay_failed",
          httpStatus: paidRes.status,
          body: paidBody,
          settleProbe: { httpStatus: settleRes.status, body: settleBody },
          hint:
            settleBody.reason === "facilitator_not_casper"
              ? "API facilitator is still mock. Set LASTRE_X402_MODE=casper + keys on the API host (not only on CLI)."
              : "Check casper-client, funded key, and LASTRE_X402_PAY_TO on the API host.",
        },
        null,
        2,
      ),
    );
    process.exit(2);
  }

  if (paidBody.settlementKind !== "casper_deploy" && paidBody.facilitator !== "casper") {
    console.error(
      JSON.stringify(
        {
          error: "server_still_mock",
          settlementKind: paidBody.settlementKind,
          facilitator: paidBody.facilitator,
          hint: "API settled with MockFacilitator. Configure casper mode on the server.",
          body: paidBody,
        },
        null,
        2,
      ),
    );
    process.exit(5);
  }

  printCasperResult(paidRes.status, paidBody);
  assertPaidProof(paidBody);
}

function printCasperResult(httpStatus, body) {
  const out = {
    httpStatus,
    paid: body.paid ?? body.ok,
    settlementKind: body.settlementKind,
    facilitator: body.facilitator ?? body.facilitatorMode,
    txHash: body.txHash,
    paymentExplorerUrl:
      body.paymentExplorerUrl ??
      (body.txHash && body.settlementKind === "casper_deploy"
        ? `https://testnet.cspr.live/transaction/${body.txHash}`
        : null),
    provenance: body.provenance,
    chainEvidence: body.chainEvidence
      ? {
          source: body.chainEvidence.source,
          packageHash: body.chainEvidence.packageHash,
          fullyVerified: body.chainEvidence.rpcEvidence?.fullyVerified,
        }
      : undefined,
    amountCspr: body.amountCspr,
    payTo: body.payTo,
  };
  console.log(JSON.stringify(out, null, 2));
}

function assertPaidProof(body) {
  const v = body.provenance?.verdict;
  const match = body.provenance?.sealMatch;
  if (v !== "Valid" || match !== true) process.exit(3);
  if (body.settlementKind === "casper_deploy" && !body.txHash) process.exit(4);
}

async function cmdEvidence() {
  const res = await fetch(`${API_BASE}/api/evidence`);
  const body = await res.json();
  console.log(JSON.stringify({ httpStatus: res.status, ...body }, null, 2));
  if (!res.ok) process.exit(1);
  if (body.onChain?.rpcEvidence && body.onChain.rpcEvidence.fullyVerified === false) {
    process.exit(4);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
