# Inventário do frontend

O inventário em `/admin/inventario` é a referência de telas, tarefas, operações e
jornadas da Lastre. Toda mudança estrutural do frontend passa por ele na mesma
entrega, conforme a regra de [AGENTS.md](../AGENTS.md).

## Abrir e atualizar

```sh
npm --prefix app ci
npm --prefix app run dev:web
```

Abrir `http://localhost:5174/admin/inventario`. Há entradas pelo console e pelo
design system em desenvolvimento. O inventário é somente leitura; editar as fontes
abaixo mantém revisão e histórico no Git, sem depender do navegador de alguém.

Inventário é uma única página na navegação administrativa. O layout compartilhado
`AdminLayout.tsx` reúne dez destinos principais e Configurações no rodapé. As 27 telas canônicas do Admin estão disponíveis como prévia local; os dados operacionais são fictícios e o envio de comandos reais permanece indisponível. Visão geral, catálogo,
modais e drawers, fluxos, operações, verificações e regra são abas locais do inventário, sem criar
itens adicionais no menu administrativo.

A aba **Modais e drawers** (`/admin/inventario?view=superficies`) reúne as
27 interfaces AD-S em um índice por tarefa e uma área de prévia viva. As próprias
telas do Admin são carregadas em frames identificados: nenhum componente é
redesenhado como miniatura. Todos os exemplos, inclusive busca, notificações,
filtros, exportações e revisão na página, são exploráveis sem sair do inventário.

Os estados disponíveis dependem do componente. Os formulários oferecem estado
inicial, campos preenchidos, validação, revisão, confirmação local, falha ao salvar
e conteúdo extenso. Consultas incluem exemplos ausentes, filtros ou busca sem
resultados quando aplicável. São cenários demonstrativos, não execução de backend.
**Comparar estados** abre duas instâncias independentes; os viewports de 720 e
390 px usam os breakpoints reais. **Ampliar prévia** cede o espaço do índice ao
componente. A busca e o seletor de interfaces permanecem acessíveis no celular.

Busca, formato, seleção, estado, comparação e viewport vivem na URL:
`buscaSuperficie`, `formato`, `preview`, `cenario`, `comparar` e `viewport`.
Exemplo: `/admin/inventario?view=superficies&preview=AD-S03&cenario=initial&comparar=review`.
Escape fecha o componente e retorna o foco a **Reiniciar exemplo**. Campos alterados
pedem continuar ou descartar antes de trocar interface, cenário, aba ou reiniciar;
recarregar usa a proteção de saída. Falha no carregamento oferece nova tentativa.

O modo de cenários exige desenvolvimento e um frame. `surface-lab-runtime.ts`
lê o ID/estado inicial e `SurfaceLabBridge.tsx` comunica prontidão e alterações.
Mensagens são conferidas por origem, janela emissora e instância. A navegação
permanece dentro do frame; seguir um link para a galeria não cria frames recursivos.
Formulários e rascunhos são efêmeros nas prévias, sem gravar preparações operacionais.
Temas do frame são isolados da preferência global. O uso normal do Admin mantém
seu comportamento. O bundle público continua excluindo todo o Admin.

Os destinos concretos ficam em `inventory-surface-previews.ts`, e os cenários e
agrupamentos em `surface-scenarios.ts`. A exportação JSON inclui as definições das
interfaces. Nenhum comando administrativo é enviado.

Regressão: `python3 app/test/inventorySurfaces.browser.py`. Cobre as 27 interfaces,
estados, comparação independente, guardas de alterações, URL/histórico, teclado,
recuperação, temas, isolamento e navegação interna em desktop e celular.
Fichas afetadas: AD-001 e AD-S01 a AD-S27; jornada JA-08. Os pontos de entrada em
AD-003, AD-017 e no shell compartilham os mesmos componentes nas prévias.

