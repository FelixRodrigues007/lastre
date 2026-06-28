#!/usr/bin/env node
// Lastre deploy doctor — one command that proves WHERE the Vercel <-> Render
// chain breaks, so we stop guessing from screenshots.
//
// Usage:
//   node scripts/diag/check-deploy.mjs <frontend-url> [gateway-url]
//
// Examples:
//   node scripts/diag/check-deploy.mjs https://lastro-xxxx.vercel.app
//   node scripts/diag/check-deploy.mjs https://lastre.io https://lastro.onrender.com
//
// It checks, in order, the exact failure modes that produce the reported
// "0 requests in the Network tab":
//   1. Frontend reachable (and NOT behind a Vercel auth/SSO wall)
//   2. Frontend is actually the React SPA (has /assets/index-*.js)
//   3. The served bundle contains the live-gateway code (URL + refresh button)
//   4. Gateway /health, /proof, /verdict respond
//   5. Gateway returns CORS allow-origin FOR THIS EXACT frontend origin
//
// Requires Node >= 18 (global fetch). No npm dependencies.

const DEFAULT_GATEWAY = "https://lastro.onrender.com";
const TIMEOUT_MS = 60_000; // Render free tier cold start can be slow.

const frontendArg = process.argv[2];
const gatewayArg = process.argv[3] || process.env.VITE_GATEWAY_URL || DEFAULT_GATEWAY;

if (!frontendArg) {
  console.error("Usage: node scripts/diag/check-deploy.mjs <frontend-url> [gateway-url]");
  process.exit(2);
}

const frontend = stripTrailingSlash(frontendArg);
const gateway = stripTrailingSlash(gatewayArg);
const frontendOrigin = new URL(frontend).origin;

const PASS = "PASS";
const FAIL = "FAIL";
const WARN = "WARN";
let hardFailures = 0;

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function line(label, status, detail) {
  const pad = label.padEnd(34, ".");
  const tag = status === PASS ? "PASS" : status === WARN ? "WARN" : "FAIL";
  console.log(`${pad} ${tag}${detail ? `  ${detail}` : ""}`);
  if (status === FAIL) hardFailures += 1;
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: "manual" });
  } finally {
    clearTimeout(timer);
  }
}

function looksLikeVercelAuthWall(status, headers, body) {
  if (status === 401) return true;
  const location = headers.get("location") || "";
  if (/vercel\.com\/sso|_vercel\/sso|sso-api/i.test(location)) return true;
  const setCookie = headers.get("set-cookie") || "";
  if (/_vercel_sso_nonce/i.test(setCookie)) return true;
  if (/Authentication Required|Vercel Authentication|vercel\.com\/sso/i.test(body)) return true;
  return false;
}

async function checkFrontend() {
  console.log(`\nFrontend: ${frontend}`);
  let res;
  try {
    res = await fetchWithTimeout(frontend, { headers: { accept: "text/html" } });
  } catch (error) {
    line("[1] Frontend reachable", FAIL, `request error: ${error.message}`);
    return null;
  }

  const body = await safeText(res);

  if (looksLikeVercelAuthWall(res.status, res.headers, body)) {
    line("[1] Frontend reachable", FAIL, `Vercel auth/SSO wall (status ${res.status}). Disable Deployment Protection.`);
    return null;
  }
  if (res.status >= 300 && res.status < 400) {
    line("[1] Frontend reachable", WARN, `redirect ${res.status} -> ${res.headers.get("location") || "?"}`);
  } else if (!res.ok) {
    line("[1] Frontend reachable", FAIL, `status ${res.status}`);
    return null;
  } else {
    line("[1] Frontend reachable", PASS, `status ${res.status}`);
  }

  // Vite emits <script type="module" ... src="/assets/index-*.js">.
  const match = body.match(/src="([^"]*\/assets\/index-[^"]+\.js)"/);
  if (!match) {
    line("[2] React SPA bundle present", FAIL, "no /assets/index-*.js in HTML (not the Vite app, or wrong deploy)");
    return null;
  }
  line("[2] React SPA bundle present", PASS, match[1]);
  return new URL(match[1], frontend).toString();
}

