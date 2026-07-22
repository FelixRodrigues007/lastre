# Lente do júri Casper + Direção — pesquisa densa (2026-07-22)

**Escopo:** como o **Final Round** é avaliado (não confudir com votação CSPR.fans) + o que a **Casper Association leadership** prioriza publicamente (Manifest, RWA, agent economy).  
**Uso:** recalibrar ranking hostil Lastre · **não** predizer voto oficial · **não** claim #1.

Fontes primárias:
- [Finals detail / DoraHacks](https://dorahacks.io/hackathon/casper-agentic-buildathon-finals/detail) (critérios oficiais)
- [Qualification detail](https://dorahacks.io/hackathon/casper-agentic-buildathon/detail) (mesmo painel de critérios)
- [Casper Team](https://www.casper.network/team)
- [X Space Recap — Manifest, RWAs, Buildathon (Michael Steuer)](https://www.casper.network/news/casper-x-space-recap-may-20-2026-casper-manifest-rwas-and-the-agentic-buildathon)
- [Why Casper for RWA](https://www.casper.network/why-casper-for-rwa) · [Proof Layer](https://www.casper.network/prooflayer)
- @Casper_Network (finalists 175, machine economy)

---

## 1. Dois “votos” diferentes (não misturar)

| Mecanismo | O que é | Quem decide | O que **não** é |
| --- | --- | --- | --- |
| **CSPR.fans community vote** | Qualificação: **Top 3** avançam direto | Comunidade | **Não** é o ranking final do prêmio |
| **Builder merit path** | Protótipo Testnet com componente on-chain que produz tx | Critério técnico de elegibilidade | Não pontua os 8 critérios ainda |
| **Final Round professional jury** | Avaliação dos finalistas (~175) no fim de julho | Painel profissional | **Não** é fan vote |

**Painel (oficial Dora):**  
*“Casper Association leadership and technical experts, representatives from partner organizations, Web3 investors, ecosystem leaders, and media representatives.”*

Ou seja: **Direção + eng + partners + VCs + mídia** — alinhamento com Manifest/RWA/agent economy pesa mais que meme de ranking interno.

**Requisitos de submission (hard gate):**
1. Protótipo em Casper Testnet com **transaction-producing on-chain component**
2. GitHub open-source + README
3. Demo video pública

**Sinais operacionais extras (Telegram finalistas / disciplina Casper):**  
fluxo impecável; descrição simples; **txs testnet densas e recentes**; “seja seu próprio juiz”; resubmit do **mesmo** BUIDL.

---

## 2. Os 8 critérios oficiais do Final Round

Fonte: tabela *Final Round Judging Criteria* no Dora (Qualification + Finals detail).

| # | Critério | O que o júri lê na prática |
| ---: | --- | --- |
| 1 | **Technical Execution** | Código, arquitetura, completude — não deck |
| 2 | **Innovation & Originality** | Abordagem nova vs clone de rails/oracle |
| 3 | **Use of AI / Agentic Systems** | Agente **significa** algo (paga, age, orquestra) — não chatbot wrapper |
| 4 | **Real-World Applicability** | Útil em **DeFi e/ou RWA** de verdade |
| 5 | **User Experience & Design** | Demo sozinha, interface clara |
| 6 | **Working Smart Contracts** | Contratos **deployed** Testnet, verificáveis |
| 7 | **Long-Term Launch Plans** | Projeto real, socials, plano de deploy (não one-off hack) |
| 8 | **Potential for Long-Term Impact** | Cresce o ecossistema Casper (adopção, builders, narrative) |

**Pesos implícitos (inferência, não oficiais):**  
Contratos + RWA/applicability + impact + execution tendem a ser “hard”; UX e launch plans separam polish.  
Michael (Buildathon): *“agents that transact, not chatbots, not wrappers around LLM APIs”* → critério 3 é **agente econômico**, não chat.

---

## 3. Direção Casper Association — quem é e o que prioriza

| Pessoa | Papel | Lente de julgamento (pública) |
| --- | --- | --- |
| **Michael Steuer** | President & CTO | Manifest: 4 audiências (devs, users, **institutions**, **machines**); RWA + machine economy como crescimento do pie; x402 production; agents that hold value / pay / operate within bounds / settle on Casper; Proof Layer multi-party trust; ERC-3643; honesty institutional |
| **Pascal Schmid** | Board Director | Governance / association — projetos com path real e reputação de longo prazo |
| **Ed Hastings** | Head of Engineering | Technical execution, contracts, architecture, **access rights / separation of duties**, não hype |
| **Tamara Wasserman** | Head of Ecosystem | Ecosystem growth, storytelling limpo, onboarding builders, amplification |
| **Skyler Willcockson** | Head of Finance & Ops | Sustentabilidade, ops real, não fake TVL |
| **Jesper Hallager** | Head of Finance and Operations | Idem (ops/finance) |
| **Berkay Soylu** | Senior Content Manager | Clareza de narrativa, content pack, sem claim falso |
| Eng team (Joe, Michał, Karan, Jakub, Alex, Jiuhong…) | Engineering | Deploy real, explorer links, RPC, Odra/tooling |

### Quotes-chave Michael (Manifest / Buildathon)

- Machines são **user class** agora: se o protocolo não trata, “you’re building for 2022.”
- Buildathon: *agents that **transact**, not chatbots / LLM wrappers* — hold value, pay for services, **defined boundaries**, settle on Casper.
- RWA: Proof Layer / multi-party trust (Parking Blox = production data on mainnet) — **origem verificável de cashflow** antes de finance.
- Crescimento: **tokenized RWAs** + **AI agentic M2M** expandem o pie vs recirculação crypto.
- X402: pay-per-request on-chain; smart accounts = limits for agents.

### Alinhamento institucional (Why Casper / RWA)

- Ownership **layered / multi-sig / roles** — rights on-chain  
- Trust multi-party (operador, owner, auditor)  
- Não só “token existe” — sistemas que fazem valor **mover com confiança**

---

## 4. Como o júri “vota” na prática (modelo operacional)

Não há scorecard público de pesos numéricos por jurado. Modelo operacional defensável:

```
Score_jury ≈ f(
  hard_gates: Testnet txs + contracts + video + GitHub,
  8 critérios oficiais,
  fit Manifest: RWA | agent pay | ecosystem,
  honesty / no fake claims,
  demo day clarity (≤90s)
)
```

**Sinais que sobem (Direção + critérios):**
1. Txs recentes e densas no explorer  
2. Contratos reais (não só mock UI)  
3. Agente com papel econômico (x402 pay / act) **sem** LLM reescrever truth on-chain  
4. RWA com **prova / trust multi-party** (não só underwriting deck)  
5. Mainnet-honest roadmap  
6. Impacto: ferramenta que outros agents usam (query provenance before mint/finance)

**Sinais que caem:**
1. Chatbot / wrapper sem settle  
2. Claim mainnet money / TVL / ranking oficial  
3. Demo quebrada  
4. Confundir fan vote com prêmio final  

---

## 5. Lastre vs 8 critérios (estimativa 0–5)

| Critério | Lastre | Nota |
| --- | :---: | --- |
| 1 Technical Execution | **4.6** | Runtime, dual-key, evidence pack, autonomy loop |
| 2 Innovation | **4.8** | Origin seal **before** token/finance — gap no campo |
| 3 AI / Agentic | **4.2** | Agent pay/skip/escalate + x402; seal determinístico (honesty forte, agentic “moderado”) |
| 4 Real-World (RWA/DeFi) | **4.9** | Hard RWA origin; dual-key; Invalid-as-proof; MintGate |
| 5 UX & Design | **4.3** | Marketplace Run Demo; labels honesty; polish vs Claros |
| 6 Working Contracts | **4.7** | ProofOfOrigin + MintGate packages + densify settles |
| 7 Launch Plans | **4.1** | Testnet live; mainnet when safe (honest) |
| 8 Ecosystem Impact | **4.6** | “Trust layer” / proof before action — encaixa Manifest machines+RWA |

**Média aritmética 8 critérios:** **~4.53**  
**Média ponderada Direção** (RWA×1.5 + contracts×1.3 + impact×1.3 + agentic×1.1 + tech×1.1 + innov×1.2 + UX×0.9 + launch×0.8): **~4.58–4.65**

### Fit por stakeholder da Direção

| Stakeholder | Lastre fit | Risco |
| --- | --- | --- |
| Michael (CTO) | Alto: RWA trust + agent boundaries + x402 real + not chatbot | Precisa manter densify txs + demo day |
| Ed (Eng) | Alto: dual-key / access rights / contracts | Continuar honesty mock vs settle |
| Tamara (Ecosystem) | Alto: BUIDL claro, story Manifest | Não shill #1 |
| Board / Finance | Médio-alto: path real, sem fake TVL | Ops mainnet só quando safe |
| Content (Berkay) | Alto: pack markdown limpo | Manter coerência Dora/API |

---

## 6. Rivais sob a mesma lente (resumo)

| Projeto | Força sob júri oficial | Fraqueza sob Direção |
| --- | --- | --- |
| **Claros** | Agentic denso + oracle RWA data + UX | Feed ≠ multi-party **origin** de asset físico; exemplo FAQ aponta “RWA oracle” — Lastre é pré-token |
| **Faktura** | RWA finance + policy on-chain + AI | Underwriting pós-origem; Michael valoriza cashflow **provado** (Proof Layer style) |
| **AgriTrust** | RWA real-world narrative | Collateral/credit story; menos dual-key origin |
| **Wardens** | Continuous audit agents | Pós-token; Lastre é gate de existência |
| **CasCet / AgentGate** | x402 rails (critério 3 + impact) | Fraco em RWA origin (critério 4) |
| **Vouch** | Agent reputation | Não prova origem do RWA |

---

## 7. Implicações táticas até demo day (~fim julho)

1. **Não otimizar para CSPR.fans** agora — já é finalista por merit path.  
2. **Otimizar para os 8 critérios + demo day:** smoke, autonomy×3 no dia, Run Demo 90s.  
3. **Narrativa Michael-safe:** agents that transact **within bounds**; seal = constraint; RWA multi-party trust.  
4. **Ed-safe:** separation of duties, contracts, honesty freeze.  
5. **Tamara-safe:** BUIDL 46748 limpo, links vivos, zero claim #1.  
6. Manter densify settle se quiser volume recente (critério contracts + “recent txs”).

---

## 8. Disclaimer

- Não há resultado oficial de votos de jurados individuais.  
- Pesos por critério são **inferidos** a partir de docs oficiais + falas públicas da Direção.  
- Ranking hostil atualizado em `docs/RANKING_UPDATE_2026-07-22-jury-lens.md`.
