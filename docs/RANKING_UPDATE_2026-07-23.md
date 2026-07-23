# Ranking hostil geral — Final Round (2026-07-23 ~02:25 UTC)

> **Não oficial.** Estimativas 0–5 hostis · **não** claim “#1” no Dora/TG.  
> Irmãos: [`RANKING_UPDATE_2026-07-22-closeout.md`](./RANKING_UPDATE_2026-07-22-closeout.md) · [`RANKING_UPDATE_2026-07-22.md`](./RANKING_UPDATE_2026-07-22.md) · [`HANDOFF_2026-07-23_SEALED_RAIL.md`](./HANDOFF_2026-07-23_SEALED_RAIL.md)

**Escopo:** Final Round Casper Agentic Buildathon · deadline **2026-07-26 23:59** · ~3 dias  
**Método:** tese Casper (RWA **origin** + agent rails + constraints) · prova on-chain · clareza demo · honesty · narrative Dora · overlap com Lastre  
**Fontes agora:**

| Fonte | Resultado |
| --- | --- |
| Dora finals badge (jina) | **BUIDLs 59** · **Hackers 172** · “3 days left” |
| Dora BUIDL list scrape | **WAF/empty** nesta passada (`No BUIDLs` no HTML) — IDs da 1ª página **não** re-enumerados ao vivo |
| Known set (`.cache/finals-known-buidls.json`) | 29 IDs; Lastre **46748** present |
| Lastre BUIDL 46748 (jina) | Live pack: thesis, evidence, health, demo video, CLI prove |
| Prod API | health · rail · evidence · mint/summary (ver §0) |
| Ship 23/07 (repo) | Sealed Rail UI+API · dual x402 · auto-lock · scroll · landing CTA |

**Delta vs 22/07 closeout (combo 4.63):**

| Eixo | O que mudou (23/07) |
| --- | --- |
| Demo day path | **Sealed Market Rail** one-click: Valid seal → mock x402 → MintGate → demo collateral (steps 1–5) |
| Dual x402 | Primary `casper` + side-car **CSPR.cloud WCSPR** `cloudReady: true` (honesty no evidence) |
| Idempotência | `ALREADY_MINTED` / `ALREADY_LOCKED` = step complete (prod shared state) |
| Landing | Capabilities “Mint sealed asset” → `app.lastre.io/marketplace?rail=1` (+ `VITE_APP_URL` trim) |
| UX app | Coluna esquerda scrollável (rail+lista); mapa fixo |
| Campo badge | **59 / 172** (= last check 00:32Z; +5 BUIDLs / +6 hackers vs closeout 54/166) |

---

## 0. Snapshot Lastre (verificado ~02:20 UTC)

| Item | Status |
| --- | --- |
| BUIDL | https://dorahacks.io/buidl/46748 — **live** |
| Thesis | *Proof before token — and proof before finance* |
| Landing | https://lastre.io · `#sealed-rail` · `#capabilities` CTA → app rail |
| App rail | https://app.lastre.io/marketplace?rail=1 — **smoke humano OK** (Valid + mock payload) |
| API | https://app-api.lastre.io |
| `facilitatorMode` | **`casper`** |
| Cloud side-car | **`cloudReady: true`** · payTo WCSPR `006de6ee…e1b2` |
| Product rail | `GET /api/rail` → `sealed-market-rail` |
| Evidence | `sealedMarketRail` · `honesty` · `lastCasperSettle` · `dualKey` · `x402Mode` |
| lastCasperSettle | `25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a` (`casper_deploy`) |
| onChain | `live-rpc` · PoO package `hash-b8b505fe…0561` |
| mint summary | mintCount **2** · paidX402Queries **21** (session) |
| Demo video (Dora) | https://youtu.be/UzhKMsKA6QE (existente — **re-gravação Sealed Rail ainda residual**) |
| PRs ship 23/07 | #56–#58 backend · #57 UI Laura · #59 mint idem · #60 auto-lock · #61 scroll · #62–#63 landing CTA |

---

## 1. Top 10 hostil (estimativa combo)

