# SDD — Casper Agentic Buildathon Final-Round Qualification (Lastre)

**Status:** READY FOR EXECUTION
**Owner:** Felix Rodrigues
**Executor:** Fugu (violent close-out mode)
**Date:** 2026-07-15
**Deadline context:** Final Round invite-only resubmit after eligibility email; DoraHacks reviewing repos now. Functional state **must never break**.
**Primary goal:** Score **5/5** on every official qualification requirement **and** maximize Final Round jury criteria once invited.

---

## 0. Non-negotiable operating rules (read first)

1. **Never leave `main` / production broken.** Judges may open the repo or live app at any second.
2. **All risky work happens on a feature branch.** Merge only when smoke green.
3. **Prefer additive docs + labels over speculative features.** Category clarity beats scope creep.
4. **Honesty over theater.** Mock x402 stays labeled until real settlement lands.
5. **Every task ends with a verification command or URL check.** No “looks done.”
6. **Do not rename public package/contract paths** that break live demos (`lastro` legacy internals stay).
7. **Do not force-push `main`.** No `git reset --hard` on shared history.

### Always-green smoke (run before AND after every merge)

```bash
# Repo health
gh repo view FelixRodrigues007/lastre --json isPrivate,description,homepageUrl,repositoryTopics
gh api repos/FelixRodrigues007/lastre/community/profile --jq '.health_percentage'
gh run list --repo FelixRodrigues007/lastre --branch main --workflow ci.yml --limit 1
gh api repos/FelixRodrigues007/lastre/dependabot/alerts --jq '[.[]|select(.state=="open" and (.security_advisory.severity=="high" or .security_advisory.severity=="critical"))] | length'

# Live app
curl -sf https://app-api.lastre.io/api/health
curl -sf https://app-api.lastre.io/api/mint/summary | head -c 400
# Manual: open https://app.lastre.io/marketplace → Run Demo still works
# Manual: open https://lastre.io
# Manual: open https://github.com/FelixRodrigues007/lastre/community
```

If any smoke fails → **stop feature work** and restore green before continuing.

---

## 1. Official message → requirement matrix

Source: Casper Agentic Buildathon Team email (qualification review while submissions in review).

### 1.1 GitHub Repository

| ID | Requirement | Current baseline (2026-07-15) | Target 5/5 | Gap? |
|---|---|---|---|---|
| G1 | Public repo, proper naming | `FelixRodrigues007/lastre` public | Public `lastre` | **DONE** |
| G2 | Description | Set | Keep + optional tighten | **DONE** |
| G3 | Website | `https://lastre.io` | Keep | **DONE** |
| G4 | Topics include `casper-blockchain`, `casper-network`, `buildathon` + relevant | Present + ai-agents, rwa, x402, etc. | Keep; add `odra` if free slot | LOW |
| G5 | Comprehensive README | Strong root README | Judge-first section at top (links, playbook, video, contract) | **HARDEN** |
| G6 | Community standards 100% | health_percentage=100 | Stay 100% | **DONE** |
| G7 | CodeQL enabled | Workflow + recent success | Keep green on schedule | **DONE** |
| G8 | Dependabot alerts + updates | Config present; open high/critical = 0 | Keep 0 high/critical | **MONITOR** |
| G9 | CI/security tools | `ci.yml` builds/tests/audits | Main CI always green | **MONITOR** |
| G10 | Fix High+ security alerts | API open high/critical empty; npm audit 0 | Continuous | **DONE / WATCH** |

### 1.2 Application

| ID | Requirement | Current baseline | Target 5/5 | Gap? |
|---|---|---|---|---|
| A1 | Fully functional MVP on Casper Testnet | ProofOfOrigin live; health ok | Always-on demo path | **DONE / GUARD** |
| A2 | Intuitive UI workflows | Marketplace Run Demo + Agents | &lt;90s judge path zero confusion | **HARDEN** |
| A3 | Demo video **or** DoraHacks playbook with step-by-step testing (no marketing) | Video: `https://youtu.be/UzhKMsKA6QE`; playbook: `JUDGES_PLAYBOOK.md` | Both linked from README + BUIDL | **HARDEN (discoverability)** |
| A4 | Contract package hashes + sample Testnet txs **with descriptions on BUIDL page** | In repo playbook; BUIDL paste is manual | Paste-ready block + screenshot checklist | **MANUAL CRITICAL** |

