import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { createGatewayApp } from "../dist/index.js";

const demo = readFileSync(new URL("../../../web/demo.html", import.meta.url), "utf8");
const marketplace = readFileSync(new URL("../../../web/marketplace.html", import.meta.url), "utf8");

function assertLivePage(html, label) {
  assert.match(html, /DEMONSTRATION — simulated assets, no investment offered/, `${label} keeps the mandatory banner`);
  assert.match(html, /fetch\(gatewayUrl\("\/catalog"\)\)/, `${label} loads catalog from the gateway`);
  assert.match(html, /fetch\(gatewayUrl\(`\/verdict\/\$\{encodeURIComponent\(asset\.assetId\)\}`\)\)/, `${label} fetches a live verdict per catalog asset`);
  assert.match(html, /fetch\(gatewayUrl\("\/proof"\)\)/, `${label} loads live proof counters/events`);
  assert.match(html, /fetch\(gatewayUrl\("\/sandbox\/compute"\)/, `${label} posts sandbox compute to the gateway`);
  assert.match(html, /fetch\(gatewayUrl\("\/sandbox\/anchor"\)/, `${label} posts controlled anchor to the gateway`);
  assert.match(html, /testnet\.cspr\.live\/transaction\//, `${label} links proof events and anchors to cspr.live transactions`);
  assert.match(html, /Simulated/, `${label} clearly labels simulated catalog assets`);
  assert.doesNotMatch(html, /const CATALOG\s*=\s*\[/, `${label} does not use embedded catalog data`);
  assert.doesNotMatch(html, /alert\(`Anchored!/, `${label} renders anchor result inline instead of pretending success in an alert`);
}

describe("web frontend gateway integration", () => {
  it("demo.html calls the live gateway APIs and preserves honesty framing", () => {
    assertLivePage(demo, "demo.html");
  });

  it("marketplace.html calls the live gateway APIs and preserves honesty framing", () => {
    assertLivePage(marketplace, "marketplace.html");
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
