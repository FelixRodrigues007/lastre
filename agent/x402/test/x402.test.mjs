import test from "node:test";
import { equal, notEqual, ok } from "node:assert/strict";
import {
  createLastroX402Server,
  createMockPaymentHeader,
  DEFAULT_PAYMENT_REQUIREMENTS,
  TAMPERED_ASSET_ID,
  VALID_ASSET_ID,
} from "../dist/index.js";

async function withServer(fn) {
  const { server } = createLastroX402Server();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected an ephemeral TCP port");
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}

async function getRequirements(baseUrl, assetId = VALID_ASSET_ID) {
  const response = await fetch(`${baseUrl}/verify?assetId=${encodeURIComponent(assetId)}`);
  const body = await response.json();
  return { response, body, requirements: body.requirements };
}

test("GET /verify without payment returns 402 with well-formed x402 requirements", async () => {
  await withServer(async (baseUrl) => {
    const { response, body, requirements } = await getRequirements(baseUrl);

    equal(response.status, 402);
    equal(body.error, "payment_required");
    equal(requirements.scheme, "exact");
    equal(requirements.network, "casper-test");
    equal(requirements.asset, "CSPR");
    equal(requirements.resource, "/verify");
    equal(requirements.description, "Lastre provenance verification");
    equal(requirements.maxAmountRequired, DEFAULT_PAYMENT_REQUIREMENTS.maxAmountRequired);
    ok(requirements.nonce);
    ok(requirements.payTo);
  });
});

test("valid payment for valid lot returns 200 Valid with seal equal to referenceSeal", async () => {
  await withServer(async (baseUrl) => {
    const { requirements } = await getRequirements(baseUrl, VALID_ASSET_ID);
    const payment = createMockPaymentHeader(requirements, { from: "consumer-valid" });

    const response = await fetch(`${baseUrl}/verify?assetId=${encodeURIComponent(VALID_ASSET_ID)}`, {
      headers: { "X-PAYMENT": payment },
    });
    const body = await response.json();

    equal(response.status, 200);
    equal(body.assetId, VALID_ASSET_ID);
    equal(body.verdict, "Valid");
    equal(body.seal, body.referenceSeal);
    equal(body.passport.seal, body.seal);
    ok(body.settlement.txHash);
    equal(response.headers.get("x-payment-response"), body.settlement.txHash);
  });
});

test("valid payment for tampered lot returns 200 Invalid with mismatch proof", async () => {
  await withServer(async (baseUrl) => {
    const { requirements } = await getRequirements(baseUrl, TAMPERED_ASSET_ID);
    const payment = createMockPaymentHeader(requirements, { from: "consumer-tampered" });

    const response = await fetch(`${baseUrl}/verify?assetId=${encodeURIComponent(TAMPERED_ASSET_ID)}`, {
      headers: { "X-PAYMENT": payment },
    });
    const body = await response.json();

    equal(response.status, 200);
    equal(body.assetId, TAMPERED_ASSET_ID);
    equal(body.verdict, "Invalid");
    notEqual(body.seal, body.referenceSeal);
    equal(body.passport.seal, body.seal);
    ok(body.settlement.txHash);
    equal(response.headers.get("x-payment-response"), body.settlement.txHash);
  });
});

test("payment with insufficient amount returns 402 and does not release verification", async () => {
  await withServer(async (baseUrl) => {
    const { requirements } = await getRequirements(baseUrl, VALID_ASSET_ID);
    const payment = createMockPaymentHeader(requirements, {
      from: "consumer-low-amount",
      amount: requirements.maxAmountRequired - 1,
    });

    const response = await fetch(`${baseUrl}/verify?assetId=${encodeURIComponent(VALID_ASSET_ID)}`, {
      headers: { "X-PAYMENT": payment },
    });
    const body = await response.json();

    equal(response.status, 402);
    equal(body.error, "payment_required");
    equal(body.reason, "amount_insufficient");
    equal(body.verdict, undefined);
    equal(response.headers.get("x-payment-response"), null);
  });
});

test("replay of the same nonce/payment is rejected on the second attempt", async () => {
  await withServer(async (baseUrl) => {
    const { requirements } = await getRequirements(baseUrl, VALID_ASSET_ID);
    const payment = createMockPaymentHeader(requirements, { from: "consumer-replay" });

    const first = await fetch(`${baseUrl}/verify?assetId=${encodeURIComponent(VALID_ASSET_ID)}`, {
      headers: { "X-PAYMENT": payment },
    });
    equal(first.status, 200);

    const second = await fetch(`${baseUrl}/verify?assetId=${encodeURIComponent(VALID_ASSET_ID)}`, {
      headers: { "X-PAYMENT": payment },
    });
    const secondBody = await second.json();

    equal(second.status, 402);
    equal(secondBody.error, "payment_required");
    equal(secondBody.reason, "nonce_replayed");
  });
});
