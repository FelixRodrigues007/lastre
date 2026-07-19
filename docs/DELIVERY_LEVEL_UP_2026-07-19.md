# Subir o nível de entrega — Lastre (Final Round)

**Data:** 2026-07-19  
**Contexto:** grid pública ainda ~3 BUIDLs; Lastre 46748 submitted/under review; autonomy in-memory; x402 API `casper`, UI mock; mapa de stakeholders Casper fechado.  
**Meta:** máxima densidade de prova + narrativa Manifest + path MAKE — sem diluir dual-key / origin.

---

## Norte (o que “nível acima” significa)

| Nível | O que o jury/CTO/MAKE vê | Onde estamos |
|-------|--------------------------|--------------|
| **L1** | Demo roda, tese clara | ✅ |
| **L2** | Evidence pack + dual-key + Invalid-as-proof | ✅ |
| **L3** | Autonomy + honesty labels mock/settle | 🟡 (cycles resetam) |
| **L4** | **1 settle x402 real** + hash no BUIDL | ✅ **2026-07-19** native CSPR `4caa7046…991f6` (WCSPR+CSPR.cloud = P2 opcional) |
| **L5** | Content kit + community presence + mainnet-honest roadmap | 🟡 kit pronto; presence TBD |
| **L6** | Access-rights language (Ed) + ecosystem story (Tamara) sem hype | 🟡 copy; falta pack visual |

**Prioridade:** fechar **L4** antes de inventar features grandes.

---

## P0 — Esta semana (ROI máximo / encanta David + jury)

### 1. Settle real testnet — **DONE 2026-07-19** (native CSPR path)
- **Tx:** `4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6`  
- **Explorer:** https://testnet.cspr.live/transaction/4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6  
- **Action:** Transfer 2.50 CSPR · `POST /api/x402/settle/CARBON-VCS-AMAZONIA-2024-001` · `casper_deploy`  
- Docs: `BUIDL_PAGE_PASTE.md`, `X402_CASPER_REAL.md`, `COMMUNITY_CONTENT_KIT_TG.md`  
- **P2 opcional:** parity MAKE (WCSPR + CSPR.cloud facilitator) — jury já tem valor on-chain real  
- **Não:** gastar em autonomy loops (manter mock-pay no cycle)

### 2. Honesty freeze no produto
- UI simulate / autonomy = mock (já)  
- API casper settle = real (quando keys)  
- Uma frase fixa em marketplace + BUIDL + TG kit  

### 3. Evidence pack “jury mode” (1 URL)
Checklist mental do judge em **uma** resposta JSON ou página:
- thesis, dualKey, packageHash, mintGate, originAutonomy counters, last settle tx (se houver), links cspr.live  
- Já existe `/api/evidence` — enriquecer só se faltar `lastCasperSettle` / `x402Mode`

### 4. BUIDL page edit (quando editável)
Blocos mínimos:
1. One-liner Manifest (“constraints their owners require”)  
2. Dual-key + Invalid + MintGate  
3. Links vivos (app, evidence, health)  
4. x402: mock UI / casper API + **settle hash**  
5. “Not an oracle marketplace”  

### 5. Autonomy density antes do demo
- POST `/api/agent/autonomy/cycle` 3–5× no dia do jury  
- Aceitar reset em restart; ter script/alias pronto  
- Opcional: cron GH Actions se secrets ok  

---

## P1 — Ampliação cirúrgica (sobe percepção sem pivot)

### 6. Content kit filmado (Berkay / Tamara)
- **30–60s:** tamper → Invalid → MintGate NoValidProof → Valid carbon → agent pay shape  
- 2 stills: dualKey JSON + marketplace verdict  
- Caption EN do [`COMMUNITY_CONTENT_KIT_TG.md`](./COMMUNITY_CONTENT_KIT_TG.md)

### 7. Linguagem “access rights” (Ed Hastings)
Renomear **só no copy** (não reescrever contrato):
- dual-key → *separation of duties*  
- MintGate → *mint access requires Valid origin*  
- Invalid → *negative attestation is first-class state*

### 8. Path mainnet honesto (Tamara)
Uma slide/linha:
> Live on Casper Testnet today. Mainnet when facilitator ops + keys + monitoring are production-safe. No mainnet money claims in demo.

