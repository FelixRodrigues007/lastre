# SPEC — Sealed Market Rail · Landing + App (Laura)

**Status:** ready for Laura implementation  
**Date:** 2026-07-22  
**Product:** Lastre (Casper Agentic Buildathon — Final Round)  
**Owner of this SPEC:** Felix (product / backend later)  
**Implementer of this SPEC:** Laura (Landing `web/` + App `app/` UI only)  
**Out of this phase:** backend settle contracts, new Odra contracts, video re-record  

---

## 0. How to use this document

| Who | Does what | When |
|-----|-----------|------|
| **Laura** | Landing section + App Sealed Rail UI, honesty, EN/PT copy, motion polish | First — implement in-repo, open PR |
| **Felix / backend agent** | Wire real API seams if UI needs new endpoints; keep MintGate/collateral honesty | After Laura PR (or in parallel if APIs already exist) |
| **Felix** | Re-record demo video with new Landing §2 + App rail | Last — after deploy live |

**Laura: implement only visual/UI/UX in:**

- `web/` (landing Vercel — `lastre.io`)
- `app/src/` **components, routes UI, styles, i18n** (console — `app.lastre.io`)

**Laura: do NOT touch unless asked:**

- `app/server/**` (API runtime, settle, evidence pack)
- `agent/**`, `contracts/**`
- Odra/MintGate contract code
- BUIDL Dora page paste (Felix)
- Video assets

If a UI control needs a backend that does not exist yet, implement with **existing** `mint` / `collateral` / `x402 simulate` APIs and keep the honesty badges. Backend phase will close real gaps.

---

## 1. Product decision (locked)

### Name

**Sealed Market Rail**

Not “DEX”. Not “DeFi marketplace”. Not “token sale”.

### One-line thesis

> **Proof before token — and proof before finance.**  
> Tokenization and collateral only unlock after a **Valid** origin seal on Casper.

### Why this wins (jury / Casper direction)

Casper Manifest stresses **RWA + machine/agent economy**. Rivals do payment rails, oracles, or continuous collateral monitoring. Lastre’s wedge is the **origin gate**: nothing financial or mintable happens until the seal says `Valid`. Invalid is permanent proof, not a discarded error.

### What already exists (reuse — do not rebuild)

| Surface | What is already live | Reuse as |
|---------|----------------------|----------|
| Marketplace | Run Demo, x402 mock, MintGate demo claim, persona filters (`public` / `buyer` / `defi` / `operator`) | Entry + rail steps 1–3 |
| My Assets | Demo collection, Lock/Release collateral, filters All/Available/Locked | Rail steps 4–5 |
| Agents | Honesty on mock vs casper settle | Link-out only |
| Landing | Hero → Problem → Solution → … | Insert new §2 Sealed Rail after Hero |
| Contracts | ProofOfOrigin (live testnet), MintGate (demo path in UI) | Labels + explorer links only |

### What we are **not** building in this SPEC

- Full DEX / order book / AMM / swap UI
- Real CSPR payments from browser buttons
- Mainnet claims
- Investment, yield, ROI, price charts, “buy asset”
- Kraken as a product feature (narrative-only, optional one-liner in landing — see §7.3)
- New Odra collateral contract (backend later if needed)
- Claiming Lastre is “#1” or “winner” anywhere

---

## 2. Non-negotiable rules (bug if violated)

### 2.1 Demonstration banner

Every public screen (landing + app) keeps:

```text
DEMONSTRATION — simulated assets, no investment offered
```

Use existing `GuardrailBanner` / site chrome. Do not invent a second banner system.

### 2.2 Honesty freeze (UI vs chain)

