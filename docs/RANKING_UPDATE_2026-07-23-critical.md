# Ranking hostil CRÍTICO — pós “BUIDL atualizado” (2026-07-23 ~02:40 UTC)

> **Não oficial.** Lente adversária máxima. Não claim “#1”.  
> Fontes: jina `dorahacks.io/buidl/46748` · finals badge · `app-api.lastre.io` · rival BUIDLs · ship repo 23/07  
> Irmão otimista (a.m.): [`RANKING_UPDATE_2026-07-23.md`](./RANKING_UPDATE_2026-07-23.md) — **este doc sobrescreve a nota de “pack alinhado”**.

---

## Veredito em uma linha

**Produto Lastre subiu; o artefato Dora que o júri lê primeiro ainda está atrás do produto.**  
Combo hostil **blended 4.62** (não 4.70). **Claros 4.40** no ombro — gap **0.22**, não 0.32.

---

## 0. Auditoria forense BUIDL 46748 (público, jina)

| Check | Prod (agora) | Dora BUIDL (scrape) | Gap |
| --- | --- | --- | --- |
| Deep-link Sealed Rail `?rail=1` | live app + landing | **AUSENTE** — só `/marketplace` | **crítico** |
| Copy “Sealed Market Rail” | API `sealed-market-rail` | **AUSENTE** | **crítico** |
| Latest settle “canonical” | evidence `25088a6a…` | page still sells **`b1967b63…` as latest** | **alto** |
| Dual x402 / WCSPR / cloudReady | health `cloudReady:true` | **AUSENTE** | médio |
| Mock honesty | yes | **yes** (ok) | — |
| Dual-key / Invalid permanent | yes | **yes** | — |
| Diff Claros/Faktura/Wardens/CasCet | yes in pack | **yes** | — |
| CanopyMRV counter | product relevant | **AUSENTE** | baixo |
| Demo video | old URL | **same** `youtu.be/UzhKMsKA6QE` — **sem beat Sealed Rail** | **alto** |
| Judge path 90s | Run Sealed Rail 1–5 | still **Run Demo** classic only | **crítico** |

**Conclusão da auditoria:** o que foi colado no Dora é essencialmente o **pack pré–Sealed Rail** (settle densify `b1967b63`, marketplace sem rail, sem product id). Ou a atualização não publicou, ou publicou um draft truncado sem as seções novas, ou o cache Dora/jina ainda serve o body antigo — **para ranking hostil, o júri é tratado como lendo o scrape acima.**

Se o teu browser mostra `rail=1` e `25088a6a` e o jina não, re-salvar o BUIDL e re-scrape; até lá **não** pontuar como “narrative 4.85”.

---

## 1. Dois scores Lastre (obrigatório na lente crítica)

| Score | Valor | Definição |
| --- | :---: | --- |
| **Stack score** (o que existe em prod) | **4.72** | Rail one-click, dual x402, settle live, dual-key, smoke humano 23/07 |
| **Jury-surface score** (o que Dora + vídeo expõem) | **4.48** | Pack clássico + vídeo antigo + latest settle desatualizado |
| **Combo blended (ranking)** | **4.62** | `0.55×stack + 0.45×surface` — pune lag de narrativa |

### Por que o a.m. 4.70 era otimista demais

| Erro de modelagem | Correção |
| --- | --- |
| Assumiu Dora pack = produto | Dora **≠** produto nesta leitura |
| Contou ship de eng como ponto de júri 1:1 | Júri começa no BUIDL + vídeo |
| “Latest settle” no pack errado | evidence API > body Dora; body desatualizado **erra confiança** |
| Vídeo residual tratado como cosmético | Dora exige demo video — conteúdo desatualizado = risco formal |

### Deduções hostis explícitas (stack 4.72 → surface 4.48)