### 1.3 Process / invite flow

| ID | Requirement | Target | Gap? |
|---|---|---|---|
| P1 | Wait for eligibility email | Inbox monitored | HUMAN |
| P2 | Resubmit BUIDL to **Final Round** (invite-only) | Same evidence + differentiation | HUMAN after invite |
| P3 | Stay functional during any changes | Branch discipline + smoke | PROCESS |

### 1.4 Jury criteria (Final Round) — aspirational 5/5

| ID | Criterion | Lastre target narrative | Gap to close for 5 |
|---|---|---|---|
| J1 | Technical Execution | Monorepo CI, Odra contracts, typed agent packages | Keep green; fix any flaky CI |
| J2 | Innovation & Originality | Seal decides; LLM only acts; Invalid is proof | Differentiation section on BUIDL |
| J3 | Use of AI / Agentic | Orchestrator pay/skip/escalate | Make agent path visible in demo/UI |
| J4 | Real-World Applicability (DeFi/RWA) | Provenance before token/mint | Carbon + mineral paths labeled |
| J5 | UX & Design | lastre.io + app polish | Demo killer &lt;90s; no broken links |
| J6 | Working Smart Contracts | Live package + sample txs | BUIDL paste + explorer links |
| J7 | Long-Term Launch Plans | Roadmap + socials | Short “After Buildathon” block |
| J8 | Long-Term Impact | Trust layer for Casper agent economy | Stack diagram vs rails/oracles |

---

## 2. Product thesis (do not dilute)

**One line:**
Other agents execute. Lastre lets them verify the source first — **proof before token**.

**Rules of the system:**
- Deterministic offline SHA-256 seal → `Valid` | `Invalid`.
- LLM/orchestrator chooses **action only**: `pay` | `skip` | `escalate`.
- LLM **cannot** overwrite verdict.
- Both Valid and Invalid are permanent Casper evidence.
- Public samples are fictional; mechanism + testnet txs are real.
- x402 facilitator may be mock until upgraded — **always labeled**.

**Stack position (battle frame):**
```text
Payment rails     → AgentGate / CasCet / Hermes
Market data       → Claros-style oracles
Agent reputation  → Vouch-style courts
Physical origin   → ★ LASTRE ★
Capital / mint    → desks / MintGate (after Valid)
```

---

## 3. Evidence pack (canonical — do not invent new hashes)

### 3.1 Live URLs

| Surface | URL |
|---|---|
| Landing | https://lastre.io |
| App | https://app.lastre.io |
| Judge demo | https://app.lastre.io/marketplace |
| Agents | https://app.lastre.io/agents |
| API health | https://app-api.lastre.io/api/health |
| Mint summary | https://app-api.lastre.io/api/mint/summary |
| Repo | https://github.com/FelixRodrigues007/lastre |
| Community | https://github.com/FelixRodrigues007/lastre/community |
| Demo video | https://youtu.be/UzhKMsKA6QE |
| Judge playbook | https://github.com/FelixRodrigues007/lastre/blob/main/JUDGES_PLAYBOOK.md |

### 3.2 Casper Testnet

```text
Network: Casper Testnet (casper-test)
ProofOfOrigin package hash: hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
Package explorer: https://testnet.cspr.live/contract-package/b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
Deployer public key: 01825d5caa210121ea1e493223af5a76f7ff23c70322c5fd0f02eb09f2818f68ad
Read-only counters (verify live): accepted=2, rejected=1 (may grow — never fake)
```

### 3.3 Sample transactions (with descriptions)

| Purpose | Hash | Expected |
|---|---|---|
| Install ProofOfOrigin | `c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10` | Package installed |
| Register reference MINA-VALEDOURO-LOTE-001 | `23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede` | Reference seal stored |
| Tampered attest LOTE-001 → **Invalid** | `5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd` | Invalid recorded |
| Register reference MINA-VALEDOURO-LOTE-002 | `bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101` | Reference seal stored |
| Agent-driven attest LOTE-002 → **Valid** | `43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4` | Valid recorded |
| Earlier genuine attest LOTE-001 → Valid | `8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f` | Valid recorded |

