# Mapa de telas — Lastre Provenance Console

**Data:** 2026-07-02  
**Escopo:** Console `app.lastre.io`  
**Fonte:** código em `app/src/routes/*` + `docs/APP-UI-ARCHITECTURE.md`  
**Tese:** *Proof before token* — o selo decide o veredito; o agente decide a ação; dados fictícios; sem linguagem de investimento.

---

## Mapa mental do produto

```
Capture → Lots/Seal → Process → Audit → Chain/Casper → Marketplace → My Assets
                              ↘ Escalations
```

---

## 1. Overview (`/`)

### Objetivo
Orientar em ~15 segundos: o sistema está vivo, há prova on-chain, e qual é o próximo passo.

### O usuário precisa ver/saber
- Contadores de pipeline (lotes → processados → selo → Casper → tokenizáveis)
- Saúde da testnet (accepted/rejected, live vs fallback)
- Atividade recente (últimos 5 registros)
- CTA contextual via OverviewNextStep (Capture → Process → Audit → Marketplace)

### Fluxo de ouro
1. Chega pela primeira vez → vê banner demo + ProofJourney
2. Lê o card "próximo passo" → vai para Capture ou Process
3. Depois do batch → volta e vê outcomes + link para Marketplace

### O que falta
- Onboarding de primeira visita (tooltip tour ou "Run demo in 60s")
- Indicador claro de sessão vs testnet histórica (hoje mistura os dois)
- Escalations no fluxo de "próximo passo" quando audit.escalated > 0
- i18n nas outras telas (Overview já usa PT/EN; resto está em inglês fixo)

### O que não deve estar ali
- Gráficos sem contexto para quem não rodou batch ainda
- Linguagem de "tokenizável" sem reforçar que é demo simbólico
- Detalhes técnicos do contrato abertos por default

### Ideias
- Modo "Judge view": botão que roda o batch demo automaticamente e abre Audit
- Badge "First visit" com checklist de 4 passos
- Sparkline de atividade da sessão
- Link direto para o package Casper com tooltip

---

## 2. Capture (`/capture`)

### Objetivo
Ponto de entrada: documento → campos estruturados → selo SHA-256 → fila de lotes.

### O usuário precisa ver/saber
- Câmera/upload é fictícia; selo é determinístico
- Preview do passaporte antes de submeter
- Após submit: auto-process com rule decider

### Fluxo de ouro
1. Upload ou câmera → captura frame hash
2. Preenche campos (ou preset demo)
3. Generate Passport + Seal → vê selo
4. Submit to App Queue → auto-process → card de próximos passos

### O que falta
- Validação de campos (lat/lng fora do perímetro)
- Explicação visual de por que a foto não entra no selo (só frameHash simulado)
- Estado de erro quando auto-process falha (catch silencioso)
- i18n e polish visual
- Opção de não auto-processar

### O que não deve estar ali
- Promessa de OCR real
- Botão Claim antes de prova válida
- Branding "LASTRO" no passaporte (produto é Lastre)

### Ideias
- Wizard em 3 passos; preset "Tampered lot"; side-by-side foto vs campos do selo; QR do selo

---

## 3. Chain (`/chain`)

### Objetivo
Prova técnica para evaluator/judge: Casper Testnet deployada, attestations existem.

### Fluxo de ouro
Overview/ProofJourney → confirma Invalid on-chain → clica attestation → Lot/Audit detail

### O que falta
- ProofJourney; links tx por attestation; copy "Invalid = prova permanente"; compare sessão vs histórico

### Ideias
- Timeline attestations; filtro Valid/Invalid; embed contrato ProofOfOrigin

---

## 4. Lots (`/lots`)

### Objetivo
Catálogo/fila de artefatos fictícios antes e depois do processamento.

### Fluxo de ouro
Browse → filtra → Lot Detail ou Process

### O que falta
- Add to batch na row; filtro status; i18n; user-captured vs demo seed; empty state

### Ideias
- Bulk select → Process; tags mineral/carbon; map pin mini na row

---

## 5. Lot Detail (`/lots/:assetId`)

### Objetivo
Sala de evidências forense: artefato, selos, veredito, proof chain.

### Fluxo de ouro
Chega de Lots/Audit/Marketplace → headline veredito → SealCompare → Audit ou Marketplace se Valid

### O que falta
- CTA Claim NFT / View Casper contextual; mapa origem; link audit sessão; fallback demoCatalog

### Ideias
- Diff campo a campo; export JSON; timeline captured→mint; modo presenter

---