### 9. Community presence (James / Alfirins)
- Postar community pack **uma vez** quando útil  
- Responder threads x402 com path MAKE  
- Não DM pedindo RT  

### 10. Thin MCP tool (opcional)
- Um tool `get_provenance(assetId)` se der tempo  
- **Não** suite MCP completa  

---

## P2 — Só se sobrar tempo / pós-final

| Ideia | Por quê adiar |
|-------|----------------|
| Agent wallet / account abstraction full | Alto custo; não é hero da tese |
| ERC-3643 transfer restrictions | Institutional lindo, dilui origin se mal feito |
| SSE streaming de attestations | Nice-to-have |
| Persistência Redis de autonomy | Bom, mas L4 > L3 polish |
| Quantum / EVM narrative | Manifest long-term, zero demo |

---

## O que **não** fazer (baixa entrega / anti-encanto)

1. Virar “AgentPay Guard #2” (só rails/budget)  
2. Competir com Claros em densidade de oracle feeds  
3. Claim Dora #1 / ranking oficial  
4. Vender mock UI como settle on-chain  
5. Ship grande de UI sem 1 tx real  
6. Spam no TG dos admins  

---

## Matriz feature → stakeholder → prioridade

| Entrega | David | Ed | Michael | Tamara | Berkay | James | Prio |
|---------|:-----:|:--:|:-------:|:------:|:------:|:-----:|:----:|
| Settle WCSPR + hash | ●●● | ●● | ●●● | ●● | ●● | ● | **P0** |
| Honesty mock/settle | ●●● | ●● | ●●● | ●● | ●●● | ●●● | **P0** |
| BUIDL edit Manifest | ● | ●● | ●●● | ●●● | ●●● | ●● | **P0** |
| Autonomy cycles no dia | ● | ● | ●● | ● | ● | ● | **P0** |
| 60s video + stills | ● | ● | ●● | ●●● | ●●● | ●● | **P1** |
| Access-rights copy | ● | ●●● | ●● | ● | ●● | ● | **P1** |
| Mainnet roadmap line | ● | ● | ●● | ●●● | ●● | ● | **P1** |
| TG citizen behavior | ●● | ● | ● | ●● | ● | ●●● | **P1** |
| MCP get_provenance | ●● | ● | ● | ● | ● | ● | **P2** |
| ERC-3643 / AA wallet | ● | ●● | ●● | ●● | ● | ● | **P2** |

---

## Sequência de execução recomendada (ordem)

```
1. ✅ Audit + settle prod native CSPR (2026-07-19 hash)
2. ✅ Docs BUIDL + X402 + TG kit com hash
3. BUIDL page Dora edit (quando UI liberar) — colar paste pack
4. Autonomy 3× no dia do jury
5. Vídeo 60s — **por último** (só se sobrar)
6. P2: WCSPR + CSPR.cloud parity / MCP thin
```

---

## Definition of Done — “nível de entrega elevado”

- [ ] Judge roda marketplace demo < 90s sem instalar nada  
- [ ] `/api/evidence` + health + autonomy respondem  
- [x] **1 settle hash** real (testnet) no BUIDL paste + X402 doc (`4caa7046…991f6`)  
- [ ] Texto em 3 lugares distingue mock UI vs casper settle  
- [ ] Pitch 20s usa: proof before token + constraints + Invalid-as-proof  
- [ ] Content kit (video ou stills) pronto para Berkay/Tamara  
- [ ] FAQ TG copiável sem inventar claims  
- [ ] Zero claim de ranking oficial / mainnet money  

---

## Referências internas

- Content kit TG: [`COMMUNITY_CONTENT_KIT_TG.md`](./COMMUNITY_CONTENT_KIT_TG.md)  
- Enchantment map: [`CASPER_ENCHANTMENT_MAP_2026-07-19.md`](./CASPER_ENCHANTMENT_MAP_2026-07-19.md)  
- Demo 5 min: [`DEMO_DAY_SCORECARD_5MIN.md`](./DEMO_DAY_SCORECARD_5MIN.md)  
- x402 real: [`X402_CASPER_REAL.md`](./X402_CASPER_REAL.md)  
- Judge one-pager: [`JUDGE_ONE_PAGER.md`](./JUDGE_ONE_PAGER.md)  
