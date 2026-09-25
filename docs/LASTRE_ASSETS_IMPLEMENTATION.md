# Lastre Assets — implementação local

Entrega baseada em `LASTRE_PRODUCT_ARCHITECTURE.md`, aplicada ao produto Assets.
A raiz do app abre `/assets`. A experiência antiga permanece em `/console`, com
suas demais rotas técnicas preservadas. O site público e o produto Investors não
foram convertidos em um segundo aplicativo nesta entrega.

## Abrir

```sh
npm --prefix app ci
npm run dev:assets
```

A interface abre em `http://localhost:5174/assets`; a API de produto usa a porta
3001. Se o Vite já estiver aberto, iniciar somente
`app/node_modules/.bin/tsx app/server/assets-server.ts` na raiz do repositório.
O comando `npm --prefix app run dev` continua iniciando a API completa, que também
monta `/api/assets` antes do runtime demonstrativo. Não iniciar as duas APIs na
mesma porta ou sobre o mesmo arquivo de dados.

A conta nova começa com organização vazia. **Explorar demonstração** cria uma
organização isolada com exemplos fictícios, solicitação e documento identificados.
O modo demonstrativo não compartilha dados com organizações reais.

## Escopo implementado

| Jornada | Comportamento |
|---|---|
| Entrada e organização | Cadastro de conta, login, logout, sessão no servidor e troca entre participações ativas |
| Início | Solicitações abertas, rascunhos, indicadores derivados e versões recebidas |
| Meus ativos | Área, direito, projeto e equipamento; filtros, cadastro, edição, arquivamento e restauração |
| Lotes | Material ou produção, quantidade, unidade, período, vínculo de origem e importação CSV |
| Rascunhos | Salvamento explícito no servidor, retomada e revisão otimista; confirmação antes de sair com campos não salvos |
| Documentos | PDF, JPG, PNG e TXT até 8 MB; fonte, emissão, autoria, hash, substituição e remoção do rascunho |
| Solicitações | Associar ou criar cadastro, atender requisitos, justificar quando permitido e responder esclarecimentos |
| Envio | Revisar conteúdo, destinatário e finalidade; selecionar organização, vigência e permissão de download; confirmar e receber recibo |
| Versões | Snapshot de campos, documentos, respostas e verificações; consulta, comparação e exportação JSON identificada |
| Compartilhamento | Consulta pelo destinatário, acesso limitado à versão, expiração, revogação e download autorizado |
| Colaboração | Papéis de administrador, cadastro, envio, leitor e colaborador com escopo de objeto; convites com validade e uso único |
| Acompanhamento | Histórico de ações e central interna de notificações com destino contextual |
| Interface | Português, temas claro/escuro, navegação por teclado e adaptação a celular |

O backend também oferece criação de solicitações e pedidos de esclarecimento
para um futuro cliente Investors. O teste do domínio exercita a correção de uma
pendência após um envio. Isso não equivale a implementar a interface de análise,
notas internas, decisão ou comitê de Investors.

CSV: separador `;` ou `,`, cabeçalhos do modelo baixado na lista de lotes, células
entre aspas, aspas escapadas, UTF-8 e até 100 linhas. A importação é atômica e
idempotente: se uma linha falha, nenhuma é criada. Reenviar a mesma chave e
conteúdo recupera o resultado anterior. Importar cria rascunhos, sem compartilhar.

## Organização do código

- `app/src/features/assets/`: shell, rotas de produto, cliente HTTP, telas e componentes.
- `app/server/assets/types.ts`: contratos compartilhados entre interface e servidor.
- `app/server/assets/store.ts`: autorização, validação, transições e persistência.
- `app/server/assets/http.ts`: transporte, sessão, proteção de requisições e arquivos.
- `app/server/assets-server.ts`: entrada independente para o desenvolvimento do produto.
- `app/src/LegacyApp.tsx`: console anterior, carregado separadamente.
- `app/test/assets*.test.ts`: testes de domínio, HTTP, isolamento, importação e CSV.
- `app/test/assetsJourney.browser.py`: jornada de duas organizações e colaborador.