| # | Projeto | ID | Combo | Δ vs 22/07 | Eixo | Notas |
| ---: | --- | --- | :---: | :---: | --- | --- |
| **1** | **Lastre** | **46748** | **4.70** | **+0.07** | RWA **origin** gate | Sealed Rail full path + dual x402 honesty + smoke prod |
| 2 | Claros | 46160 | 4.38 | = | Oracle / agent feeds | Densidade agentic; não dual-key origin |
| 3 | Faktura | 46441 | 4.28 | = | Invoice RWA + policy | Finance pós-origin |
| 4 | AgentGate | 46679 | 4.12 | = | HTTP → CSPR pay | Pay rails ≠ provenance |
| 5 | CasCet | 46821 | 4.08 | = | MCP × x402 cascades | NEW 23/07 a.m.; pay multi-hop |
| 6 | AgriTrust | 47173 | 4.00 | = | Ag invoice credit | RWA money unlocked |
| 7 | Vouch | 45565 | 4.00 | = | Agent trust/escrow | “Trust” verbal only |
| 8 | CanopyMRV | 46745 | 3.90 | = | Carbon MRV ISSUE/FREEZE | Climate stack; Lastre = origin before credit **and** finance |
| 9 | Wardens | 46792 | 3.97 | = | Continuous collateral | Origin once ≠ continuous monitor |
| 10 | AgentPay Guard | 46706 | 3.95 | = | x402 spend policy | Wallet policy |

*Combo 4.70 = média hostil ponderada (tech / agent / RWA origin / Casper depth / honesty / demo-narrative).*  
*Não confundir com ranking oficial Dora (ainda não publicado / MACI).*

### Por que Lastre **+0.07** (4.63 → 4.70)

| + | Motivo |
| --- | --- |
| +0.04 | **Demo day:** um Run Sealed Rail completa 1–5 em prod (judge path) |
| +0.02 | **Dual stack x402** documentado no evidence (casper settle + cloud WCSPR ready) |
| +0.01 | Landing ↔ app deep-link + scroll/rail polish (menos fricção de júri) |

### Por que **não** 4.8+

| − | Motivo |
| --- | --- |
| Claros | Ainda pode vencer polish de marketplace de feeds |
| Vídeo | Link Dora ainda é o pack antigo — beat Sealed Rail **não** re-gravado |
| Grid | Badge 59; scrape lista vazia = vigilância incompleta de NEW BUIDLs |
| Shared MintGate | ALREADY_MINTED em prod é feature de demo, não economia mainnet |

---

## 2. Matriz hostil Top 6 (0–5)

| | Tech | Agent | RWA origin | Casper depth | Honesty | Demo / narrative |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Lastre** | **4.7** | 4.4 | **4.95** | **4.7** | **4.95** | **4.85** |
| Claros | 4.4 | **4.7** | 3.4 | 4.3 | 4.0 | 4.6 |
| Faktura | 4.2 | 4.3 | 4.2 | 4.0 | 4.0 | 4.3 |
| AgentGate | 4.1 | 4.3 | 1.6 | 4.0 | 4.0 | 4.0 |
| CasCet | 4.2 | 4.4 | 1.8 | 4.0 | 4.0 | 4.1 |
| AgriTrust | 3.9 | 4.1 | 4.0 | 3.6 | 3.5 | 4.0 |
| CanopyMRV | 3.9 | 3.8 | 4.0 | 3.7 | 3.6 | 3.9 |

---

## 3. Tier S / A / B (snapshot)

### Tier S (~4.05+)
**Lastre** · Claros · Faktura · AgentGate · CasCet

### Tier A (3.70–4.05)
AgriTrust · Vouch · CanopyMRV · Wardens · AgentPay Guard · Caliber · Concordia · Sentinel AI (46715)

### Tier B (periferia / pay-only / coach)
Leash · AgentShield · Baret · AiFinPay · CasperAgent · Arena · KaJota · Pico · XELT · Runway · Codequity · Ulgen · Arzing

### NEW monitor (desde 00:32Z)

| ID | Nome | Tese 1 linha | Ameaça a Lastre |
| --- | --- | --- | --- |
| 46821 | CasCet | MCP tools + x402 multi-hop pay | Pay rails — **não** origin |
| 46715 | Casper Sentinel AI | Policy pre-exec de txs agent | Wallet security — **não** origin |

---

## 4. Pressão do campo

| Rival | Pressão | Counter Lastre (público) |
| --- | --- | --- |
| Claros | Agent + data density | Feed ≠ dual-key origin seal |
| Faktura / AgriTrust / CanopyMRV | RWA money / carbon credit | **Proof before finance** + Valid-only MintGate |
| Wardens | Continuous collateral | Origin attestation ≠ continuous monitor |
| AgentGate / CasCet | Pay / MCP rails | Pay **for** provenance (`pay for provenance, not instead`) |
| Sentinel AI | Agent tx policy | Pre-exec risk ≠ physical origin |

---

## 5. Campo Dora (badge)

