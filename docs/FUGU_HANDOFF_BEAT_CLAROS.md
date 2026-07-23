# Fugu handoff — Beat Claros Tier 0

Date: 2026-07-15  
Branch: `final/beat-claros-tier0`  
Rule: no invented Casper hashes; mock simulate remains mock.

## Preflight

Commands run:

```bash
git fetch origin && git checkout main && git pull origin main --ff-only
curl -sS https://app-api.lastre.io/api/health | jq .x402
curl -sS https://app-api.lastre.io/api/evidence | jq '{
  dualKey: .dualKey.distinct,
  operators: [.operators[].role],
  composition: .composition.model,
  mintGate: .mintGate.rules[0:2],
  fullyVerified: .onChain.rpcEvidence.fullyVerified,
  x402: .x402.facilitatorMode
}'
```

Observed:

```json
{
  "health.x402.facilitatorMode": "casper",
  "health.x402.secretPemLooksValid": true,
  "evidence.dualKey.distinct": true,
  "operators": ["field_sealer", "chain_attester", "paying_agent", "human_escalation"],
  "composition.model": "tool_receipt → lastre_receipt",
  "fullyVerified": true,
  "x402.facilitatorMode": "casper"
}
```

## T0.1 Dual-key

- sealer publicKey: `0193d8172e0e3aa24a7b1894331324ef17cb49d44ac4899b75083d1987b1725176`
- sealer accountHash: `account-hash-4c8631b8d684faba4f3087c6be0fed6c506a9669bb378e6ee5fff7977b7d1657`
- attester publicKey: `01825d5caa210121ea1e493223af5a76f7ff23c70322c5fd0f02eb09f2818f68ad`
- attester accountHash: `account-hash-6de6ee75f7d41407d9e0643d24fe7debc36bbe75695950e544c4ebd11850e1b2`
- path output: `output/dual-key-run.json`
- script: `scripts/dual-key-pipeline.sh`
- seal: `02b124b78ea702ce0cf1afda98c9c65a6f70c27720e2b2c4f0595c5fdc5ee12c`

Verification:

```bash
bash scripts/dual-key-pipeline.sh
jq -e '.sealer.accountHash != .attester.accountHash' output/dual-key-run.json
cd app && node --test --import tsx test/dualKeyRun.test.ts
```

Status: **PASS**

## T0.2 MintGate

- package hash: **none**
- mint_lot tx: **none**
- explorer URLs: **none**
- Render env set: **no** (`LASTRE_MINTGATE_PACKAGE_HASH` must not be set until a real package exists)
- details: `docs/MINTGATE_LIVE.md`

ProofOfOrigin dependency discovered by RPC:

- package: `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561`
- contract version hash: `contract-27f08307b82295e664fa5d2d7473bd10e393962f7f113f8fd1beadb51fd816b4`

Deploy attempts:

1. `contract-...` as `proof_contract` failed before deploy: `AddressCreationFailed`.
2. `hash-...` package as `proof_contract` reached deploy but failed:

```text
Contract init failed ExecutionError(ContractDeploymentError)
```

Backtrace points to Odra deploy host:

```text
<lastro_contracts::mint_gate::MintGate as odra_core::host::Deployer<...>>::deploy
at odra-core-2.8.1/src/host.rs:216:23
```

Status: **FAIL / BLOCKED**  
Reason: no live package hash and no real `mint_lot` transaction. No fake hash was invented.

## T0.3 Anchor

- chainRoot sample: `0c40eb1b4164b95305b0c98908dd6c17ce6bfa37b3900095d87304ea566f8d33`
- transfer-id: `17290909242139064466`
- anchorTx / Deploy hash: `915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a`
- explorer: https://testnet.cspr.live/transaction/915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a
- script: `scripts/anchor-composition-root.mjs`
- output: `output/composition-anchor.json`

Verification:

```bash
casper-client get-deploy -n https://node.testnet.casper.network/rpc \
  915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a
```

Observed:

```text
execution_result.Version2.error_message = null
session.Transfer.args.id.parsed = 17290909242139064466
transaction_hash.Deploy = 915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a
```

Note: this is a Casper **Deploy** hash (legacy transfer). `casper-client get-transaction` does not find it as a Version1 transaction; `get-deploy` confirms execution.

