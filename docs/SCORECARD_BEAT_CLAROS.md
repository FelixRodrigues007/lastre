# Scorecard — Beat Claros Tier 0 attempt

Date: 2026-07-15

This scorecard is evidence-gated. It does **not** authorize a “beat Claros” claim unless every Tier 0 gate passes.

| Dimension | Before | After this branch | Evidence |
| --- | ---: | ---: | --- |
| Dual-key operational run | 4.9 | 5.0 candidate | `scripts/dual-key-pipeline.sh` + `output/dual-key-run.json` show sealer accountHash ≠ attester accountHash. |
| MintGate live | 4.85 | 4.85 / FAIL Tier 0 | `docs/MINTGATE_LIVE.md` records deploy attempts blocked by `ContractDeploymentError`; no package/mint tx claimed. |
| 2-hop composition anchor | 4.9 | 5.0 candidate | `output/composition-anchor.json` + real Casper Deploy `915c...417a` with transfer-id derived from chainRoot. |
| Compete framing | 4.9 | 5.0 candidate | Agents page adds honest Lastre vs Claros/AgentGate/CasCet matrix. |
| BUIDL docs honesty | 5.0 | 5.0 | Docs list only real hashes; MintGate live remains blocked. |

## Claim gate

| Gate | Status |
| --- | --- |
| T0.1 Dual-key RUN | PASS |
| T0.2 MintGate live package + mint_lot | FAIL / BLOCKED |
| T0.3 Composition anchor | PASS candidate (requires production redeploy for evidence endpoint) |
| T0.4 Compete UI | PASS candidate |
| T0.5 Docs | PASS with MintGate fail disclosed |
| T0.6 Prod smoke/handoff | Pending PR + API redeploy |

Because T0.2 is blocked, **do not claim “beat Claros under demanding judge” yet**. Allowed claim: “dual-key operational run and composition anchor are now documented/implemented; MintGate live remains the blocker.”