Explorer: `https://testnet.cspr.live/transaction/<hash>`

---

## 4. Gap list ranked for Fugu (violent priority)

### P0 — Qualification blockers / judge-facing (do first)

| Task | Why | Owner type |
|---|---|---|
| **T0.1** Paste contract hash + sample txs + descriptions on **current BUIDL page** | Explicit email requirement A4 | HUMAN + Fugu prep text |
| **T0.2** Ensure demo video URL is on BUIDL + README top + playbook §1 | Email A3 | Fugu docs |
| **T0.3** Judge-first README header (links only, no marketing fluff) | G5 + A3 | Fugu docs |
| **T0.4** Confirm JUDGES_PLAYBOOK is operational (no marketing) | A3 | Fugu docs audit |
| **T0.5** Always-green guard: branch policy + smoke script in repo | P3 email warning | Fugu scripts/docs |
| **T0.6** Verify main CI green; fix any red without breaking prod | G9 | Fugu CI |

### P1 — Score 5 on jury dimensions (while waiting for invite)

| Task | Why | Notes |
|---|---|---|
| **T1.1** “Show Invalid proof” path in UI or playbook (one click / one section) | Innovation + honesty | Additive, labeled |
| **T1.2** Agents page: machine payload before action crystal clear | J3 agentic | No redesign circus |
| **T1.3** Trust boundary banners consistent (Live testnet / Demo simulated / Mock x402) | Honesty = credibility | Audit UI copy |
| **T1.4** Long-term launch block (roadmap 90 days + socials) | J7 | docs + BUIDL |
| **T1.5** Differentiation block vs rails/oracles/desks (paste BUIDL) | J2/J8 | Use battlecard text |
| **T1.6** Optional: one real x402 settlement OR explicit “facilitator path” ADR | Closes #1 competitor attack | Only if zero downtime |

### P2 — Hardening (only if P0/P1 green)

| Task | Why |
|---|---|
| **T2.1** SECURITY.md: add private contact email | Community polish |
| **T2.2** Dependabot cargo failure investigation (non-blocking if main CI green) | Hygiene |
| **T2.3** Add topic `odra` if slots allow | Discoverability |
| **T2.4** Community TG/Discord presence note (human) | Email “Connect” |

### Out of scope (do NOT do during review window)

- Full mainnet deploy
- Real financial products / yield promises
- Rebranding lastro paths
- Multi-chain expansion
- Rewriting design system
- “Competitive feature parity” with Claros ZK / CasCet cascade

---

## 5. Workstreams (execution plan)

### Workstream W0 — Freeze functional baseline (Day 0, 1–2h)

**Goal:** Prove green before any edit.

**Steps:**
1. Run full smoke §0.
2. Record screenshot or note: health `{"ok":true}`, marketplace Run Demo works, community 100%.
3. Create branch `final/qualification-hardening` from latest green `main`.
4. Open tracking checklist issue or update this SDD status table as you go.

**Done when:**
- [ ] Smoke all green
- [ ] Branch created
- [ ] No open Dependabot high/critical

---

### Workstream W1 — GitHub 5/5 freeze (2–4h)

**Files likely touched:** `README.md`, `SECURITY.md`, `JUDGES_PLAYBOOK.md`, maybe `docs/FINAL_ROUND_CHECKLIST.md`

#### T0.3 / T0.2 — README judge-first block

Add **at the very top of README** (before long thesis), a compact block:

```markdown
## Final-round judge entry

| Item | Link |
| --- | --- |
| Live app demo | https://app.lastre.io/marketplace → **Run Demo** |
| Agents integration | https://app.lastre.io/agents |
| Landing | https://lastre.io |
| Demo video | https://youtu.be/UzhKMsKA6QE |
| Step-by-step testing (no marketing) | [JUDGES_PLAYBOOK.md](./JUDGES_PLAYBOOK.md) |
| API health | https://app-api.lastre.io/api/health |
| Casper ProofOfOrigin package | hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561 |
| Community standards | https://github.com/FelixRodrigues007/lastre/community |

DEMONSTRATION ONLY — fictional assets; no investment/yield/ownership sale.
```

