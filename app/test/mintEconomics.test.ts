import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MintEconomicsGate } from "../server/mint-economics.js";

describe("MintEconomicsGate (MintGate contract-logic parity)", () => {
  it("allows mint when Valid proof exists", () => {
    const g = new MintEconomicsGate();
    const r = g.mintLot({ assetId: "A", minter: "m1", hasValidProof: true });
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.event.gate, "LotMinted");
      assert.equal(r.mintCount, 1);
    }
    assert.equal(g.isMinted("A"), true);
  });

  it("reverts NoValidProof without Valid", () => {
    const g = new MintEconomicsGate();
    const r = g.mintLot({ assetId: "B", minter: "m1", hasValidProof: false });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.error, "NoValidProof");
    assert.equal(g.mintCount(), 0);
  });

  it("reverts AlreadyMinted on second mint", () => {
    const g = new MintEconomicsGate();
    g.mintLot({ assetId: "C", minter: "m1", hasValidProof: true });
    const r = g.mintLot({ assetId: "C", minter: "m1", hasValidProof: true });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.error, "AlreadyMinted");
    assert.equal(g.mintCount(), 1);
  });
});
