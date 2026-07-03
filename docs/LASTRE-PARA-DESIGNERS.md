# Lastre para Designers

**O documento profundo**

Um só documento, denso, para você ler e não ter dúvida de nada. Explica o produto inteiro do zero, traduz cada termo cripto, e disseca cada tela com: o que é, pra que serve, objetivo, o que tem que acontecer, ações que devem existir, fluxo ideal, modelos de layout, layout recomendado, o que NÃO fazer, perguntas de sênior respondidas, e referências reais do Mobbin com link.

**Base:** leitura do código real do app (`Capture`, `Process`, `Lot Detail`) + briefing do produto + `docs/UX-SCREEN-AUDIT.md`

**Regra que rege tudo:** *proof before token* — o selo decide o veredito, o agente decide a ação, tudo é demonstração com dados fictícios, sem investimento.

**Validado contra o repo em:** 2026-07-02

---

## I. O produto inteiro, do zero

### O problema que a Lastre resolve

Coisas físicas de valor — minério, ouro, crédito de carbono — circulam com documentos que dizem de onde vêm. Esses documentos podem ser falsificados ou adulterados. Quem recebe o lote não tem como saber, olhando o papel, se os números foram trocados no caminho. A Lastre existe para responder uma pergunta: **este documento é íntegro, ninguém mexeu nele desde a origem?**

### Como funciona, em 5 passos

1. **Captura.** Fotografa-se ou faz-se upload do documento do lote. Preenchem-se os dados estruturados (origem, produtor, data, quantidade).
2. **Selo.** O sistema gera uma "impressão digital" matemática desses dados — o selo SHA-256. É determinístico: os mesmos dados sempre geram o mesmo selo.
3. **Processar.** Um agente automático recalcula o selo e compara com o selo de referência. Bate = íntegro. Não bate = adulterado. O agente então escolhe uma ação (seguir, pular, escalar).
4. **Veredito + registro.** O resultado (Valid/Invalid) é gravado num caderno público imutável (a blockchain Casper). Ninguém apaga.
5. **Camada simbólica.** Só depois de provado, o lote pode virar uma representação simbólica (NFT demo) num marketplace de demonstração. Nunca antes.

### A invariante de confiança

**Coração do produto**

> "O agente escolhe a AÇÃO. O selo decide o VEREDITO."

Esta é a frase mais importante do produto inteiro, e o motivo pelo qual ele é confiável. A inteligência artificial **NÃO** julga se algo é verdadeiro — se ela julgasse, seria só mais uma "IA mágica" em que ninguém confia. Quem julga é a matemática do selo, que é determinística e verificável por qualquer um. A IA só decide o que fazer com o resultado. Seu design precisa deixar essa separação óbvia em toda tela onde ela aparece.

*Evidência no código:* `agent/orchestrator/src/agent.ts` — comentário explícito na invariante; `Process.tsx` repete no lead da página.

### O que o app NÃO é

- **Não é uma loja:** ninguém compra ou vende nada. É uma demo para um avaliador julgar a tecnologia.
- **Não é um produto de investimento:** nada de retorno, yield, preço.
- **Não é rastreamento GPS em tempo real:** as origens no mapa são fictícias.
- **Não é OCR real:** a "leitura" do documento é simulada; o selo vem dos dados digitados, não da foto.

### As três superfícies do produto

| Superfície | URL | Papel |
|------------|-----|-------|
| Landing | lastre.io | Página pública que explica a tese |
| Console | app.lastre.io | Onde você trabalha — as 12 telas deste documento |
| API | app-api.lastre.io | Cérebro que calcula selos e registra provas |

**Importante saber:** a API guarda dados em memória (`app/server/runtime.ts`) — ao recarregar/reiniciar o servidor, a sessão zera. Isso tem consequência de design (avisar o usuário).

### Para quem você projeta