## 6. Process (`/process`)

### Objetivo
Substituto interativo do make demo — coração operacional.

### Fluxo de ouro
4 lotes default → Run batch → stepper → ProcessWhatHappened → Audit

### O que falta
- Lotes user-captured além dos 4 default; sync decider Settings; skip/escalate no stepper; link Escalations

### Ideias
- Guided demo; replay batch; highlight tampered no Invalid; split agente vs selo

---

## 7. Audit (`/audit`)

### Objetivo
Histórico persistente da sessão — Invalid não some.

### Fluxo de ouro
Pós-batch → 4 outcomes → filtra rejected → export JSON → drill-down

### O que falta
- Filtros verdict/action; coluna Tx/timestamp; aviso persistência memória; i18n

### Ideias
- Sankey action→verdict→outcome; compliance report PDF

---

## 8. Audit Detail (`/audit/:assetId`)

### Objetivo
Drill-down técnico de um AuditRecord.

### O que falta
- ProofJourney; link Lot Detail; painel artefato; copy hashes

---

## 9. Escalations (`/escalations`)

### Objetivo
Fila human-in-the-loop para action: escalate.

### Fluxo de ouro
Batch com LOTE-OUTOFREGION → revisa triggering fields → (ideal) dismiss/re-process

### O que falta
- Ações de triagem (spec: dismiss/override) — hoje read-only; ProofJourney

### Ideias
- Acknowledge → Re-queue; mapa perímetro vs geo; badge na nav

---

## 10. Settings (`/settings`)

### Objetivo
Tema, decider, limites, persistência.

### O que falta
- Seletor idioma; explicação prática dos limites; test LLM

---

## 11. Marketplace (`/marketplace`)

### Objetivo
Pós-prova: browse, claim NFT demo, DeFi sim, Global Mundi Map.

### Fluxo de ouro
Tokenizáveis no Audit → connect wallet → claim → DeFi lock → aba Map

### O que falta
- Unificar My Assets; substituir alert(); guardrails DeFi mais claros

### O que não deve estar ali
- Linguagem investimento; GPS custody real; "Buy" sem Demo

### Ideias
- Claim representation; tour Mundi; proof inline nos cards

---

## 12. My Assets (`/my-assets`)

### Objetivo
Coleção pessoal de NFTs mintados na demo.

### O que falta
- Ownership real; empty state; merge com Marketplace como tab

---

## Landing (`lastre.io`)

| Seção | Objetivo | Gap |
|-------|----------|-----|
| Hero | Tese + CTA App | CTA para Capture, não só Overview |
| Problem/Solution | Por que proof before token | — |
| HowItWorks/Proof | Educação visual | Alinhar com ProofJourney |
| Demonstration | Prova interativa | Bridge para console |
| FAQ/Personas | Desarmar objeções | Sem linguagem investimento |

---

## Dimensões extras (vale mapear)

| Dimensão | Por quê |
|----------|---------|
| Persona por tela | Evaluator: Process+Audit+Chain; Operator: Capture+Escalations |
| Estados empty/loading/error | Inconsistentes — Capture e Marketplace diferentes |
| Mobile | Tab bar 5 itens — Audit/Marketplace no hamburger |
| Sessão vs permanente | API em memória — usuário não sabe que perde dados |
| Invariantes confiança | Só Process e Capture reforçam selo≠agente bem |
| Métrica sucesso | Evaluator entende em <5 min? 4 outcomes corretos? |
| Deep links | /audit/:id, /lots/:id existem |
| i18n | Overview traduzido; 10 rotas inglês fixo |
| Command palette ⌘K | Falta descoberta |

---

## Fluxo de ouro global

**Evaluator (primeira visita):**
```
Landing → Overview → Process → Audit → Lot tampered → Chain → Marketplace claim → My Assets
```

**Operator:**
```
Capture → Lots → Process → Escalations → Audit
```

---

## Prioridades P0 UX

1. i18n nas 10 rotas restantes
2. Ações em Escalations
3. Unificar Marketplace + My Assets
4. Onboarding Overview ("Run demo in 60s")
5. ProofJourney em Chain, Audit, Escalations, Settings
6. Substituir alert() no Marketplace
7. Aviso persistência em Audit e Overview

---

## Resumo executivo

O console cobre bem o arco Capture → Seal → Process → Audit → Chain → Marketplace. Maiores gaps: consistência de idioma, Escalations sem ação, duplicação Marketplace/My Assets, falta de onboarding guiado, feedback UI cru em Capture e Marketplace.