async function checkBundle(bundleUrl) {
  if (!bundleUrl) return;
  let res;
  try {
    res = await fetchWithTimeout(bundleUrl);
  } catch (error) {
    line("[3] Bundle has live-gateway code", FAIL, `cannot fetch bundle: ${error.message}`);
    return;
  }
  const js = await safeText(res);
  const hasGatewayUrl = /onrender\.com|api\.lastre\.io|VITE_GATEWAY_URL/.test(js);
  const hasRefresh = js.includes("Refresh live verdicts");
  const hasVerdictPath = js.includes("/verdict/");
  if (hasGatewayUrl && hasRefresh && hasVerdictPath) {
    const url = js.match(/https?:\/\/[a-z0-9.-]*onrender\.com|https?:\/\/api\.lastre\.io/i);
    line("[3] Bundle has live-gateway code", PASS, url ? `baked URL: ${url[0]}` : "refresh + /verdict present");
  } else {
    line(
      "[3] Bundle has live-gateway code",
      FAIL,
      `STALE BUNDLE — gatewayUrl:${hasGatewayUrl} refreshBtn:${hasRefresh} verdict:${hasVerdictPath}. Redeploy latest main.`,
    );
  }
}

async function checkGateway() {
  console.log(`\nGateway: ${gateway}  (Origin sent: ${frontendOrigin})`);

  // /health — also reveals cold start.
  await probe("[4] Gateway /health", `${gateway}/health`);

  // Browser-shaped requests: send the real Origin and assert CORS echoes it.
  await probeCors("[5] CORS /proof", `${gateway}/proof`);
  await probeCors("[6] CORS /verdict/LOTE-001", `${gateway}/verdict/MINA-VALEDOURO-LOTE-001`);

  // Preflight (only matters once requests carry non-simple headers, but it is
  // the cheapest way to catch a gateway that 404s OPTIONS).
  await probePreflight("[7] CORS preflight /verdict", `${gateway}/verdict/MINA-VALEDOURO-LOTE-001`);
}

async function probe(label, url) {
  try {
    const res = await fetchWithTimeout(url, { headers: { accept: "application/json" } });
    line(label, res.ok ? PASS : FAIL, `status ${res.status}`);
  } catch (error) {
    line(label, FAIL, `request error: ${error.message} (Render cold start? retry in 60s)`);
  }
}

async function probeCors(label, url) {
  try {
    const res = await fetchWithTimeout(url, {
      headers: { accept: "application/json", origin: frontendOrigin },
    });
    const allow = res.headers.get("access-control-allow-origin");
    const ok = res.ok && (allow === frontendOrigin || allow === "*");
    line(
      label,
      ok ? PASS : FAIL,
      `status ${res.status} | allow-origin: ${allow ?? "(none)"}${
        ok ? "" : " — add this origin to Render ALLOWED_ORIGINS"
      }`,
    );
  } catch (error) {
    line(label, FAIL, `request error: ${error.message}`);
  }
}

async function probePreflight(label, url) {
  try {
    const res = await fetchWithTimeout(url, {
      method: "OPTIONS",
      headers: {
        origin: frontendOrigin,
        "access-control-request-method": "GET",
        "access-control-request-headers": "accept",
      },
    });
    const allow = res.headers.get("access-control-allow-origin");
    const ok = (res.status === 204 || res.status === 200) && (allow === frontendOrigin || allow === "*");
    line(label, ok ? PASS : WARN, `status ${res.status} | allow-origin: ${allow ?? "(none)"}`);
  } catch (error) {
    line(label, WARN, `request error: ${error.message}`);
  }
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

async function main() {
  console.log("Lastre deploy doctor");
  console.log("====================");
  const bundleUrl = await checkFrontend();
  await checkBundle(bundleUrl);
  await checkGateway();

  console.log("\nSummary");
  console.log("-------");
  if (hardFailures === 0) {
    console.log("All hard checks passed. If the panel still shows no live data, hard-refresh");
    console.log("the page (Cmd+Shift+R) and click 'Refresh live verdicts'.");
  } else {
    console.log(`${hardFailures} hard failure(s) above. Fix the FIRST FAIL — later steps depend on it:`);
    console.log("  [1] FAIL -> Vercel auth wall or wrong/dead URL.");
    console.log("  [2] FAIL -> not the React SPA (likely the Render-served demo.html, or a bad deploy).");
    console.log("  [3] FAIL -> stale bundle: Vercel is serving an old commit. Redeploy latest main.");
    console.log("  [4] FAIL -> gateway down or cold-starting on Render.");
    console.log("  [5/6] FAIL -> CORS: add the printed origin to Render ALLOWED_ORIGINS (or use https://*.vercel.app).");
  }
  process.exit(hardFailures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("doctor crashed:", error);
  process.exit(2);
});