| Capability | UI truth today | Label required |
|------------|----------------|----------------|
| ProofOfOrigin counters / verdicts | Live testnet (or explicit fallback snapshot) | `Live testnet` or `Fallback snapshot` |
| MintGate LotMinted | Demo / simulated event | `Demo simulated` |
| x402 “pay” in Run Demo | Mock facilitator | `Mock` — no CSPR moved |
| Real CSPR settle | API/CLI only (`facilitatorMode=casper`) | Never claim the UI button settles |
| Collateral lock/release | Local + optional runtime demo | `Demo collateral` |

Copy pattern already on Marketplace (keep / extend):

```text
Honesty freeze: Run Demo / x402 simulate = mock facilitator (no CSPR moved).
Real testnet CSPR settles only via production API settle path — not this UI button.
Proof before token and before finance.
```

### 2.3 Copy blacklist

Never use on Landing or App for this feature:

```text
invest, buy, sell, yield, return, ROI, profit, price, market cap,
ownership, fractional ownership, passive income, token sale,
trade, swap, DEX, listing fee, APY, TVL, liquidate (as retail),
guaranteed, risk-free
```

Allowed substitutes:

| Avoid | Prefer |
|-------|--------|
| Buy / Sell | Claim access · View provenance · Verify origin |
| Collateral (investment) | Demo collateral · Lock as demo collateral |
| Mint NFT (hype) | MintGate claim after Valid · Demo LotMinted |
| DeFi unlock | Finance gate · Sealed rail · Origin-gated access |
| Trade | Downstream access (demo only) |

### 2.4 Product invariants

1. **Seal decides verdict.** Never the LLM, never a persona toggle.
2. **LLM/agent decides action only** (`pay` / `skip` / `escalate`).
3. **Invalid is permanent proof** — show blocked mint/finance, not “error discarded”.
4. **Valid-only** for MintGate claim and for collateral lock eligibility in the rail.
5. **Fictional assets only** in public demos (`CARBON-VCS-AMAZONIA-2024-001`, Vale D’Ouro lots, etc.).

---

## 3. Information architecture

### 3.1 Landing (`web/`) — new section order

**Current** (`web/src/App.tsx`):

```text
Hero → Problem → Solution → PartnersBar → HowItWorks → Proof → Personas → Comparison → Demonstration → Faq
```

**Target:**

```text
Hero
→ ★ SealedRail          ← NEW (section 2 — primary product story)
→ Problem               ← keep; minor copy tweak optional (§5.2)
→ Solution
→ PartnersBar
→ HowItWorks
→ Proof
→ Personas
→ ComparisonTable
→ Demonstration
→ Faq
→ Footer
```

**Nav:** add one anchor in `SiteNav` / `content.ts` nav:

| Key | EN | PT | href |
|-----|----|----|------|
| `nav.rail` | Sealed rail | Trilho selado | `#sealed-rail` |

Place after Protocol / before How (Laura discretion for visual weight — must be discoverable).

### 3.2 App (`app/`) — no new top-level route required (P0)

P0 reuses routes:

| Route | Role in Sealed Rail |
|-------|---------------------|
| `/marketplace` | Rail steps 1–3: proof → paid query (mock) → MintGate claim |
| `/my-assets` | Rail steps 4–5: collection → demo collateral lock/release |
| `/agents` | Optional “agent pays for provenance” deep link |

**Optional P1** (only if it improves demo clarity without duplicating pages):

| Route | Purpose |
|-------|---------|
| `/marketplace?rail=1` | Deep-link opens Marketplace with Sealed Rail panel expanded + persona `defi` |
| `/my-assets?rail=1` | Deep-link focuses collateral panel |

No new sidebar item required for P0.  
**P1 optional nav label** under Marketplace group: “Sealed rail” pointing to `/marketplace?rail=1` — only if Laura wants explicit discovery; prefer not cluttering `WORKSPACE_NAV`.

### 3.3 Deep links (for video + judges)

| Link | Behavior |
|------|----------|
| `https://lastre.io/#sealed-rail` | Landing jumps to new section |
| `https://app.lastre.io/marketplace?demo=full` | Existing full demo (keep) |
| `https://app.lastre.io/marketplace?rail=1` | Open rail panel + set persona `defi` |
| `https://app.lastre.io/my-assets?asset=CARBON-VCS-AMAZONIA-2024-001` | Existing asset focus (keep) |

