# Lastre

**Other agents execute. Lastre lets them verify the source first — proof before token.**

Tokens and AI agents act on unverified origin claims. Lastre is a proof layer for real-world assets on Casper: a deterministic offline seal verifies the payload, an agent may recommend, the **seal decides** Valid or Invalid — permanently anchored on-chain and queryable via x402. Invalid is proof, not a discarded error.

DEMONSTRATION ONLY — fictional sample assets; no investment, yield, ownership sale, or financial promise.

---

## Live demo (start here)

| What | Link |
| --- | --- |
| **Judge demo** | https://app.lastre.io/marketplace → **Run Demo** |
| Agents / x402 integration | https://app.lastre.io/agents |
| Landing | https://lastre.io |
| Demo video (≈2 min) | https://youtu.be/UzhKMsKA6QE |
| Evidence pack (trust stack + live RPC) | https://app-api.lastre.io/api/evidence |
| API health | https://app-api.lastre.io/api/health |
| GitHub | https://github.com/FelixRodrigues007/lastre |
| Community profile | https://github.com/FelixRodrigues007/lastre/community |
| Judge playbook | https://github.com/FelixRodrigues007/lastre/blob/main/JUDGES_PLAYBOOK.md |

### Agent CLI (60 seconds)

```bash
# Quote (HTTP 402)
node packages/cli/bin/lastre.mjs prove CARBON-VCS-AMAZONIA-2024-001

# Judge-safe pay + proof (mock settle — UI path)
node packages/cli/bin/lastre.mjs prove CARBON-VCS-AMAZONIA-2024-001 --pay

# Real Casper Testnet CSPR settle (production API is casper-mode)
node packages/cli/bin/lastre.mjs prove CARBON-VCS-AMAZONIA-2024-001 --pay --mode casper

# Live-RPC evidence pack
node packages/cli/bin/lastre.mjs evidence
```

---

## How to test in 5 minutes

1. Open **https://app.lastre.io/marketplace** → click **Run Demo**.
2. Confirm the final payload:
   - Verdict: **Valid**
   - Seal match: **true**
   - Carbon impact score: **92**
   - Casper ProofOfOrigin evidence present
   - MintGate labeled as **demo event** (not a fake explorer mint)
3. **View in MyAssets** — fictional carbon asset with proof details.
4. Open **https://app.lastre.io/agents** — quote → `X-PAYMENT` → proof + `chainEvidence`.
5. Open **https://app-api.lastre.io/api/evidence** — `trustStack` (4 roles) + `onChain.rpcEvidence` (live-RPC when the public node responds).
6. Invalid path: marketplace lot `MINA-VALEDOURO-LOTE-001` **and** the tampered tx below.

---

## Casper Testnet evidence

| Field | Value |
| --- | --- |
| Network | `casper-test` |
| ProofOfOrigin package | `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561` |
| Package explorer | https://testnet.cspr.live/contract-package/b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561 |
| Deployer public key | `01825d5caa210121ea1e493223af5a76f7ff23c70322c5fd0f02eb09f2818f68ad` |
| Counters (may grow) | accepted ≥ 2 · rejected ≥ 1 |

### On-chain sample transactions

Explorer format: `https://testnet.cspr.live/transaction/<hash>`

| # | Purpose | Tx hash |
| --- | --- | --- |
| 1 | Install ProofOfOrigin package | `c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10` |
| 2 | Register reference · `MINA-VALEDOURO-LOTE-001` | `23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede` |
| 3 | **Tampered attest → Invalid** (permanent rejection proof) | `5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd` |
| 4 | Register reference · `MINA-VALEDOURO-LOTE-002` | `bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101` |
| 5 | **Agent-driven attest → Valid** | `43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4` |
| 6 | Earlier Valid attest · lote-001 | `8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f` |

### Real x402 CSPR payment (production)

Native transfer via **CasperFacilitator** · `settlementKind=casper_deploy` · 2.5 CSPR  
Paid provenance for `CARBON-VCS-AMAZONIA-2024-001` (Valid + sealMatch).

| | |
| --- | --- |
| **Prod payment tx** | `27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c` |
| **Explorer** | https://testnet.cspr.live/transaction/27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c |
| Path | `POST /api/x402/settle/:assetId` or CLI `--pay --mode casper` |
| **Not** this path | UI **Run Demo** / `POST /api/x402/simulate` → always **mock** (`synthetic_receipt`) |

