import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { createGatewayApp, createMemoryAnchorLimiter } from "../dist/index.js";
import { computeSeal } from "../../sealer/dist/src/sealer.js";

const PACKAGE_HASH = "hash-test-package";

const CATALOG = {
  perimeter: {
    label: "Fictional perimeter — DEMONSTRATION",
    polygon: [
      { lat: -29.98, lng: -53.3 },
      { lat: -29.98, lng: -53.1 },
      { lat: -30.12, lng: -53.1 },
      { lat: -30.12, lng: -53.3 },
    ],
  },
  assets: [
    {
      assetId: "MINA-VALEDOURO-LOTE-002",
      name: "Vale do Ouro Lot 002",
      mineral: "Gold",
      operator: "Mineradora Vale do Ouro Ltda. (fictional)",
      origin: { lat: -30.08, lng: -53.15, label: "Sector B — fictional origin" },
      referenceRegistered: true,
      expectedOnChain: "Valid",
      simulated: false,
    },
    {
      assetId: "SANDBOX-ESTANHO-LOTE-008",
      name: "Tin Sandbox Lot 008",
      mineral: "Tin",
      operator: "Rondônia Estanho Verificações Ltda. (fictional)",
      origin: { lat: -10.82, lng: -63.2, label: "Channel T8 — fictional origin" },
      referenceRegistered: false,
      expectedOnChain: "Simulated",
      simulated: true,
    },
  ],
};

function makeDeps(overrides = {}) {
  return {
    readVerdict(assetId) {
      return Promise.resolve({
        assetId,
        verdict: "Unverified",
        seal: null,
        referenceSeal: null,
        attester: null,
        attestationTx: null,
        packageHash: PACKAGE_HASH,
        readAt: "2026-06-25T00:00:00.000Z",
      });
    },
    computeSeal,
    anchor(assetId, seal) {
      return Promise.resolve({
        txHash: `tx-${assetId}-${seal.slice(0, 8)}`,
        verdict: "Invalid",
        explorerUrl: `https://testnet.cspr.live/transaction/tx-${assetId}`,
      });
    },
    readProof() {
      return Promise.resolve({ packageHash: PACKAGE_HASH, accepted: 2, rejected: 1, recentAttestations: [] });
    },
    readMintStatus() {
      return Promise.resolve({ isMinted: false, mintTx: null });
    },
    loadCatalog() {
      return Promise.resolve(CATALOG);
    },
    ...overrides,
  };
}

