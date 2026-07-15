import test from "node:test";
import { equal, match, ok } from "node:assert/strict";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  CasperFacilitator,
  extractTransferTxHash,
  transferIdFromNonce,
  signMockPayment,
  createFacilitatorFromEnv,
  prepareX402SecretsFromEnv,
  MockFacilitator,
} from "../dist/index.js";

test("transferIdFromNonce is stable u64 string", () => {
  const a = transferIdFromNonce("quote-nonce-1");
  const b = transferIdFromNonce("quote-nonce-1");
  equal(a, b);
  match(a, /^\d+$/);
});

test("extractTransferTxHash finds common casper-client shapes", () => {
  equal(
    extractTransferTxHash('transaction_hash: "aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899"'),
    "aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899",
  );
  equal(
    extractTransferTxHash('{"deploy_hash":"11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff"}'),
    "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
  );
});

test("CasperFacilitator settlePayment returns casper_deploy with mocked exec", async () => {
  const dir = join(tmpdir(), `lastre-x402-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  const keyPath = join(dir, "secret_key.pem");
  writeFileSync(keyPath, "-----BEGIN FAKE-----\n00\n-----END FAKE-----\n");

  const realHash = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
  const fac = new CasperFacilitator({
    secretKeyPath: keyPath,
    targetAccount: "01" + "ab".repeat(32),
    execFile: async () => ({
      stdout: `transfer succeeded\ntransaction_hash: "${realHash}"\n`,
      stderr: "",
    }),
  });

  equal(fac.mode, "casper");
  const requirements = {
    scheme: "exact",
    network: "casper-test",
    maxAmountRequired: 100_000_000,
    asset: "CSPR",
    payTo: "01" + "ab".repeat(32),
    resource: "/verify",
    nonce: "n-1",
    description: "Lastre provenance verification",
  };
  const payment = {
    nonce: "n-1",
    amount: 100_000_000,
    from: "agent",
    sig: signMockPayment({ nonce: "n-1", amount: 100_000_000, from: "agent" }),
  };

  const v = await fac.verifyPayment(payment, requirements);
  equal(v.ok, true);
  const s = await fac.settlePayment(payment, requirements);
  equal(s.kind, "casper_deploy");
  equal(s.txHash, realHash);

  // anti-replay
  const v2 = await fac.verifyPayment(payment, requirements);
  equal(v2.ok, false);
});

test("createFacilitatorFromEnv defaults to mock", () => {
  const f = createFacilitatorFromEnv({ LASTRE_X402_MODE: "mock" });
  ok(f instanceof MockFacilitator);
  equal(f.mode, "mock");
});

test("createFacilitatorFromEnv casper without key falls back to mock", () => {
  const f = createFacilitatorFromEnv({
    LASTRE_X402_MODE: "casper",
    LASTRE_X402_SECRET_KEY_PATH: "/no/such/key.pem",
    LASTRE_X402_PAY_TO: "01" + "cd".repeat(32),
  });
  equal(f.mode, "mock");
});

test("createFacilitatorFromEnv materializes PEM secret", () => {
  const env = {
    LASTRE_X402_MODE: "casper",
    LASTRE_X402_SECRET_KEY_PEM:
      "-----BEGIN PRIVATE KEY-----\\nAAECAwQFBgc=\\n-----END PRIVATE KEY-----",
    LASTRE_X402_PAY_TO: "01" + "ef".repeat(32),
  };
  const path = prepareX402SecretsFromEnv(env);
  ok(path && existsSync(path));
  // Key file is fake PEM so CasperFacilitator still constructs (existsSync only)
  const f = createFacilitatorFromEnv(env);
  equal(f.mode, "casper");
});

test("normalizePem repairs single-line and quoted PEMs", async () => {
  const { normalizePem } = await import("../dist/index.js");
  const oneLine =
    "-----BEGIN PRIVATE KEY-----AAECAwQFBgc=-----END PRIVATE KEY-----";
  const n = normalizePem(oneLine);
  ok(n.includes("\n"));
  ok(n.startsWith("-----BEGIN PRIVATE KEY-----\n"));
  ok(n.trimEnd().endsWith("-----END PRIVATE KEY-----"));

  const quoted = '"-----BEGIN PRIVATE KEY-----\\nAAEC\\n-----END PRIVATE KEY-----"';
  const n2 = normalizePem(quoted);
  equal(n2.split("\n").filter(Boolean).length, 3);
});

test("createFacilitatorFromEnv materializes B64 secret", () => {
  const pem = "-----BEGIN PRIVATE KEY-----\nAAECAwQFBgc=\n-----END PRIVATE KEY-----\n";
  const b64 = Buffer.from(pem, "utf8").toString("base64");
  const env = {
    LASTRE_X402_MODE: "casper",
    LASTRE_X402_SECRET_KEY_B64: b64,
    LASTRE_X402_PAY_TO: "01" + "ab".repeat(32),
  };
  const path = prepareX402SecretsFromEnv(env);
  ok(path && existsSync(path));
  equal(createFacilitatorFromEnv(env).mode, "casper");
});