| Persona | Quem é | Vive em | Precisa de |
|---------|--------|---------|------------|
| **Avaliador / Judge** | Chega pela 1ª vez para julgar se a tecnologia funciona. Público nº 1. | Overview → Process → Audit → Chain | Clareza, entender a tese em minutos, "wow" forense |
| **Operador** | Simula o uso diário: cadastra e processa lotes. | Capture → Lots → Process → Escalations | Eficiência, ações rápidas, feedback claro |

---

## II. Dicionário completo dos termos

### Cada termo, traduzido

| Termo | O que significa de verdade |
|-------|---------------------------|
| **Selo / Seal / SHA-256** | Impressão digital dos dados. Um código de 64 caracteres gerado a partir do conteúdo. Muda 1 vírgula, muda o código inteiro. Prova que nada foi alterado. |
| **Computed seal** | O selo calculado AGORA a partir dos dados atuais do lote. |
| **Reference seal** | O selo original, gravado quando o lote foi registrado. É o "gabarito". |
| **Seal match / mismatch** | Batem = íntegro. Não batem = adulterado. No código, o campo é `sealMatchesReference`. |
| **Valid / Invalid (veredito)** | O resultado. Invalid **NÃO** é erro do sistema — é prova legítima de adulteração. Nunca esconda como se fosse falha. |
| **Agente / Agent** | Assistente automático que decide a AÇÃO: pay (seguir), skip (pular), escalate (mandar pra humano). **NÃO** decide verdade. |
| **Decider (Rule / LLM)** | Como o agente decide: por regras fixas (Rule) ou por IA (LLM). No app é uma escolha na tela Process. |
| **Outcome** (tokenizable/rejected/skipped/escalated) | O desfecho de cada lote após processar. Tokenizable = provado e apto à camada simbólica. Rejected = inválido. Skipped = duplicado/ignorado. Escalated = foi pra revisão humana. |
| **Casper / on-chain / testnet** | Casper é a blockchain — caderno público imutável. On-chain = gravado nele. Testnet = versão de teste. |
| **Attestation** | O registro individual gravado no caderno, carimbado com data. Tem um link para o explorador (cspr.live). |
| **Proof rail / proof step** | O "trilho da prova" — indicador de progresso de 5 passos que mostra em que estágio da cadeia de prova o lote está. |
| **Artifact** | Os dados estruturados do lote (origem, operador, massa/toneladas, etc.). É sobre ele que o selo é calculado. |
| **Lote / Lot / Passaporte** | O item físico rastreado + o documento que o acompanha ("passaporte de proveniência"). |
| **NFT / Token** | Representação simbólica de demo de um lote provado. Sem dono real, valor ou venda. Última camada. |
| **Marketplace / DeFi sim** | Vitrine de demo. "Sim" = simulação. Nada é comprado/vendido. |
| **Mundi Map** | Mapa mundial das origens fictícias dos lotes + a âncora do Casper. Não é GPS. |
| **Escalate / Escalations** | Quando o agente não tem certeza, escala pra revisão humana. Escalations é a fila. |

### Copy: proibido e preferido

| NUNCA use | Prefira |
|-----------|---------|
| Buy, Invest, Earn, Yield, Price, Return, ROI, lucro, preço, retorno, ownership real, venda de token | Claim NFT Representation (Demo), Simulate Casper signature, Symbolic provenance representation, No real asset/value/ownership transfer |

---

## III. Direção visual e régua de layout

### O "sabor": infraestrutura forense premium

**Não negociável**

- **Alvo:** laboratório forense/dossiê pericial de alto nível. Não um app de cripto.
- **Sim:** mineral, olive/dark (verde-oliva escuro), gold seal accents (dourado de selo), técnico, editorial, preciso, muito respiro, tipografia mono nos dados.
- **Não:** roxo/ciano Web3, dashboard financeiro, "AI magic", excesso de cards SaaS iguais, linguagem especulativa.
- **Acessibilidade (obrigatória):** foco visível, contraste AA, labels em todos os botões, respeitar reduce-motion, mobile sem overflow, e Valid/Invalid nunca só por cor — sempre ícone + texto + forma.

### Régua: quando usar cada modelo de layout

