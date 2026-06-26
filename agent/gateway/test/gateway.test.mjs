import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createGatewayApp,
  createMemoryAnchorLimiter
} from "../dist/index.js";

const PACKAGE_HASH = "hash-test-package";
const VALID_SEAL = "a".repeat(64);
const INVALID_SEAL = "b".repeat(64);

function makeDeps(overrides = {}) {
  const deps = {
    readVerdict(assetId) {
      if (assetId === "MINA-VALEDOURO-LOTE-001") {
        return Promise.resolve({
          assetId,
          verdict: "Invalid",
          seal: INVALID_SEAL,
          referenceSeal: VALID_SEAL,
          attester: "account-hash-demo",
          attestationTx: null,
          packageHash: PACKAGE_HASH,
          readAt: "2026-06-25T00:00:00.000Z",
          accepted: 2,
          rejected: 1,
        });
      }

      return Promise.resolve({
        assetId,
        verdict: "Unverified",
        seal: null,
        referenceSeal: null,
        attester: null,
        attestationTx: null,
        packageHash: PACKAGE_HASH,
        readAt: "2026-06-25T00:00:00.000Z",
        accepted: 2,
        rejected: 1,
      });
    },
    computeSeal() {
      return VALID_SEAL;
    },
    anchor(assetId, seal) {
      return Promise.resolve({
        txHash: `tx-${assetId}-${seal.slice(0, 6)}`,
        verdict: "Valid",
        explorerUrl: "https://testnet.cspr.live/transaction/demo",
      });
    },
    readProof() {
      return Promise.resolve({
        packageHash: PACKAGE_HASH,
        accepted: 2,
        rejected: 1,
        recentAttestations: [],
      });
    },
    readMintStatus() {
      return Promise.resolve({ isMinted: false, mintTx: null });
    },
    loadCatalog() {
      return Promise.resolve({ assets: [] });
    },
  };

  return { ...deps, ...overrides };
}

