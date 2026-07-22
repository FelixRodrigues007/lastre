# Lastre — Briefing Subnichos Genesis

> Fonte: repositório Lastre (`lastro`), docs internos e `product-marketing-context.md`.  
> Página Notion: https://app.notion.com/p/subnichosgenesis/Lastre-3900c187eeaf802085b8e1b0654bde42

---

## Identificação

| Campo | Conteúdo |
|---|---|
| **Nome do projeto** | Lastre |
| **Tagline** | Proof before token |
| **Subtítulo** | A cadeia de prova da terra ao token — verificada offline e ancorada na Casper |
| **Categoria** | Infraestrutura de proveniência RWA / camada de confiança / protocolo proof-of-origin |
| **Tipo** | Protótipo de protocolo + demo developer-facing (não é produto financeiro) |
| **Site** | https://lastre.io |
| **Repositório** | https://github.com/FelixRodrigues007/lastro |
| **API (hoje)** | https://lastro.onrender.com |
| **API (futuro)** | https://api.lastre.io |
| **Rede** | Casper Testnet (`casper-test`) |
| **Status** | Protótipo ativo — Casper Agentic Buildathon 2026 |
| **Banner obrigatório** | DEMONSTRATION — simulated assets, no investment offered |

---

## Nicho

**Tokenização de ativos do mundo real (RWA) e infraestrutura de confiança em blockchain.**

Mercado amplo onde equipes tentam representar ativos físicos (minerais, commodities, propriedades, cadeias de suprimento) em sistemas digitais, agentes autônomos e contratos inteligentes — mas frequentemente sem provar a origem física real dos dados.

---

## Sub-nicho

**Prova de proveniência determinística para RWA na Casper — antes da tokenização ou do uso por agentes.**

Foco estreito:
- Builders de RWA e equipes de tokenização
- Ecossistema Casper (Odra/Rust, testnet, hackathons)
- Avaliadores técnicos, jurados e stakeholders de compliance/risco
- Quem precisa demonstrar **Valid** e **Invalid** on-chain — não só o happy path

Sub-nicho em uma frase: *camada de trust para provar origem física com selo SHA-256 offline + attestation na Casper, separando verificação determinística de decisão operacional por LLM/agente.*

---

## Avatar (cliente ideal)

### Persona principal — **Marina, RWA Protocol Lead**

| Atributo | Detalhe |
|---|---|
| **Cargo** | Fundadora/CTO ou lead de produto em startup de tokenização RWA |
| **Idade** | 30–45 |
| **Contexto** | Construindo demo ou MVP em Casper; precisa de narrativa de confiança para investidores técnicos, parceiros e jurados |
| **Conhecimento** | Entende smart contracts, APIs e oráculos; cética com “AI verified” sem prova auditável |
| **Onde está** | GitHub, Discord/Telegram do ecossistema Casper, hackathons, calls com compliance |

### Persona secundária — **Rafael, Technical Evaluator / Jurado**

| Atributo | Detalhe |
|---|---|
| **Cargo** | Engenheiro, auditor ou jurado de buildathon |
| **Motivação** | Separar demo superficial de infraestrutura que funciona de verdade |
| **Critério** | Contrato deployado, leitura on-chain, fronteiras de confiança claras |

### Persona terciária — **Camila, Compliance / Risk**

| Atributo | Detalhe |
|---|---|
| **Cargo** | Risco, compliance ou auditoria em projeto RWA |
| **Motivação** | Rastro auditável quando proveniência falha — rejeição como evidência, não erro descartado |

### Dores (7+)

1. Demos de RWA provam preço ou propriedade, mas não **origem física**.
2. Dados entram via API ou digitação manual — fácil de adulterar ou “teatro de oráculo”.
3. Quando proveniência é inválida, o sistema **apaga o erro** em vez de registrar prova permanente.
4. LLM/agente é vendido como “fonte da verdade” — inaceitável para compliance.
5. Difícil explicar em 15 segundos por que o token “merece confiança”.
6. Integração Casper + fluxo agentic (x402) parece marketing, não arquitetura.
7. Landing pages genéricas de tokenização não diferenciam no hackathon.
8. Medo de overclaim em IA e em promessas financeiras.

### Desejos (7+)

1. Mostrar **proof before token** em menos de 15 segundos.
2. Ancorar veredito `Valid` / `Invalid` na Casper Testnet com links reais.
3. Demonstrar tamper: mudar **1 g** quebra o selo → `Invalid`.
4. Separar claramente: **selo decide veredito; LLM decide ação** (`pay` / `skip` / `escalate`).
5. Repo auditável, contratos Apache, gateway documentado.
6. UI forense e credível — não “crypto gradient slop”.
7. Demo memorável (Spot-the-Fraud) para gravação e pitch.
8. Guardrails regulatórios explícitos (demonstração, dados fictícios).

