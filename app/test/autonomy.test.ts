import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AutonomyStore, newCycleId } from "../server/autonomy.js";
import { AppRuntime } from "../server/runtime.js";

describe("AutonomyStore", () => {
  it("records cycles and summarizes without inventing on-chain counters", () => {
    const store = new AutonomyStore();
    store.record({
      cycleId: newCycleId(),
      at: new Date().toISOString(),
      source: "test",
      ok: true,
      scenarios: [
        { scenario: "VALID_MINA", ok: true, outcome: "tokenizable" },
        { scenario: "INVALID_TAMPER", ok: true, outcome: "rejected" },
      ],
      evidenceFullyVerified: true,
      mockPayOk: true,
      facilitatorMode: "mock",
    });
    const s = store.summary();
    assert.equal(s.model, "origin_autonomy_loop");
    assert.equal(s.cyclesTotal, 1);
    assert.equal(s.cyclesOk, 1);
    assert.equal(s.persistence, "in_memory_session");
    assert.ok(s.byScenario.VALID_MINA?.runs === 1);
    assert.ok(s.honestLimits.length >= 1);
  });

  it("caps stored cycles at 200", () => {
    const store = new AutonomyStore();
    for (let i = 0; i < 210; i++) {
      store.record({
        cycleId: `c-${i}`,
        at: new Date().toISOString(),
        source: "test",
        ok: true,
        scenarios: [],
        evidenceFullyVerified: null,
        mockPayOk: null,
        facilitatorMode: null,
      });
    }
    assert.equal(store.summary().cyclesTotal, 200);
  });
});

describe("AppRuntime.runAutonomyCycle", () => {
  it("runs isolated scenarios + mock pay without throwing", async () => {
    const runtime = new AppRuntime();
    await runtime.seedDemoSessionIfEmpty();
    const cycle = await runtime.runAutonomyCycle("unit-test");
    assert.ok(cycle.cycleId.startsWith("auton-"));
    assert.equal(typeof cycle.ok, "boolean");
    assert.ok(cycle.scenarios.length >= 5);
    const summary = runtime.getAutonomySummary();
    assert.equal(summary.cyclesTotal, 1);
    const evidence = await runtime.getEvidencePack();
    assert.ok(evidence.originAutonomy);
    assert.equal(evidence.originAutonomy.cyclesTotal, 1);
    // Thesis pack still present
    assert.ok(typeof evidence.thesis === "string");
    assert.equal(evidence.invalidIsProof, true);
  });
});
