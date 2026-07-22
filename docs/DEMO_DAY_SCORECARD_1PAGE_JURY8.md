# Demo Day Scorecard — 1 page · 8 critérios oficiais Casper

**Projeto:** Lastre · BUIDL https://dorahacks.io/buidl/46748  
**Duração:** 5:00 (+30s Q&A) · **Data prep:** 2026-07-22  
**Thesis (20s):** *Proof before token and finance. Seal decides Valid/Invalid. Dual-key sealer ≠ attester. Agent only pay/skip/escalate. Invalid is permanent on-chain proof.*

> DEMONSTRATION ONLY. Simulated assets; no investment. Only labeled Casper Testnet hashes are real.  
> **Not fan vote** — professional jury · 8 official Dora criteria · Direção/Manifest lens.

---

## A. Prep (T−10 min) — hard gates

| ☐ | Check | URL / ação |
| :---: | --- | --- |
| ☐ | Health | https://app-api.lastre.io/api/health → `ok` + `facilitatorMode=casper` |
| ☐ | Evidence | https://app-api.lastre.io/api/evidence → `honesty`, `lastCasperSettle`, `dualKey.distinct` |
| ☐ | Autonomy warm | `POST /api/agent/autonomy/cycle` **×3** (cold start zera contadores) |
| ☐ | Tabs | marketplace · agents · evidence JSON · Invalid explorer · settle explorer · BUIDL |
| ☐ | Backup video | https://youtu.be/UzhKMsKA6QE (só se UI cair) |
| ☐ | Smoke | `bash scripts/jury-smoke.sh` (opcional T−30) |

**Latest settle (falar se pedirem pay real):**  
https://testnet.cspr.live/transaction/b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106  

**Invalid sample:**  
https://testnet.cspr.live/transaction/5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd  

---

## B. Timeline 0:00 → 5:00 → critérios oficiais

| Clock | Falar (≤1 frase) | Clicar / mostrar | **C1** Tech | **C2** Innov | **C3** Agentic | **C4** RWA | **C5** UX | **C6** Contracts | **C7** Launch | **C8** Impact |
| ---: | --- | --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **0:00–0:20** | Thesis: seal decides; agent only acts; proof before finance. | lastre.io → app | · | ● | ● | ● | · | · | · | ● |
| **0:20–1:20** | Happy path: mock pay → Valid carbon → MintGate only after Valid. | **Marketplace → Run Demo** | ● | ● | ● | ● | ● | · | · | · |
| **1:20–1:50** | Invalid is permanent proof — not a failed UX. | **Invalid tx** explorer | · | ● | · | ● | · | ● | · | · |
| **1:50–2:30** | Separation of duties: sealer ≠ attester (Ed-safe). | evidence → `dualKey` + `accessRights` | ● | ● | · | ● | · | ● | · | ● |
| **2:30–3:00** | Agent path: 402 → pay → proof; UI simulate = mock honesty. | **/agents** | · | · | ● | · | ● | · | · | · |
| **3:00–3:30** | Real CSPR settle exists (API casper); not the UI button. | settle explorer **b1967b63…** | ● | · | ● | · | · | ● | · | · |
| **3:30–4:10** | Autonomy: dense origin self-test (mock pay inside cycle). | GET/POST **autonomy** | ● | · | ● | · | · | · | ● | · |
| **4:10–4:40** | MintGate package + carbon Valid + multi-party trust stack. | evidence `mintGate` / carbon tx | · | · | · | ● | · | ● | · | ● |
| **4:40–5:00** | Mainnet when safe; partners query Lastre before mint/finance. | BUIDL 46748 one line | · | · | · | · | · | · | ● | ● |

**●** = hit explícito neste bloco · **·** = implícito / já coberto

---

## C. Mapa 1:1 — critério → o que o juiz **deve ver**