---

## 4. Landing — Sealed Rail section (detail)

### 4.1 File plan (Laura)

| Action | Path |
|--------|------|
| **Create** | `web/src/components/sealed-rail/SealedRail.tsx` |
| **Create** | `web/src/components/sealed-rail/SealedRailSteps.tsx` (or inline) |
| **Create** | `web/src/components/sealed-rail/sealed-rail.css` |
| **Edit** | `web/src/App.tsx` — import + mount after `<Hero />` |
| **Edit** | `web/src/i18n/content.ts` — `sealedRail` block EN + PT |
| **Edit** | `web/src/i18n/translations.ts` — short keys if needed (`openSealedRail`, etc.) |
| **Edit** | `web/src/components/layout/SiteNav.tsx` (or nav content) — `#sealed-rail` |
| **Optional** | `web/src/components/problem/Problem.tsx` — one line bridging to finance gate |

Match existing section patterns: `shell`, section kicker, mineral dark surface, seal-gold accent, `prefers-reduced-motion`.

### 4.2 Section anatomy (wireframe)

```text
┌─────────────────────────────────────────────────────────────────┐
│ id="sealed-rail"                                                 │
│                                                                  │
│  EYEBROW: SEALED MARKET RAIL · ORIGIN-GATED ACCESS               │
│  H1: Proof before token. Proof before finance.                   │
│  Body: Tokenization and demo collateral only unlock after a      │
│        Valid origin seal on Casper. Invalid permanently blocks.  │
│                                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ 1 Seal │→│ 2 Query│→│ 3 Mint │→│ 4 Hold │→│ 5 Lock │   │
│  │ Valid  │  │ x402*  │  │ Gate*  │  │ Asset │  │ Demo*  │   │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘   │
│  * = demo / mock in public UI — honesty chip under rail          │
│                                                                  │
│  [ Open Sealed Rail in app ]  [ Spot the fraud ]                 │
│                                                                  │
│  Honesty note (small mono):                                      │
│  MintGate + collateral + x402 UI are demo. Live ProofOfOrigin    │
│  verdicts are on Casper Testnet. No investment offered.          │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Step cards (5)

| # | EN title | EN detail | Honesty chip |
|---|----------|-----------|--------------|
| 1 | Origin seal | Physical reading sealed offline; Casper records Valid or Invalid | `Live testnet` when linking ProofOfOrigin |
| 2 | Provenance query | Agent or operator reads verdict before any action | `Mock x402` in UI |
| 3 | MintGate claim | Access to mint only if verdict is Valid | `Demo simulated` |
| 4 | Sealed asset | Provenance NFT / lot appears in My Assets (demo collection) | `Demo` |
| 5 | Demo collateral | Lock only when Valid + claimed; release returns available | `Demo collateral` |

**Invalid branch (must be visible, not only Valid happy path):**

Show a compact alternate rail or split state:

```text
Invalid seal → mint blocked → finance gate closed → rejection is on-chain proof
```

Visual: same step chrome, red/amber “blocked” treatment consistent with existing Invalid badges (do not invent neon error UI).

### 4.4 Primary / secondary CTAs

| CTA | EN | PT | Target |
|-----|----|----|--------|
| Primary | Open Sealed Rail | Abrir Trilho Selado | `https://app.lastre.io/marketplace?rail=1` (external) |
| Secondary | Spot the fraud | Detectar a fraude | `#proof` or existing fraud/demo anchor used by Hero |
| Tertiary (optional) | View on-chain package | Ver package on-chain | existing `CSPR_PACKAGE_URL` |

Use existing `Button` component. Track analytics:

```ts
trackEvent("cta_click", { target: "sealed-rail-app" });
trackEvent("cta_click", { target: "sealed-rail-fraud" });
```

