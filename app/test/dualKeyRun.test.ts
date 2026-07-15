import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

type DualKeyRun = {
  sealer: { publicKey: string; accountHash: string };
  attester: { publicKey: string; accountHash: string; lastTx?: string | null };
  assetId: string;
  seal: string;
  rule: string;
};

const PUBLIC_KEY_RE = /^[0-9a-f]{66}$/;
const ACCOUNT_HASH_RE = /^account-hash-[0-9a-f]{64}$/;
const TX_RE = /^[0-9a-f]{64}$/;
const SEAL_RE = /^[0-9a-f]{64}$/;

test("dual-key run artifact documents distinct sealer and attester accounts", () => {
  const run = JSON.parse(
    readFileSync(new URL("../../output/dual-key-run.json", import.meta.url), "utf8"),
  ) as DualKeyRun;

  assert.match(run.sealer.publicKey, PUBLIC_KEY_RE);
  assert.match(run.attester.publicKey, PUBLIC_KEY_RE);
  assert.match(run.sealer.accountHash, ACCOUNT_HASH_RE);
  assert.match(run.attester.accountHash, ACCOUNT_HASH_RE);
  assert.notEqual(run.sealer.accountHash, run.attester.accountHash);
  assert.equal(run.rule, "Two keys, one seal rule");
  assert.ok(run.assetId.length > 0);
  assert.match(run.seal, SEAL_RE);
  if (run.attester.lastTx) assert.match(run.attester.lastTx, TX_RE);
});