---

## Trust model

| Layer | Who | What is trusted |
| --- | --- | --- |
| Field sealer | Offline capture | Canonical artifact + SHA-256 seal — **no LLM, no network** |
| Chain attester | ProofOfOrigin (Casper) | Reference seal; Valid **and** Invalid permanent |
| Paying agent | External agent / consumer | HTTP 402 → payment → read proof before acting |
| Human escalation | Reviewer | HITL for action uncertainty — **never** overwrites seal truth |

**Rules**

- The seal decides **Valid / Invalid**. The LLM only chooses **pay / skip / escalate**.
- The LLM cannot rewrite a seal verdict.
- Judge UI simulate = mock facilitator (no CSPR moved). HTTP 402 seam is real.
- Production settle can move **real testnet CSPR** when configured (`casper_deploy` — see payment tx above).
- MintGate / collateral / MyAssets are demo economics where not full on-chain — explorer links for simulated mints are **omitted**, not faked.
- Sample assets and operators are fictional unless labeled as Casper Testnet evidence.

---

## Differentiation

Most buildathon projects improve how agents **pay**, compose tools, publish market data, underwrite invoices, or rate agents.

Lastre answers a different **upstream** question:

> Was the physical origin of this RWA verified **before** any token, payment, or agent action?

- Payment rails monetize calls → Lastre verifies **origin** before calls matter.
- Market oracles publish feeds → Lastre gates **asset-origin proof** and permanent Invalid evidence.
- Credit desks underwrite cash flow → Lastre is **pre-token** provenance.
- Reputation systems judge agents → Lastre judges the **seal of the asset**.

**Proof before token. Seal decides. LLM only acts. Invalid is permanent on-chain proof.**

---

## After the buildathon

1. Grow Casper Testnet evidence; evaluate mainnet ProofOfOrigin only when safe.
2. Keep judge UI on mock simulate; harden real-CSPR ops and dual-key operator docs.
3. Offline field-operator capture kit + deterministic sealer runbook.
4. Partner-agent integrations that query Lastre **before** mint, finance, or collateral.
5. Public site and community updates **without** fake TVL, yield, or investment claims.

---

## Quick smoke

```bash
bash scripts/final-smoke.sh
curl -sS https://app-api.lastre.io/api/health | jq .
curl -sS https://app-api.lastre.io/api/evidence | jq '.x402, .onChain.source, .onChain.rpcEvidence.fullyVerified'
```

**Lastre** — proof of provenance for RWA agents on Casper.

---

## Tier 0 Beat-Claros evidence update (2026-07-15)

### Dual-key operational run

Lastre now includes a reproducible dual-key run artifact:

```bash
bash scripts/dual-key-pipeline.sh
jq -e '.sealer.accountHash != .attester.accountHash' output/dual-key-run.json
```

| Role | Account hash |
| --- | --- |
| Field sealer | `account-hash-4c8631b8d684faba4f3087c6be0fed6c506a9669bb378e6ee5fff7977b7d1657` |
| Chain attester | `account-hash-6de6ee75f7d41407d9e0643d24fe7debc36bbe75695950e544c4ebd11850e1b2` |

Rule: **Two keys, one seal rule**. The field sealer computes the deterministic offline seal; the chain attester authorizes the Casper write. The accounts are distinct.

### Composition chainRoot anchor

The 2-hop receipt model remains:

```text
tool_receipt → lastre_receipt
```

A real Casper Testnet native transfer anchors the demo `chainRoot` via `transfer-id`:

| Field | Value |
| --- | --- |
| chainRoot | `0c40eb1b4164b95305b0c98908dd6c17ce6bfa37b3900095d87304ea566f8d33` |
| anchor tx / deploy hash | `915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a` |
| explorer | https://testnet.cspr.live/transaction/915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a |
| transfer-id | `17290909242139064466` |

`casper-client get-deploy` confirms execution success. This is a real Casper Testnet Deploy hash, not a synthetic receipt.

### MintGate live status

MintGate economics are implemented and enforced in the API/contract tests, but **live MintGate deployment is still blocked**. See `docs/MINTGATE_LIVE.md`.

No MintGate package hash or `mint_lot` transaction is claimed until a real deploy + real mint transaction exists.