### 4.5 Motion (Laura)

- Section enters on scroll once (opacity + slight Y), ~400–600ms, ease-out.
- Steps may stagger 40–60ms each.
- **No** infinite loops, bounce, or counter faking.
- Respect `prefers-reduced-motion: reduce` → static layout, no stagger.

### 4.6 Mobile

- Steps become horizontal scroll snap **or** vertical stack (prefer vertical stack for honesty readability).
- CTAs full-width stacked.
- Honesty note always fully readable (no truncated “…” without expand).

### 4.7 Accessibility

- `section` with `id="sealed-rail"` and `aria-labelledby`.
- Steps as `ol` with list semantics.
- Chips not color-only (text labels).
- Focus visible on CTAs.

---

## 5. Landing — adjustments to existing sections

### 5.1 Hero (light touch only)

**Do not rewrite Hero.** Optional micro-adjustments only if Laura wants narrative continuity:

| Element | Current | Optional tweak |
|---------|---------|----------------|
| Headline | “Proof before token.” | Keep |
| Sub | offline seals / on-chain verdicts | Optionally append: “Before any token **or finance action**.” (EN/PT) |

If sub changes, update `translations.ts` `heroSubShort` EN + PT together.

### 5.2 Problem (optional bridge)

Keep Problem structure. Optional one-line addition in `content.problem.lead` or after lanes:

**EN:**

```text
When origin is false, every agent payment and every finance gate inherits fiction.
```

**PT:**

```text
Quando a origem é falsa, cada pagamento de agente e cada trava financeira herdam ficção.
```

Do not restructure TrustGlobe or agent icons unless broken by layout.

### 5.3 Solution / HowItWorks / Comparison

No required structural change.  
If Comparison table has a “vs oracles / vs pay rails” row, Laura may add one line:

```text
vs finance without origin: Lastre closes the gate until Valid.
```

Only if the table component already supports easy row add without redesign.

### 5.4 FAQ — add 2 Q&As

Add to FAQ content (EN + PT):

**Q1 EN:** What is the Sealed Market Rail?  
**A1 EN:** A demo path where MintGate claim and demo collateral only unlock after a Valid origin seal on Casper. It is not a DEX and not an investment product.

**Q2 EN:** Does the marketplace move real CSPR?  
**A2 EN:** No. The public Run Demo uses a mock x402 facilitator. Real testnet CSPR settlement is available only via the production API settle path, not the marketplace button.

---

## 6. App — Sealed Market Rail UX (detail)

### 6.1 Goal of the App rail

In **≤ 90 seconds**, a judge can see:

1. Valid origin required  
2. Mock paid provenance query  
3. MintGate demo claim only after Valid  
4. Asset in My Assets  
5. Demo collateral lock only when eligible  
6. Honesty labels never lie about live vs demo  

### 6.2 Marketplace — new / adjusted UI blocks

**File plan:**

| Action | Path |
|--------|------|
| **Create** | `app/src/components/marketplace/SealedMarketRail.tsx` |
| **Create** | `app/src/components/marketplace/sealed-market-rail.css` |
| **Edit** | `app/src/routes/Marketplace.tsx` — mount rail panel near top (after header / before or after mint summary) |
| **Edit** | `app/src/components/marketplace/MarketplaceFilters.tsx` — persona `defi` label clarity if weak |
| **Edit** | i18n app translations if keys exist for marketplace |
| **Edit** | `app/src/lib/fullDemo.ts` only if deep-link helpers needed (`buildSealedRailUrl`) |

#### 6.2.1 Placement

Recommended order inside Marketplace main column:

```text
PageHeader (Marketplace)
→ ★ SealedMarketRail panel          ← NEW
→ honesty / mint summary (existing market-mint-summary)
→ filters + list (existing)
→ agent query card (existing)
→ map drawer (existing)
```

#### 6.2.2 SealedMarketRail component — states

