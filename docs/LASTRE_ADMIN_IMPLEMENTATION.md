# Lastre Admin — implementação da prévia

Entrega de 25 de setembro de 2026, baseada em [LASTRE_ADMIN_ARCHITECTURE.md](LASTRE_ADMIN_ARCHITECTURE.md). A interface cobre as 27 telas canônicas e as 27 superfícies contextuais como **prévia local com dados fictícios**. Os dez destinos principais compartilham navegação, busca, tema, notificações e conta; Configurações permanece no rodapé.

## Abrir

```sh
npm --prefix app run dev:web
```

Acessar `http://localhost:5174/admin`. O Inventário continua em `/admin/inventario` com seus links e fichas existentes. A entrada `/admin/entrar` explica os requisitos de autenticação; “Explorar demonstração local” não cria uma sessão administrativa.

A importação administrativa continua condicionada a `import.meta.env.DEV`. Nenhuma tela, fixture operacional ou fonte do inventário é entregue como parte do build público.

## Refinamento visual com o DS

- Shell com marca completa, sidebar fosca, seleção contextual, busca em rebaixo e controles de tema/notificações com ícones acessíveis.
- Visão geral com métricas acionáveis, prioridades de atendimento, saúde observada por serviço, atribuições e atividade recente. Os eventos abrem a auditoria pelo ID; contagens usam os fixtures existentes, sem séries ou tendências inventadas.
- Tabelas com identidade na primeira coluna, prioridade por barras e rótulo, estado pelo componente do DS e responsáveis com monogramas. No celular, as linhas se reorganizam mantendo os nomes dos campos.
- Botões, seletores, buscas e painéis reutilizam componentes reais do DS. Materiais, elevação, foco, controles pressionados e movimento reduzido permanecem no sistema de tokens; o inventário mantém seu drawer existente.
- Busca disponível em todas as larguras. Cmd/Ctrl+K foca o campo da barra; até 1050 px abre a busca compacta, com foco no campo e retorno ao acionador por Escape. Nenhum segundo diálogo é aberto sobre uma revisão em andamento.
- Limpar filtros aparece quando há critérios ativos; tipo de registro e tabs continuam preservados. A ordem padrão da fila é identificada como Prioridade.

IDs afetados: `AD-001`–`AD-027`, superfícies compartilhadas `AD-S01`–`AD-S26`; nova superfície `AD-S27` e jornada local `JA-07`. As jornadas de produção `JA-01`–`JA-06` mantêm seus contratos propostos. Não houve remoção de telas nem alteração de API.

## Padrão de UI compartilhado com Assets

O Admin usa o mesmo kit de `app/src/components/ui/` que as telas de Assets.
`AdminUI.tsx` mantém suas props, e as implementações passam pelo kit:

- `DataTable` usa o `DataTable` compartilhado: faixa com o total de registros, menu
  Exibição (colunas e densidade lembradas no navegador), paginação local de 10 itens,
  linha que abre a prévia e botão "Abrir prévia" por linha. Colunas podem declarar
  `sort` para ordenação. A página atual deixou de ficar em `?pagina=`.
- `Filter` e `AdvancedFilters` usam `Select` com o rótulo embutido; `Toolbar` e
  `ClearFilters` seguem o `FilterBar`. `PageTabs` e as visões rápidas da fila usam as
  tabs sublinhadas, estas últimas com contagem por visão.
- `Surface` mantém o foco e a guarda de rascunho próprios, com a aparência do
  `Drawer` do kit; a variante modal fica centralizada e vira folha inferior no celular.
- `admin-kit.css`, carregado depois de `admin.css`, alinha cabeçalho, painéis, selos,
  monogramas coloridos, estado vazio, fatos e barra de filtros à escala de Assets.
- Nenhum `<select>` nativo permanece nas telas do Admin e do inventário.

Os testes de navegador foram ajustados à interação com o `Select` (abrir e escolher a
opção) e à tabela compartilhada; as asserções de comportamento continuam as mesmas.