| # | Critério oficial (Dora) | Momento | Prova |
| ---: | --- | --- | --- |
| **1** | Technical Execution | Run Demo + evidence + health | Fluxo E2E sem install; JSON jury pack; sem crash |
| **2** | Innovation & Originality | Thesis + Invalid + dual-key | Origin **before** token/finance; Invalid permanente; sealer≠attester |
| **3** | AI / Agentic Systems | Run Demo + agents + autonomy | Agent **pay/skip/escalate**; x402; bounds (Michael: not chatbot) |
| **4** | Real-World Applicability | Carbon + mineral + MintGate | RWA hard origin; mint só com Valid; labels fictionais |
| **5** | UX & Design | Marketplace + agents | Run Demo sozinho; honesty labels legíveis |
| **6** | Working Smart Contracts | Explorers + evidence | PoO package, MintGate, settle `casper_deploy`, Invalid/Valid txs |
| **7** | Long-Term Launch Plans | Close + BUIDL | Testnet live; mainnet-honest; socials/GitHub |
| **8** | Ecosystem Impact | Close + agents | Outros agents **query** provenance antes de agir; trust layer Casper |

---

## D. Frases por stakeholder da Direção (se o jurado for…)

| Stakeholder | Uma frase (não enrolar) |
| --- | --- |
| **Michael** | *Agents may pay and act within bounds; the seal decides origin truth on Casper.* |
| **Ed** | *Separation of duties: field sealer ≠ chain attester; both have on-chain txs.* |
| **Tamara** | *Judge can open BUIDL + demo + evidence without us installing anything.* |
| **Finance/Board** | *No fake TVL or mainnet money claims — testnet evidence and honest roadmap.* |

---

## E. Self-score rápido (0–5) — preencher **depois** do ensaio

| Critério | Target | Ensaio 1 | Ensaio 2 | Demo day |
| --- | :---: | :---: | :---: | :---: |
| C1 Technical | 4.6 | __ | __ | __ |
| C2 Innovation | 4.8 | __ | __ | __ |
| C3 Agentic | 4.2–4.5* | __ | __ | __ |
| C4 RWA | 4.9 | __ | __ | __ |
| C5 UX | 4.3–4.6 | __ | __ | __ |
| C6 Contracts | 4.7 | __ | __ | __ |
| C7 Launch | 4.1 | __ | __ | __ |
| C8 Impact | 4.6 | __ | __ | __ |
| **Média** | **~4.5+** | __ | __ | __ |

\*C3 sobe se autonomy×3 rodou no dia e você diz *agents within bounds* (não “full oracle marketplace”).

---

## F. Anti-patterns (descontam)

| Não fazer | Por quê |
| --- | --- |
| Dizer “somos #1” / ranking oficial | Destrói honesty + media/board |
| Vender UI simulate como CSPR real | Quebra C1/C3/honesty |
| Competir com Claros em densify de feeds | Fora da tese; confunde C2/C4 |
| Skip Invalid path | Perde C2 + C6 |
| Re-demo no Q&A sem pedido | Come tempo; parece nervoso |

---

## G. Checklist 90s de emergência (se cortarem tempo)

1. Thesis 15s  
2. Run Demo → Valid  
3. Invalid explorer  
4. dualKey + settle real  
5. Close: mainnet-honest + query before mint/finance  

**Critérios cobertos em 90s:** C1–C6 + C8 parcial.

---

## H. Links de batalha (copiar)

- Demo: https://app.lastre.io/marketplace  
- Agents: https://app.lastre.io/agents  
- Evidence: https://app-api.lastre.io/api/evidence  
- Health: https://app-api.lastre.io/api/health  
- Autonomy: https://app-api.lastre.io/api/agent/autonomy  
- BUIDL: https://dorahacks.io/buidl/46748  
- Playbook: https://github.com/FelixRodrigues007/lastre/blob/main/JUDGES_PLAYBOOK.md  

**Referência pesquisa júri:** `docs/JURY_LENS_CASPER_DIRECAO_2026-07-22.md`  
**Scorecard 5 min expandido:** `docs/DEMO_DAY_SCORECARD_5MIN.md`