**Visual:** horizontal stepper (desktop) / vertical (mobile) with 5 steps matching landing.

**State machine (UI):**

| State | Condition | Step highlights |
|-------|-----------|-----------------|
| `idle` | Fresh load | Step 1 active |
| `demo_running` | Full demo modal running | Steps advance with modal steps |
| `proof_ready` | Paid query returned Valid | Steps 1–2 complete |
| `minted` | Demo LotMinted success or already exists | Steps 1–3 complete |
| `in_collection` | Asset in My Assets (local/demo) | Steps 1–4 complete |
| `locked` | Asset locked as demo collateral | All 5 complete |
| `blocked_invalid` | Verdict Invalid | Step 1 fails; 3–5 disabled with reason |

Wire to **existing** data:

- `getMintSummary` / mint summary for ProofOfOrigin counts  
- Full demo modal steps (already: capture → agent → x402 mock → MintGate)  
- `addDemoMint` / mint result for step 3  
- Link to My Assets for steps 4–5  

Do **not** invent new on-chain reads in the client beyond current API helpers.

#### 6.2.3 Actions inside the rail panel

| Control | Behavior | Label honesty |
|---------|----------|---------------|
| **Run Sealed Rail demo** | Triggers existing Full Demo (`demo=full` path / same modal) | Mock x402 + Demo MintGate |
| **View origin verdict** | Focus selected Valid lot or open detail | Live / snapshot as today |
| **Open My Assets** | `Link` to `/my-assets?asset=…&rail=1` | — |
| **Persona: DeFi / builder** | Sets persona `defi` (existing storage key) | Copy: “Origin-gated access (demo)” not “Trade” |

#### 6.2.4 Persona `defi` copy refresh

In filters / empty states when persona is `defi`:

**EN:**

```text
DeFi / builder view — show only origin-gated access paths.
Finance actions stay demo until a Valid seal exists.
```

**PT:**

```text
Visão DeFi / builder — mostra só caminhos com trava de origem.
Ações financeiras permanecem demo até existir selo Valid.
```

Hide or de-emphasize any copy that sounds like trading.

#### 6.2.5 Invalid asset behavior (critical demo moment)

If user selects or demos a known Invalid lot (`MINA-VALEDOURO-LOTE-001` or equivalent):

- MintGate claim button **disabled** or fails with clear reason  
- Rail shows **Blocked — Invalid origin**  
- Microcopy:

```text
Invalid is permanent proof. MintGate and demo collateral stay closed.
```

This is the differentiator vs “happy path only” DeFi demos.

### 6.3 My Assets — rail completion

**File plan:**

| Action | Path |
|--------|------|
| **Edit** | `app/src/routes/MyAssets.tsx` |
| **Edit** | `app/src/components/my-assets/*` only if needed for rail banner |
| **Create (optional)** | `app/src/components/my-assets/SealedRailBanner.tsx` |

#### 6.3.1 Banner when `?rail=1` or after marketplace handoff

```text
Sealed Market Rail · step 4–5
Claimed demo assets can be locked as demo collateral only when origin is Valid.
```

#### 6.3.2 Collateral panel honesty (strengthen existing)

Current UI has Lock / Release. Ensure visible:

```text
Demo collateral — not a lending market. No liquidation, no yield, no investment.
Eligible only with Valid origin + demo claim.
```

If verdict is not Valid, **disable Lock** and show reason.

#### 6.3.3 Filters

Keep All / Available / Locked.  
Optional chip: `Origin Valid only` — only if cheap; not required for P0.

### 6.4 App shell / nav (optional P1)

| Change | Required? |
|--------|-----------|
| New sidebar item | No |
| Marketplace subtitle “Sealed rail” | Optional |
| Command palette entry “Sealed Market Rail” → `/marketplace?rail=1` | Nice-to-have if palette already lists routes |

### 6.5 Agents page (optional P1)

One card or callout:

