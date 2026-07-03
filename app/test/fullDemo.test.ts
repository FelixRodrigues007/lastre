import assert from "node:assert/strict";
import test from "node:test";
import {
  FULL_DEMO_ASSET_ID,
  buildCaptureDemoUrl,
  buildMarketplaceDemoUrl,
  createFullDemoState,
  isFullDemoStage,
} from "../src/lib/fullDemo";

test("full demo URLs carry the canonical carbon asset id", () => {
  assert.equal(FULL_DEMO_ASSET_ID, "CARBON-VCS-AMAZONIA-2024-001");
  assert.equal(buildCaptureDemoUrl(), "/capture?demo=full&assetId=CARBON-VCS-AMAZONIA-2024-001");
  assert.equal(buildMarketplaceDemoUrl(), "/marketplace?demo=full&assetId=CARBON-VCS-AMAZONIA-2024-001");
});

test("full demo state is timestamped and stage-validated", () => {
  const state = createFullDemoState("capture", new Date("2026-07-03T12:00:00.000Z"));

  assert.deepEqual(state, {
    active: true,
    assetId: FULL_DEMO_ASSET_ID,
    stage: "capture",
    startedAt: "2026-07-03T12:00:00.000Z",
  });
  assert.equal(isFullDemoStage("x402"), true);
  assert.equal(isFullDemoStage("unknown"), false);
});
