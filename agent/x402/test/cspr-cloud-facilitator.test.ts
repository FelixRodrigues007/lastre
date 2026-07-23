import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CsprCloudFacilitator } from "../src/cspr-cloud-facilitator.js";
import {
  WCSPR_TESTNET_PACKAGE_HASH,
  CSPR_CLOUD_FACILITATOR_URL,
  buildCloudQuoteMeta,
} from "../src/cspr-cloud-types.js";
import {
  createFacilitatorFromEnv,
  createOptionalCsprCloudFromEnv,
  resolveX402Mode,
  resolveWcsprPayTo,
} from "../src/create-facilitator.js";

describe("resolveX402Mode", () => {
  it("accepts cspr_cloud aliases", () => {
    assert.equal(resolveX402Mode("cspr_cloud"), "cspr_cloud");
    assert.equal(resolveX402Mode("cspr-cloud"), "cspr_cloud");
    assert.equal(resolveX402Mode("wcspr"), "cspr_cloud");
    assert.equal(resolveX402Mode("casper"), "casper");
    assert.equal(resolveX402Mode("mock"), "mock");
  });
});

describe("buildCloudQuoteMeta", () => {
  it("advertises WCSPR testnet package and official docs", () => {
    const meta = buildCloudQuoteMeta({ payTo: "00" + "ab".repeat(32) });
    assert.equal(meta.asset, WCSPR_TESTNET_PACKAGE_HASH);
    assert.equal(meta.assetSymbol, "WCSPR");
    assert.equal(meta.facilitatorUrl, CSPR_CLOUD_FACILITATOR_URL);
    assert.match(meta.docs, /docs\.cspr\.cloud/);
    assert.match(meta.examplesRepo, /casper-x402/);
  });
});

describe("CsprCloudFacilitator", () => {
  it("requires token and payTo", () => {
    assert.throws(() => new CsprCloudFacilitator({ apiToken: "", payTo: "00" + "11".repeat(32) }));
    assert.throws(() => new CsprCloudFacilitator({ apiToken: "tok", payTo: "" }));
  });

  it("verify fails without cloud EIP-712 body", async () => {
    const f = new CsprCloudFacilitator({
      apiToken: "test-token",
      payTo: "00" + "22".repeat(32),
      fetchImpl: async () => {
        throw new Error("should not call network");
      },
    });
    const req = {
      scheme: "exact" as const,
      network: "casper:casper-test",
      maxAmountRequired: 1_000_000_000,
      asset: "WCSPR",
      payTo: "00" + "22".repeat(32),
      resource: "/verify",
      nonce: "n1",
      description: "t",
    };
    const v = await f.verifyPayment(
      { nonce: "n1", amount: 1_000_000_000, from: "payer", sig: "x" },
      req,
    );
    assert.equal(v.ok, false);
  });

  it("settleOfficial success path via mocked fetch", async () => {
    const calls: string[] = [];
    const f = new CsprCloudFacilitator({
      apiToken: "test-token",
      payTo: "00" + "33".repeat(32),
      fetchImpl: async (url, init) => {
        const u = String(url);
        calls.push(u);
        if (u.endsWith("/verify")) {
          return new Response(JSON.stringify({ isValid: true, payer: "00" + "aa".repeat(32) }), {
            status: 200,
          });
        }
        if (u.endsWith("/settle")) {
          return new Response(
            JSON.stringify({
              success: true,
              transaction: "abcd".repeat(16),
              network: "casper:casper-test",
              payer: "00" + "aa".repeat(32),
            }),
            { status: 200 },
          );
        }
        return new Response("nope", { status: 404 });
      },
    });

    const body = {
      paymentPayload: {
        x402Version: 2 as const,
        resource: { url: "https://app-api.lastre.io/api/x402/provenance/CARBON" },
        accepted: {
          scheme: "exact" as const,
          network: "casper:casper-test",
          asset: WCSPR_TESTNET_PACKAGE_HASH,
          amount: "1000000000",
          payTo: "00" + "33".repeat(32),
          maxTimeoutSeconds: 900,
        },
        payload: {
          signature: "01" + "ab".repeat(64),
          publicKey: "01" + "cd".repeat(32),
          authorization: {
            from: "00" + "aa".repeat(32),
            to: "00" + "33".repeat(32),
            value: "1000000000",
            validAfter: "0",
            validBefore: "9999999999",
            nonce: "ef".repeat(32),
          },
        },
      },
      paymentRequirements: f.getCloudPaymentRequirements(),
    };

    const result = await f.settleOfficial(body);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.txHash, "abcd".repeat(16));
      assert.equal(result.settlementKind, "casper_deploy");
    }
    assert.ok(calls.some((c) => c.endsWith("/verify")));
    assert.ok(calls.some((c) => c.endsWith("/settle")));
  });

  it("getSupported uses Authorization header", async () => {
    let auth: string | null = null;
    const f = new CsprCloudFacilitator({
      apiToken: "secret-token",
      payTo: "00" + "44".repeat(32),
      fetchImpl: async (_url, init) => {
        const headers = init?.headers as Record<string, string>;
        auth = headers.authorization ?? headers.Authorization ?? null;
        return new Response(
          JSON.stringify({
            kinds: [{ x402Version: 2, scheme: "exact", network: "casper:casper-test" }],
          }),
          { status: 200 },
        );
      },
    });
    const s = await f.getSupported();
    assert.equal(auth, "secret-token");
    assert.equal(s.kinds[0]?.network, "casper:casper-test");
  });
});

describe("createFacilitatorFromEnv cspr_cloud", () => {
  it("builds CsprCloudFacilitator when token + payTo set", () => {
    const f = createFacilitatorFromEnv({
      LASTRE_X402_MODE: "cspr_cloud",
      CSPR_CLOUD_API_TOKEN: "tok",
      LASTRE_X402_PAY_TO: "00" + "55".repeat(32),
    });
    assert.equal(f.mode, "cspr_cloud");
  });

  it("falls back to mock without token", () => {
    const f = createFacilitatorFromEnv({
      LASTRE_X402_MODE: "cspr_cloud",
      LASTRE_X402_PAY_TO: "00" + "55".repeat(32),
    });
    assert.equal(f.mode, "mock");
  });
});

describe("dual stack side-car", () => {
  it("resolveWcsprPayTo prefers LASTRE_WCSPR_PAY_TO", () => {
    assert.equal(
      resolveWcsprPayTo({
        LASTRE_WCSPR_PAY_TO: "00" + "ab".repeat(32),
        LASTRE_X402_PAY_TO: "01deadbeef",
      }),
      "00" + "ab".repeat(32),
    );
  });

  it("createOptionalCsprCloudFromEnv works with casper primary env", () => {
    const cloud = createOptionalCsprCloudFromEnv({
      LASTRE_X402_MODE: "casper",
      CSPR_CLOUD_API_TOKEN: "tok",
      LASTRE_WCSPR_PAY_TO: "00" + "66".repeat(32),
    });
    assert.ok(cloud);
    assert.equal(cloud!.mode, "cspr_cloud");
  });

  it("side-car null without 00+64hex payTo", () => {
    const cloud = createOptionalCsprCloudFromEnv({
      CSPR_CLOUD_API_TOKEN: "tok",
      LASTRE_X402_PAY_TO: "013a7fadf901393a1ddecefb3fa967d9d782bbe1d3e0729ed526310840217b47f0",
    });
    assert.equal(cloud, null);
  });
});