```text
Agents pay to read provenance (x402). They do not decide Valid/Invalid.
Sealed Market Rail uses that verdict as the finance gate.
```

Link to Marketplace rail. Keep existing honesty on settle modes.

---

## 7. Copy decks (canonical)

### 7.1 Landing SealedRail — English

```text
EYEBROW
SEALED MARKET RAIL · ORIGIN-GATED ACCESS

HEADLINE
Proof before token. Proof before finance.

BODY
Lastre gates tokenization and demo collateral on a Valid origin seal.
Autonomous agents may pay to read provenance — they never decide the verdict.
Invalid is permanent proof: the rail stays closed.

STEPS
1 Origin seal — Field data sealed offline; Casper records Valid or Invalid.
2 Provenance query — Read the verdict before any downstream action (mock x402 in UI).
3 MintGate claim — Demo mint access only after Valid.
4 Sealed asset — Lot appears in My Assets for inspection.
5 Demo collateral — Lock/release is simulated; origin must stay Valid.

PRIMARY CTA
Open Sealed Rail

SECONDARY CTA
Spot the fraud

HONESTY
Demonstration — simulated assets, no investment offered.
MintGate, collateral, and marketplace x402 are demo/mock in the public UI.
Live ProofOfOrigin attestations are on Casper Testnet.
```

### 7.2 Landing SealedRail — Portuguese

```text
EYEBROW
TRILHO DE MERCADO SELADO · ACESSO COM TRAVA DE ORIGEM

HEADLINE
Prova antes do token. Prova antes da finança.

BODY
A Lastre só libera tokenização e colateral demo após selo de origem Valid.
Agentes autônomos podem pagar para ler proveniência — nunca decidem o veredito.
Invalid é prova permanente: o trilho permanece fechado.

STEPS
1 Selo de origem — Leitura de campo selada offline; Casper registra Valid ou Invalid.
2 Consulta de proveniência — Leia o veredito antes de qualquer ação (x402 mock na UI).
3 Claim MintGate — Acesso a mint demo só após Valid.
4 Ativo selado — Lote aparece em My Assets para inspeção.
5 Colateral demo — Lock/release é simulado; a origem precisa permanecer Valid.

PRIMARY CTA
Abrir Trilho Selado

SECONDARY CTA
Detectar a fraude

HONESTY
DEMONSTRAÇÃO — ativos simulados, sem oferta de investimento.
MintGate, colateral e x402 do marketplace são demo/mock na UI pública.
Atestações live de ProofOfOrigin estão no Casper Testnet.
```

### 7.3 Kraken / market access (optional, max 1 line)

**Only if** Laura adds a tiny trust/partners footnote — **not** as a product feature.

**EN (max 1 sentence):**

```text
Casper’s broader market access deepens the network layer; Lastre remains the origin gate on that stack.
```

**Forbidden:** “Lastre listed on Kraken”, “trade CSPR here”, any exchange CTA.

### 7.4 App rail panel strings — English

```text
TITLE
Sealed Market Rail

SUBTITLE
Origin-gated path from Valid seal → MintGate claim → demo collateral.

BUTTON_PRIMARY
Run Sealed Rail demo

BUTTON_SECONDARY
Open My Assets

STATUS_IDLE
Start with a Valid origin seal.

STATUS_BLOCKED
Blocked — Invalid origin. Mint and demo collateral stay closed.

STATUS_COMPLETE
Rail complete (demo). Review honesty labels before judging live vs simulated.

HONESTY_FOOTER
Mock x402 in UI · Demo MintGate · Demo collateral · Live ProofOfOrigin when source=live
```

### 7.5 App rail panel strings — Portuguese

