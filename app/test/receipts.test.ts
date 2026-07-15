import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ReceiptStore } from "../server/receipts.js";

describe("ReceiptStore 2-hop composition", () => {
  it("builds tool → lastre Valid graph", () => {
    const s = new ReceiptStore();
    const parent = s.createToolReceipt({ assetId: "X", payTx: "t1" });
    const r = s.composeLastreHop({
      parentId: parent.id,
      assetId: "X",
      lastreVerdict: "Valid",
      sealMatch: true,
      payTx: "pay1",
    });
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.child.parentId, parent.id);
      assert.equal(r.child.verdict, "Valid");
      assert.equal(r.graph.length, 2);
    }
  });

  it("kill-switch: Invalid aborts hop", () => {
    const s = new ReceiptStore();
    const parent = s.createToolReceipt({ assetId: "Y" });
    const r = s.composeLastreHop({
      parentId: parent.id,
      assetId: "Y",
      lastreVerdict: "Invalid",
      sealMatch: false,
    });
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.reason, "invalid_aborts_hop");
      assert.equal(r.aborted?.verdict, "Aborted");
      assert.equal(r.aborted?.parentId, parent.id);
    }
  });

  it("rejects asset_id mismatch", () => {
    const s = new ReceiptStore();
    const parent = s.createToolReceipt({ assetId: "A" });
    const r = s.composeLastreHop({
      parentId: parent.id,
      assetId: "B",
      lastreVerdict: "Valid",
      sealMatch: true,
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "asset_id_mismatch");
  });
});
