# Ranking hostil geral — Final Round (2026-07-22 ~00:36 UTC)

> **Atualização jury-lens + Direção:** ver [`RANKING_UPDATE_2026-07-22-jury-lens.md`](./RANKING_UPDATE_2026-07-22-jury-lens.md) e [`JURY_LENS_CASPER_DIRECAO_2026-07-22.md`](./JURY_LENS_CASPER_DIRECAO_2026-07-22.md) — Lastre **4.62** combo.


**Escopo:** ~175 finalistas oficiais · grid pública **BUIDLs 50** · **Hackers 160**  
**Método:** tese Casper (RWA origin + agent rails + constraints) · prova on-chain · clareza demo · honesty · narrative pública Dora · overlap com Lastre  
**Disciplina:** **estimativas 0–5, não ranking oficial Dora.** Não publicar “#1” no Dora/TG.

**Delta vs 21/07 noite (pós-deploy API):** BUIDL **46748** atualizado com pack completo (markdown limpo, proof-before-finance, settle latest, honesty, differentiation vs Claros/Faktura/AgriTrust/Wardens). Prod API estável (`casper` + jury evidence). Autonomy counters em 0 = cold start normal.

---

## 0. Snapshot Lastre (verificado agora)

| Item | Status |
| --- | --- |
| BUIDL público | https://dorahacks.io/buidl/46748 — **pack completo live** |
| Thesis pública | *proof before token (and before finance)* |
| Diff pública | vs oracles / finance / Wardens / pay rails no corpo do BUIDL |
| Settle no BUIDL | `b1967b63…` + explorer |
| API | https://app-api.lastre.io · `facilitatorMode=casper` |
| Evidence jury | `honesty` · `lastCasperSettle` · `x402Mode` · `dualKey` |
| jury-smoke (sessão anterior) | fail=0 pós-Render |
| Demo day residual | dry-run visual 90s + autonomy×3 no dia do jury |

---

## 1. Top 10 hostil (estimativa)

| # | Projeto | ID | Score | Δ vs 21/07 noite | Eixo | Notas |
| ---: | --- | --- | :---: | :---: | --- | --- |
| **1** | **Lastre** | 46748 | **4.60** | **+0.05** | RWA **origin** gate | Dora pack completo + API jury live + densify settles |
| 2 | **Claros** | 46160 | **4.35** | = | Oracle / agent feeds | Ainda #1 rival em densidade agentic; não origin seal |
| 3 | **Faktura** | 46441 | **4.20** | = | Invoice RWA + policy firewall | AI underwrites; finance pós-origin |
| 4 | **Vouch** | 45565 | **4.10** | = | Agent trust/escrow | Nome “trust layer” — overlap verbal só |
| 5 | **CasCet** | 46821 | **4.05** | = | MCP × x402 cascades | Pay rails / MCP, não RWA origin |
| 6 | **AgriTrust** | 47173 | **4.00** | = | Ag invoice credit | Na 1ª página “newest”; counter no BUIDL Lastre |
| 7 | **AgentGate** | 46679 | **4.00** | = | HTTP → CSPR pay | On-chain receipts; pay ≠ provenance |
| 8 | **Wardens Protocol** | 46792 | **3.95** | = | Continuous RWA collateral | Counter “different layer” no BUIDL Lastre |
| 9 | **CSPR AgentPay Guard** | 46706 | **3.95** | = | x402 policy spend | Wallet policy |
| 10 | **Caliber** | 46574 | **3.90** | = | RWA treasury | Post-token |

---

## 2. Tier S / A / B

### Tier S (~4.05+)
Lastre · Claros · Faktura · Vouch · CasCet

### Tier A (3.70–4.00)
AgriTrust · AgentGate · Wardens · AgentPay Guard · Caliber · Concordia · CanopyMRV/Casper Carbon · SealRail/Trust Layer · Casper RWA Oracle