| Modelo | Use quando… | Evite quando… |
|--------|-------------|-----------------|
| Tabela / stacked list | Muitos itens comparáveis, filtrar/ordenar/escanear | Poucos itens; a hierarquia é a mensagem |
| Bento grid | Tela-resumo, blocos de pesos diferentes | Itens homogêneos que pedem comparação |
| Grid de cards | Itens visuais equivalentes que se navega | Dados densos que pedem números alinhados |
| Split view (lista+detalhe) | Processo passo a passo com resultado ao lado | Mobile estreito — precisa empilhar |
| Master + rail lateral | Conteúdo principal + resumo/status fixo à direita | Conteúdo curto que não precisa de âncora |
| Wizard (passos) | Sequência com ordem lógica obrigatória | Tarefas independentes sem ordem |
| Drawer / bottom sheet | Preview rápido sem sair do contexto | Conteúdo longo que merece página |
| Gráfico | Dado real + uma pergunta clara | Enfeite; ficaria vazio antes do 1º batch |

**Princípio:** densidade vem de hierarquia, não de encher. Uma informação primária grande, o resto discreto.

---

## IV. Overview (`/`) — a primeira impressão

### O que é / pra que serve

A home do console e a primeira coisa que o judge vê. Um "centro de comando da prova": mostra a saúde do pipeline, as camadas de confiança e o próximo passo. Hoje traz o banner demo, os 7 passos da jornada (Captura→Selo→Processar→Auditoria→Casper→Marketplace→Meus Ativos) via `ProofJourney`, gráficos de pipeline, `OverviewNextStep` contextual, e botão "Run batch".

> **Nota dev:** pode haver crash em atividade recente se um registro vier malformado (`record.decision` undefined) — usar optional chaining; não é gap de design.

### Objetivo & o que tem que acontecer

Em ~15s o usuário entende: isto é demo; o sistema está vivo e há prova on-chain; meu próximo passo é este. O que bate o olho e sabe: o banner "dados fictícios", um número âncora (X provas registradas) e um CTA primário claro.

### Ações que devem existir

- CTA primário único: **"Rode a demo em 60s"** → Process.
- **Modo Judge:** roda o batch automaticamente e abre o Audit.
- Atalhos contextuais (Capture / Audit) conforme o estado da sessão.
- Ver o pacote Casper (link externo).

### Fluxo ideal

Chega → lê o banner e o número âncora → lê o card "próximo passo" → clica "60s" → cai no Process já sabendo o que vai ver. Se já rodou antes: o herói vira "atividade recente + próximo passo contextual".

### Modelos de layout possíveis & recomendado

**Possíveis:** bento grid, dashboard clássico com cards iguais, ou hero + lista.

**Recomendado:** bento grid. Bloco grande herói ("60s"), blocos médios de contadores do pipeline (lotes → processados → válidos → on-chain), bloco de atividade recente. Bento porque os itens têm pesos diferentes — não é lista homogênea.

### Referências de layout que deve ter

- Banner de contexto persistente no topo (não-fechável na demo).
- Métricas com rótulo + valor + nota comparativa.
- Estado vazio de primeira visita = checklist de onboarding, nunca zeros crus.

### O que NÃO fazer

- Gráficos vazios para quem não rodou nada (o judge vê zeros).
- Hash/contrato exposto por default.
- Dois CTAs primários competindo.
- Misturar sessão atual com histórico da testnet sem separar visualmente.

### Perguntas do sênior, respondidas

- **"E na primeira visita, sem dados?"** → Estado vazio vira onboarding: checklist de 4 passos + botão "60s".
- **"Como o judge sabe o que vai acontecer ao clicar?"** → Microcopy no botão: "4 lotes, veja o selo decidir Valid/Invalid".
- **"Escala pra quem já rodou 3 vezes?"** → Herói troca para atividade recente + próximo passo.
- **"Onde entra Escalations?"** → Vira "próximo passo" quando há casos escalados.

### Referências Mobbin

Onboarding checklist · Status/home dashboard (Mercury, Vercel)

---

## V. Process (`/process`) — o coração

### O que é / pra que serve