async function withServer(app, fn) {
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address();
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

async function getJson(base, path, init) {
  const response = await fetch(`${base}${path}`, init);
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

const HEX64 = /^[0-9a-f]{64}$/;

describe("fraud challenge generation", () => {
  it("returns a genuine/tampered pair with real, deterministic seals for the easy difficulty", async () => {
    const app = createGatewayApp({ packageHash: PACKAGE_HASH, dependencies: makeDeps() });

    await withServer(app, async (base) => {
      const { status, body } = await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008&difficulty=easy");

      assert.equal(status, 200);
      assert.equal(body.assetId, "SANDBOX-ESTANHO-LOTE-008");
      assert.match(body.challengeId, /^ch_/);
      assert.ok(["A", "B"].includes(body.correctFraud));
      assert.match(body.difference, /mass/i);

      for (const side of ["sealA", "sealB"]) {
        assert.match(body[side].seal, HEX64, `${side} seal is 64-hex`);
        assert.equal(typeof body[side].measurement.massGrams, "number");
        // The seal is computed by the REAL sealer over the returned measurement.
        assert.equal(computeSeal(body[side].measurement), body[side].seal, `${side} seal is reproducible`);
      }

      assert.notEqual(body.sealA.seal, body.sealB.seal, "a one-field change yields a different seal");
      assert.equal(body.difficulty, "easy");
      assert.match(JSON.stringify(body), /DEMONSTRATION/);
    });
  });

  it("defaults to a referenceRegistered catalog lot when no assetId is supplied", async () => {
    const app = createGatewayApp({ packageHash: PACKAGE_HASH, dependencies: makeDeps() });
    await withServer(app, async (base) => {
      const { status, body } = await getJson(base, "/fraud-challenge");
      assert.equal(status, 200);
      assert.equal(body.assetId, "MINA-VALEDOURO-LOTE-002");
    });
  });

  it("404s when the requested lot is not in the fictional catalog", async () => {
    const app = createGatewayApp({ packageHash: PACKAGE_HASH, dependencies: makeDeps() });
    await withServer(app, async (base) => {
      const { status, body } = await getJson(base, "/fraud-challenge?assetId=DOES-NOT-EXIST");
      assert.equal(status, 404);
      assert.equal(body.error, "asset_not_in_catalog");
    });
  });

  it("produces a subtle but seal-breaking tamper in hard mode", async () => {
    const app = createGatewayApp({ packageHash: PACKAGE_HASH, dependencies: makeDeps() });
    await withServer(app, async (base) => {
      const { status, body } = await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008&difficulty=hard");
      assert.equal(status, 200);
      assert.equal(body.difficulty, "hard");
      assert.notEqual(body.sealA.seal, body.sealB.seal);
      assert.equal(computeSeal(body.sealA.measurement), body.sealA.seal);
      assert.equal(computeSeal(body.sealB.measurement), body.sealB.seal);
    });
  });
});

describe("fraud guess scoring", () => {
  it("confirms a correct guess: the tampered card is Invalid, the genuine card is Valid", async () => {
    const app = createGatewayApp({ packageHash: PACKAGE_HASH, dependencies: makeDeps() });
    await withServer(app, async (base) => {
      const challenge = (await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008&difficulty=easy")).body;
      const { status, body } = await getJson(base, "/fraud/guess", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId, userChoice: challenge.correctFraud, currentStreak: 6 }),
      });

      assert.equal(status, 200);
      assert.equal(body.correct, true);
      const fraudVerdict = challenge.correctFraud === "A" ? body.verdictA : body.verdictB;
      const genuineVerdict = challenge.correctFraud === "A" ? body.verdictB : body.verdictA;
      assert.equal(fraudVerdict, "Invalid");
      assert.equal(genuineVerdict, "Valid");
      assert.equal(body.computedSeals.A, challenge.sealA.seal);
      assert.equal(body.computedSeals.B, challenge.sealB.seal);
      assert.equal(body.currentStreak, 7);
      assert.ok(body.score > 0 && body.score <= 100);
    });
  });

  it("resets the streak and score to zero on a wrong guess", async () => {
    const app = createGatewayApp({ packageHash: PACKAGE_HASH, dependencies: makeDeps() });
    await withServer(app, async (base) => {
      const challenge = (await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008").catch(() => null))?.body
        ?? (await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008")).body;
      const wrongChoice = challenge.correctFraud === "A" ? "B" : "A";
      const { status, body } = await getJson(base, "/fraud/guess", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId, userChoice: wrongChoice, currentStreak: 6 }),
      });

      assert.equal(status, 200);
      assert.equal(body.correct, false);
      assert.equal(body.currentStreak, 0);
      assert.equal(body.score, 0);
    });
  });

  it("rejects an invalid userChoice with 400", async () => {
    const app = createGatewayApp({ packageHash: PACKAGE_HASH, dependencies: makeDeps() });
    await withServer(app, async (base) => {
      const challenge = (await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008")).body;
      const { status } = await getJson(base, "/fraud/guess", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId, userChoice: "C" }),
      });
      assert.equal(status, 400);
    });
  });

  it("404s an unknown challengeId and 409s a replayed guess", async () => {
    const app = createGatewayApp({ packageHash: PACKAGE_HASH, dependencies: makeDeps() });
    await withServer(app, async (base) => {
      const unknown = await getJson(base, "/fraud/guess", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: "ch_missing", userChoice: "A" }),
      });
      assert.equal(unknown.status, 404);

      const challenge = (await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008")).body;
      const first = await getJson(base, "/fraud/guess", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId, userChoice: "A" }),
      });
      assert.equal(first.status, 200);
      const replay = await getJson(base, "/fraud/guess", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId, userChoice: "A" }),
      });
      assert.equal(replay.status, 409);
    });
  });
});