| Dedução | pts | Motivo |
| --- | ---: | --- |
| Judge path errado no Dora | **−0.10** | Manda para Run Demo, não `?rail=1` / 5 steps |
| Settle “latest” stale | **−0.05** | Cita `b1967b63` como latest; API canônica `25088a6a` |
| Vídeo sem Sealed Rail | **−0.06** | Mesmo link; não prova o produto de 23/07 |
| Dual-stack não narrado | **−0.02** | cloudReady existe, Dora silencia (oportunidade perdida, não mentira) |
| Shared MintGate ALREADY_* | **−0.01** | Demo shared state ainda é cheiro de “hackathon demo” se juiz re-clicar |

---

## 2. Top 10 hostil (combo blended)

| # | Projeto | ID | Combo | Stack | Surface | Eixo | Pressão crítica |
| ---: | --- | --- | :---: | :---: | :---: | --- | --- |
| **1** | **Lastre** | 46748 | **4.62** | 4.72 | 4.48 | Origin gate | Produto forte; **empacotamento Dora fraco relativo ao ship** |
| 2 | **Claros** | 46160 | **4.40** | 4.40 | 4.45 | Oracle feeds | Pitch limpo, verifiable RWA **data** — júri agentic-friendly |
| 3 | **Faktura** | 46441 | **4.28** | 4.28 | 4.25 | Invoice RWA | Money path legível; finance > origin |
| 4 | **CasCet** | 46821 | **4.15** | 4.20 | 4.15 | MCP×x402 | **Mainnet** claim no pitch; pay density alta |
| 5 | **AgentGate** | 46679 | **4.12** | 4.15 | 4.10 | HTTP pay | One-command wrap; receipts on-chain |
| 6 | **AgriTrust** | 47173 | **4.00** | 4.00 | 4.00 | Ag credit | Capital unlock narrative |
| 7 | **Vouch** | 45565 | **4.00** | 4.00 | 4.00 | Agent trust | Nome compete com “trust layer” |
| 8 | **CanopyMRV** | 46745 | **3.95** | 3.95 | 4.00 | Carbon MRV | Live demo URL + vídeo próprio — **surface > Lastre no carbon path** |
| 9 | **Wardens** | 46792 | **3.97** | 3.97 | 3.95 | Collateral | Continuous monitoring story |
| 10 | **AgentPay Guard** | 46706 | **3.92** | 3.95 | 3.90 | Spend policy | Wallet constraints |

### Movimento vs ranking a.m. (4.70)

| | a.m. | crítico agora | Δ |
| --- | :---: | :---: | :---: |
| Lastre combo | 4.70 | **4.62** | **−0.08** |
| Gap vs Claros | 0.32 | **0.22** | **−0.10** |
| CasCet | 4.08 | **4.15** | +0.07 (mainnet pay pitch re-weighted) |
| CanopyMRV | 3.90 | **3.95** | +0.05 (demo+vídeo surface) |

---

## 3. Matriz hostil Top 5 (0–5) — pós-auditoria

| | Tech | Agent | RWA origin | Casper depth | Honesty | **Demo path (júri)** | Narrative Dora |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Lastre** | **4.75** | 4.40 | **4.95** | **4.75** | **4.90** | **4.55**¹ | **4.35**² |
| Claros | 4.40 | **4.75** | 3.40 | 4.30 | 4.00 | 4.50 | **4.55** |
| Faktura | 4.20 | 4.30 | 4.20 | 4.00 | 4.00 | 4.25 | 4.25 |
| CasCet | 4.25 | 4.45 | 1.70 | 4.20 | 3.90 | 4.20 | 4.25 |
| AgentGate | 4.15 | 4.30 | 1.60 | 4.10 | 4.00 | 4.15 | 4.15 |

¹ Demo path **prod** = 4.85; score de matriz usa o que o Dora manda o juiz clicar → **4.55**.  
² Narrative Dora = pack clássico bom, mas **desalinhado do ship de 23/07**.

---

## 4. Campo Final Round

| Métrica | Valor |
| --- | --- |
| BUIDLs (badge) | **59** |
| Hackers | **172** |
| Deadline | **2026-07-26 23:59** (~3 dias) |
| Lista 1ª página scrape | frágil / partial (jina) |
| Lastre no grid | **sim** (página BUIDL resolve) |

**NEW não-origin ainda relevantes:** CasCet (pay MCP mainnet) · Sentinel AI (policy) — **não** reescrevem tese de origin; roubam atenção de “agentic Casper”.