O substituto interativo do `make demo`: a tela onde o judge sente a tecnologia funcionando. Roda um lote de itens e mostra a decisão acontecendo ao vivo. No código, vêm 4 lotes fixos com destinos rotulados: Genuine→Valid, Tampered→Invalid, Duplicate→skip, Out of region→escalate. Tem escolha de decider (Rule/LLM) e botão "Run batch". Os lotes aparecem um a um a cada ~450ms, com barra de progresso; no fim há um placar (tokenizable/rejected/skipped/escalated) e link "Open audit log".

### Objetivo & o que tem que acontecer

O judge precisa sair desta tela entendendo: **"o agente escolheu a AÇÃO; o selo decidiu o VEREDITO"**. Precisa mostrar com clareza, por lote: ação do agente, verificação do selo, veredito, prova Casper. O momento mais persuasivo é ver o lote Tampered dar Invalid porque um campo mudou.

### Ações que devem existir

- Marcar/desmarcar os lotes do batch; incluir lotes que o usuário capturou (hoje só os 4 fixos).
- Escolher o decider (Regras fixas / IA), sincronizado com Settings.
- "Run batch" com progresso e estado de erro ("Tentar de novo").
- Ver skip/escalate no stepper; link para Escalations quando houver.
- No fim: "Open audit log" → Audit; replay do batch.

### Fluxo ideal

Chega (vindo do "60s") → vê os 4 lotes e seus destinos esperados → "Run batch" → assiste cada card processar, entendendo agente vs selo → vê o placar → "Open audit log" para revisar tudo persistido.

### Modelos de layout possíveis & recomendado

**Possíveis:** split view (config | pipeline ao vivo), stepper full-width vertical, ou wizard por lote.

**Recomendado:** split view. Esquerda: config (4 lotes com checkbox, decider, "Run batch", progresso). Direita: stepper ao vivo, um card por lote. Dentro de cada card, duas colunas fixas: **"Ação do agente" | "Veredito do selo"**, com ícones distintos (robô/decisão vs selo/cadeado). No fim, faixa-resumo sticky com o placar dos 4.

### Referências de layout que deve ter

- Stepper com estados (pendente / rodando / concluído) por lote.
- Barra de progresso com %.
- No card do Invalid, um "antes → depois" do campo adulterado.
- Faixa-resumo sticky que consolida o placar.

### O que NÃO fazer

- Sugerir que a IA julga a verdade. A IA age; o selo julga.
- Tratar Invalid como erro vermelho de falha.
- Jogar todo o aprendizado num blocão de texto no fim — ensine durante a animação.
- Deixar Rule/LLM como jargão sem explicação.

### Perguntas do sênior, respondidas

- **"Como mostro 'agente vs selo' sem texto?"** → Duas colunas fixas em cada card, com ícones distintos. A repetição ensina.
- **"E se o batch falhar?"** → Estado de erro com "Tentar de novo"; nunca card mudo.
- **"O judge entende por que o lote 2 deu Invalid?"** → Destaque o campo adulterado com antes/depois.
- **"Rule vs LLM confunde o leigo?"** → Rotular "Como o agente decide: Regras fixas / IA" + tooltip de uma linha.
- **"E lotes que o usuário capturou?"** → Precisam poder entrar no batch, não só os 4 fixos.

### Referências Mobbin

Pipeline/console ao vivo (Sentry, Replit, Render) · Verification result (Databricks, Okta)

---

## VI. Lot Detail (`/lots/:id`) — a sala de evidências

### O que é / pra que serve

O laudo forense de um único lote. No código, já tem: breadcrumb Lots › lote; hero com métricas via `LotEvidenceGrid`; seção Proof rail (trilho de 5 passos); seção Seals com `SealCompare` (computed vs reference) e rótulo match/mismatch; seção Artifact com highlight em `massGrams` quando há mismatch; seção Casper Testnet quando existe attestation; rail lateral `LotProofStatus` com veredito, proof rail, CTAs contextuais.

### Objetivo & o que tem que acontecer