Cada ficha abre um drawer com as abas **Visão geral**, **Contrato**, **Estados**,
**Operações** e **Fluxos**. Cabeçalho e abas permanecem visíveis durante a rolagem
do conteúdo. As setas esquerda/direita e Home/End navegam nas abas; Esc fecha o
drawer e devolve o foco ao acionador. A ficha e a aba podem ser compartilhadas
pela URL, por exemplo `/admin/inventario?view=catalogo&screen=LA-006&tab=contrato`.
Abrir outra ficha começa em Visão geral; fechar preserva os filtros do catálogo.
A linha inteira do catálogo abre a ficha, incluindo descrição, rota e status.
O botão com o nome mantém o acesso por teclado com Enter ou Espaço.

Regressão de abertura (com o Vite ativo e Python Playwright instalado):
`python3 app/test/inventoryDrawer.browser.py --base-url http://localhost:5174`.
O teste cobre clique nas diferentes células, abertura única, abas e retorno do
foco, em desktop e celular.

| Fonte | Conteúdo |
|---|---|
| `app/src/lib/inventory/screens.ts` | IDs estáveis, rotas, propósito, estados e situação |
| `app/src/lib/inventory/specifications.ts` | Tarefa, contexto, dados, ações, permissões, recuperação, versões e aceitação |
| `app/src/lib/inventory/operations.ts` | Operações observadas ou propostas e suas limitações |
| `app/src/lib/inventory/flows.ts` | Etapas das jornadas e resultado esperado |
| `app/src/lib/inventory/governance.ts` | Regra e procedimento exibidos no Admin |
| `app/src/lib/inventory/generated/report.json` | Relatório produzido pelo comando de sincronização |

## Regra de alteração

1. Identificar as fichas e jornadas afetadas antes da implementação.
2. Atualizar os registros junto com a mudança. Nova rota requer uma ficha;
   mudança de estado, ação, dado ou permissão requer revisão do contrato da tela.
3. Rodar `npm run inventory:sync` e revisar o catálogo no Admin, incluindo erros
   e o comportamento em celular quando a interface mudar.
4. Rodar `npm run inventory:check` e `npm run inventory:test`.
5. Informar no PR os IDs afetados e os resultados da validação.

Para uma alteração só visual, revisar as telas afetadas, sincronizar o relatório
e indicar no PR que o contrato funcional permanece válido. Para remoções,
atualizar fluxos e referências, preservando o registro da decisão no PR.

## Conferência automática

O build local do app e a etapa **Check living inventory** da CI executam a conferência.
Ela falha quando encontra rotas do app sem ficha, fichas sem rota, IDs duplicados,
referências ausentes, especificações incompletas ou um relatório desatualizado.
O job executa em todos os PRs, inclusive mudanças no site ou design system.

O relatório inclui uma assinatura de conteúdo das fontes de `app/src`,
`web/src`, `design-system` e dos arquivos de configuração frontend selecionados.
Arquivos gerados pelo próprio inventário ficam fora da assinatura. Alterações
nas fontes monitoradas exigem sincronização, inclusive mudanças em estilos e
componentes compartilhados. Assets binários e arquivos públicos externos a
essas fontes ainda dependem de revisão manual.

A cobertura automática de rotas abrange JSX React Router do app e sua entrada
especial de design system. O roteamento próprio do site é catalogado manualmente.
O verificador não comprova que permissões funcionam, que um endpoint está
integrado ou que uma jornada foi testada. Também não julga se uma ficha descreve
corretamente o comportamento: essa revisão faz parte da entrega.

A tela administrativa atual é uma prévia de desenvolvimento e não integra o
build público. Não há autenticação administrativa de produção implementada. Preparações e rascunhos da prévia podem ser salvos na sessão do navegador, sem alterar dados de clientes. Referências e limites: [implementação do Admin](LASTRE_ADMIN_IMPLEMENTATION.md) e [Mobbin](LASTRE_ADMIN_MOBBIN_REFERENCES.md).