### Objetivos do avatar

- Validar arquitetura antes de escalar tokenização.
- Ter história de confiança para parceiros e jurados.
- Reduzir risco de greenwashing e auditoria fraca.

### Anti-persona (não é para)

- Investidor buscando yield, ROI ou retorno.
- Comprador de token ou “fractional ownership”.
- Quem quer dados de empresas reais de mineração sem licença.
- Quem espera produto financeiro pronto para produção.

---

## Roma (promessa central)

**Transformação prometida (não financeira):**

> Em menos de 2 minutos, qualquer avaliador técnico entende e verifica que a Lastre prova a origem física **antes** de tokenizar ou de um agente agir — com selo SHA-256 determinístico, veredito na Casper, e rejeição registrada como prova permanente.

**Promessa em uma linha:**

> **Proof before token** — a cadeia de prova da terra ao token.

**Mecanismo em uma linha:**

> Medição de campo → selo SHA-256 offline → attestation na Casper → `Valid` ou `Invalid` (ambos gravados).

**O que NÃO prometemos:**

- Investimento, yield, retorno, venda de token, propriedade ou direito financeiro.
- Dados reais de empresas ou lotes reais em demos públicas.
- Software auditado ou pronto para mainnet.

---

## Método

**Como a Lastre entrega valor (arquitetura, não curso):**

1. **Sealer (offline)** — artefato canônico de proveniência → digest SHA-256 determinístico (independente de cloud/rede).
2. **ProofOfOrigin (Casper/Odra)** — registra referência e attestations; `Valid` e `Invalid` são outcomes gravados com sucesso.
3. **MintGate** — mint simbólico só após attestation válida.
4. **x402** — verificação paga via HTTP 402 (facilitator mock no protótipo).
5. **OriginChain Agent** — LLM escolhe **ação** apenas; nunca o veredito.
6. **Gateway + Frontend** — Render + Vercel (`lastre.io`) para leitura ao vivo e demo Spot-the-Fraud.

**Frase de método:**

> Separamos **verificação** (determinística) de **orquestração** (agente).

---

## Produto / Oferta

| Camada | O que é | Para quem |
|---|---|---|
| **Protocolo** | Contratos ProofOfOrigin + MintGate na Casper Testnet | Builders, auditores |
| **Demo pública** | `lastre.io` — landing, `/proof`, `/catalog`, `/spot-fraud` | Jurados, visitantes, parceiros |
| **Gateway API** | Leituras on-chain + writes controlados SANDBOX | Frontend e integradores |
| **Repo open-core** | Contratos Apache-2.0; sealer BUSL-1.1 | Desenvolvedores |
| **Design system** | Tokens, ads, guardrails de copy | Marketing técnico |

**CTA principal:** Verificar proveniência  
**CTA secundário:** Spot the fraud  
**Conversão desejada:** Clone do repo, exploração da demo, entendimento da arquitetura — não venda.

---

## Diferenciais

1. **Proof before token** — narrativa clara e defensável.
2. **Selo decide veredito** — não o LLM.
3. **Invalid é prova** — rejeição permanente on-chain.
4. **Casper-native** — Odra/Rust, package deployado, txs públicas.
5. **Agentic + x402** — encaixa no tema “agent economy”, mas com origem verificada primeiro.
6. **Demo anti-fraude** — +1 g quebra o selo; memorável para vídeo.
7. **Honestidade regulatória** — banner de demonstração em toda tela.

---

## Concorrência e alternativas

| Alternativa | Por que falha para o avatar |
|---|---|
| Oráculos de preço/claims | Provam número, não origem física |
| PDFs e auditoria manual | Lento, difícil de compor em workflow agentic |
| “AI verified” | LLM como oráculo de verdade |
| Demos token-first | Pulam a pergunta de origem |
| RWA genérico sem rejeição on-chain | Invalid desaparece — sem auditoria |

**Posicionamento:** não competir como marketplace ou yield; competir como **trust layer** de proveniência.

---

## Objeções e resoluções

