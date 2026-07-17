#!/usr/bin/env node
/**
 * Lastre origin autonomy cycle — judge-safe HTTP client.
 *
 * Default: hit production/local API for one dense proof cycle (mock pay only).
 * Never calls /api/x402/settle (no real CSPR from this script).
 *
 *   node scripts/autonomous-cycle.mjs
 *   node scripts/autonomous-cycle.mjs --once
 *   LASTRE_API_BASE=http://127.0.0.1:3001 node scripts/autonomous-cycle.mjs
 *
 * Env:
 *   LASTRE_API_BASE   default https://app-api.lastre.io
 *   AUTONOMY_SOURCE   label stored on the cycle (default: cli)
 */

import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API_BASE = (process.env.LASTRE_API_BASE || "https://app-api.lastre.io").replace(/\/$/, "");
const SOURCE = process.env.AUTONOMY_SOURCE || "cli";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOG_PATH = join(ROOT, "output", "autonomy-log.jsonl");

function log(msg) {
  console.log(`[autonomy] ${msg}`);
}

async function main() {
  log(`API=${API_BASE} source=${SOURCE}`);

  const healthRes = await fetch(`${API_BASE}/api/health`);
  if (!healthRes.ok) {
    throw new Error(`health HTTP ${healthRes.status}`);
  }
  const health = await healthRes.json();
  log(`health ok=${health.ok} facilitator=${health.x402?.facilitatorMode ?? "?"}`);

  const cycleRes = await fetch(`${API_BASE}/api/agent/autonomy/cycle`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ source: SOURCE }),
  });
  const cycleBody = await cycleRes.json();
  if (!cycleRes.ok && cycleRes.status !== 207) {
    throw new Error(`cycle HTTP ${cycleRes.status}: ${JSON.stringify(cycleBody).slice(0, 400)}`);
  }

  const summaryRes = await fetch(`${API_BASE}/api/agent/autonomy`);
  const summary = await summaryRes.json();

  const line = JSON.stringify({
    at: new Date().toISOString(),
    api: API_BASE,
    httpStatus: cycleRes.status,
    cycle: cycleBody.cycle ?? null,
    summary: {
      cyclesTotal: summary.cyclesTotal,
      cyclesOk: summary.cyclesOk,
      cyclesLast24h: summary.cyclesLast24h,
      evidenceFullyVerifiedLatest: summary.evidenceFullyVerifiedLatest,
    },
  });

  await mkdir(dirname(LOG_PATH), { recursive: true });
  await appendFile(LOG_PATH, `${line}\n`, "utf8");

  log(`cycle ok=${cycleBody.ok} id=${cycleBody.cycle?.cycleId ?? "?"}`);
  log(`scenarios: ${(cycleBody.cycle?.scenarios ?? []).map((s) => `${s.scenario}:${s.ok ? "PASS" : "FAIL"}`).join(" ")}`);
  log(`summary cyclesTotal=${summary.cyclesTotal} cyclesOk=${summary.cyclesOk}`);
  log(`log → ${LOG_PATH}`);

  if (!cycleBody.ok) {
    process.exitCode = 2;
    log("FAIL: one or more hard scenarios failed (see cycle JSON)");
    console.log(JSON.stringify(cycleBody.cycle, null, 2));
    return;
  }
  log("PASS");
}

main().catch((err) => {
  console.error(`[autonomy] ERROR: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
