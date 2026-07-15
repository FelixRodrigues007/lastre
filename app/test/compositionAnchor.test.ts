import assert from "node:assert/strict";
import test from "node:test";
import {
  anchorExplorerUrl,
  isCanonicalTxHash,
  transferIdFromChainRoot,
} from "../server/composition-anchor";

const ROOT = "0c40eb1b4164b95305b0c98908dd6c17ce6bfa37b3900095d87304ea566f8d33";
const TX = "27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c";

test("transferIdFromChainRoot is stable unsigned u64", () => {
  const id = transferIdFromChainRoot(ROOT);
  assert.match(id, /^\d+$/);
  assert.equal(id, transferIdFromChainRoot(ROOT));
  assert.ok(BigInt(id) >= 0n);
  assert.ok(BigInt(id) <= 18_446_744_073_709_551_615n);
});

test("anchorExplorerUrl only links canonical 64-hex tx hashes", () => {
  assert.equal(isCanonicalTxHash(TX), true);
  assert.equal(anchorExplorerUrl(TX), `https://testnet.cspr.live/transaction/${TX}`);
  assert.equal(anchorExplorerUrl("synthetic-anchor"), null);
  assert.equal(anchorExplorerUrl("mint-gate-demo"), null);
  assert.equal(anchorExplorerUrl(null), null);
});
