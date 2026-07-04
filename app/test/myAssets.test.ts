import assert from "node:assert/strict";
import test from "node:test";
import {
  estimateDemoCollateralCspr,
  filterAssetByCollateralStatus,
  formatDemoCollateralValue,
} from "../src/lib/myAssets";

test("estimates carbon collateral from tonnes using demo-only conservative rate", () => {
  assert.equal(estimateDemoCollateralCspr({ category: "carbon_credit", tonnesCO2e: 125000 }), 3125);
  assert.equal(formatDemoCollateralValue(3125), "~3,125 CSPR demo");
});

test("estimates mineral collateral from grams using demo-only mass rate", () => {
  assert.equal(estimateDemoCollateralCspr({ category: "mineral", massGrams: 125000 }), 625);
});

test("filters available and locked assets by collateral status", () => {
  assert.equal(filterAssetByCollateralStatus("all", true), true);
  assert.equal(filterAssetByCollateralStatus("locked", true), true);
  assert.equal(filterAssetByCollateralStatus("locked", false), false);
  assert.equal(filterAssetByCollateralStatus("available", true), false);
  assert.equal(filterAssetByCollateralStatus("available", false), true);
});
