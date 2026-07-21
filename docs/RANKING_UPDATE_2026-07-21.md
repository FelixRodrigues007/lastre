# Ranking hostil atualizado — Final Round (2026-07-21)

**Escopo:** ~175 finalistas oficiais · grid pública ~48 (goteira resubmit)  
**Método:** tese Casper (RWA + agent rails + constraints) · prova on-chain · clareza demo · honesty · overlap com Lastre  
**Disciplina:** **estimativas 0–5, não ranking oficial Dora.** Não claim #1 público.

---

## 0. Snapshot Lastre (verificado 2026-07-21)

| Item | Status |
| --- | --- |
| BUIDL | https://dorahacks.io/buidl/46748 público |
| Health | `facilitatorMode=casper` |
| Autonomy | densificado (ciclo post-ajuste: ≥3 ok na sessão; in-memory) |
| Settle latest | `b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106` |
| Copy | “proof before token **and finance**” + vs Wardens/oracles |

---

## 1. Tier S — disputa de pódio (estimativa)

| # | Projeto | ID | Score | Δ vs 20/jul | Notas |
| ---: | --- | --- | :---: | :---: | --- |
| 1 | **Lastre** | 46748 | **4.50** | +0.05 | Copy finance/Wardens + settle density + dual-key |
| 2 | **Claros** | 46160 | **4.35** | = | Oracle agent economy; rival #1 de densidade |
| 3 | **Faktura** | 46441 | **4.15** | +0.05 | Invoice RWA AI — campo finance esquentou (AgriTrust) |
| 4 | **Vouch** | 45565 | **4.10** | −0.05 | Trust layer genérico (se execução fraca, cai) |
| 5 | **CasCet** | 46821 | **4.05** | = | Rails CASPAY-like (pode não estar na grid pública ainda) |

---

## 2. Tier A — ameaça direta / vizinha

| Projeto | ID | ~Score | Eixo | Counter Lastre |
| --- | --- | :---: | --- | --- |
| AgriTrust | 47173 | **4.00** | Ag invoice / no collateral | Proof **before finance** |
| Wardens Protocol | 46792 | **3.95** | Continuous RWA collateral | Origin seal ≠ continuous monitor |
| AgentGate | 46679 | 4.00 | Agent pay rails | Pay for provenance, not instead |
| CSPR AgentPay Guard | 46706 | 3.95 | x402 policy pay | Same |
| Caliber | 46574 | 3.90 | RWA treasury | Pre-token origin |
| Concordia | 46732 | 3.90 | DAO governance firewall | Constraints on origin content |
| CanopyMRV / Casper Carbon | 46745 / 46742 | 3.85 | Carbon/MRV | Dual-key + Invalid-as-proof |
| SealRail / Trust Layer | 46723 / 46686 | 3.80 | Trust naming | Show dualKey + Invalid tx |
| Casper RWA Oracle / CasperRWA | 44468 / 44481 | 3.75 | RWA oracle | Feed ≠ origin gate |
| Leash / AgentShield / Baret | 46762… | 3.65 | Spend/policy | Wallet policy ≠ seal |
| AiFinPay / CasperAgent / HiveMind | fans | 3.60 | Social + pay/portfolio | Demo 90s clarity wins |
| Arena / KaJota / Pico | vários | 3.50 | Commerce / trading | Peripheral |

---

## 3. Onde Lastre sobe/cai

| Movimento | Efeito |
| --- | --- |
| Dora paste “proof before finance” + settle latest | Mantém/sobe Tier S |
| Autonomy + settles recentes | +0.05 honesty/demo |
| Confundir com carbon oracle / invoice desk | −0.2 a −0.4 |
| Claim ranking oficial / mainnet money | −0.5 |

---

## 4. Matriz hostil Top 6 (0–5)

| | Tech | Agent | RWA origin | Casper depth | Honesty | Demo |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Lastre** | 4.5 | 4.3 | **4.9** | 4.5 | **4.8** | 4.4 |
| Claros | 4.4 | **4.7** | 3.4 | 4.2 | 4.0 | 4.5 |
| Faktura | 4.1 | 4.3 | 4.2 | 3.8 | 3.5 | 4.1 |
| AgriTrust | 3.9 | 4.1 | 4.0 | 3.6 | 3.5 | 4.0 |
| Wardens | 4.0 | 4.0 | 4.1 | 3.8 | 3.6 | 3.8 |
| AgentPay Guard | 4.0 | 4.2 | 2.0 | 4.0 | 4.0 | 4.0 |

---

## 5. Mensagem de ranking (interna)

1. **Lastre ~#1–2 hostil** com Claros no ombro.  
2. **Novo risco:** AgriTrust + Wardens reforçam RWA finance/monitor — counter é **copy + demo**, não novo produto.  
3. **Campo público ~48 / 175** — ranking real do jury ainda se forma; polish até deadline 26/07.  
4. **Não** publicar “somos #1” no Dora/TG.

---

## 6. Próximos 48h (pós-ajuste)

- [ ] Colar bloco **Dora short description** de `BUIDL_PAGE_PASTE.md` no Edit BUIDL  
- [ ] Dry-run 90s demo  
- [ ] Autonomy 3× no dia do jury (in-memory)  
- [x] Monitor 5h reativado (scheduler `019f863af4cf`)  

---

## 7. Monitor DELTA — 2026-07-21 ~19:50 UTC

| Campo | Valor |
| --- | --- |
| Badge BUIDLs | **50** (era 48) · hackers **158** (era 154) |
| Scraped 1ª página | 24 IDs |
| NEW | **46667 XELT** — VPN pay-per-minute x402/Casper (periférico; não ameaça origin) |
| REMOVED scrape | 46441 Faktura — **ignorado** (paginação; mantido em known) |
| Lastre 46748 | presente na grid pública |
| Prod health | `ok` · `facilitatorMode=casper` |
| dualKey.distinct | true · on-chain accepted=2 rejected=1 (live-rpc) |
| Autonomy | PASS · cyclesTotal=2 cyclesOk=2 (in-memory pós cold start) |

**Ajuste de ranking:** nenhum. XELT não entra Tier A/S (commerce/VPN rails). AgriTrust/Wardens continuam os counters de copy.

---

## 8. Macro L1 — CSPR × Kraken (2026-07-21)

**Fato (ecossistema, não produto Lastre):** `$CSPR` anunciado/disponível em `@krakenfx` — venue top-tier, narrativa “infra pra machine economy + RWAs”.

| Uso na Lastre | Sim / Não |
| --- | --- |
| Mudar score hostil de projeto | **Não** (não é feature de finalista) |
| Argumento “why Casper” pra jury/TG | **Sim** — acesso a CSPR → gas/agent rails mais realistas |
| Claim no Dora “Lastre on Kraken” | **NUNCA** |
| Ajuste de copy | Opcional 1 linha no BUIDL *Why Casper*: liquidity/access tailwind |

**Frase segura (interna → cola se pedirem why-Casper):**  
*Casper is deepening real access (CSPR on major venues) while the Final Round ships agent + RWA rails — Lastre is the origin gate on that stack: proof before token and finance.*