---

## 5. Ameaças reais (ordem de morte)

| # | Ameaça | Por quê mata |
| ---: | --- | --- |
| 1 | **Juiz segue Dora → Run Demo clássico → não acha Sealed Rail** | Ship de 23/07 **invisível** no first click |
| 2 | **Claros polish + agent density** | Em track agentic, “oracle network” é história mais familiar que dual-key seal |
| 3 | **Vídeo desatualizado** | Requirement Dora; se revisor só assiste vídeo, não vê rail 1–5 |
| 4 | **CasCet/AgentGate mainnet pay flex** | “Live on mainnet” vs Lastre “testnet only” — sem counter explícito no first screen |
| 5 | **CanopyMRV carbon demo URL** | Carbon asset Lastre é forte em chain; rival tem **UI carbon dedicada** |
| 6 | **Stale “latest settle” no Dora** | Juiz confere evidence API, vê outro hash → sensação de pack desleixado |
| 7 | Claim implícito de #1 / overclaim | Suicide social no campo |

---

## 6. O que **não** se mexe (forças reais)

| Força | Evidência |
| --- | --- |
| Tese origin única no campo | dual-key + permanent Invalid + MintGate |
| Honesty disciplinada | mock UI vs settle real explícito |
| API jury pack | evidence + rail + health + cloud |
| On-chain samples densos | PoO package + multi txs + carbon Valid |
| Prod rail funciona | smoke humano 23/07 (1–5 + Invalid) |
| Diff pack (Claros/Faktura/Wardens/CasCet) | ainda presente no body |

---

## 7. Patch mínimo no Dora (ordem de impacto)

Faça **hoje**, senão o score surface não sobe:

1. **Substituir todo judge demo link** por  
   `https://app.lastre.io/marketplace?rail=1`
2. **90s section:** Run **Sealed Rail demo** → steps 1–5 → Invalid toggle  
3. **Latest settle** = `25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a`  
   (manter `b1967b63…` como prior, não “latest”)
4. Uma linha: **Sealed Market Rail** — proof before finance path (demo collateral after Valid only)
5. Uma linha honesty dual: UI mock · settle casper · optional WCSPR cloud API
6. **Re-gravar vídeo 60s** com rail + Invalid (único residual que mexe MACI/requirements)

Estimativa se 1–5 forem feitos **e** verificáveis no scrape: surface **4.48 → ~4.70**, combo blended **4.62 → ~4.71**.

---

## 8. Histórico de score (corrigido)

| Snapshot | Combo | Nota crítica |
| --- | :---: | --- |
| 22/07 closeout | 4.63 | pack+API alinhados |
| 23/07 a.m. pós-ship | **4.70** | **otimista** — contou eng como Dora |
| **23/07 crítico pós-“BUIDL update”** | **4.62** | Dora scrape **sem** rail/settle novo |

---

## 9. Mensagem interna (brutal)

1. **Não celebrar 4.70** até o jina/`view-source` do Dora mostrar `rail=1` e settle `25088a6a`.  
2. Gap vs Claros **encolheu** no papel porque a **superfície de júri** não capturou o ship.  
3. Produto está em condição de finalista; **marketing de prova no Dora está em dívida**.  
4. Prioridade #1: **alinhar BUIDL + vídeo ao rail** — não mais features.  
5. **Nunca** postar ranking hostil como oficial.

---

## 10. Re-verificação

```bash
# Dora body
curl -sS "https://r.jina.ai/https://dorahacks.io/buidl/46748" | grep -E 'rail=1|25088a6a|Sealed Market|b1967b63'

# Deve passar DEPOIS do re-paste:
# rail=1  ✓
# 25088a6a ✓
# Sealed Market ✓

# Prod
curl -sS https://app-api.lastre.io/api/evidence | jq '{settle: .lastCasperSettle.txHash, rail: .sealedMarketRail.product.id, mode: .x402Mode}'
```

---

*Ranking crítico gerado 2026-07-23. Atualizar para “confirmado 4.70+” só com scrape positivo dos checks da §7.*