```text
TITLE
Trilho de Mercado Selado

SUBTITLE
Caminho com trava de origem: selo Valid → claim MintGate → colateral demo.

BUTTON_PRIMARY
Rodar demo do Trilho Selado

BUTTON_SECONDARY
Abrir My Assets

STATUS_IDLE
Comece com um selo de origem Valid.

STATUS_BLOCKED
Bloqueado — origem Invalid. Mint e colateral demo permanecem fechados.

STATUS_COMPLETE
Trilho completo (demo). Revise os selos de honesty antes de julgar live vs simulado.

HONESTY_FOOTER
x402 mock na UI · MintGate demo · Colateral demo · ProofOfOrigin live quando source=live
```

---

## 8. Design system constraints (Laura Law)

### 8.1 Tokens

| Surface | Tokens source |
|---------|----------------|
| Landing | `web/src/styles/lastro-tokens.css` + `global.css` + section CSS |
| App | existing app CSS variables / marketplace + my-assets styles |
| Canonical reference | `design-system/tokens/lastro.css` (do not break Vercel by importing outside app roots unless already supported) |

### 8.2 Visual language

- Forensic infrastructure: dark mineral, seal-gold, mono hashes, restrained chrome  
- **No** purple/cyan crypto hype, neon DeFi dashboards, candlesticks, TVL widgets  
- Typography: existing stacks; data/hashes in mono  
- Padding generous; cards not cramped  
- Micro-interactions: hover scale + color, not bounce  

### 8.3 Component primitives

Reuse:

- Landing: `Button`, shell layouts, section kickers from Problem/Solution  
- App: `PageHeader`, `StatePanel`, `route-cta`, existing badges  

Avoid new component libraries.

---

## 9. Backend contract (for Felix later — Laura reads only)

Laura implements UI against **today’s** APIs. Backend phase may extend; do not block UI on new endpoints.

| Need | Today | Backend later |
|------|-------|---------------|
| ProofOfOrigin live | `/api` mint summary + lot verdicts | densify settles, evidence pack already exists |
| MintGate | demo mint endpoint / LotMinted simulation | optional real CEP-style mint |
| x402 UI | mock facilitator | keep casper settle API-only |
| Collateral | localStorage + `getLockedCollateral` / lock-release demo | optional on-chain lock registry |
| Rail progress | pure UI state + query params | optional persistence |

**Do not** call production settle from browser buttons.

---

## 10. Out of scope (explicit)

| Item | Owner later |
|------|-------------|
| New Odra collateral / lending contract | Backend |
| Real browser wallet pay for x402 | Backend + product decision |
| Mainnet deploy | Ops |
| Dora BUIDL text / ranking claims | Felix |
| Demo video re-record + YouTube | Felix (after this ships live) |
| Full DEX / orderbook | Never in this Final Round wedge |
| Changing ProofOfOrigin dual-key logic | Backend / contracts |
| Merge conflicts on pure visual files without Laura | Respect Laura ownership |

---

## 11. Acceptance criteria (Laura PR checklist)

### Landing

- [ ] `#sealed-rail` exists and is second section after Hero  
- [ ] EN + PT complete for section + nav + FAQ additions  
- [ ] 5 steps visible + Invalid branch explained  
- [ ] Honesty note present  
- [ ] Primary CTA opens app marketplace with `rail=1`  
- [ ] No copy blacklist terms  
- [ ] `prefers-reduced-motion` respected  
- [ ] Mobile readable without horizontal overflow bugs  
- [ ] Demo banner still global  

### App

- [ ] `SealedMarketRail` panel on `/marketplace`  
- [ ] `?rail=1` expands/focuses rail + persona `defi`  
- [ ] Run demo still uses existing Full Demo; honesty mock labels intact  
- [ ] Invalid path blocks mint + shows closed finance gate  
- [ ] My Assets collateral shows demo-only language; Lock disabled without Valid  
- [ ] Link Marketplace → My Assets with asset id when demo completes  
- [ ] No claim that UI moves real CSPR  
- [ ] Mint summary honesty freeze text preserved or strengthened  
- [ ] No new sidebar clutter (unless optional P1 clearly labeled)  

### Cross

