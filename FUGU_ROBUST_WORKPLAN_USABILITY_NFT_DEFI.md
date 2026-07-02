# FUGU ROBUST WORK PLAN
## Lastro: Advanced Usability — NFT Purchases, DeFi Layers, Internal Users & Full Casper Leverage

**Owner / Executor:** Fugu (Codex-Fugu)
**Requester:** Felix
**Date:** 2026-07-01
**Context:** Build on recent completion of Carbon Credits + In-App Capture + Marketplace (Capture.tsx, Marketplace.tsx, sealer generalization, server endpoints).
**Goal:** Deliver a polished, usable experience for different personas using **everything Casper provides** (Odra contracts, on-chain state, events, addresses, cross-contract calls) + previously planned architecture (MintGate, ProofOfOrigin, agent orchestration, x402).

**Strict Guardrails (non-negotiable):**
- DEMONSTRATION ONLY. Fictional data. No real investment, yield, ROI, ownership transfer, or financial advice language.
- All public copy must pass design-system banned-word lint.
- "Proof before token" remains the core thesis.
- Prefer `/marketplace` or `/catalog` carefully (per roadmap: avoid heavy commerce framing in public surfaces).
- Leverage existing infra: app/ React console, gateway, agent, contracts/lastro_origin.

---

## 1. Executive Summary & Success Metrics

**Problem:** Current app is excellent for provenance verification and carbon generalization, but the path from "Verified Proof" → usable asset (NFT-like representation, marketplace interaction, DeFi simulation) is incomplete or static-HTML only. Different user types (internal operators vs public buyers vs DeFi experimenters) lack tailored, smooth experiences.

**Vision:** Inside the single React app (`app/`), users can:
1. Capture (camera/upload already done) → Instant Passport + Seal.
2. Process through Agent (LLM or rule, now xAI-capable) → Valid/Invalid on Casper.
3. If Valid → **Mint** via MintGate (on-chain record + event).
4. **Marketplace** inside app: Browse (minerals + all carbon types), "Purchase" / claim the proven asset as a demo NFT representation.
5. **DeFi layers:** Use a proven asset as simulated collateral, list orders, or participate in mock liquidity (leveraging Casper account model + contract state).
6. **Internal / Role-based UX:** Operators see privileged views (batch processing, escalations override, audit export); public users see clean verifier + buyer flows.

**Casper Leverage (already planned + now activate):**
- `ProofOfOrigin` + `MintGate` cross-contract (already implemented in Odra).
- Events (`LotMinted`).
- Addresses as minters/owners.
- On-chain queries (via gateway + direct if we expose).
- Future: Extend MintGate or companion contract for richer NFT metadata (CEP-78 style attributes with provenance seal attached).
- Account model for "my assets" simulation.
- Potential real contract calls from frontend (via agent/gateway or Casper JS SDK).

**Definition of Done (for this plan):**
- End-to-end demo in < 3 minutes: Capture carbon/mineral → Process (Valid) → Mint on-chain visible → Buy/Claim in Marketplace → See in "My Proven Assets".
- Internal operator flow and public buyer flow clearly differentiated.
- DeFi demo surface (collateral lock + release using proof check).
- All flows work with live testnet attestations where possible.
- Builds cleanly, tests pass, respects guardrails.
- Fugu produces clean, reviewable PRs or branches.

**Target Duration:** 5–8 focused days for core (MVP usable) + polish.

---

## 2. Personas & Journeys

### 2.1 Internal Operator (privileged demo user)
- Goal: Efficiently process batches, review escalations, trigger mints, manage internal catalog.
- Journey: Login sim (role toggle) → Capture or select lot → Run Process with LLM (xAI) → Review Audit → Force mint if needed (demo only) → Dashboard shows internal metrics.

### 2.2 Public Verifier / Explorer
- Goal: Understand proof, tamper, verify on-chain.
- Already strong. Enhance with direct links from marketplace.

### 2.3 NFT Buyer / Collector (RWA enthusiast in demo)
- Goal: Find proven assets (especially carbon credits), "purchase" → triggers mint_gate → owns a representation.
- Journey: Marketplace filters (mineral / creditType / Vintage / Tonnes) → View provenance proof → Buy button (only if Valid + attested) → Simulated signing + MintGate call → My Collection.