| Objeção | Resposta |
|---|---|
| “Isso é produto financeiro?” | Não. É camada de prova/proveniência. Sem yield, ROI ou venda. |
| “O LLM decide se é válido?” | Não. O selo SHA-256 decide; o LLM só escolhe ação. |
| “Está pronto para produção?” | Não. Protótipo com dados fictícios; não auditado. |
| “São dados reais de mineração?” | Não. Samples fictícios (ex.: Mineradora Vale do Ouro, LOTE-001/002). |
| “x402 paga de verdade?” | Mock facilitator — sem CSPR real; interface pronta para swap futuro. |
| “Por que Casper?” | Buildathon/ecossistema; contrato já na testnet com estado verificável. |
| “E se o frontend mentir?” | Veredito vem do contrato via gateway; usuário pode checar no explorer. |

---

## Jornada do herói

1. **Mundo comum** — RWA e agentes consomem dados não verificados; tokens herdam ceticismo.
2. **Chamado** — Precisa provar origem antes do hackathon/demo/parceiro.
3. **Recusa** — Medo de complexidade on-chain e de overclaim em IA.
4. **Mentor/prova** — Lastre mostra fluxo em 4 passos e txs reais na testnet.
5. **Travessia** — Usuário joga Spot-the-Fraud, vê +1 g → selo quebrado → `Invalid`.
6. **Recompensa** — Entende “invalid is proof too”; arquitetura separa selo vs agente.
7. **Retorno** — Leva narrativa “proof before token” para pitch, README e slides.

---

## Tom de voz e linguagem

**Tom:** técnico, credível, preciso, contido.  
**Personalidade:** forense, rigoroso, infrastructure-grade.

**Usar:** proof, provenance, origin, seal, attest, reject, anchor, deterministic, audit trail, trust layer, Casper, veredito, evidência.

**Evitar:** invest, yield, ROI, returns, profit, buy, sell, ownership, token sale, passive income, “AI verified truth”, nomes de empresas reais.

**Headlines aprovadas:**
- Proof before token.
- Change one gram. The seal breaks.
- A rejection is proof, not a discarded error.
- The seal decides the verdict. The LLM can only choose an action.

---

## Prova social e métricas (só fatos verificados)

- **ProofOfOrigin** deployado na Casper Testnet  
- **Package hash:** `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561`  
- **Estado on-chain (exemplo):** `accepted=2`, `rejected=1`  
- **LOTE-001:** veredito atual `Invalid` (selo adulterado registrado)  
- **LOTE-002:** veredito `Valid`  
- **Clientes reais / depoimentos:** nenhum — não inventar logos ou quotes.

---

## Links úteis

| Recurso | URL |
|---|---|
| Site | https://lastre.io |
| GitHub | https://github.com/FelixRodrigues007/lastro |
| Gateway | https://lastro.onrender.com |
| Docs hub | https://github.com/FelixRodrigues007/lastro/tree/main/docs |
| Casper tx (install) | https://testnet.cspr.live/transaction/c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10 |

---

## Equipe / papéis (roadmap interno)

| Papel | Responsável | Entrega |
|---|---|---|
| Frontend / design | Laura | Vercel `lastre.io`, UI, motion |
| Gateway | Fugu/Felix | Render API, smoke tests |
| Protocolo | Fugu/Felix | Casper read/write |
| Design system | Laura/Fugu | Tokens, ads, guardrails |
| Demo ops | Felix | Domínio, gravação, deploy |

---

## Roadmap resumido

| Fase | Foco | Status |
|---|---|---|
| 0 | Protocolo live + base da experiência | Ativo/concluído |
| 1 | Launch público `lastre.io`, rotas P0, smoke tests | P0 |
| 2 | Polish visual Laura, detalhe de asset, `api.lastre.io` | P1 |
| 3 | Hardening operacional, monitoring, banned-word checks | P2 |
| 4 | Maturidade de protocolo (mainnet só com auditoria) | Futuro |

**North star:** proveniência óbvia em <15s — selo → tamper → veredito on-chain → verificação sem confiar no frontend.

---

## Banco de “depoimentos” (fictícios / internos — não publicar como cliente real)

> Usar apenas como copy de exemplo para slides — **não** apresentar como clientes.

- *“Finalmente um demo RWA onde Invalid também fica on-chain.”* — persona avaliador técnico  
- *“O selo vs LLM ficou claro em um screenshot.”* — persona builder  
- *“Spot-the-Fraud virou nosso hook de 15 segundos no pitch.”* — persona demo ops  

---

## Checklist de preenchimento Notion

- [ ] Nicho e sub-nicho colados  
- [ ] Avatar com dores/desejos  
- [ ] Roma + limites (não financeiro)  
- [ ] Método em 6 passos  
- [ ] Objeções  
- [ ] Links e package hash  
- [ ] Banner de demonstração em materiais  
- [ ] Revisão: zero palavras da blacklist de copy  

---

*Gerado a partir do repositório Lastre em 2026-07-02.*
