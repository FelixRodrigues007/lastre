import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { createGatewayApp } from "../dist/index.js";

const demo = readFileSync(new URL("../../../web/demo.html", import.meta.url), "utf8");
const marketplace = readFileSync(new URL("../../../web/marketplace.html", import.meta.url), "utf8");
const mapPath = new URL("../../../web/map.html", import.meta.url);

function assertLivePage(html, label) {
  assert.match(html, /DEMONSTRATION — simulated assets, no investment offered/, `${label} keeps the mandatory banner`);
  assert.match(html, /fetch\(gatewayUrl\("\/catalog"\)\)/, `${label} loads catalog from the gateway`);
  assert.match(html, /fetch\(gatewayUrl\(`\/verdict\/\$\{encodeURIComponent\(asset\.assetId\)\}`\)\)/, `${label} fetches a live verdict per catalog asset`);
  assert.match(html, /fetch\(gatewayUrl\("\/proof"\)\)/, `${label} loads live proof counters/events`);
  assert.match(html, /fetch\(gatewayUrl\("\/sandbox\/compute"\)/, `${label} posts sandbox compute to the gateway`);
  assert.match(html, /fetch\(gatewayUrl\("\/sandbox\/anchor"\)/, `${label} posts controlled anchor to the gateway`);
  assert.match(html, /fetch\(gatewayUrl\(`\/certificate\/\$\{encodeURIComponent\(asset\.assetId\)\}`\)\)/, `${label} fetches symbolic certificates for valid assets`);
  assert.match(html, /symbolic credential via MintGate event — not a transferable asset/, `${label} labels the credential honestly`);
  assert.match(html, /href="\/map"/, `${label} links to the fictional custody map`);
  assert.match(html, /testnet\.cspr\.live\/transaction\//, `${label} links proof events and anchors to cspr.live transactions`);
  assert.match(html, /Simulated/, `${label} clearly labels simulated catalog assets`);
  assert.doesNotMatch(html, /const CATALOG\s*=\s*\[/, `${label} does not use embedded catalog data`);
  assert.doesNotMatch(html, /alert\(`Anchored!/, `${label} renders anchor result inline instead of pretending success in an alert`);
}

function assertMapPage(html) {
  assert.match(html, /DEMONSTRATION — simulated assets, no investment offered/, "map keeps the mandatory banner");
  assert.match(html, /maplibre-gl/i, "map loads MapLibre GL without a private token");
  assert.match(html, /deck\.gl|deck\.ArcLayer/, "map uses deck.gl for custody arcs");
  assert.match(html, /new deck\.ArcLayer/, "map renders custody paths through ArcLayer");
  assert.match(html, /fetch\(gatewayUrl\("\/catalog"\)\)/, "map loads the live catalog from the gateway");
  assert.match(html, /fetch\(gatewayUrl\(`\/verdict\/\$\{encodeURIComponent\(asset\.assetId\)\}`\)\)/, "map polls live verdicts for each on-chain asset");
  assert.match(html, /fictional geolocation/i, "map labels all locations as fictional");
  assert.match(html, /no GPS tracking/i, "map does not imply live GPS tracking");
  assert.match(html, /setInterval\(refreshMapVerdicts, 30_000\)/, "map refreshes verdict colors by polling");
  assert.match(html, /perimeter/i, "map draws the fictional provenance perimeter");
  assert.match(html, /@keyframes map-pin-pulse/, "map animates verdict pins");
  assert.match(html, /prefers-reduced-motion/, "map respects reduced-motion preferences");
  assert.match(html, /Simulated/, "map clearly labels simulated catalog assets");
  assert.doesNotMatch(html, /\b(buy|sell|yield|ROI|price)\b/i, "map avoids prohibited commercial language");
}

describe("web frontend gateway integration", () => {
  it("demo.html calls the live gateway APIs and preserves honesty framing", () => {
    assertLivePage(demo, "demo.html");
  });

  it("marketplace.html calls the live gateway APIs and preserves honesty framing", () => {
    assertLivePage(marketplace, "marketplace.html");
  });
});

describe("web map page", () => {
  it("serves the dedicated fictional custody map at /map", async () => {
    const app = createGatewayApp({
      dependencies: {
        readVerdict() { throw new Error("not needed"); },
        computeSeal() { return "a".repeat(64); },
        anchor() { throw new Error("not needed"); },
        readProof() { return Promise.resolve({ packageHash: "hash-test", accepted: 2, rejected: 1, recentAttestations: [] }); },
        loadCatalog() { return Promise.resolve({ assets: [] }); },
        readMintStatus() { return Promise.resolve({ isMinted: false }); },
      },
      packageHash: "hash-test",
    });
    const server = app.listen(0, "127.0.0.1");
    try {
      await new Promise((resolve) => server.once("listening", resolve));
      const { port } = server.address();
      const response = await fetch(`http://127.0.0.1:${port}/map`, { headers: { accept: "text/html" } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type")?.includes("text/html"), true);
      assert.match(await response.text(), /id="map-page"/);
    } finally {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });

  it("renders MapLibre pins, deck.gl custody arcs, and live verdict polling with honest labels", () => {
    assert.equal(existsSync(mapPath), true, "web/map.html should exist");
    assertMapPage(readFileSync(mapPath, "utf8"));
  });
});


describe("web proof route", () => {
  it("serves the demo shell for browser navigation to /proof while API fetches still get JSON", async () => {
    const app = createGatewayApp({
      dependencies: {
        readVerdict() { throw new Error("not needed"); },
        computeSeal() { return "a".repeat(64); },
        anchor() { throw new Error("not needed"); },
        readProof() { return Promise.resolve({ packageHash: "hash-test", accepted: 2, rejected: 1, recentAttestations: [] }); },
        loadCatalog() { return Promise.resolve({ assets: [] }); },
      },
      packageHash: "hash-test",
    });
    const server = app.listen(0, "127.0.0.1");
    try {
      await new Promise((resolve) => server.once("listening", resolve));
      const { port } = server.address();
      const html = await fetch(`http://127.0.0.1:${port}/proof`, { headers: { accept: "text/html" } });
      const json = await fetch(`http://127.0.0.1:${port}/proof`, { headers: { accept: "application/json" } });

      assert.equal(html.headers.get("content-type")?.includes("text/html"), true);
      assert.match(await html.text(), /id="proof-section"/);
      assert.equal(json.headers.get("content-type")?.includes("application/json"), true);
      assert.equal((await json.json()).accepted, 2);
    } finally {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });
});


describe("demo catalog", () => {
  it("contains the complete fictional multi-mineral showcase and required schema", async () => {
    const { readFile } = await import("node:fs/promises");
    const catalog = JSON.parse(await readFile(new URL("../../../web/public/catalog.json", import.meta.url), "utf8"));
    const assets = catalog.assets;
    assert.ok(Array.isArray(assets));

    const minerals = new Set(assets.map((asset) => asset.mineral));
    for (const mineral of ["Gold", "Iron ore", "Niobium", "Lithium", "Copper", "Bauxite", "Tin"]) {
      assert.equal(minerals.has(mineral), true, `missing mineral: ${mineral}`);
    }

    const lote001 = assets.find((asset) => asset.assetId === "MINA-VALEDOURO-LOTE-001");
    const lote002 = assets.find((asset) => asset.assetId === "MINA-VALEDOURO-LOTE-002");
    assert.equal(lote001.expectedOnChain, "Invalid");
    assert.equal(lote001.simulated, false);
    assert.equal(lote002.expectedOnChain, "Valid");
    assert.equal(lote002.simulated, false);

    const simulated = assets.filter((asset) => asset.simulated === true);
    assert.ok(simulated.length >= 6, "expected at least six simulated mineral lots");

    for (const asset of assets) {
      assert.equal(typeof asset.assetId, "string", `${asset.assetId} assetId`);
      assert.equal(typeof asset.mineral, "string", `${asset.assetId} mineral`);
      assert.equal(typeof asset.operator, "string", `${asset.assetId} operator`);
      assert.equal(typeof asset.referenceRegistered, "boolean", `${asset.assetId} referenceRegistered`);
      assert.equal(typeof asset.expectedOnChain, "string", `${asset.assetId} expectedOnChain`);
      assert.equal(typeof asset.origin?.lat, "number", `${asset.assetId} origin.lat`);
      assert.equal(typeof asset.origin?.lng, "number", `${asset.assetId} origin.lng`);
      assert.equal(typeof asset.origin?.label, "string", `${asset.assetId} origin.label`);
      assert.ok(Array.isArray(asset.custodyPath), `${asset.assetId} custodyPath`);
      assert.ok(asset.custodyPath.length >= 2, `${asset.assetId} custodyPath length`);
    }
  });

  it("marketplace shell exposes mineral/status filters fed by the live catalog", () => {
    assert.match(demo, /id="mineral-filter"/);
    assert.match(demo, /id="status-filter"/);
    assert.match(demo, /applyMarketplaceFilters\(\)/);
    assert.match(demo, /populateFilterOptions\(catalog\.assets \|\| \[\]\)/);
    assert.match(marketplace, /id="mineral-filter"/);
    assert.match(marketplace, /id="status-filter"/);
  });
});

describe("DEMO.md", () => {
  it("documents exact owner registration and fresh attest commands without committing secrets", async () => {
    const { readFile } = await import("node:fs/promises");
    const demoMd = await readFile(new URL("../../../DEMO.md", import.meta.url), "utf8");
    assert.match(demoMd, /casper-client put-transaction package/);
    assert.match(demoMd, /--session-entry-point register_reference/);
    assert.match(demoMd, /--session-arg "asset_id:string='SANDBOX-DEMO-LOTE-001'"/);
    assert.match(demoMd, /--session-arg "reference_seal:string='[a-f0-9]{64}'"/);
    assert.match(demoMd, /LASTRO_AGENT_ASSET_ID=SANDBOX-DEMO-LOTE-001/);
    assert.match(demoMd, /LASTRO_AGENT_PROVIDED_SEAL=/);
    assert.match(demoMd, /cargo \+nightly-2026-01-01 run --features livenet --bin attest/);
    assert.match(demoMd, /DEMONSTRATION — simulated assets, no investment offered/);
    assert.doesNotMatch(demoMd, /-----BEGIN .*PRIVATE KEY-----/);
  });
});