### 2.4 DeFi Participant
- Goal: Experiment with proven RWAs in DeFi primitives (collateral, orders).
- Journey: From Marketplace or "My Assets" → Lock proven asset as collateral (checks attestation on-chain) → View mock loan terms or liquidity position → Release.

### 2.5 Admin / Owner (Casper contract level)
- Interact with MintGate owner functions (set_proof_contract, view stats).

---

## 3. Phased Implementation Plan

### Phase 0 — Foundation & Planning (0.5 day)
- Sync with current state (carbon, Capture, in-app Marketplace, xAI LLM).
- Decide on `/marketplace` vs new `/catalog` + `/my-assets`.
- Audit existing Casper contract deployment addresses (ProofOfOrigin + MintGate).
- Define "demo NFT" representation: JSON metadata including `seal`, `attestation_tx`, `category`, `creditType` etc. (stored client-side + emitted in event).

**Deliverable:** Updated plan + any quick type alignments.

### Phase 1 — Casper Connectivity & Wallet Simulation (1–1.5 days)
**Usability base for all advanced features.**

- Add minimal Casper integration layer in `app/src/lib/casper.ts` (or reuse gateway):
  - Query functions for `get_attestation`, `is_minted` (via existing gateway or new thin wrappers).
  - Event listening simulation or polling for `LotMinted`.
- **Wallet / Identity simulation** (demo-friendly, no real blocker):
  - "Connect Casper Account" button (localStorage + fake Address).
  - Real option: integrate `@casper-js/sdk` for query + basic signing (if time; otherwise strong mock that logs the intent).
  - Store "connected minter" per session.
- Update AppShell / Command Palette with persona switcher (Internal Operator / Buyer / DeFi User / Public).
- Add "My Proven Assets" view (persisted in local/session + synced with on-chain minted state).

**Files:**
- `app/src/lib/casper.ts` (new)
- `app/src/components/wallet/CasperConnect.tsx`
- Update `AppShell.tsx`, navigation, types.
- Extend gateway if needed for new read endpoints.

**Acceptance:** User can "connect", see address, and flows are persona-aware.

### Phase 2 — Complete Tokenization Flow (Proof → Real MintGate Call) (1.5–2 days)
**Core "NFT purchase" enabler.**

- Enhance in-app Marketplace "Buy / Tokenize" button:
  - Only enabled for `attested && latestVerdict === "Valid"`.
  - Calls (via agent or direct gateway) a flow that:
    1. Confirms on-chain attestation (cross-check).
    2. Calls `MintGate.mint_lot(assetId)` (symbolic but on-chain record + event).
  - Show transaction hash + link to cspr.live.
  - After success: Add to user's "owned" collection with metadata (seal + proof link).
- Wire `Capture` artifacts all the way: after user submits → appears in Lots → Process → Mint.
- Add visual "Minted" badge + Provenance NFT card (rich HTML/JSON preview with embedded seal, category, carbon details).
- Update contracts if needed: expose more metadata on MintGate (or note future NFT contract that references the attestation).

**Leverage Casper:**
- Use existing `LotMinted` event.
- Cross-contract call already in Rust (keep it).
- On-chain `mint_count` and `is_minted` queries.

**Files to touch:**
- `app/src/routes/Marketplace.tsx` (enhance actions)
- New `app/src/routes/MyAssets.tsx` or section
- `app/server/runtime.ts` + API routes for mint simulation/proxy
- Agent/gateway if we want orchestrated `mint_after_proof`
- Possibly light contract update (optional, if we want richer events)

**Acceptance:** From capture → process (Valid) → click Tokenize in marketplace → on-chain mint visible in explorer + appears in My Assets.

### Phase 3 — Enhanced Marketplace & NFT Experience (1–1.5 days)
- Rich filters (already started): category, creditType (full enum), tonnes range, vintage, mineral type, status (Proven/Minted/Available).
- Asset cards: beautiful, show proof rail mini + key carbon/mineral attrs + "Provenance Score" (fake but fun).
- Detail page enhancement: full provenance + "Mint Status" + direct "Mint / Buy" CTA.
- Sorting, pagination, search (minerals + 10+ carbon types).
- "Featured" or "Recently Proven" sections.
- For carbon: special views (e.g. "Climate Impact" summary).