### Tier B (periferia)
Leash · AgentShield · Baret · AiFinPay · CasperAgent · HiveMind · Arena · KaJota · Pico · XELT · Runway · Codequity

---

## 3. Matriz hostil Top 6 (0–5)

| | Tech | Agent | RWA origin | Casper depth | Honesty | Demo / narrative |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Lastre** | **4.6** | 4.3 | **4.9** | **4.6** | **4.9** | **4.7** |
| Claros | 4.4 | **4.7** | 3.4 | 4.3 | 4.0 | 4.6 |
| Faktura | 4.2 | 4.3 | 4.2 | 4.0 | 4.0 | 4.3 |
| Vouch | 4.1 | 4.2 | 2.5 | 3.9 | 3.8 | 4.0 |
| CasCet | 4.2 | 4.4 | 1.8 | 4.0 | 4.0 | 4.1 |
| AgriTrust | 3.9 | 4.1 | 4.0 | 3.6 | 3.5 | 4.0 |
| Wardens | 4.0 | 4.0 | 4.1 | 3.8 | 3.6 | 3.8 |

**Por que Lastre +0.05 (4.55 → 4.60):**
- Narrative pública Dora alinhada com prod (finance/Wardens counters, honesty, settle, 90s path)  
- Juiz não depende mais de “achar” o pack no GitHub  

**Por que não 4.7+:**
- Claros ainda pode vencer em polish de marketplace de feeds  
- Demo day ao vivo ainda é o teste final  
- Grid 50/175 — ranking real do jury incompleto  

---

## 4. Pressão do campo (inalterada na tese)

| Rival | Pressão | Lastre (agora no BUIDL público) |
| --- | --- | --- |
| Claros | Agent + data density | Feed ≠ origin gate |
| Faktura / AgriTrust | RWA money unlocked | Proof **before finance** |
| Wardens | Stale collateral | Origin once ≠ continuous monitor |
| Vouch / AgentGate / CasCet | Trust / pay rails | Pay **for** provenance |

---

## 5. Onde sobe / cai a partir daqui

| Movimento | Efeito hostil |
| --- | --- |
| Dry-run 90s estável no dia do jury + autonomy×3 | **+0.05** |
| Outage API / links mortos no BUIDL | **−0.3** |
| Pitch que confunde com oracle/invoice desk | **−0.2 a −0.4** |
| Claim “#1 oficial” / mainnet money / Lastre on Kraken | **−0.5** |

---

## 6. Mensagem interna

1. **Lastre ~#1 hostil (4.60)** · **Claros 4.35** no ombro.  
2. **BUIDL 46748 = artefato de júri** — alinhado com API live.  
3. Campo finance/monitor (AgriTrust/Wardens/Faktura) na 1ª página — counters já públicos.  
4. Grid **50 / ~175** — polish até ~26/07.  
5. **Não** postar “somos #1”.

---

## 7. Histórico de score Lastre

| Snapshot | Score | Gatilho |
| --- | :---: | --- |
| 20/07 JUMP público | ~4.45 | Grid + dual-key base |
| 21/07 a.m. finance counters | 4.50 | Copy pack docs |
| 21/07 noite pós-deploy API | 4.55 | Evidence jury + smoke |
| **22/07 BUIDL Dora completo** | **4.60** | Narrative pública + links |

Arquivos irmãos:  
[`RANKING_UPDATE_2026-07-21-post-deploy.md`](./RANKING_UPDATE_2026-07-21-post-deploy.md) ·  
[`RANKING_UPDATE_2026-07-21.md`](./RANKING_UPDATE_2026-07-21.md)

---

## 8. Próximos (só residual)

- [x] Dry-run técnico scorecard (API) — `DRY_RUN_CLOSEOUT_2026-07-22.md`  
- [ ] Autonomy ×3 **no dia do jury** (cold start)  
- [ ] Vídeo novo (Felix)  

- [x] Dora pack live 46748  
- [x] Render + jury evidence  
- [x] Ranking 22/07  
