# Lastre — Post-Buildathon Roadmap (honest)

**Status:** source of truth for “what comes after Final Round”  
**Audience:** Casper jury, ecosystem (Steuer / Wasserman / builders), operators  
**Rule:** this is a **gated plan**, not a claim that mainnet or billion-dollar flows are live today.

---

## Thesis (do not dilute)

**Proof before token. Proof before finance.**

- **Not** “proof of concept” (generic MVP language).  
- **Yes** origin seal: deterministic SHA-256 → dual-key attest on Casper → `Valid` | `Invalid` (Invalid is permanent proof).  
- MintGate / demo finance only after **Valid**.  
- Agent may **pay / skip / escalate** for provenance — never rewrite the seal.

Live product today: **Casper Testnet** only.  
Demo: https://app.lastre.io/marketplace?rail=1  
Evidence: https://app-api.lastre.io/api/evidence  

---

## Today (Final Round discipline)

| Item | State |
| --- | --- |
| Network of record for proof | **Casper Testnet** |
| Sealed Market Rail | Live (`?rail=1`) |
| Dual-key / Invalid / MintGate | Live (testnet + honesty labels) |
| UI simulate / rail run | **Mock** (no value moved) |
| `POST /api/x402/settle` | Real **testnet** CSPR when keys present |
| Mainnet money / TVL / yield | **None — never claimed in demo** |

One-liner (also on evidence `mainnetRoadmap`):

> Live on Casper Testnet today. Mainnet when facilitator ops + keys + monitoring are production-safe. No mainnet money claims in demo.

---

## After Finals close (execution order)

Clock starts when Casper Agentic Buildathon Final Round submission window ends  
(**deadline reference:** 2026-07-26 23:59 — confirm on Dora).

### Phase A — Freeze & production completion (weeks 0–2)

1. Freeze demo vs production boundaries (labels, env, runbooks).  
2. Complete production stack beyond demo rail (ops checklist, not new features for show).  
3. Harden smoke: health, evidence settle hash, dual-key, sealed rail gates.  
4. Operator pack: redacted lot docs template (lab / romaneio / chain-of-custody).

**Exit:** one person can run jury path 90s + evidence without improvisation.

### Phase B — Operator feasibility (weeks 1–4, parallel)

1. Discovery with real operating assets (mines, carbon, mineral lots) — **lot unit**, not “tokenizeize the mine”.  
2. Example class in flight: copper-mine acquisition inquiry (stated capacity **>1 kt/day**) — pilot only if paper trail is real.  
3. Define pilot scope: 1 site, 1 lot type, dual-key roles (field sealer ≠ chain attester).  
4. Legal/compliance review before any real-asset language on mainnet.

**Exit:** written pilot scope + redacted sample docs + go/no-go.

### Phase C — Load & capacity (testnet first)

1. Load/capacity testing on **Testnet** for industrial corridor shapes.  
2. Design target: institutional RWA **asset-flow class** (order of magnitude consistent with multi-billion USD real-world corridors over time) — **not** a claim of current processed volume.  
3. Measure: seal → attest → query/x402 path latency, failure modes, RPC limits.  
4. Document scaling assumptions and bottlenecks honestly.

**Exit:** capacity note in repo + no fake TPS/TVL marketing.

### Phase D — Multi-site RWA + field origin

1. Multi-location operations model (site registry, lot lineage).  
2. Precision **field geolocation / origin capture** where the asset is produced (operator kit).  
3. Full RWA site coverage path: chain-of-custody from field → seal → Casper → gate.  
4. Partner agents that **must** query Lastre before mint / finance / collateral.

**Exit:** multi-site design doc + at least one field-capture runbook dry-run.

### Phase E — Mainnet readiness (phased, gated)

Mainnet is a **permissioned step**, not a date promise.

| Gate | Required before any mainnet money / PoO mainnet |
| --- | --- |
| **Keys** | Production key custody, rotation, no secrets in chat/CI logs |
| **Facilitator / settle** | Casper path ops-safe; if WCSPR cloud, controlled `modeActive` + keys |
| **Monitoring** | Health, last settle, alert on RPC/settle failure |
| **Runbook** | Who signs, rollback, incident contact |
| **Contract policy** | Package review; mint/reissue policy if any; audit path decided |
| **Legal** | Real-asset claims only with counsel; demo vs production copy frozen |

**Sequence on mainnet (when gates green):**

1. Minimal ProofOfOrigin / evidence path (no finance theater).  
2. Expand settle ops + monitoring.  
3. Operator pilot with real docs under dual-key.  
4. Only then: broader site rollout.

**Still forbidden until gates green:** mainnet money in public demo, fake TVL, yield, investment offers, “#1” claims.

---

## Milestone language (for “keep us posted”)

Send updates **only** when one of these is true:

1. Redacted operator docs in hand  
2. New testnet settle / package densify (hash)  
3. Pilot scope signed / written go  
4. A mainnet **gate** flipped green (name the gate)  
5. First mainnet proof tx (explorer link) — if/when

Do not ping on vanity metrics or rival drama.

---

## Public surfaces to keep aligned

| Surface | What to show |
| --- | --- |
| Repo | this file + `docs/ROADMAP.md` link |
| BUIDL Dora | “After-buildathon” = summary of phases A–E + one-liner |
| `GET /api/evidence` | `mainnetRoadmap` + honesty (testnet) |
| App / landing | DEMONSTRATION · simulated assets · no investment |
| Community posts | origin proof **before** token/finance — never “proof of concept” as thesis |

---

## Anti-patterns

- Editing past community posts to “fix” wording after likes — prefer **shipping the plan** here.  
- Claiming mainnet readiness without gates.  
- Equating industrial **design class** with live volume.  
- Tokenizing an entire mine on day one — unit of proof is the **lot**.

---

## Related

- Product phases (pre/post launch surface): [`ROADMAP.md`](./ROADMAP.md)  
- Jury paste: [`BUIDL_PAGE_FINAL_PASTE.md`](./BUIDL_PAGE_FINAL_PASTE.md)  
- Honesty ADR: [`adr/0001-keep-x402-mock-facilitator-for-final-round.md`](./adr/0001-keep-x402-mock-facilitator-for-final-round.md)  
- Live evidence: https://app-api.lastre.io/api/evidence  