**Casper angle:** Show live `mint_count` from contract. Link every minted asset to its `LotMinted` tx.

**Files:**
- `app/src/routes/Marketplace.tsx` (major iteration)
- New components: `AssetCard.tsx` (generalized), `MintButton.tsx`
- Update catalog consumption (merge static + live lots + minted state)

### Phase 4 — DeFi Demo Layers (1.5 days)
**"Everything Casper makes available" for advanced usability.**

- **Collateral Locker (sim DeFi):**
  - From My Assets or Marketplace, "Lock as Collateral".
  - Requires Valid proof + minted.
  - On "lock": record locally + optionally call a new simple contract or mock that checks `MintGate.is_minted` + `ProofOfOrigin`.
  - Show mock "Loan available: X CSPR against this asset" (demo numbers).
  - "Release" flow.

- **Order Book / Simple DEX sim:**
  - List proven assets for "sale" (demo).
  - Match orders using local state but verify provenance on "fill".

- **Portfolio Dashboard:**
  - For DeFi/Internal: Total Proven Value (sim), Locked Collateral, Active Positions.
  - Use on-chain data where possible (mint counts, attestations).

- Leverage Casper: Use account model (different "users" have different addresses). Show how a proven asset's attestation can be read by other contracts.

**Files:**
- New `app/src/routes/DeFi.tsx` or integrated tabs in Marketplace/MyAssets.
- `app/src/lib/defi-sim.ts`
- Optional: light new contract module (e.g. `CollateralGate`) if we want more on-chain.

**Acceptance:** User can mint a carbon credit NFT → Lock it → See simulated loan position → Release. All checks respect proof.

### Phase 5 — Role-Based Internal User Experience & Polish (1 day)
- **Role switcher** (demo): Operator | Buyer | DeFi Tester | Auditor.
  - Operator: Extra buttons (batch force, escalation override, direct mint admin, export full audit).
  - Internal views: "Operator Dashboard" with live counters from Casper + pending escalations.
- Improve overall usability:
  - Onboarding tour / empty states for each persona.
  - Better mobile/responsive (Capture camera on mobile).
  - Keyboard + a11y pass.
  - Loading skeletons everywhere.
  - Clear "DEMO MODE" banners per persona.
  - Command palette enhancements (quick "Mint latest", "Go to My Assets").
- Integrate xAI LLM more visibly for internal operators (e.g. "Ask Grok to suggest batch" using the existing LlmDecider).
- Error handling & recovery for all Casper interactions.

**Files:**
- `app/src/context/RoleContext.tsx` (new)
- Updates to existing routes + AppShell.
- New operator-specific components.

### Phase 6 — Testing, Docs, Deployment & Demo Prep (0.5–1 day)
- End-to-end manual flows for all personas.
- Add Playwright/Cypress smoke tests for critical paths (Capture → Mint → Buy).
- Update docs: README, DEMO.md, APP-UI-ARCHITECTURE.md, new section in ROADMAP.
- Update design-system copy matrix with new flows (still guardrailed).
- Deploy smoke checklist.
- Record short internal demo video (optional, since user dropped public video for now).
- Casper-specific: Document how to query MintGate + ProofOfOrigin from the app.

---

## 4. Detailed Task Breakdown (for Fugu — numbered, prioritized, actionable)

**P0 (Must for usable core)**
1. Implement Phase 1 Casper connect + persona switcher.
2. Wire Marketplace "Tokenize" to real `mint_lot` call (via gateway/agent).
3. Create `/my-assets` view + persist owned minted assets.
4. Fix any remaining carbon display/processing gaps post recent work.
5. Add "Mint Status" to LotDetail and Asset cards.

**P1**
6–12. Marketplace filters/cards polish (creditType optgroups, carbon impact summary, search).
13–16. Capture flow enhancements (auto-suggest credit fields, better photo preview tied to passport).
17–20. DeFi collateral locker (mock + proof check).
21. Role-based conditional UI.

**P2 (Polish & Casper depth)**
22. Add real Casper JS SDK queries (optional but recommended).
23. Rich NFT metadata card (downloadable JSON with seal + tx links).
24. Operator dashboard enhancements.
25. Full test coverage + docs.
26. Cross-persona end-to-end test script.

