/**
 * Origin autonomy loop — session-side cycle log for judges.
 *
 * Not an oracle feed counter (Claros-class). Each cycle records dense
 * proof-before-token checks: seal → decide → mock pay → verdict → mint gate dry-run
 * → evidence RPC re-verify. In-memory by default; resets on process restart.
 */

export type AutonomyScenarioId =
  | "VALID_MINA"
  | "INVALID_TAMPER"
  | "VALID_CARBON"
  | "DUPLICATE_SKIP"
  | "OUT_OF_PERIMETER"
  | "EVIDENCE_RPC"
  | "MOCK_PAY";

export type AutonomyScenarioResult = {
  scenario: AutonomyScenarioId;
  ok: boolean;
  outcome: string;
  detail?: string;
  assetId?: string;
};

export type AutonomyCycleRecord = {
  cycleId: string;
  at: string;
  source: string;
  ok: boolean;
  scenarios: AutonomyScenarioResult[];
  evidenceFullyVerified: boolean | null;
  mockPayOk: boolean | null;
  facilitatorMode: string | null;
};

export type AutonomySummary = {
  model: "origin_autonomy_loop";
  note: string;
  cyclesTotal: number;
  cyclesOk: number;
  cyclesLast24h: number;
  byScenario: Record<string, { runs: number; ok: number }>;
  byOutcome: Record<string, number>;
  lastCycle: AutonomyCycleRecord | null;
  evidenceFullyVerifiedLatest: boolean | null;
  persistence: "in_memory_session";
  honestLimits: string[];
};

const MAX_CYCLES = 200;

export class AutonomyStore {
  private readonly cycles: AutonomyCycleRecord[] = [];

  record(cycle: AutonomyCycleRecord): void {
    this.cycles.push(cycle);
    while (this.cycles.length > MAX_CYCLES) {
      this.cycles.shift();
    }
  }

  list(limit = 20): AutonomyCycleRecord[] {
    const n = Math.max(1, Math.min(limit, 100));
    return this.cycles.slice(-n).reverse();
  }

  summary(): AutonomySummary {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const byScenario: AutonomySummary["byScenario"] = {};
    const byOutcome: Record<string, number> = {};

    for (const cycle of this.cycles) {
      for (const s of cycle.scenarios) {
        const bucket = byScenario[s.scenario] ?? { runs: 0, ok: 0 };
        bucket.runs += 1;
        if (s.ok) bucket.ok += 1;
        byScenario[s.scenario] = bucket;
        byOutcome[s.outcome] = (byOutcome[s.outcome] ?? 0) + 1;
      }
    }

    const last = this.cycles.length > 0 ? this.cycles[this.cycles.length - 1]! : null;
    const cyclesLast24h = this.cycles.filter((c) => {
      const t = Date.parse(c.at);
      return Number.isFinite(t) && now - t <= dayMs;
    }).length;

    return {
      model: "origin_autonomy_loop",
      note:
        "Not an oracle marketplace counter. Each cycle = seal/decide/mock-pay/verdict/mint-gate dry-run + evidence RPC check. In-memory; resets on API restart.",
      cyclesTotal: this.cycles.length,
      cyclesOk: this.cycles.filter((c) => c.ok).length,
      cyclesLast24h,
      byScenario,
      byOutcome,
      lastCycle: last,
      evidenceFullyVerifiedLatest: last?.evidenceFullyVerified ?? null,
      persistence: "in_memory_session",
      honestLimits: [
        "Does not farm fake on-chain accepted counters",
        "Mock pay path only in cycle (no casper settle from autonomy)",
        "MintGate checks are dry-run / already-minted status — no free mints",
        "Session log max 200 cycles; lost on process restart unless redeployed with external log",
      ],
    };
  }
}

export function newCycleId(): string {
  return `auton-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 8)}`;
}
