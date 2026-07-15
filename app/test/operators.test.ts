import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getOperators, DEFAULT_SEALER_PUBKEY, DEFAULT_ATTESTER_PUBKEY } from "../server/operators.js";

describe("dual-key operators", () => {
  it("sealer and attester keys are distinct by default", () => {
    const ops = getOperators();
    assert.equal(ops.dualKeyDistinct, true);
    assert.notEqual(DEFAULT_SEALER_PUBKEY, DEFAULT_ATTESTER_PUBKEY);
    const sealer = ops.operators.find((o) => o.role === "field_sealer");
    const attester = ops.operators.find((o) => o.role === "chain_attester");
    assert.ok(sealer?.publicKey);
    assert.ok(attester?.publicKey);
    assert.notEqual(sealer?.publicKey, attester?.publicKey);
    assert.notEqual(sealer?.accountHash, attester?.accountHash);
    assert.ok(attester?.lastTx);
    assert.equal(ops.operators.length, 4);
  });
});