Each task should have:
- Files
- Acceptance criteria
- Casper contract usage note

---

## 5. Architecture Notes (Casper First)

- **Keep MintGate as the gatekeeper** (already solid).
- For "real" NFT feel: Either:
  a) Enhance MintGate to store more metadata, or
  b) Plan a companion `RwaNft` contract (Odra) that mints a CEP-78 compatible NFT referencing the asset_id + seal (future phase).
- Frontend never holds private keys for real value in demo.
- All heavy logic stays in contracts + agent. Frontend orchestrates UX.
- Use existing gateway as BFF for Casper reads/writes.
- Events are first-class for "recent mints" UI.

---

## 6. Risks & Mitigations

- **Scope creep on real DeFi/NFT:** Mitigate by keeping everything symbolic/demo with clear labels.
- **Casper wallet friction:** Use strong simulation first; gate real SDK behind flag.
- **Language guardrails:** Run design-system lint on every UI string change.
- **Type drift** (sealer vs app): Centralize ProvenanceArtifact type (export from sealer).
- **Buildathon deadline:** Prioritize P0 + P1 strictly. DeFi can be thin but visual.

---

## 7. Milestones & Checkpoints

- **Day 1 end:** Connect + persona + basic Tokenize wired to MintGate.
- **Day 3 end:** Functional Marketplace + My Assets + one full Capture→Mint→Buy flow.
- **Day 5 end:** DeFi collateral + role UX.
- **Final:** All flows demoable, builds green, plan items documented.

---

## 8. Global Mundi Map Tab — candidate implementation status

**Status:** Candidate implemented in-app under `Marketplace` as the second tab: `Assets` / `Global Mundi Map`.

**Map API decision:** Use **MapLibre GL JS** as the rendering abstraction and **MapTiler Cloud** as the preferred production tile provider once Felix obtains the API key. MapLibre keeps the app open-source and avoids hard lock-in; MapTiler gives production vector tiles, styles, and geocoding without forcing us into a proprietary renderer. The current candidate ships a zero-token SVG fallback so the demo does not break while credentials are pending.

**Quality pass added:** The map tab now persists the demo Casper account/persona for cross-route continuity, displays the production integration path (`MapLibre GL JS` renderer + `MapTiler Cloud` tiles/styles + `VITE_MAPTILER_KEY` readiness), includes minted/proven/pending counts, has a legend, and handles empty filtered states without breaking the SVG. The MapTiler key is now functional: when `VITE_MAPTILER_KEY` is present, the tab lazy-loads MapLibre GL JS and renders MapTiler `streets-v4` vector tiles; without a key or if the map fails to load, it falls back to the zero-token SVG demo map.

**Files touched for candidate:**
- `app/src/routes/Marketplace.tsx`
- `app/src/routes/marketplace.css`
- `app/src/lib/navigation.ts` (fix existing invalid icon names)
- `app/src/lib/types.ts` (align app types with minted asset fields already used by the UI)
- `app/package.json` + `app/package-lock.json` (add `maplibre-gl`)
- `app/README.md` (document the functional `VITE_MAPTILER_KEY` production map key)

**Acceptance checked locally:**
- `npm --prefix app run lint`
- `npm --prefix app run build`

**Uncertainties / next decision:**
- Confirm final API key/provider. Recommendation remains MapLibre + MapTiler.
- Decide whether the map stays as a tab inside `/marketplace` or becomes a dedicated `/map` route later.
- Add `VITE_MAPTILER_KEY` to Cloudflare Pages once the key is available; the MapLibre component is already wired and will activate automatically, while the SVG remains the fallback.

---

**Fugu — execute this plan firmly. Start with Phase 0 sync, then P0 tasks. Create clear branches/PRs. Surface questions early (especially contract extensions or real SDK integration).**

**Reference files to start:**
- `contracts/lastro_origin/src/mint_gate.rs`
- `app/src/routes/Marketplace.tsx` + `Capture.tsx` (recent)
- `app/server/runtime.ts`
- `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/APP-UI-ARCHITECTURE.md`
- `agent/orchestrator/src/`

Deliver clean, production-grade demo code that makes the Casper provenance story shine for operators, buyers, and DeFi tinkerers.

Ready when you are. Let's ship.