describe("fraud anchor-tampered (reuses sandbox guards)", () => {
  it("blocks anchoring the tampered seal outside the SANDBOX namespace", async () => {
    let calls = 0;
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({ anchor() { calls += 1; return Promise.resolve({ txHash: "x", verdict: "Invalid", explorerUrl: "https://example.invalid" }); } }),
      anchorEnabled: true,
      anchorSecretKeyPath: "/tmp/demo-secret.pem",
    });
    await withServer(app, async (base) => {
      const challenge = (await getJson(base, "/fraud-challenge?assetId=MINA-VALEDOURO-LOTE-002")).body;
      const { status, body } = await getJson(base, "/fraud/anchor-tampered", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId, assetId: "MINA-VALEDOURO-LOTE-002" }),
      });
      assert.equal(status, 403);
      assert.match(body.error, /SANDBOX/);
      assert.equal(calls, 0);
    });
  });

  it("blocks anchoring when the controlled flag is disabled", async () => {
    let calls = 0;
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({ anchor() { calls += 1; return Promise.resolve({ txHash: "x", verdict: "Invalid", explorerUrl: "https://example.invalid" }); } }),
      anchorEnabled: false,
    });
    await withServer(app, async (base) => {
      const challenge = (await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008")).body;
      const { status, body } = await getJson(base, "/fraud/anchor-tampered", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId }),
      });
      assert.equal(status, 403);
      assert.match(body.error, /disabled/i);
      assert.equal(calls, 0);
    });
  });

  it("anchors the tampered seal as Invalid in a controlled SANDBOX run", async () => {
    const anchored = [];
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({
        anchor(assetId, seal) {
          anchored.push({ assetId, seal });
          return Promise.resolve({ txHash: `tx-${seal.slice(0, 8)}`, verdict: "Invalid", explorerUrl: `https://testnet.cspr.live/transaction/tx-${seal.slice(0, 8)}` });
        },
      }),
      anchorEnabled: true,
      anchorSecretKeyPath: "/tmp/demo-secret.pem",
      anchorLimiter: createMemoryAnchorLimiter({ windowMs: 60_000, max: 1 }),
    });
    await withServer(app, async (base) => {
      const challenge = (await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008")).body;
      const tamperedSeal = challenge.correctFraud === "A" ? challenge.sealA.seal : challenge.sealB.seal;

      const { status, body } = await getJson(base, "/fraud/anchor-tampered", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId }),
      });

      assert.equal(status, 200);
      assert.equal(body.verdict, "Invalid");
      assert.match(body.txHash, /^tx-/);
      assert.equal(anchored.length, 1);
      assert.equal(anchored[0].assetId, "SANDBOX-ESTANHO-LOTE-008");
      assert.equal(anchored[0].seal, tamperedSeal, "anchors exactly the tampered seal");
    });
  });

  it("refuses fraud anchoring while sandbox auto-register is enabled", async () => {
    const original = process.env.SANDBOX_REGISTER_REFERENCE;
    process.env.SANDBOX_REGISTER_REFERENCE = "true";
    let calls = 0;
    try {
      const app = createGatewayApp({
        packageHash: PACKAGE_HASH,
        dependencies: makeDeps({
          anchor() {
            calls += 1;
            return Promise.resolve({ txHash: "x", verdict: "Invalid", explorerUrl: "https://example.invalid" });
          },
        }),
        anchorEnabled: true,
        anchorSecretKeyPath: "/tmp/demo-secret.pem",
      });
      await withServer(app, async (base) => {
        const challenge = (await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008")).body;
        const { status, body } = await getJson(base, "/fraud/anchor-tampered", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ challengeId: challenge.challengeId }),
        });
        assert.equal(status, 409);
        assert.match(body.error, /pre-registered/i);
        assert.equal(calls, 0);
      });
    } finally {
      if (original === undefined) {
        delete process.env.SANDBOX_REGISTER_REFERENCE;
      } else {
        process.env.SANDBOX_REGISTER_REFERENCE = original;
      }
    }
  });

  it("does not claim success if the controlled write does not read back Invalid", async () => {
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({
        anchor(assetId, seal) {
          return Promise.resolve({
            txHash: `tx-${assetId}-${seal.slice(0, 8)}`,
            verdict: "Valid",
            explorerUrl: "https://testnet.cspr.live/transaction/demo",
          });
        },
      }),
      anchorEnabled: true,
      anchorSecretKeyPath: "/tmp/demo-secret.pem",
      anchorLimiter: createMemoryAnchorLimiter({ windowMs: 60_000, max: 2 }),
    });
    await withServer(app, async (base) => {
      const challenge = (await getJson(base, "/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008")).body;
      const { status, body } = await getJson(base, "/fraud/anchor-tampered", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId }),
      });
      assert.equal(status, 409);
      assert.equal(body.error, "tampered_anchor_not_invalid");
      assert.equal(body.actualVerdict, "Valid");
    });
  });
});

describe("spot-fraud frontend", () => {
  const mapPath = new URL("../../../web/spot-fraud.html", import.meta.url);

  it("serves the spot-fraud page at /spot-fraud", async () => {
    const app = createGatewayApp({ packageHash: PACKAGE_HASH, dependencies: makeDeps() });
    await withServer(app, async (base) => {
      const response = await fetch(`${base}/spot-fraud`, { headers: { accept: "text/html" } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type")?.includes("text/html"), true);
      assert.match(await response.text(), /id="spot-fraud-page"/);
    });
  });

  it("uses the fraud endpoints, keeps the demonstration framing, and respects reduced motion", () => {
    assert.equal(existsSync(mapPath), true, "web/spot-fraud.html should exist");
    const html = readFileSync(mapPath, "utf8");
    assert.match(html, /DEMONSTRATION — simulated assets, no investment offered/);
    assert.match(html, /Spot the Fraud/);
    assert.match(html, /fetch\(gatewayUrl\(`\/fraud-challenge/);
    assert.match(html, /fetch\(gatewayUrl\("\/fraud\/guess"\)/);
    assert.match(html, /fetch\(gatewayUrl\("\/fraud\/anchor-tampered"\)/);
    assert.match(html, /This is the fraud/);
    assert.match(html, /@keyframes/);
    assert.match(html, /prefers-reduced-motion/);
    assert.match(html, /testnet\.cspr\.live\/transaction\//);
    assert.doesNotMatch(html, /\b(buy|sell|invest|yield|ROI|price|token)\b/i);
  });

  it("links to the spot-fraud game from the demo and map navigation", () => {
    const demo = readFileSync(new URL("../../../web/demo.html", import.meta.url), "utf8");
    const map = readFileSync(new URL("../../../web/map.html", import.meta.url), "utf8");
    assert.match(demo, /href="\/spot-fraud"/);
    assert.match(map, /href="\/spot-fraud"/);
  });
});