Code evidence after API redeploy:

```json
"composition": {
  "chainRoot": "0c40...8d33",
  "anchorTx": "915c...417a",
  "anchorExplorerUrl": "https://testnet.cspr.live/transaction/915c...417a",
  "anchored": true
}
```

Status: **PASS candidate** (requires app-api redeploy to expose in production evidence endpoint)

## T0.4 Compete UI

- section: `app/src/routes/Agents.tsx`
- route: `https://app.lastre.io/agents`
- content: honest Lastre vs Claros / AgentGate / CasCet matrix
- required copy included: “Claros optimizes the agent network. Lastre is the truth gate under it.”
- explicit honesty: Lastre loses broad oracle-network axis to Claros-style systems by design.

Status: **PASS candidate** (requires app deploy after merge)

## T0.5 Docs

Files updated/created:

- `docs/BUIDL_PAGE_DORAHACKS.md`
- `docs/BUIDL_PAGE_PASTE.md`
- `docs/MINTGATE_LIVE.md`
- `docs/SCORECARD_BEAT_CLAROS.md`
- `docs/FUGU_HANDOFF_BEAT_CLAROS.md`
- `scripts/dual-key-operators.md`

Docs include only real hashes:

- payment: `27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c`
- anchor deploy: `915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a`
- canonical PoO txs already listed

Docs explicitly mark MintGate live as **blocked** and do not claim package/mint tx.

Status: **PASS with T0.2 failure disclosed**

## T0.6 Prod smoke

Local/pre-merge verification run:

```bash
cd app && node --test --import tsx test/dualKeyRun.test.ts
cd app && node --test --import tsx test/compositionAnchor.test.ts
bash scripts/final-smoke.sh
```

Production preflight before this branch:

```json
{
  "dualKey": true,
  "operators": ["field_sealer", "chain_attester", "paying_agent", "human_escalation"],
  "composition": "tool_receipt → lastre_receipt",
  "fullyVerified": true,
  "x402": "casper"
}
```

Required after merge:

1. Merge PR to main.
2. Redeploy `app-api` from latest main so `composition.anchorTx` appears in `/api/evidence`.
3. Do **not** set `LASTRE_MINTGATE_PACKAGE_HASH` unless MintGate deploy is fixed and a real package hash exists.
4. Re-run:

```bash
API=https://app-api.lastre.io
curl -sS $API/api/evidence | jq '{
  dualKey,
  mintGate: { live: .mintGate.livePackageHash, rules: .mintGate.rules|length },
  composition: { model: .composition.model, anchor: .composition.anchorTx },
  fullyVerified: .onChain.rpcEvidence.fullyVerified
}'
curl -sS -X POST $API/api/x402/simulate/CARBON-VCS-AMAZONIA-2024-001 \
  -H 'content-type: application/json' -d '{}' \
  | jq '{settlementKind, facilitatorMode, mint: .provenance.csprLinks.mint}'
bash scripts/final-smoke.sh
```

Status: **PENDING production redeploy**

## Scorecard after

| Dimensão | Antes | Depois |
| --- | ---: | ---: |
| MintGate | 4.85 | 4.85 — **T0.2 FAIL/BLOCKED** |
| Dual-key | 4.9 | 5.0 candidate |
| 2-hop | 4.9 | 5.0 candidate after API redeploy |
| Overall rank claim | #2 | Do **not** claim beat-Claros until MintGate live passes |

## Risks / residual

- **MintGate live is the blocker.** Odra livenet deploy fails with `ContractDeploymentError` during init. Needs focused contract/deploy debugging; no fake package/mint tx was created.
- The composition anchor is a legacy Casper Deploy hash; validator should use `casper-client get-deploy`, not only `get-transaction` Version1.
- Production `/api/evidence` needs app-api redeploy to show anchor fields added in this branch.
- Simulate must remain mock (`synthetic_receipt`) and mint explorer must remain `null`.

## Final verdict

Tier 0 is **not fully complete** because T0.2 failed honestly.  
Allowed claim: dual-key operational run + composition anchor + compete framing are complete candidates.  
Forbidden claim: “beat Claros under demanding judge” until MintGate live package + real `mint_lot` tx exist.