| Métrica | 22/07 closeout | 23/07 00:32Z | 23/07 02:25Z |
| --- | ---: | ---: | ---: |
| BUIDLs (badge) | 54 | **59** | **59** (reconfirm jina) |
| Hackers | 166 | **172** | **172** |
| Deadline | 26/07 | 26/07 | **~3 days left** |
| Lastre on grid | yes | yes | yes (BUIDL page live) |
| Lista 1ª página scrape | partial | 24 IDs | **0 IDs** (WAF/empty shell) |

**Disciplina:** badge 59 ≠ 59 revisados; usar known set + samples até scrape voltar.

---

## 6. Onde sobe / cai daqui até 26/07

| Movimento | Efeito hostil |
| --- | --- |
| Vídeo 60s com beat Sealed Rail (steps 1–5 + Invalid) colado no Dora | **+0.05 a +0.08** |
| Autonomy ×3 no dia do jury (cold start) | **+0.03** |
| BUIDL Dora atualizado com `?rail=1` + dual x402 honesty | **+0.02** |
| Outage API / rail vermelho no live demo | **−0.25 a −0.40** |
| Claim mainnet money / “#1 oficial” / Kraken | **−0.50** |
| NEW BUIDL origin-grade (seal + mint gate) sem counter | **−0.10 a −0.20** |

---

## 7. Histórico de score Lastre (combo hostil)

| Snapshot | Score | Gatilho |
| --- | :---: | --- |
| 20/07 JUMP público | ~4.45 | Grid + dual-key base |
| 21/07 a.m. finance counters | 4.50 | Copy pack |
| 21/07 noite pós-deploy API | 4.55 | Evidence jury |
| 22/07 BUIDL Dora completo | 4.60 | Narrative pública |
| 22/07 closeout densify | **4.63** | Settle densify + dry-run |
| **23/07 Sealed Rail ship + smoke** | **4.70** | One-click rail · dual x402 · CTA landing |

---

## 8. Checklist residual (só o que falta)

| # | Item | Owner | Bloqueia finalista? |
| ---: | --- | --- | --- |
| 1 | **Re-gravar vídeo 60s** com Sealed Rail (+ Invalid) e colar no BUIDL | Felix | Se vídeo atual for rejeitado no Dora — **sim** |
| 2 | Atualizar corpo BUIDL: deep-link `?rail=1`, dual x402 cloudReady, honesty freeze | Felix | Não (nice for judges) |
| 3 | Autonomy ×3 **no dia do jury** | Felix | Não (hygiene) |
| 4 | Dependabot / npm audit high | Eng | Não (CI noise) |
| 5 | Re-enable scrape 1ª página (jina/WAF) | Ops | Não (intel) |
| 6 | Opcional: 1 settle WCSPR real + hash no BUIDL | Felix | Não |

**Eng/ops produto Sealed Rail: DONE para demo de júri** (API + app + landing CTA). Residual = **vídeo + copy Dora**.

---

## 9. Mensagem interna (1 tela)

1. **Lastre ~4.70 hostil** · Claros **4.38** no ombro · **não** postar “#1”.  
2. **Demo path de 23/07:** `lastre.io` → Mint CTA / `#sealed-rail` → `app…/marketplace?rail=1` → Run → 5 steps · Invalid branch.  
3. **Honesty inalterada:** UI simulate = mock; settle casper real via API/CLI; cloud WCSPR side-car ready.  
4. **Campo 59/172** · deadline **26/07** · NEW pay-rails (CasCet/Sentinel) **não** origin.  
5. **Único residual crítico de narrativa:** vídeo com beat Sealed Rail.

---

## 10. Comandos de re-verificação

```bash
export API=https://app-api.lastre.io
curl -sS "$API/api/health" | jq '.x402.facilitatorMode, .x402.cloud.cloudReady'
curl -sS "$API/api/rail" | jq '.product.id'
curl -sS "$API/api/evidence" | jq '{thesis, x402Mode, sealed: .sealedMarketRail.product.id, settle: .lastCasperSettle.txHash}'

# Badge finals (jina)
curl -sS "https://r.jina.ai/https://dorahacks.io/hackathon/casper-agentic-buildathon-finals/buidl" \
  | grep -oE 'BUIDLs [0-9]+|Hackers [0-9]+'

# Smoke UI
# https://lastre.io/#capabilities → Mint sealed asset
# https://app.lastre.io/marketplace?rail=1 → Run Sealed Rail demo
```

---

*Gerado 2026-07-23 após smoke Sealed Rail + PRs #59–#63. Atualizar se badge >59 ou NEW origin-grade BUIDL aparecer.*