Provar, de forma inegável, se este lote é íntegro ou adulterado — e mostrar exatamente o quê mudou. Bate o olho e sabe: o veredito (headline); se os selos batem; e, se Invalid, qual campo foi alterado.

### Ações que devem existir

- Expandir/colapsar o detalhe técnico dos hashes; copiar hash com um clique.
- "Ver attestation no cspr.live" (já existe quando há Casper).
- "View audit record" (já existe); **"Ver no mapa"** de origem (falta).
- Se Valid: CTA "Marketplace". Nunca "Claim" antes de provar válido.
- Export JSON do laudo.

### Fluxo ideal

Chega (do Audit ou Lots) → lê o veredito no topo → vê o SealCompare (batem/não batem) → se Invalid, o diff mostra o campo alterado → confirma no proof rail em que estágio está → segue para Casper (prova permanente) ou Marketplace (se válido).

### Modelos de layout possíveis & recomendado

**Possíveis:** master + rail lateral (o atual), abas (Artifact / Seals / Chain), ou página longa scrollável.

**Recomendado:** master + proof rail à direita (evolução do que já existe). Topo: banner de veredito grande. Meio: **tabela de diff campo a campo** (campo · valor de referência · valor atual, com a linha divergente destacada) — hoje só há highlight em `massGrams`; generalizar para qualquer campo. Direita fixa: SealCompare com selo "MATCH/MISMATCH", proof rail, evidência Casper, mini-mapa. Tabela, não cards — o poder está no alinhamento campo a campo.

### Referências de layout que deve ter

- Diff view estilo Git (duas colunas, linha alterada destacada).
- Selo de status "idênticos ✓ / divergem ✗" acima dos hashes.
- Hashes em mono, colapsáveis atrás de "ver detalhe técnico".
- Proof rail como indicador de progresso fixo.

### O que NÃO fazer

- Dois hashes de 64 caracteres lado a lado sem dizer "batem/não batem". Ninguém compara a olho.
- Linguagem de valor/preço/ownership.
- CTA "Claim" antes do veredito válido.
- Sumir com o proof rail em lotes sem Casper — mostre "aguardando registro".

### Perguntas do sênior, respondidas

- **"Como faço 2 hashes de 64 chars legíveis?"** → Mostre um selo "Selos idênticos ✓" e colapse os hashes.
- **"Qual o momento 'aha'?"** → O diff. `massGrams: 100000 → 100500` prova adulteração melhor que texto.
- **"E lotes sem Casper ainda?"** → Proof rail mostra "aguardando registro", mantendo consistência.
- **"Como vira 'inesquecível'?"** → Laudo pericial: mono nos dados, selo dourado no veredito, muito respiro. Menos SaaS, mais dossiê.

### Referências Mobbin

Verification / security detail · Item/audit detail (1Password, WorkOS, Vanta)

---

## VII. Capture (`/capture`) — a entrada do operador

### O que é / pra que serve

Onde um lote nasce no sistema. Trabalha com dois tipos: mineral (ex.: ouro, com massa em gramas) ou crédito de carbono (ex.: certificado VCS da Amazônia, com toneladas de CO₂). No código, hoje são **3 painéis lado a lado:** (1) Details — campos do lote, com atalho "Use demo Valid carbon"; (2) Capture Document — "Start Camera / Capture Photo / Upload File", a foto vira um frame hash; (3) Passport + Seal — o cartão do passaporte com o selo, que só aparece após gerar. Dois botões-chave: "Generate Passport + Seal" e, depois, "Submit to App Queue" (que salva, auto-processa com rule decider, e mostra painel **"What happened?"** com CTAs — primário: Lot Detail; secundários: Process, Audit, Marketplace).

### Objetivo & o que tem que acontecer

Transformar um documento físico em dados estruturados + um selo, e enfileirar o lote. Bate o olho e sabe: "escolho tipo, preencho, capturo o documento"; "o selo nasce dos DADOS, não da foto"; "gerei o passaporte, agora envio".

### Ações que devem existir