### Componentes compartilhados de lista

As listas de Assets usam componentes de `app/src/components/ui/`, com prefixo
`lastre-` e somente tokens do design system, para servirem também ao Admin e a
outras telas. A referência viva fica em `/design-system#data`, com dados fictícios.

| Componente | Uso |
|---|---|
| `DataTable` | Ordenação com `aria-sort`, seleção com Shift, barra de ações em lote, menu por linha, colunas e densidade lembradas no navegador, paginação, estados de carregamento e vazio. A linha abre o registro; o nome continua um link real. Vira cartões abaixo de 640 px da própria largura. |
| `Tabs` (`variant="underline"`) | Navegação de página ou filtro de situação com contagem e indicador deslizante. Sem `children`, controla um painel externo por `panelId`. A variante segmentada original não mudou. |
| `FilterBar`, `FacetFilter` | Busca, facetas multisseleção com contagem por opção e um único "Limpar". |
| `Select` | Escolha única em listbox, com ícones, descrições, grupos e busca. Com `name`, envia por campo oculto e participa da validação nativa. |
| `DropdownMenu` | Menu com setas, Home/End, busca por letra, itens de marcação e escolha única, e item destrutivo. |
| `Drawer`, `Tooltip`, `Checkbox`, `Pagination` | Painel lateral no `<dialog>` nativo (folha inferior no celular), dica de controle, marcação com estado parcial e rodapé de paginação. |

Camadas flutuantes são renderizadas no `<dialog>` aberto ou no `body`, e
compensam ancestrais com `transform`. Os componentes funcionam com ou sem
React Router (`routing.tsx`).

Nenhuma dependência de runtime foi adicionada. A interface reutiliza React,
React Router, os tokens, a fonte e os símbolos locais existentes. O carregamento
de Assets não inicializa a sessão fictícia, o onboarding ou os dados do console.

## Persistência e acesso

O armazenamento padrão é `app/.lastre/assets.json`, ignorado pelo Git e resolvido
em relação ao módulo, independentemente do diretório em que o comando é iniciado.
`LASTRE_ASSETS_DATA` permite apontar para outro arquivo. A escrita valida a
mutação em uma cópia, grava arquivo temporário e o renomeia antes de publicar o
novo estado em memória. Uma falha não deixa metade da operação gravada.

Esta implementação atende **uma instância de servidor com volume persistente**.
Não há coordenação de escrita entre processos ou armazenamento distribuído. Os
bytes dos documentos estão no arquivo de dados, como base64; não são guardados
no localStorage, enviados ao console ou servidos por diretório público. Alterações
confirmadas sobrevivem ao reinício. Campos não salvos permanecem somente no
formulário e não são uma captura offline.

Senhas usam scrypt com salt individual. Sessões usam tokens aleatórios, digest no
servidor, prazo de sete dias e cookie HttpOnly / SameSite=Strict. Em produção o
cookie recebe Secure. Mutação exige cabeçalho próprio e origem autorizada.
`LASTRE_ASSETS_ORIGINS` configura origens exatas separadas por vírgula para uma
implantação com proxy. A API não habilita CORS para o produto.

Toda leitura de cadastro, concessão e arquivo confere organização e papel. Um
colaborador vê apenas o cadastro atribuído, inclusive nos metadados, documentos
e histórico. Revogar uma concessão impede novas consultas e downloads; arquivos
já baixados não são remotamente apagados. Administração de equipe não concede
acesso ao conteúdo de outra organização.

Convites são links copiados pelo administrador; **não há envio de e-mail**. A
criação de uma conta não verifica titularidade de e-mail ou identidade legal da
organização. Antes de operação pública com dados reais, são necessárias a camada
operacional de identidade (confirmação de e-mail e recuperação de senha), política
de retenção, armazenamento de documentos adequado ao volume, backups e operação
de infraestrutura. O código não declara que esses controles estejam concluídos.

