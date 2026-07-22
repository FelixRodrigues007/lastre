import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { CollateralStore } from "../server/collateral-store.js";
import { AppRuntime } from "../server/runtime.js";
import { SEALED_RAIL_PRODUCT } from "../server/sealed-rail.js";
import { buildDemoLotDetail } from "../src/lib/demoCatalog.js";

describe("CollateralStore persistence", () => {
  it("survives reload from disk", () => {
    const dir = mkdtempSync(join(tmpdir(), "lastre-col-"));
    const path = join(dir, "locks.json");
    try {
      const a = new CollateralStore(path);
      a.set("ASSET-1", "owner-a");
      assert.equal(a.has("ASSET-1"), true);
      assert.equal(a.get("ASSET-1")?.owner, "owner-a");

      const b = new CollateralStore(path);
      assert.equal(b.has("ASSET-1"), true);
      assert.equal(b.listByOwner("owner-a")[0]?.assetId, "ASSET-1");

      b.delete("ASSET-1");
      const c = new CollateralStore(path);
      assert.equal(c.has("ASSET-1"), false);

      const raw = readFileSync(path, "utf8");
      assert.match(raw, /"version": 1/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("offline Invalid catalog for Sealed Rail", () => {
  it("exposes MINA-VALEDOURO-LOTE-001-TAMPERED as Invalid offline", () => {
    const lot = buildDemoLotDetail("MINA-VALEDOURO-LOTE-001-TAMPERED");
    assert.ok(lot);
    assert.equal(lot!.latestVerdict, "Invalid");
    assert.equal(lot!.sealMatchesReference, false);
    assert.equal(lot!.isMinted, false);
  });
});

describe("AppRuntime collateral + Invalid rail", () => {
  it("persists lock across status reads for Valid minted carbon", async () => {
    const runtime = new AppRuntime();
    await runtime.seedDemoSessionIfEmpty();
    const assetId = SEALED_RAIL_PRODUCT.defaultDemoAssetId;
    assert.equal(runtime.getSealedRailStatus(assetId).verdict, "Valid");
    assert.ok(runtime.isMinted(assetId));

    const lock = runtime.lockCollateral(assetId, "judge-owner");
    assert.equal(lock.success, true);
    assert.equal(runtime.getLockedStatus(assetId)?.owner, "judge-owner");
    assert.equal(runtime.listLockedBy("judge-owner").length, 1);

    const release = runtime.releaseCollateral(assetId, "judge-owner");
    assert.equal(release.success, true);
    assert.equal(runtime.getLockedStatus(assetId), null);
  });

  it("Invalid sample closes finance gate on live seed", async () => {
    const runtime = new AppRuntime();
    await runtime.seedDemoSessionIfEmpty();
    const assetId = SEALED_RAIL_PRODUCT.defaultInvalidAssetId;
    const rail = runtime.getSealedRailStatus(assetId);
    assert.equal(rail.exists, true);
    assert.equal(rail.verdict, "Invalid");
    assert.equal(rail.financeGateOpen, false);
    assert.equal(rail.eligibility.canMint, false);
    assert.equal(rail.eligibility.canLock, false);
  });
});