**Acceptance:**
- [ ] Fresh visitor finds demo + playbook + video + package hash in &lt;30 seconds
- [ ] README still accurate; no broken relative links
- [ ] `npm`/build not affected (docs only)

#### T2.1 — SECURITY.md contact

Add explicit private contact for vulnerability reports (owner email already used publicly elsewhere if appropriate: project contact).

**Acceptance:**
- [ ] Clear “Report a vulnerability” path without public issues for secrets

#### T0.6 — CI green

**Acceptance:**
- [ ] Latest `ci.yml` on `main` = success
- [ ] CodeQL latest = success or scheduled green
- [ ] `npm audit --audit-level=high` = 0 on root/web/app/agent packages CI already enforces

---

### Workstream W2 — Application + playbook 5/5 (3–6h)

**Files:** `JUDGES_PLAYBOOK.md`, `docs/DEMO_SCRIPT.md`, `docs/JUDGE_ONE_PAGER.md`, optional UI labels

#### T0.4 — Playbook audit

Ensure playbook contains **only operational steps**:
1. Links
2. Contract + txs
3. UI flow A (marketplace)
4. UI flow B (agents)
5. curl smokes
6. Expected outcomes
7. Trust boundaries

Remove any leftover marketing adjectives if present.

**Acceptance:**
- [ ] A stranger can test end-to-end without asking the team
- [ ] Demo video linked in §1
- [ ] Invalid transaction called out with explorer link

#### T1.1 — Invalid proof path

Minimum viable (prefer docs if UI risky):

**Option A (docs-only, safer):**
Playbook section “Verify Invalid on-chain (2 minutes)” with LOTE-001 tampered tx + what UI shows if available.

**Option B (UI, careful):**
Marketplace secondary control “View Invalid sample evidence” linking to cspr.live + short explanation. Must not break Run Demo.

**Acceptance:**
- [ ] Judge can see both Valid and Invalid stories without reading the whole README
- [ ] Production demo still works if Option B ships

#### T1.3 — Label audit

Search UI for paths that look “live” but are simulated. Enforce:

| Label | Meaning |
|---|---|
| Live testnet | Read from Casper / verified package |
| Fallback snapshot | Cached when RPC fails |
| Demo simulated | MintGate/collateral/mint UX not full mainnet economics |
| Mock x402 facilitator | No real CSPR moved |

**Acceptance:**
- [ ] No unlabeled simulated financial action on primary judge path

#### T1.2 — Agents clarity

**Acceptance:**
- [ ] Agents page shows sequence: quote → payment seam → proof payload fields (seal, verdict, casper evidence)
- [ ] States LLM does not decide Valid/Invalid

---

### Workstream W3 — BUIDL page pack (1–2h prep; human paste)

Create file: `docs/BUIDL_PAGE_PASTE.md` (single copy-paste source of truth).

Must include:
1. One-line thesis
2. Live links table
3. Demo video URL
4. Playbook URL
5. Contract package block
6. Sample txs with **descriptions**
7. Trust boundaries (short)
8. Differentiation (short — §6 below)
9. After-buildathon plan (5 bullets)

**Acceptance:**
- [ ] Owner can paste entire BUIDL update in one sitting
- [ ] All hashes match §3
- [ ] No marketing fluff

**Human gate T0.1:** After paste, screenshot BUIDL for record.

---

### Workstream W4 — Competitive differentiation + long-term (2–3h)

#### T1.5 — Differentiation (finalists frame)

Paste-ready content lives in `docs/BUIDL_PAGE_PASTE.md` and optionally `docs/JUDGE_ONE_PAGER.md`.

Core claims (do not overclaim):
- Rails (AgentGate/CasCet) monetize calls — Lastre verifies origin.
- Oracles (Claros) publish feeds — Lastre gates **asset origin** + permanent Invalid.
- Desks (Faktura) underwrite cashflow — Lastre is pre-token provenance.
- Courts (Vouch) judge agents — Lastre judges the **seal of the asset**.

#### T1.4 — Long-term launch plans

