import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateSealedRail,
  sealedRailOverview,
  SEALED_RAIL_PRODUCT,
  SEALED_RAIL_HONESTY,
} from "../server/sealed-rail.js";
import { AppRuntime } from "../server/runtime.js";

describe("evaluateSealedRail (pure)", () => {
  it("blocks finance when origin is Invalid", () => {
    const status = evaluateSealedRail({
      assetId: "X-INVALID",
      exists: true,
      verdict: "Invalid",
      sealMatch: false,
      attested: true,
      minted: false,
      mintTx: null,
      paidQueryCount: 0,
      sessionHasPaidQuery: false,
      locked: false,
      lockedOwner: null,
      lockedAt: null,
    });
    assert.equal(status.financeGateOpen, false);
    assert.equal(status.gateCode, "INVALID_ORIGIN");
    assert.equal(status.eligibility.canMint, false);
    assert.equal(status.eligibility.canLock, false);
    assert.equal(status.steps[0]!.status, "blocked");
    assert.equal(status.steps[2]!.status, "blocked");
    assert.equal(status.steps[4]!.status, "blocked");
    assert.match(status.blockedReason ?? "", /Invalid is permanent/i);
  });

  it("opens mint when Valid and not yet minted", () => {
    const status = evaluateSealedRail({
      assetId: "X-VALID",
      exists: true,
      verdict: "Valid",
      sealMatch: true,
      attested: true,
      minted: false,
      mintTx: null,
      paidQueryCount: 1,
      sessionHasPaidQuery: true,
      locked: false,
      lockedOwner: null,
      lockedAt: null,
    });
    assert.equal(status.financeGateOpen, true);
    assert.equal(status.eligibility.canMint, true);
    assert.equal(status.eligibility.canLock, false);
    assert.equal(status.steps[0]!.status, "complete");
    assert.equal(status.steps[1]!.status, "complete");
    assert.equal(status.steps[2]!.status, "ready");
  });

  it("marks full rail complete when Valid + minted + locked + queried", () => {
    const status = evaluateSealedRail({
      assetId: "X-COMPLETE",
      exists: true,
      verdict: "Valid",
      sealMatch: true,
      attested: true,
      minted: true,
      mintTx: "mint-demo",
      paidQueryCount: 2,
      sessionHasPaidQuery: true,
      locked: true,
      lockedOwner: "owner-1",
      lockedAt: new Date().toISOString(),
    });
    assert.equal(status.progress.complete, true);
    assert.equal(status.progress.completedSteps, 5);
    assert.equal(status.eligibility.canLock, false);
    assert.equal(status.eligibility.canRelease, true);
  });

  it("returns UNKNOWN_ASSET when lot missing", () => {
    const status = evaluateSealedRail({
      assetId: "NOPE",
      exists: false,
      verdict: null,
      sealMatch: null,
      attested: false,
      minted: false,
      mintTx: null,
      paidQueryCount: 0,
      sessionHasPaidQuery: false,
      locked: false,
      lockedOwner: null,
      lockedAt: null,
    });
    assert.equal(status.gateCode, "UNKNOWN_ASSET");
    assert.equal(status.exists, false);
  });

  it("overview exposes product honesty and endpoints", () => {
    const overview = sealedRailOverview();
    assert.equal(overview.product.id, "sealed-market-rail");
    assert.equal(overview.honesty.phrase, SEALED_RAIL_HONESTY.phrase);
    assert.ok(overview.endpoints.run.includes("/api/rail/run"));
    assert.equal(overview.sampleAssets.validDemo, SEALED_RAIL_PRODUCT.defaultDemoAssetId);
  });
});

describe("AppRuntime Sealed Market Rail", () => {
  it("Valid carbon asset: mock rail run mints (or already minted) and keeps honesty mockOnly", async () => {
    const runtime = new AppRuntime();
    await runtime.seedDemoSessionIfEmpty();

    const assetId = SEALED_RAIL_PRODUCT.defaultDemoAssetId;
    const before = runtime.getSealedRailStatus(assetId);
    assert.equal(before.exists, true);
    assert.equal(before.verdict, "Valid");
    assert.equal(before.financeGateOpen, true);

    const run = await runtime.runSealedRailDemo({
      assetId,
      owner: "judge-demo",
      lock: false,
    });
    assert.equal(run.mockOnly, true);
    assert.equal(run.ok, true);
    assert.ok(run.stepsRun.some((s) => s.step === "provenance_query" && s.ok));
    assert.ok(runtime.isMinted(assetId));
    assert.equal(run.rail.eligibility.canLock, true);
  });

  it("Invalid asset: mint and lock stay closed", async () => {
    const runtime = new AppRuntime();
    await runtime.seedDemoSessionIfEmpty();

    const assetId = SEALED_RAIL_PRODUCT.defaultInvalidAssetId;
    const status = runtime.getSealedRailStatus(assetId);
    assert.equal(status.verdict, "Invalid");
    assert.equal(status.financeGateOpen, false);
    assert.equal(status.eligibility.canMint, false);
    assert.equal(status.eligibility.canLock, false);

    const mint = runtime.mintAsset(assetId, "attacker");
    assert.equal(mint.success, false);
    assert.ok(
      mint.code === "INVALID_ORIGIN" || mint.code === "NoValidProof",
      `unexpected mint code: ${mint.code}`,
    );

    const lock = runtime.lockCollateral(assetId, "attacker");
    assert.equal(lock.success, false);
    assert.ok(lock.code === "NOT_MINTED" || lock.code === "INVALID_ORIGIN");
  });

  it("lock requires mint even when Valid", async () => {
    const runtime = new AppRuntime();
    await runtime.seedDemoSessionIfEmpty();

    // Use a Valid lot and ensure we can reason about codes via eligibility
    const assetId = "MINA-VALEDOURO-LOTE-001";
    const status = runtime.getSealedRailStatus(assetId);
    assert.equal(status.verdict, "Valid");

    // If seed already minted tokenizable lots, release path is canLock; force lock then release
    if (runtime.isMinted(assetId)) {
      const lock = runtime.lockCollateral(assetId, "owner-a");
      assert.equal(lock.success, true);
      const again = runtime.lockCollateral(assetId, "owner-a");
      assert.equal(again.success, false);
      assert.equal(again.code, "ALREADY_LOCKED");
      const release = runtime.releaseCollateral(assetId, "owner-a");
      assert.equal(release.success, true);
    } else {
      const lock = runtime.lockCollateral(assetId, "owner-a");
      assert.equal(lock.success, false);
      assert.equal(lock.code, "NOT_MINTED");
    }
  });

  it("evidence pack includes sealedMarketRail", async () => {
    const runtime = new AppRuntime();
    await runtime.seedDemoSessionIfEmpty();
    const pack = await runtime.getEvidencePack();
    assert.ok(pack.sealedMarketRail);
    assert.equal(pack.sealedMarketRail.product.id, "sealed-market-rail");
    assert.equal(pack.sealedMarketRail.sampleInvalid.financeGateOpen, false);
    assert.ok(pack.juryLinks.rail);
    assert.ok(pack.accessRights.sealedRail);
  });
});
