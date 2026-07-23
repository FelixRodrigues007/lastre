# FUGU FULL EXECUTION — Superar Claros (juiz exigente)

**Owner:** Felix  
**Executor:** Fugu (full autonomy on implementation)  
**Validator:** Grok (this session / next) — **não confia em claim sem prova**  
**Data do brief:** 2026-07-15  
**Branch sugerida:** `final/beat-claros-tier0`  
**Base já em `main` (NÃO reimplementar):** A3 CSPR real, B2 CLI, C3 operators[] dual-key config, D2 2-hop receipts, E2 mint economics parity + honesty, evidence live-RPC  

---

## 0. Missão em uma frase

Tornar **impossível** um juiz exigente dizer *“Lastre é só demo de provenance”* — fechando o gap residual vs **Claros** (densidade multi-party operacional + economics on-chain + composition anchored) **sem** diluir *proof before token*.

### NÃO é a missão
- Virar marketplace/oracle tipo Claros  
- Inventar txs / package hashes  
- Quebrar UI simulate mock  
- Claim “#1 oficial DoraHacks”  

### É a missão
Fechar **Tier 0** com provas em prod + BUIDL paste + scorecard.

---

## 1. Estado de partida (Fugu deve re-verificar antes de codar)

```bash
git fetch origin && git log -3 --oneline origin/main
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

**Esperado agora (PASS se bater):**
- `facilitatorMode: casper`, `secretPemLooksValid: true`
- `dualKey.distinct: true`, 4 operators
- `composition: tool_receipt → lastre_receipt`
- `fullyVerified: true`
- Payment conhecido: `27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c`

Se algo falhar → **parar** e reportar; não empilhar Tier 0 em cima de regredir.

### Gaps que AINDA faltam (por que Claros ainda pode ganhar)

| Gap | Por que juiz exige | Epic |
| --- | --- | --- |
| Dual-key só **configurado**, não **run** com 2 keys em pipeline documentado | “multi-party é marketing” | **T0.1** |
| MintGate **sem package live** + sem `mint_lot` explorer | “sem token economics real” | **T0.2** |
| 2-hop sem **anchor on-chain** do chainRoot | “composition só JSON” | **T0.3** |
| Framing Compete + Invalid path pouco visível | Claros parece “maior” | **T0.4** |
| Vídeo/BUIDL sem 2-key story | Agentic fraco no pitch | **T0.5** |

---

## 2. Definição de DONE (binária)

Só marcar **BEAT_CLAROS_RUBRIC=true** se **todos** forem ☑:

```text
[ ] T0.1 Dual-key RUN: sealer account ≠ attester account; artefato JSON + script; operators[].lastTx coerente ou lastTx sealer documentado
[ ] T0.2 MintGate package hash LIVE no testnet + ≥1 mint_lot tx no explorer + env Render LASTRE_MINTGATE_PACKAGE_HASH
[ ] T0.3 composition.anchorTx (ou equivalente) no evidence com explorer URL canônica (64 hex)
[ ] T0.4 Rota ou secção Compete no app (ou Agents) Lastre vs Claros/AgentGate/CasCet — honesta
[ ] T0.5 BUIDL paste atualizado (docs) com txs NOVAS + dual-key run + mint + anchor
[ ] Simulate continua mock; mint explorer fake continua null
[ ] /api/evidence fullyVerified ainda true (não quebrar live-rpc)
[ ] Testes unitários novos verdes; smoke final PASS
[ ] PR mergeado em main + Render app-api redeployed
```

Se **qualquer** ☑ faltar → **NÃO** claim “superamos Claros no juiz exigente”.  
Claim permitido com todos ☑: *“Top-1 origin + technical contender that closes multi-party/mint/composition gaps vs Claros-class systems.”*

---

## 3. Ordem de execução (obrigatória)

```text
T0.0  Preflight + branch
T0.1  Dual-key operational pipeline
T0.2  MintGate live deploy + mint_lot
T0.3  2-hop chainRoot anchor
T0.4  Compete UI framing
T0.5  Docs/BUIDL + scorecard
T0.6  Render redeploy + smoke
T0.7  Handoff report for Grok validator
```

Não pular T0.2 antes de T0.1 se dual-key run for mais rápido — mas **não** mergear half-done mint package.

---

## 4. Epic T0.1 — Dual-key RUN (P0)

### Objetivo
Duas **account-hashes diferentes** participam do pipeline documentado:
- **Sealer key:** `~/.casper-keys/lastro-sealer/` (pubkey default já em `app/server/operators.ts`)
- **Attester key:** `~/.casper-keys/lastro-deploy/` (pubkey attester)

### Deliverables
1. `scripts/dual-key-pipeline.sh` (ou `.mjs`) que:
   - Imprime sealer pubkey + account-hash  
   - Imprime attester pubkey + account-hash  
   - Assert `sealer_account != attester_account` (exit 1 se iguais)  
   - Gera/usa artifact + seal offline (pode chamar sealer package se existir)  
   - Documenta que **register/attest** usam attester key (comandos casper-client ou odra attest se existirem)  
   - Escreve `output/dual-key-run.json` com:
     ```json
     {
       "sealer": { "publicKey": "...", "accountHash": "..." },
       "attester": { "publicKey": "...", "accountHash": "...", "lastTx": "..." },
       "assetId": "...",
       "seal": "...",
       "rule": "Two keys, one seal rule"
     }
     ```
2. Atualizar `GET /api/evidence` se necessário:
   - `operators[field_sealer].accountHash` e `operators[chain_attester].accountHash` distintos  
   - Preferir lastTx reais quando existirem  
3. `scripts/dual-key-operators.md` atualizado com output do último run  
4. Teste: `app/test/operators.test.ts` (já existe) + assert dual-key run JSON schema se útil  

### Aceitação
```bash
bash scripts/dual-key-pipeline.sh
jq -e '.sealer.accountHash != .attester.accountHash' output/dual-key-run.json
curl -sS $API/api/evidence | jq -e '.dualKey.distinct == true'
```

### NÃO
- Usar a mesma secret para “simular” dois papéis  
- Inventar lastTx  

---

## 5. Epic T0.2 — MintGate LIVE (P0)

### Objetivo
MintGate **on-chain** no Casper Testnet + ≥1 `mint_lot` com explorer.

### Contexto repo
- Contrato: `contracts/lastro_origin/src/mint_gate.rs`  
- WASM: `contracts/lastro_origin/wasm/MintGate.wasm`  
- Deploy atual só PoO: `contracts/lastro_origin/bin/deploy.rs`  
- PoO package: `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561`  
- API economics já em: `app/server/mint-economics.ts` + `GET /api/mint/economics`  
- Env: `LASTRE_MINTGATE_PACKAGE_HASH`

### Deliverables
1. Bin/script de deploy MintGate com `proof_contract` = endereço/contrato ProofOfOrigin **correto** (não inventar; ler de named keys / query / docs existentes).  
   - Preferir Odra livenet (`deploy` feature) se for o path oficial.  
2. Após deploy: gravar em `docs/MINTGATE_LIVE.md`:
   - package hash  
   - contract address se houver  
   - init tx / install tx  
   - mint_lot tx hash  
   - asset_id mintado (deve ter Valid on-chain)  
3. Wire API:
   - `LASTRE_MINTGATE_PACKAGE_HASH` lido (já)  
   - Evidence `mintGate.livePackageHash` não-null em prod após Render env  
   - Se possível: read `mint_count` / `is_minted` via query binário ou RPC (melhoria); se não, honest note  
4. **Não** linkar mint demo `mint-*` como explorer canônico  

### Aceitação
```bash
# package existe no explorer (humano)
# https://testnet.cspr.live/contract-package/<mintgate-hash-without-prefix>
curl -sS $API/api/mint/economics | jq -e '.livePackageHash != null'
curl -sS $API/api/evidence | jq '.mintGate.livePackageHash, .mintGate.livePackageUrl'
```
E mint_lot tx no BUIDL/docs com 64 hex real.

### Riscos
- Gas / key funding (lastro-deploy tem saldo — usar com cuidado)  
- Endereço ProofOfOrigin errado → mint sempre NoValidProof  
- Deploy novo PoO **proibido** sem owner; reutilizar package atual  

### Se deploy impossível no prazo
Fugu deve reportar **BLOCKED** com log — **não** inventar package. Validator marca T0.2 FAIL.

---

## 6. Epic T0.3 — 2-hop ANCHOR (P0)

### Objetivo
Após compose Valid, ancorar `chainRoot` on-chain (1 tx) e expor no evidence.

### Contexto
- Store: `app/server/receipts.ts` (`chainRoot` já existe)  
- API: `/api/receipts/*`  
- Payment transfer pattern: `CasperFacilitator` / casper-client transfer  

### Deliverables
1. Função `anchorCompositionRoot(chainRoot: string)`:
   - Preferir `casper-client transfer` com `--transfer-id` = u64 derivado do chainRoot (mesmo padrão `transferIdFromNonce`)  
   - Ou put-transaction se já houver path  
   - Retorna `{ txHash, explorerUrl }`  
2. `POST /api/receipts/compose` e/ou `POST /api/receipts/anchor`:
   - Após Valid hop, opcional `anchor: true` ou env `LASTRE_COMPOSITION_ANCHOR=1`  
   - Response inclui `anchorTx`  
3. Evidence:
   ```json
   "composition": {
     "model": "tool_receipt → lastre_receipt",
     "killSwitch": "...",
     "anchorTx": "<64hex>|null",
     "anchorExplorerUrl": "...|null",
     "receipts": [...]
   }
   ```
4. Teste unitário: kill-switch ainda PASS; anchor mocked via exec inject se necessário  

### Aceitação
```bash
# demo compose + anchor (local casper mode ou prod se keys)
curl -sS -X POST $API/api/receipts/demo -H 'content-type: application/json' -d '{}'
# se endpoint anchor:
curl -sS $API/api/evidence | jq -e '.composition.anchorTx | length == 64 or . == null'
# Para DONE: anchorTx length 64 e explorer abre
```

### NÃO
- Afirmar anchor se só hash sintético  
- Quebrar kill-switch Invalid  

---

## 7. Epic T0.4 — Compete framing (P1 rápido)

### Objetivo
Juiz vê em **1 tela** por que Lastre não é Claros — e por que isso é feature.

### Deliverables
1. Secção em `app/src/routes/Agents.tsx` **ou** rota `/compete`:
   - Tabela honesta: Lastre vs Claros / AgentGate / CasCet  
   - Colunas: Origin seal · Invalid-as-proof · CSPR settle · Dual-key · 2-hop · Oracle network  
   - Lastre W/L honesto (Oracle network = L vs Claros)  
2. Link evidence + payment explorer + dual-key rule  
3. Copy: *“Claros optimizes the agent network. Lastre is the truth gate under it.”*  

### Aceitação
- UI build passa  
- Texto **não** diz “we are #1 overall”  
- Texto **diz** Invalid permanente + proof before token  

---

## 8. Epic T0.5 — BUIDL + scorecard (P1)

### Deliverables
1. Atualizar `docs/BUIDL_PAGE_DORAHACKS.md` (e paste pack se ainda usado) com:
   - Dual-key run summary + account hashes  
   - MintGate package + mint_lot tx  
   - Composition anchor tx  
   - Payment tx já conhecido  
2. `docs/SCORECARD_BEAT_CLAROS.md` before/after notas 0–5  
3. Opcional: 10 linhas Q&A hostil  

### Aceitação
- Nenhuma tx inventada  
- Todos os hashes batem com explorer  

---

## 9. Epic T0.6 — Deploy prod

```text
1. Merge PR → main
2. Render app-api Manual Deploy latest main
3. Env novos se preciso:
   LASTRE_MINTGATE_PACKAGE_HASH=hash-...
   LASTRE_COMPOSITION_ANCHOR=1  (se implementado)
   (manter LASTRE_X402_* e B64)
4. Smoke:
```

```bash
export API=https://app-api.lastre.io
curl -sS $API/api/health | jq .x402
curl -sS $API/api/evidence | jq '{
  dualKey, 
  mintGate: { live: .mintGate.livePackageHash, rules: .mintGate.rules|length },
  composition: { model: .composition.model, anchor: .composition.anchorTx },
  fullyVerified: .onChain.rpcEvidence.fullyVerified
}'
curl -sS $API/api/mint/economics | jq '{livePackageHash, mintCount, rules}'
bash scripts/final-smoke.sh || true
```

Simulate deve permanecer mock.

---

## 10. Constraints rígidas

| Regra | |
| --- | --- |
| Branch | `final/beat-claros-tier0` (ou similar); PR para `main` |
| Simulate | sempre mock |
| Fake explorer | proibido |
| Secrets | nunca commitar PEM/B64 |
| Keys | `lastro-sealer` + `lastro-deploy`; não gastar saldo em loops |
| Casper | testnet only |
| Commits | mensagens claras; 1 PR preferencialmente empilhado lógico |
| Idioma código | EN; docs podem PT/EN |

---

## 11. Relatório final que Fugu deve entregar (obrigatório)

Arquivo: `docs/FUGU_HANDOFF_BEAT_CLAROS.md`

```markdown
# Fugu handoff — Beat Claros Tier 0

## Preflight
- [ ] evidence dualKey / fullyVerified (colar output)

## T0.1 Dual-key
- sealer accountHash:
- attester accountHash:
- path output/dual-key-run.json:
- PASS/FAIL

## T0.2 MintGate
- package hash:
- mint_lot tx:
- explorer URLs:
- Render env set: yes/no
- PASS/FAIL

## T0.3 Anchor
- chainRoot sample:
- anchorTx:
- explorer:
- PASS/FAIL

## T0.4 Compete UI
- route/section:
- PASS/FAIL

## T0.5 Docs
- files updated:
- PASS/FAIL

## T0.6 Prod smoke
- colar jq evidence pós-redeploy
- PASS/FAIL

## Scorecard after
| Dimensão | Antes | Depois |
| MintGate | 4.85 | ? |
| Dual-key | 4.9 | ? |
| 2-hop | 4.9 | ? |
| Overall rank claim | #2 | ? |

## Risks / residual
...
```

---

## 12. Prompt para colar no Fugu (full)

```text
You are Fugu in FULL EXECUTION mode for Lastre (repo lastre / lastro).

PRIMARY SPEC (read completely, obey order and DONE gates):
  docs/FUGU_FULL_BEAT_CLAROS_EXECUTION.md

CONTEXT (already shipped on main — do NOT reimplement or regress):
  - Real CSPR settle prod (casper_deploy) + CLI
  - operators[] dual-key CONFIG (distinct sealer≠attester) + 2-hop receipts + MintGate economics parity
  - Honesty: simulate mock; no fake mint explorer links
  - Evidence live-RPC fullyVerified

MISSION:
  Close residual gaps so a demanding judge can no longer prefer Claros solely for
  "multi-party / economics / composition density" while Lastre keeps proof-before-token.

EXECUTE Tier 0 in order T0.1 → T0.6:
  T0.1 Dual-key OPERATIONAL pipeline (two real account-hashes, dual-key-run.json)
  T0.2 MintGate LIVE deploy + ≥1 mint_lot tx on testnet + LASTRE_MINTGATE_PACKAGE_HASH
  T0.3 Anchor composition chainRoot on-chain + evidence.composition.anchorTx
  T0.4 Compete framing UI (honest vs Claros/AgentGate/CasCet)
  T0.5 Update BUIDL docs with ONLY real new hashes
  T0.6 Render redeploy guidance + smoke; write docs/FUGU_HANDOFF_BEAT_CLAROS.md

RULES:
  - Never invent Casper hashes or package ids
  - Never break judge simulate mock path
  - Never commit secrets
  - If MintGate deploy blocked, mark T0.2 FAIL with logs — do not fake
  - Prefer minimal surgical code; match existing style
  - Tests for new logic; PR to main when green

END STATE:
  All DONE checkboxes in §2 of the spec, handoff doc complete for Grok validator.
```

---

## 13. Checklist do VALIDADOR (Grok) — usar após Fugu

### A. Repo
- [ ] PR merged to `main`  
- [ ] Sem secrets no diff  
- [ ] `scripts/dual-key-pipeline.*` existe e exit 0  
- [ ] `output/dual-key-run.json` ou doc com hashes distintos  
- [ ] `docs/MINTGATE_LIVE.md` com package + mint tx  
- [ ] `docs/FUGU_HANDOFF_BEAT_CLAROS.md` completo  

### B. Prod (curl)
- [ ] `dualKey.distinct == true`  
- [ ] `mintGate.livePackageHash` não null (se T0.2 PASS)  
- [ ] `composition.anchorTx` 64 hex (se T0.3 PASS)  
- [ ] `fullyVerified == true`  
- [ ] simulate ainda `synthetic_receipt`  
- [ ] mint/attestation explorer null no simulate  

### C. Explorer (humano)
- [ ] Payment tx ainda válido  
- [ ] MintGate package page abre  
- [ ] mint_lot tx abre  
- [ ] anchor tx abre  

### D. Claim gate
- [ ] Se todos PASS → autorizar claim “fecha gaps vs Claros no juiz exigente / contender #1 origin + multi-party+mint+composition”  
- [ ] Se algum FAIL → listar falhas; **proibir** claim beat Claros  

### E. Notas pós-validação (preencher)
| Dimensão | Pré-Fugu | Pós-Fugu (validado) |
| --- | ---: | ---: |
| Dual-key | 4.9 | _ |
| MintGate | 4.85 | _ |
| 2-hop | 4.9 | _ |
| Rank overall | #2 | _ |

---

## 14. Referências rápidas

| Item | Valor |
| --- | --- |
| PoO package | `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561` |
| Payment prod | `27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c` |
| Invalid sample | `5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd` |
| Valid sample | `43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4` |
| Attester pubkey | `01825d5caa210121ea1e493223af5a76f7ff23c70322c5fd0f02eb09f2818f68ad` |
| Sealer pubkey (default) | `0193d8172e0e3aa24a7b1894331324ef17cb49d44ac4899b75083d1987b1725176` |
| API | `https://app-api.lastre.io` |
| App | `https://app.lastre.io` |
| Ranking atual | `docs/RANKING_UPDATE_2026-07-15.md` |
| Score C/D/E | `docs/SCORECARD_CDE_EPICS.md` |

---

**Fugu executa full. Grok valida com §13. Owner só cola BUIDL e redeploy se Fugu não tiver acesso Render.**