Minimum 90-day plan:
1. Keep testnet evidence growing; optional mainnet package
2. Real x402 facilitator alignment (Casper official stack)
3. Field-operator capture kit (offline sealer ops)
4. Partner agents query `/provenance` before mint/finance
5. Socials: X + site maintained; no fake TVL

**Acceptance:**
- [ ] Jury criterion J7 answerable in 30 seconds

#### T1.6 — x402 real settlement (optional stretch)

**Only if** can ship without downtime.

- Prefer isolated branch + feature flag
- Keep simulate path as default for judges if real path flaky
- Document exact tx if real payment lands

**Acceptance if attempted:**
- [ ] At least one real testnet settlement linked
- [ ] OR explicit ADR “why mock remains + path to real” with honest wording

If risk &gt; 2h or breaks demo → **skip**, document ADR instead.

---

### Workstream W5 — Zero-downtime process (continuous)

#### T0.5 — Smoke script

Add `scripts/final-smoke.sh` that runs curls + prints PASS/FAIL.

**Acceptance:**
- [ ] `bash scripts/final-smoke.sh` exits 0 on healthy prod
- [ ] Documented in playbook

#### Branch discipline

```text
main          = always green, deployable
final/*       = hardening PRs
feat/*        = optional stretch
```

PR checklist must include smoke results in description.

---

## 6. Paste-ready blocks (Fugu must materialize into files)

### 6.1 BUIDL — Contract & transactions

```text
## Casper Testnet evidence

Network: casper-test
ProofOfOrigin package hash: hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
Explorer: https://testnet.cspr.live/contract-package/b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561

Sample transactions (all Success):
1) Install ProofOfOrigin
   c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10
2) Register reference MINA-VALEDOURO-LOTE-001
   23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede
3) Tampered attest LOTE-001 → Invalid (permanent rejection proof)
   5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd
4) Register reference MINA-VALEDOURO-LOTE-002
   bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101
5) Agent-driven attest LOTE-002 → Valid
   43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4

## How to test (5 minutes)
1. Open https://app.lastre.io/marketplace
2. Click Run Demo
3. Confirm verdict Valid, seal match, Casper evidence link
4. Open https://app.lastre.io/agents for machine payload flow
5. Step-by-step: https://github.com/FelixRodrigues007/lastre/blob/main/JUDGES_PLAYBOOK.md
6. Demo video: https://youtu.be/UzhKMsKA6QE

## Trust boundaries
- Seal decides Valid/Invalid; LLM only chooses pay/skip/escalate.
- x402 facilitator is mock (HTTP 402 seam real); no real CSPR required for judge demo.
- MintGate/collateral UI paths labeled demo where not full on-chain economics.
- Public assets are fictional demonstration data unless labeled Casper Testnet evidence.
```

### 6.2 BUIDL — Differentiation

```text
## Differentiation
Most buildathon projects improve how agents pay (x402 rails), compose tools (MCP),
publish market data (oracles), underwrite invoices (credit desks), or rate agents
(reputation). Lastre answers a different question: was the physical origin of this
RWA verified BEFORE any token, payment, or agent action?

Proof before token. Seal decides. LLM only acts. Invalid is permanent on-chain proof.
```

---

## 7. Definition of Done — Qualification 5/5

### GitHub DoD

- [ ] Public `lastre` with description + website
- [ ] Topics include required three + relevant
- [ ] Community health 100%
- [ ] CodeQL enabled and not failing
- [ ] Dependabot high/critical open = 0
- [ ] CI on `main` success
- [ ] README judge-first entry present
- [ ] SECURITY.md report path present

### Application DoD

- [ ] https://app-api.lastre.io/api/health → ok
- [ ] Marketplace Run Demo works end-to-end
- [ ] Agents page explains machine integration
- [ ] Demo video public and linked (README + BUIDL + playbook)
- [ ] JUDGES_PLAYBOOK operational, no marketing
- [ ] Contract hash + ≥5 sample txs with descriptions on **BUIDL page**
- [ ] Trust labels correct on primary paths
- [ ] Invalid evidence discoverable

### Process DoD

- [ ] `scripts/final-smoke.sh` exists and is green
- [ ] No broken intermediate deploys on `main`
- [ ] `docs/BUIDL_PAGE_PASTE.md` complete
- [ ] Owner ready to paste within 15 minutes of eligibility email
- [ ] After invite: Final Round BUIDL resubmit checklist executed