async function request(app, path, init) {
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}${path}`, init);
    const text = await response.text();
    return {
      status: response.status,
      headers: response.headers,
      body: text ? JSON.parse(text) : null,
    };
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

describe("lastro-gateway", () => {
  it("returns the live verdict payload and always includes the package hash", async () => {
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps(),
    });

    const response = await request(app, "/verdict/MINA-VALEDOURO-LOTE-001");

    assert.equal(response.status, 200);
    assert.equal(response.body.assetId, "MINA-VALEDOURO-LOTE-001");
    assert.equal(response.body.verdict, "Invalid");
    assert.equal(response.body.packageHash, PACKAGE_HASH);
    assert.equal(response.body.seal, INVALID_SEAL);
    assert.equal(response.body.referenceSeal, VALID_SEAL);
    assert.equal("accepted" in response.body, false);
    assert.equal("rejected" in response.body, false);
    assert.equal("recentAttestations" in response.body, false);
  });

  it("labels an asset with no attestation as Unverified instead of inventing proof", async () => {
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps(),
    });

    const response = await request(app, "/verdict/SIMULATED-LOT-999");

    assert.equal(response.status, 200);
    assert.equal(response.body.assetId, "SIMULATED-LOT-999");
    assert.equal(response.body.verdict, "Unverified");
    assert.equal(response.body.packageHash, PACKAGE_HASH);
    assert.equal(response.body.seal, null);
  });

  it("computes a local sandbox verdict by comparing against the on-chain reference seal", async () => {
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps(),
    });

    const response = await request(app, "/sandbox/compute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assetId: "MINA-VALEDOURO-LOTE-001", seal: VALID_SEAL }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.computedSeal, VALID_SEAL);
    assert.equal(response.body.referenceSeal, VALID_SEAL);
    assert.equal(response.body.match, true);
    assert.equal(response.body.verdict, "Valid");
  });

  it("blocks public anchoring outside the SANDBOX namespace", async () => {
    let calls = 0;
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({
        anchor() {
          calls += 1;
          return Promise.resolve({ txHash: "unexpected", verdict: "Valid", explorerUrl: "https://example.invalid" });
        },
      }),
    });

    const response = await request(app, "/sandbox/anchor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assetId: "MINA-VALEDOURO-LOTE-001", seal: VALID_SEAL }),
    });

    assert.equal(response.status, 403);
    assert.match(response.body.error, /SANDBOX/);
    assert.equal(calls, 0);
  });

  it("requires the explicit anchor flag before any on-chain sandbox write", async () => {
    let calls = 0;
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({
        anchor() {
          calls += 1;
          return Promise.resolve({ txHash: "unexpected", verdict: "Valid", explorerUrl: "https://example.invalid" });
        },
      }),
      anchorEnabled: false,
    });

    const response = await request(app, "/sandbox/anchor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assetId: "SANDBOX-OPEN-001", seal: VALID_SEAL }),
    });

    assert.equal(response.status, 403);
    assert.match(response.body.error, /disabled/i);
    assert.equal(calls, 0);
  });

  it("applies a global one-request-per-minute anchor limiter", async () => {
    let calls = 0;
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({
        anchor(assetId, seal) {
          calls += 1;
          return Promise.resolve({
            txHash: `${assetId}-${seal.slice(0, 8)}`,
            verdict: "Valid",
            explorerUrl: "https://testnet.cspr.live/transaction/demo",
          });
        },
      }),
      anchorEnabled: true,
      anchorSecretKeyPath: "/tmp/demo-secret.pem",
      anchorLimiter: createMemoryAnchorLimiter({ windowMs: 60_000, max: 1 }),
    });

    const first = await request(app, "/sandbox/anchor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assetId: "SANDBOX-OPEN-001", seal: VALID_SEAL }),
    });
    const second = await request(app, "/sandbox/anchor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assetId: "SANDBOX-OPEN-002", seal: VALID_SEAL }),
    });

    assert.equal(first.status, 200);
    assert.equal(second.status, 429);
    assert.equal(calls, 1);
  });

  it("returns proof counters and recent attestations", async () => {
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({
        readProof() {
          return Promise.resolve({
            packageHash: PACKAGE_HASH,
            accepted: 2,
            rejected: 1,
            recentAttestations: [
              {
                assetId: "MINA-VALEDOURO-LOTE-002",
                verdict: "Valid",
                tx: "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
                timestamp: null,
              },
            ],
          });
        },
      }),
    });

    const response = await request(app, "/proof");

    assert.equal(response.status, 200);
    assert.equal(response.body.packageHash, PACKAGE_HASH);
    assert.equal(response.body.accepted, 2);
    assert.equal(response.body.rejected, 1);
    assert.equal(response.body.recentAttestations[0].assetId, "MINA-VALEDOURO-LOTE-002");
  });

  it("returns a non-transferable provenance credential only for Valid and MintGate-minted assets", async () => {
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({
        readVerdict(assetId) {
          return Promise.resolve({
            assetId,
            verdict: "Valid",
            seal: VALID_SEAL,
            referenceSeal: VALID_SEAL,
            attester: "account-hash-valid-attester",
            attestationTx: "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
            packageHash: PACKAGE_HASH,
            readAt: "2026-06-25T00:00:00.000Z",
          });
        },
        readMintStatus(assetId) {
          assert.equal(assetId, "MINA-VALEDOURO-LOTE-002");
          return Promise.resolve({
            isMinted: true,
            mintTx: "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
          });
        },
      }),
    });

    const response = await request(app, "/certificate/MINA-VALEDOURO-LOTE-002");

    assert.equal(response.status, 200);
    assert.equal(response.body.type, "ProvenanceCredential");
    assert.equal(response.body.assetId, "MINA-VALEDOURO-LOTE-002");
    assert.equal(response.body.verdict, "Valid");
    assert.equal(response.body.seal, VALID_SEAL);
    assert.equal(response.body.attester, "account-hash-valid-attester");
    assert.equal(response.body.attestationTx, "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4");
    assert.equal(response.body.transferable, false);
  });

  it("404s certificate requests when the ProofOfOrigin verdict is not Valid", async () => {
    let mintReads = 0;
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({
        readMintStatus() {
          mintReads += 1;
          return Promise.resolve({ isMinted: true, mintTx: "unexpected" });
        },
      }),
    });

    const response = await request(app, "/certificate/MINA-VALEDOURO-LOTE-001");

    assert.equal(response.status, 404);
    assert.equal(response.body.error, "certificate_not_available");
    assert.equal(mintReads, 0);
  });

  it("404s certificate requests when MintGate has not symbolically minted the Valid asset", async () => {
    const app = createGatewayApp({
      packageHash: PACKAGE_HASH,
      dependencies: makeDeps({
        readVerdict(assetId) {
          return Promise.resolve({
            assetId,
            verdict: "Valid",
            seal: VALID_SEAL,
            referenceSeal: VALID_SEAL,
            attester: "account-hash-valid-attester",
            attestationTx: null,
            packageHash: PACKAGE_HASH,
            readAt: "2026-06-25T00:00:00.000Z",
          });
        },
        readMintStatus() {
          return Promise.resolve({ isMinted: false, mintTx: null });
        },
      }),
    });

    const response = await request(app, "/certificate/MINA-VALEDOURO-LOTE-002");

    assert.equal(response.status, 404);
    assert.equal(response.body.error, "certificate_not_available");
  });

  it("allows the configured Vercel origin and localhost development origins through CORS", async () => {
    const previous = process.env.ALLOWED_ORIGINS;
    process.env.ALLOWED_ORIGINS = "https://lastro-landing.vercel.app";
    try {
      const app = createGatewayApp({
        packageHash: PACKAGE_HASH,
        dependencies: makeDeps(),
      });

      const vercel = await request(app, "/health", {
        headers: { origin: "https://lastro-landing.vercel.app" },
      });
      const local = await request(app, "/health", {
        headers: { origin: "http://localhost:5173" },
      });

      assert.equal(vercel.status, 200);
      assert.equal(vercel.headers.get("access-control-allow-origin"), "https://lastro-landing.vercel.app");
      assert.equal(local.status, 200);
      assert.equal(local.headers.get("access-control-allow-origin"), "http://localhost:5173");
    } finally {
      if (previous === undefined) {
        delete process.env.ALLOWED_ORIGINS;
      } else {
        process.env.ALLOWED_ORIGINS = previous;
      }
    }
  });

  it("does not emit CORS allow-origin for unconfigured browser origins", async () => {
    const previous = process.env.ALLOWED_ORIGINS;
    process.env.ALLOWED_ORIGINS = "https://lastro-landing.vercel.app";
    try {
      const app = createGatewayApp({
        packageHash: PACKAGE_HASH,
        dependencies: makeDeps(),
      });

      const response = await request(app, "/health", {
        headers: { origin: "https://example.invalid" },
      });

      assert.equal(response.status, 200);
      assert.equal(response.headers.get("access-control-allow-origin"), null);
    } finally {
      if (previous === undefined) {
        delete process.env.ALLOWED_ORIGINS;
      } else {
        process.env.ALLOWED_ORIGINS = previous;
      }
    }
  });

});