- Escolher tipo (mineral/carbono); preencher campos com validação inline.
- Atalho "usar exemplo demo" (existe) + um preset **"lote adulterado"** para demonstrar Invalid.
- Câmera / upload de documento.
- "Gerar Passaporte + Selo" → mostra o cartão.
- "Enviar para a fila" → idealmente leva ao Lot Detail (ver a prova), com opção de não auto-processar.

### Fluxo ideal

Passo 1: escolhe tipo e preenche dados (validados) → Passo 2: captura/upload do documento → Passo 3: vê o passaporte com o selo e o side-by-side "foto | campos que entraram no selo" → envia → cai no Lot Detail para ver a prova antes de qualquer camada simbólica.

### Modelos de layout possíveis & recomendado

**Possíveis:** 3 painéis simultâneos (o atual), wizard em passos, ou formulário único longo.

**Recomendado:** wizard em 3 passos. Um passo por vez reduz carga e impõe a narrativa dados→documento→selo. No passo 3, o passaporte como card credencial (estilo Wallet), selo em destaque, e o side-by-side ensinando que a foto não altera o selo.

### Referências de layout que deve ter

- Stepper de progresso no topo (1 · 2 · 3).
- Validação inline nos campos, com mensagem do que corrigir.
- Cartão credencial para o passaporte (estilo passe de carteira digital).
- Preview lado a lado (documento | dados do selo).

### O que NÃO fazer

- Branding **"LASTRO PROOF PASSPORT"** — errado (confirmado no código, linha 322 de `Capture.tsx`). É **Lastre**.
- Prometer OCR real / "IA lê o documento".
- Empurrar Marketplace como destino único pós-submit — respeitar *proof before token*.
- Campos sem validação (dá pra pôr latitude impossível).
- Botão "Claim" na captura, antes de prova válida.

### Perguntas do sênior, respondidas

- **"Por que 3 painéis lado a lado é ruim?"** → O usuário não sabe onde começar; a ordem lógica some. Wizard impõe a narrativa.
- **"Onde entra a validação?"** → No passo 1, inline, antes de avançar (perímetro geográfico, obrigatórios).
- **"Depois do Submit, pra onde vai?"** → Idealmente Lot Detail, não Marketplace — respeita *proof before token*.
- **"Como ensino que a foto não entra no selo?"** → Side-by-side no passo 3 + microcopy.

### Referências Mobbin

Multi-step / wizard (Wise, Revolut) · Document scan / KYC (Plata, Origin)

---

## VIII. Audit (`/audit`) — o histórico

### O que é / pra que serve

O histórico persistente da sessão. Registra os 4 desfechos de cada batch. O ponto de honra: **Invalid não some** — fica como prova permanente. Dá para filtrar e ir ao detalhe de cada registro.

### Objetivo, ações & fluxo

- **Objetivo:** ser o registro confiável de tudo que passou.
- **Ações:** filtrar por veredito/ação (chips), ordenar, clicar na linha → detalhe, export JSON.
- **Fluxo:** chega pós-batch → vê os 4 outcomes → filtra os rejected → abre um para drill-down.

### Layout & o que NÃO fazer

**Recomendado:** tabela densa + faixa de 4 outcomes no topo. Chips de filtro acima; colunas lote · veredito · ação · on-chain · data; linha clicável. Tabela é o padrão — escaneamento e comparação.

**Não fazer:** sumir com os Invalid; deixar achar que os dados persistem (API em memória) sem aviso; gráfico que fica vazio antes do 1º batch.

### Perguntas do sênior & Mobbin

- **"Como comunico persistência de sessão sem assustar?"** → Faixa discreta: "Registros desta sessão. Recarregar limpa os dados da demo."
- **"Vale gráfico aqui?"** → Só a faixa de 4 contadores. Sankey é ideia futura, não P0.
- **"Invalid sem ser só vermelho?"** → Ícone + label + peso tipográfico (AA).

**Mobbin:** Activity log (Discord, WorkOS, Vanta) · Log com filtros (Okta, Cloudflare)

---

## IX. Marketplace + Mundi Map — a camada simbólica