- [ ] Judges can complete Flow A (Marketplace demo) + collateral glance in My Assets without confusion  
- [ ] Video-ready: Landing §2 → App rail → Invalid block → Valid lock demo  

---

## 12. Suggested implementation order (Laura)

```text
1. Landing content EN/PT (content.ts + translations)
2. SealedRail.tsx + CSS + App.tsx mount + nav anchor
3. FAQ + optional Problem/Hero microcopy
4. App SealedMarketRail.tsx + CSS + Marketplace mount
5. Query param rail=1 + persona defi
6. My Assets banner + collateral honesty + Valid gate on Lock
7. Visual polish pass (motion, mobile, contrast)
8. Self-QA with checklist §11
9. PR titled: feat(ui): Sealed Market Rail — landing + marketplace rail
```

**Timebox guidance:** design-quality P0 can ship without P1 (Agents card, command palette, comparison row).

---

## 13. PR / handoff text (paste)

### PR title

```text
feat(ui): Sealed Market Rail — landing section + app origin-gated rail
```

### PR body (short)

```text
## Summary
- Landing: new §2 Sealed Market Rail after Hero (EN/PT), nav anchor, FAQ.
- App: Marketplace Sealed Rail panel reusing Full Demo, MintGate demo, My Assets collateral.
- Honesty freeze preserved (mock x402 / demo mint / demo collateral vs live ProofOfOrigin).

## Thesis
Proof before token and before finance — not a DEX.

## Test plan
- [ ] lastre.io/#sealed-rail
- [ ] app.lastre.io/marketplace?rail=1 → Run Sealed Rail demo
- [ ] Invalid lot blocks mint messaging
- [ ] My Assets lock/release demo labels
- [ ] No investment language
```

### Message to Felix when Laura is done

```text
Sealed Rail UI shipped on branch ____.
Ready for backend polish (if any) + video re-record using:
Landing #sealed-rail → marketplace?rail=1 → Invalid block → Valid mint → My Assets lock.
```

---

## 14. Video note (Felix only — not Laura)

After deploy, re-record ~60s with this beat sheet:

| Time | Shot |
|------|------|
| 0:00–0:08 | Landing Hero + scroll to Sealed Rail |
| 0:08–0:20 | 5 steps + honesty chip |
| 0:20–0:40 | App Marketplace rail + Run Demo (mock labels visible) |
| 0:40–0:50 | Invalid blocked moment (critical) |
| 0:50–0:60 | Valid → My Assets → demo collateral lock |

Script base remains `docs/VIDEO_60S_SCRIPT.md` — update only after UI is live.

---

## 15. References (read if unsure)

| Doc | Why |
|-----|-----|
| `docs/LANDING_PAGE_CREATIVE_SPEC.md` | Creative tone, blacklist, motion |
| `docs/LAURA_FRONTEND_SYSTEM_DESIGN.md` | Product rules, tokens, deployment |
| `JUDGES_PLAYBOOK.md` | Flow A Marketplace judge path |
| `docs/APP-UI-ARCHITECTURE.md` | Console invariants |
| `docs/CSPR_KRAKEN_LEVERAGE_2026-07-22.md` | Kraken narrative-only rules |
| `docs/DEMO_DAY_SCORECARD_1PAGE_JURY8.md` | Jury criteria mapping |

---

## 16. Decision log

| Decision | Choice |
|----------|--------|
| Product wedge | Sealed Market Rail (origin-gated mint + demo collateral) |
| Not building | DEX / real browser settle / mainnet claims |
| Landing position | Section 2 immediately after Hero |
| App approach | Reuse Marketplace + My Assets, not a third product island |
| Honesty | Mock UI vs live ProofOfOrigin must stay explicit |
| Phasing | Laura UI → backend autonomous → Felix video |

---

**End of SPEC.**  
Laura may exercise visual judgment (spacing, type scale, step chrome) as long as §2 non-negotiables and acceptance criteria hold.