### Jury stretch DoD (for post-invite polish)

- [ ] Differentiation + 90-day plan on BUIDL
- [ ] Optional real x402 **or** ADR explaining mock + path
- [ ] One-pager + playbook dates current

---

## 8. Execution order for Fugu (violent sequence)

```text
Hour 0–1     W0 smoke + branch
Hour 1–3     W1 README + playbook video links + SECURITY contact
Hour 3–5     W3 BUIDL_PAGE_PASTE.md (full paste pack)
Hour 5–8     W2 Invalid path + label audit + agents clarity
Hour 8–9     W5 smoke script + PR to main (only if green)
Hour 9–10    HUMAN: paste BUIDL; verify live
Hour 10–12   W4 differentiation + long-term (if time)
Stretch      T1.6 x402 real OR ADR
Anytime      If smoke red → stop → restore
```

**Merge policy:** one PR per workstream preferred; never merge red CI; run smoke after deploy.

---

## 9. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Judge hits mid-refactor | Fail functional MVP | Branch-only work; small PRs; smoke |
| x402 real breaks demo | Fail UX | Feature flag; keep simulate default |
| RPC flaky → empty on-chain UI | Looks broken | Fallback snapshot + labels |
| Overclaim vs competitors | Credibility loss | Honesty labels; no fake settlement |
| Dependabot PR breaks build | Red main | Don't auto-merge; pin if needed |
| Eligibility email missed | No final resubmit | Human monitors contact email daily |

---

## 10. Human-only checklist (Felix)

- [ ] Monitor eligibility email daily
- [ ] Paste BUIDL content from `docs/BUIDL_PAGE_PASTE.md` when ready (even before invite — current submission)
- [ ] After invite: create/submit **Final Round** BUIDL (invite-only)
- [ ] Confirm demo video unlisted/public settings allow judges without login wall
- [ ] Optional: post in Casper TG/Discord with repo link (no spam)
- [ ] Do not announce investment/yield language anywhere

---

## 11. Success scoreboard (self-grade after execution)

| Area | Weight | 5 means |
|---|---|---|
| GitHub requirements | 25% | Email matrix all green |
| Live MVP + contracts | 25% | Demo + package + txs verified |
| Playbook + video | 15% | Stranger tests in 5–10 min |
| BUIDL completeness | 15% | Hashes, txs, steps pasted |
| Honesty / trust labels | 10% | No false live claims |
| Differentiation / long-term | 10% | Jury J2/J7/J8 covered |

**Ship bar for “qualification ready”:** all rows ≥ 4, none &lt; 4 on first four rows.
**Ship bar for “finalist weaponized”:** all rows = 5.

---

## 12. References in-repo

- `JUDGES_PLAYBOOK.md`
- `docs/FINAL_ROUND_CHECKLIST.md`
- `docs/DEMO_SCRIPT.md`
- `docs/JUDGE_ONE_PAGER.md`
- `demo-video/lastre-v2/DETAILS.md` (video)
- This SDD: `docs/superpowers/specs/2026-07-15-final-round-qualification-sdd.md`

---

## 13. Fugu kickoff prompt (copy-paste)

```text
You are Fugu. Execute docs/superpowers/specs/2026-07-15-final-round-qualification-sdd.md
in violent close-out mode for Casper Agentic Buildathon final-round qualification.

Rules:
- Never break main/production. Branch final/qualification-hardening.
- Run smoke before and after changes (section 0 of the SDD).
- Prioritize P0: README judge entry, video links, JUDGES_PLAYBOOK polish,
  docs/BUIDL_PAGE_PASTE.md with contract hashes + sample txs + differentiation.
- Then P1: Invalid proof path, trust labels, agents clarity, long-term plan.
- Skip risky x402 real settlement unless zero-downtime and &lt;2h.
- Every task ends with verification evidence in the PR description.
- Do not invent new Casper transaction hashes; use SDD section 3 only.
- When done, print scoreboard section 11 self-grade with links.

Start with W0 smoke, then W1, W3, W2, W5, W4.
```

---

**End of SDD.**