## Comportamento implementado

- Fila com visões rápidas, busca, filtros na URL, ordenação e prévia de triagem. Detalhe com contexto, linha do tempo, nota demonstrativa e preparação de comunicação externa separada.
- Organizações com situação, ativação, equipe, registros relacionados, restrições, condições do piloto e histórico.
- Índice de registros por tipo; páginas de ativo/lote, dossiê, análise, evidência e comparação. Links históricos preservam a versão; versão inexistente e evidência fora da versão não abrem outro registro silenciosamente.
- Viewer de um documento **fictício em HTML**, com zoom e metadados recolhíveis. Não é um renderizador de PDFs integrado ao armazenamento. Evidências restritas permanecem fechadas.
- Verificações com execução, resultado e validade independentes; tentativas, método, contexto e diagnóstico. Seleção em conjunto fixa explicitamente os IDs para a revisão; os inelegíveis aparecem excluídos.
- Modelos por tipo, definição e uso. Editor com identificação, requisitos, prévias e diff. Rascunho local sobrevive ao recarregamento na mesma sessão; sair com alterações exige descartar ou continuar. Salvar não publica.
- Integrações com observação de saúde, configurações mascaradas, tentativas e inspeção de entregas. O estado desconhecido não aparece como operacional.
- Pessoas, equipe interna e concessões separadas; diagnóstico demonstrativo de acesso, sessões e matriz de capacidades em leitura.
- Auditoria filtrável e evento em drawer; configurações com fonte e responsável; revisão de intervenção com alvos, elegíveis, excluídos, aprovação, execução e recibo ainda não confirmado.
- Busca por nome ou ID agrupada por organizações, pessoas, registros, execuções e ocorrências.
- Estados de não encontrado, sem resultados, restrição de conteúdo, falha de gravação local e saída com rascunho. Estados utilitários consultáveis por `?estado=sem-permissao`, `sessao-expirada`, `indisponivel` e `manutencao`; são demonstrações, não autorização.

## Superfícies contextuais

O inventário usa IDs estáveis `AD-S01` a `AD-S27`, com `kind: hosted`, hospedeira, fonte, gatilho, formato e contrato. Isso não aumenta o número de destinos na navegação.

| IDs | Superfícies |
|---|---|
| AD-S01–AD-S05 | Prévia e criação de ocorrência, atribuição, resolução e comunicação externa |
| AD-S06–AD-S12 | Organização, convite, vínculo, sessão, pedido/concessão de suporte e suspensão/reativação |
| AD-S13–AD-S16 | Repetição, revogação de resultado, criação/duplicação de modelo e revisão de publicação |
| AD-S17–AD-S21 | Conexão, credencial, entrega, evento de auditoria e exportação |
| AD-S22–AD-S26 | Acompanhamento de exportação, notificações, filtros, conta e ficha do inventário |
| AD-S27 | Busca global compacta, compartilhada por todas as páginas do shell |

Atribuição usa modal curto; comunicação externa usa compositor no modal. Ambas mantêm contexto e revisão na mesma superfície. Publicação usa uma seção do editor. Os filtros principais ficam inline e os adicionais da fila ficam em drawer. Prévia e confirmação se substituem, sem empilhar diálogos bloqueantes. O inventário conserva seu drawer próprio de cinco tabs.

## Limites da entrega

Nenhum comando administrativo real é enviado. Revisões exibem alvo, organização, versão, motivo, efeito e autoridade exigida; a confirmação permanece indisponível. Preparações podem ser salvas em `sessionStorage`, com retorno explícito de sucesso local ou erro. A nota da ocorrência é temporária na página. Nenhum desses mecanismos representa persistência de produto ou trilha de auditoria.

Permanecem pendentes, conforme as decisões da arquitetura:

- Identidade administrativa no servidor, verificação adicional e capacidades por objeto/ambiente.
- API administrativa, revisão otimista, idempotência, tarefas assíncronas, recibos e auditoria durável.
- Concessões de suporte com expiração efetiva, arquivos privados, download e exportação autorizados.
- Envio de convites/mensagens, reprocessamento, suspensão, revogação, publicação e gestão de credenciais.
- Política aprovada de retenção, eliminação, vigência, revisão independente e observabilidade real.
- Editor avançado de requisitos/exceções, comparação visual de documentos e instrumentação de indicadores P1.

As jornadas `JA-01` a `JA-06` continuam **propostas** no inventário. `existing` nas fichas indica existência da interface da prévia, não prontidão de produção. A leitura local é uma operação observada; a execução administrativa permanece proposta.

## Referências e verificação

A pesquisa no Mobbin está registrada [tela por tela](LASTRE_ADMIN_MOBBIN_REFERENCES.md), com links às referências efetivamente consultadas e descrição do que foi aproveitado. A implementação usa os tokens, a tipografia, a marca, os ícones, o controle de tema e os componentes `Button`, `Surface`, `SearchInput`, `SelectField`, `StatusBadge` e `Tabs` existentes da Lastre.

```sh
npm --prefix app run lint
npm run inventory:sync
npm run inventory:check
npm run inventory:test
npm --prefix app run build
python3 app/test/adminPreview.browser.py --base-url http://localhost:5174
python3 app/test/inventoryDrawer.browser.py --base-url http://localhost:5174
```

A regressão do Admin percorre 27 rotas e suas tabs em 1440 e 390 px, verifica overflow, teclado, filtros recarregáveis, retorno de foco, substituição de painéis, versão histórica, evidência restrita, revisão sem envio, seleção explícita, rascunho local, navegação com alterações, estados utilitários, busca global por teclado e links de atividade para eventos. Também registra que nenhuma escrita `/api/` foi disparada. Capturas vão para `/tmp/lastre-admin-review` ou para `--artifacts`.

O teste anterior do inventário continua cobrindo abertura pela linha inteira, navegação única, cinco tabs, Escape e retorno de foco em desktop e celular. As referências do build público são conferidas à parte; os testes da prévia não comprovam autorização de produção.

## Resultado da validação nesta entrega

- `inventory:check`: sem divergências; 61/61 rotas do app cobertas.
- `inventory:test`: 9 testes aprovados.
- `app run lint` e `app run build`: aprovados. O build mantém o aviso de chunks grandes de mapas, fora do escopo desta interface local.
- `adminPreview.browser.py`: aprovado em 1440 e 390 px, incluindo todas as rotas/tabs e as regressões de filtros, versões, revisões e rascunhos; nenhuma escrita de API observada.
- `inventoryDrawer.browser.py`: aprovado em desktop e celular.
- Catálogo administrativo e contratos AD-002, AD-017 e AD-S27 revisados na interface do Inventário; jornada local JA-07 conferida e relatório gerado incluído na entrega.
- JS/CSS públicos inspecionados: nenhum marcador da implementação, das fixtures ou das superfícies administrativas encontrado.
- Capturas dos dois temas e de páginas de operação, documento, execução e auditoria inspecionadas; sem overflow de página nos tamanhos testados.
- Refinamento DS: 54 visitas adicionais às nove páginas principais em 320, 768 e 1024 px, nos dois temas e com movimento reduzido; sem erros JavaScript ou overflow de página.
- Busca global: foco, envio e recarga da consulta, Escape e proteção contra sobreposição de diálogos verificados em desktop e celular; atividade recente abre o evento canônico.
- `tokens:check`: 118 combinações de contraste aprovadas; todos os tokens usados pelos estilos administrativos existem no DS. Não substitui auditoria completa com tecnologia assistiva.
- Evidências deste refinamento em `/tmp/lastre-admin-refinement/`.

## Escopo de arquivos

O shell compartilhado afeta `AD-001` a `AD-027` e suas superfícies hospedadas. A entrega mantém os IDs anteriores; não remove telas. Não altera o comportamento do backend nem os contratos de Assets e Investors. Alterações nesses produtos que coexistam na árvore de trabalho pertencem a trabalhos independentes.