## Versões e verificações

O rascunho usa revisão numérica. Edições e respostas incrementam essa revisão;
uma edição ou confirmação baseada em revisão antiga recebe conflito, sem
sobrescrita silenciosa. O snapshot enviado preserva os valores examinados, os
metadados e bytes referenciados dos documentos, as justificativas e as respostas.
A chave de idempotência recupera o mesmo recibo quando uma confirmação é repetida.
Reutilizar a chave com outro conteúdo é rejeitado.

A verificação implementada compara os bytes armazenados ao digest SHA-256 do
upload, no momento da criação da versão. Ela identifica método, versão, momento,
escopo e limitações. Origem física e titularidade aparecem como **indisponíveis**.
Não são herdados resultados favoráveis de uma versão antiga. Receber uma resposta
não resolve automaticamente uma pendência e não produz uma decisão de análise.

## Inventário e compatibilidade

Fichas `LA-001` a `LA-009` foram implementadas preservando seus IDs. Foram
acrescentadas `LA-010` a `LA-016` para detalhe de ativo, organização, entrada,
convite, consulta recebida, revisão de ativo e redirecionamento da raiz.

`LC-001` passou de `/` para `/console`, mantendo a identidade de visão técnica.
As demais fichas LC permanecem. O shell técnico recebeu acesso de retorno a
Assets. O Admin continua apenas em desenvolvimento e não integra o build público.
As jornadas `FL-001`, `FL-004` e `FL-005` possuem implementação local;
`FL-002` e `FL-003` continuam propostas, pois incluem a interface Investors.

O gate G9 passou a reconhecer declarações reais de funções e métodos qualificados
via AST, sem aceitar comentários como implementação. As fontes da API Assets
entram na assinatura do relatório. Não se desabilitou nenhum gate.

## Validação

```sh
npm run test:assets
npm run inventory:sync
npm run inventory:check
npm run inventory:test
npm --prefix app run lint
npm --prefix app run build
npm --prefix app run build:api
python3 app/test/assetsJourney.browser.py
```

O teste de navegador requer Playwright Python, Chromium, API e Vite ativos. Cria
contas isoladas com sufixo aleatório, sem enviar mensagens externas, e grava
screenshots em `output/assets/`, fora do Git.

Cobertura automatizada: persistência após reinício, isolamento de organizações,
conflito de edição e envio, snapshot imutável, repetição de upload/envio/importação,
revogação e expiração de acesso, permissões de download, papéis, convite restrito,
troca de organização, resposta e correção de pendência, CSV e transporte HTTP.
A jornada no navegador cobre criação, proteção de campos não salvos, associação,
upload, envio, recebimento, exportação, revogação, importação, convite, escopo de
colaborador, celular e revisão do inventário do Admin.

## Evoluções ainda não implementadas

Captura offline completa, modelos setoriais regulatórios, conectores externos,
notificações por e-mail, automação de origem/titularidade e infraestrutura de
produção não são inferidos da existência das telas. O detalhamento de áreas e
direitos usa campos declaratórios mínimos; cadastros específicos de cada setor
precisam de modelos e requisitos próprios. A especificação de produto continua
sendo a referência para essas evoluções.

### Resultado desta entrega — 25/09/2026

- Suíte completa do app: **89 testes aprovados**, incluindo os 13 testes de Assets.
- Inventário: **9 testes aprovados**, 35/35 rotas cobertas e relatório sincronizado.
- Typecheck da interface e do servidor, build Vite e build da API: aprovados.
- Jornada Playwright: aprovada entre duas organizações e um colaborador, sem erros
  de página; revisão em desktop e 390 px, temas claro/escuro e Admin.
- Bundle público: sem a prévia do inventário administrativo.

A suíte antiga consultou o mecanismo de fallback quando a consulta Casper local
não encontrou configuração de ambiente. O resultado não certifica conectividade
ou transações de rede. O Vite manteve seu aviso de tamanho dos chunks de mapas do
console antigo; Assets é carregado em chunk próprio.