### O que é / pra que serve

A vitrine dos lotes já provados + o mapa mundial de origens (Mundi Map) + o claim de representação NFT demo e uma simulação de DeFi. É a **última camada** — só existe depois da prova.

### Objetivo, ações & fluxo

- **Objetivo:** mostrar o "e agora?" de um lote provado, sem nunca sugerir investimento.
- **Ações:** browse em grid; "Claim Representation (Demo)"; clicar num pin → drawer com preview antes de navegar; alternar Marketplace ↔ Meus Ativos como abas.
- **Fluxo:** lotes tokenizáveis no Audit → Marketplace → claim → item vai pra Meus Ativos; aba Map para explorar origens.

### Modelos de layout & recomendado

**Recomendado:** grid de cards para os lotes + mapa com drawer. Cards porque são itens visuais equivalentes. No mapa, clicar no pin sobe um drawer/bottom sheet com preview (nome, veredito, mini-selo). Dois marcadores claramente distintos: origem (fictícia) vs âncora Casper (a prova).

### O que NÃO fazer & perguntas do sênior

- Palavras financeiras (Buy, Invest, Earn, Yield, Price, Return).
- Pop-ups crus (`alert()` do browser) — **gap confirmado** em `Marketplace.tsx`.
- Sugerir custódia/GPS real; pins de origem iguais à âncora Casper.

**Sênior:**
- **"Como o drawer evita navegação à toa?"** → Preview no sheet + botão "Ver evidências" só se quiser aprofundar.
- **"Como deixo óbvio que não é GPS?"** → Legenda + copy "origem declarada, fictícia" + pin ilustrativo.
- **"Vale unir com Meus Ativos?"** → Sim, como abas — reduz a duplicação apontada no audit.

### Referências Mobbin

Mapa com bottom sheet (Honest Greens, KakaoBank) · Bottom sheet · Drawer

---

## X. Telas de apoio

### Chain (`/chain`)

- **O que é:** a prova técnica para o judge — mostra que os vereditos estão gravados no Casper e existem attestations.
- **Objetivo:** convencer que "isto está gravado para sempre; nem o Invalid some".
- **Ações:** filtrar Valid/Invalid, abrir cada tx no explorador, comparar sessão vs histórico.
- **Layout:** timeline vertical (stacked list) de attestations.
- **Não fazer:** despejar dados de contrato sem tradução para o leigo.
- **Sênior:** "como um leigo entende 'imutável'?" → uma frase + o cadeado, sem aula de blockchain.
- **Mobbin:** timeline & history

### Lots (`/lots`)

- **O que é:** o catálogo/fila de todos os lotes, antes e depois de processados.
- **Objetivo:** encontrar um lote e agir sobre ele.
- **Ações:** filtrar por status, "adicionar ao batch" na linha, seleção em massa → Process, abrir Lot Detail.
- **Layout:** tabela/stacked list com ação na linha; tags mineral/carbono; mini-pin de mapa.
- **Não fazer:** misturar lotes capturados pelo usuário com os de exemplo sem distinção visual; deixar sem empty state.
- **Sênior:** "como distingo seed de user-captured?" → badge/coluna dedicada.
- **Mobbin:** list com filtros e bulk actions

### Audit Detail (`/audit/:id`)

- **O que é:** o drill-down técnico de um registro de auditoria.
- **Objetivo:** dar a prova completa de um caso.
- **Ações:** copiar hashes com um clique, link para o Lot Detail, ver o proof rail.
- **Layout:** painel de detalhe técnico com dados do artefato + hashes em mono.
- **Não fazer:** mostrar hash sem botão de copiar.
- **Mobbin:** log detail / copy to clipboard

### Escalations (`/escalations`)

- **O que é:** a fila human-in-the-loop dos casos que o agente escalou (ex.: lote fora da região).
- **Objetivo:** revisar e decidir.
- **Ações necessárias (gap principal — hoje é só leitura):** descartar, sobrescrever, reprocessar; ver os campos que dispararam a escalação.
- **Layout:** fila (stacked list) com ações por item + badge de contagem na nav + mapa perímetro vs geo declarada.
- **Não fazer:** deixar read-only sem nenhuma ação.
- **Sênior:** "qual a ação mínima viável?" → Acknowledge → Re-queue.
- **Mobbin:** review / approval queue

### My Assets (`/my-assets`)

- **O que é:** a coleção pessoal de representações simbólicas (NFT demo) reivindicadas.
- **Objetivo:** mostrar o que foi "claimado".
- **Ações:** abrir um item; voltar ao lote de origem.
- **Layout:** grid de cards estilo Wallet; empty state com CTA.
- **Não fazer:** sugerir posse real; manter como tela separada se fizer mais sentido virar aba do Marketplace.
- **Mobbin:** collection / wallet grid

### Settings (`/settings`)

- **O que é:** tema, decider (regra do agente), limites e persistência.
- **Objetivo:** configurar o comportamento da demo.
- **Ações:** ajustar decider e limites; testar a config do LLM. *(Idioma PT/EN hoje está no menu de preferências da nav — `AppPreferencesMenu` — não nesta página.)*
- **Layout:** lista de preferências agrupadas com toggles e sliders.
- **Não fazer:** mostrar limites como números crus sem explicar o efeito prático.
- **Mobbin:** settings / preferences

---

## XI. Padrões transversais (valem para tudo)

### Sistema, não peças soltas

- **Estados vazio/carregando/erro:** hoje inconsistentes (Capture ≠ Marketplace). Padronize um componente (`StatePanel` existe — estender uso). Todo erro diz o próximo passo; todo vazio tem CTA. Nada de tela morta.
- **Trilho de CTAs:** Captura→Processar, Processar→Auditoria, Auditoria(válido)→Marketplace, Claim→Meus Ativos. Um sistema encadeado, não CTA solto.
- **Invariante de confiança:** "o selo decide, o agente age" precisa aparecer em Process, Capture, Chain, Audit e Lot Detail — não só em duas telas.
- **Aviso de sessão:** a API é em memória; avise em Audit e Overview para o usuário não achar que perdeu dados.
- **Idioma:** Overview + nav + badges traduzidos via `LocaleContext`; **conteúdo das outras 10 rotas ainda em inglês fixo** — precisa PT/EN em todas.
- **Command palette ⌘K:** existe (`CommandPalette.tsx`, botão na nav) mas sem descoberta/onboarding.
- **Acessibilidade:** foco visível, AA, labels, reduce-motion, Valid/Invalid nunca só por cor.

---

## XII. Por onde começar & board no Mobbin

### Prioridade de redesign

**P0**

1. **Process + Lot Detail** — o "wow" forense; definem a percepção do judge.
2. **Overview** — onboarding "60s" e modo judge.
3. **Capture** — wizard, validação, branding Lastre (não LASTRO), fluxo pós-submit centrado em prova.
4. **Marketplace + Mundi Map** — linguagem demo e drawer no mapa.
5. **Escalations + transversais** — ações reais, estados unificados, i18n nas 10 rotas, aviso de persistência, ⌘K.

### Como montar sua board no Mobbin

- Uma board por tela de alto impacto (Process, Lot Detail, Overview, Marketplace).
- Salve 3–5 refs por tela; anote "o que roubar" (o padrão, não a estética cripto).
- Filtre pelo mood forense/sóbrio: 1Password, WorkOS, Vanta, Mercury, Stripe, Linear, Wise.
- Termos-âncora de busca: verification, security, audit log, evidence, receipt, KYC, timeline, empty state, onboarding checklist, map drawer.

---

## Documentos relacionados

| Documento | Papel |
|-----------|-------|
| `docs/UX-SCREEN-AUDIT.md` | Audit técnico por rota (gaps P0) |
| `docs/APP-UI-ARCHITECTURE.md` | Spec de UI original do console |
| `docs/LAURA_PLATFORM_ARCHITECTURE_SUPER_FILE.md` | Arquitetura completa |
| `design-system/` | Tokens olive/gold, templates de marca |
