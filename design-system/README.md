# Lastre Design System · 1.2

A identidade de produto da Lastre, implementada em React e CSS a partir do [Figma, seção 69:725](https://www.figma.com/design/qs8aJnnERxiPfreitHGkfV/Lastre?node-id=69-725).

## Abrir a biblioteca

```sh
npm ci --prefix app
npm --prefix app run dev:web
```

Acesse **http://localhost:5174/design-system**. A biblioteca é pública, não precisa de login, não inicializa sessão de demonstração e não depende do backend. Inclui temas claro/escuro, busca e cópia das cores, download de tokens, tipografia, geometria, inspetor semântico, playground de botões com cópia de JSX, campos, feedback e padrões com carregamento, vazio, erro e recuperação.

## Profundidade, materiais e movimento · 1.2

A biblioteca agora inclui uma composição com camadas separáveis, laboratório de elevação por slider ou teclado, quatro estudos de materiais, três curvas de movimento com reprodução sob demanda e uma galeria de ícones com tamanho ajustável. As demonstrações copiam tokens ou JSX. A preferência de movimento reduzido do sistema tem prioridade sobre o modo escolhido no laboratório.

| Elevação | Uso | Token |
| --- | --- | --- |
| 0 · Base | Conteúdo no plano da página | `--lastre-elevation-0` |
| 1 · Repouso | Cards de métricas e controles | `--lastre-elevation-1` |
| 2 · Destaque | Painéis de informação | `--lastre-elevation-2` |
| 3 · Suspenso | Superfícies em destaque ou interação | `--lastre-elevation-3` |
| 4 · Flutuante | Menus e popovers | `--lastre-elevation-4` |
| 5 · Foco | Diálogos e decisões | `--lastre-elevation-5` |

As sombras combinam contato e difusão, com valores próprios por tema. `surface-edge` acrescenta a luz superior e o contato inferior; no tema escuro, esse contorno ajuda a separar planos. Elevação visual e `z-index` são decisões distintas: o componente não muda a ordem de empilhamento nem adiciona interação.

```tsx
import { Surface } from "./components/ui/Surface";

<Surface as="section" elevation={2} material="matte" aria-label="Evidências">
  <h2>Cadeia de origem</h2>
</Surface>
```

`Surface` aceita `as="div" | "article" | "section"`, `elevation={0…5}` e `material="matte" | "glass" | "recessed"`, além dos atributos HTML. Fosco recebe luz difusa; vidro preserva o contexto com desfoque e fallback opaco; rebaixo substitui a sombra externa pela interna. O metal usa `--lastre-material-metal` em detalhes decorativos; textos sobre ele precisam de uma base adequada para contraste.

Os mesmos tokens estão aplicados no produto: `MetricCard` e `OverviewDashboardCard` usam `Surface`; painéis, popovers e diálogos têm aliases de sombra distintos; botões primários/secundários respondem a hover e pressão; campos e buscas usam rebaixo; abas selecionadas se destacam do trilho. Os nomes existentes `shadow-sm` e `shadow-md` permanecem como aliases semânticos. A paleta, o logotipo e as famílias tipográficas continuam compartilhados.

Movimento: `ease-standard` / 180ms para controles, `ease-emphasized` / 320ms para painéis e `ease-spring` / 560ms para detalhes expressivos. O laboratório anima apenas transformação e opacidade, sem repetição automática. Cópias e seletores funcionam por teclado, e os temas se sincronizam entre abas.

Validação da versão 1.2: build do app e da landing; lint do app; sincronização e 118 verificações de contraste dos tokens; biblioteca nos dois temas em 1440, 1024, 768, 390 e 320px; 20 visitas a overview, lotes, processamento, auditoria e configurações em desktop/celular; interação por teclado, cópias, download, estados, movimento reduzido e sincronização de tema entre abas. Evidências locais em `output/design-system-depth/` (ignorado pelo Git). As verificações de contraste cobrem os tokens; os testes de navegador não substituem uma auditoria completa com tecnologias assistivas.

## Fonte de verdade

Edite `tokens/lastre.tokens.json` e execute:

```sh
npm run tokens:build
npm run tokens:check
```

O gerador produz `lastre.css` e `lastre-compat.css`. Antes de gerar, valida referências ausentes, ciclos, nomes de variáveis duplicados e paridade dos papéis entre temas. O segundo comando detecta arquivos desatualizados e verifica 118 combinações de contraste nos dois temas: texto ≥ 4.5:1, foco e contornos de controles ≥ 3:1. Esses testes cobrem os papéis semânticos; não representam uma auditoria de acessibilidade de todas as telas existentes.

| Camada                | Arquivo                                                 | Responsabilidade                                                            |
| --------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| Fonte                 | `tokens/lastre.tokens.json`                             | Primitivos, fundamentos, semânticos dos dois temas e aliases de componentes |
| CSS                   | `tokens/lastre.css`                                     | Variáveis `--lastre-*`, geradas automaticamente                             |
| Compatibilidade       | `tokens/lastre-compat.css`                              | Nomes `--lastro-*` existentes apontam para a nova identidade                |
| Entrada compartilhada | `tokens/lastro.css`                                     | Importa definições legadas, nova identidade e compatibilidade               |
| Arquivo histórico     | `tokens/lastro-legacy.css`, `tokens/lastro.tokens.json` | Paleta anterior mantida para compatibilidade e referências históricas       |
| Marca                 | `assets/lastre-wordmark.svg`                            | SVG original exportado do Figma, sem redesenho                              |
| Símbolo               | `scripts/build-symbol.mjs`                              | Geometria exata do nó `69:917`; gera os SVG da marca e todos os ícones      |
| Fonte display         | `assets/fonts/`                                         | Manrope variável, local, com licença OFL                                    |

O app importa `lastre.css` diretamente: todos os seus estilos usam os tokens `--lastre-*`, sem depender dos aliases `--lastro-*`. A landing continua recebendo os mesmos tokens pela entrada de compatibilidade `lastro.css`. Os materiais publicitários históricos permanecem documentados em [ADVERTISING.md](ADVERTISING.md).

## O que veio do Figma

- **Marca:** vetor do nó `69:727`, exportado a partir de `69:726`.
- **Símbolo:** vetor do nó `69:917`, reconstruído por `scripts/build-symbol.mjs`.
- **Mirage:** 11 tons, de `50 #F0F1F3` a `950 #0F1116`.
- **Blue:** 11 tons, com `500 #107CA4` como cor principal.
- **Gold:** 11 tons, com `200 #FDA82D` como cor secundária.
- **Tipografia de referência:** o quadro usa Science Gothic e Inter. Por orientação da usuária, o produto adota Manrope nos títulos e Inter nos textos/controles. A tipografia do logotipo permanece no SVG original.

Referências: funções de cor em `69:740`; escalas em `69:757`. O quadro usa Mirage 900 como base escura; a implementação usa esse tom nas superfícies e Mirage 950 no canvas para separar níveis.

São **extensões de implementação**, não especificações presentes no Figma: a escolha de Manrope e os gradientes dourados solicitados pela usuária, os papéis semânticos, os tons de sucesso/erro, a escala de espaçamento, os raios, as alturas de controle, o movimento e os estados dos componentes. JetBrains Mono foi mantida do produto para hashes e IDs.

## Símbolo

O export do Figma (`assets/lastre-icon.svg`, preservado como procedência) é um desenho a caneta: as arestas retas saíram como cúbicas com alças fora de eixo, vértices que deveriam coincidir diferem na terceira casa, o mesmo canto aparece com dois raios e sobrou um segmento de comprimento zero. `scripts/build-symbol.mjs` não corrige aquele arquivo — reconstrói a marca a partir das retas que o desenho aproxima e derruba todo vértice de uma interseção.

```sh
npm run symbol:build
npm run symbol:check
```

A marca são cinco regiões: o chevron `<` à esquerda, o losango no meio, o telhado, a faixa e o vale. As invariantes que o desenho só aproximava e que o gerador torna exatas:

- o losango é um losango — diagonais ortogonais, centro sobre a horizontal média;
- a meia-diagonal vertical do losango é a altura da faixa, e a ponta de baixo cai na horizontal de baixo;
- `K`, a ponta direita do losango, é o canto de base do telhado;
- `N`, a mordida na montanha, está sobre a reta `M→K`;
- os dois ápices no topo e as duas pontas embaixo compartilham `y`;
- os três cantos filetados têm o mesmo comprimento de tangente (6), com arcos circulares de verdade.

Nenhum ângulo foi forçado para um retículo: o desvio máximo entre a reconstrução e as amostras do Figma é **0.434 px em 150**, ou seja, a silhueta é a mesma. As diagonais medem entre 59.8° e 62.2°, perto de 60° sem serem 60°.

Camadas e costuras: dois polígonos que dividem uma aresta deixam um fio de 25% de transparência, porque o rasterizador soma duas coberturas de 50% e chega a 75%. O desenho chapado empilha — a silhueta inteira embaixo, as outras três regiões por cima —, e o espectro é um traçado só com dois subtraçados, sem nenhuma aresta interna.

| Saída                                  | Caixa     | Uso                                                        |
| -------------------------------------- | --------- | ---------------------------------------------------------- |
| `assets/lastre-symbol.svg`             | 128, 112  | Marca chapada, cores próprias                               |
| `assets/lastre-symbol-espectro.svg`    | 128, 112  | Espectro contínuo; é o que o header usa                     |
| `web/public/favicon.svg`               | 128, 120  | Aba do navegador, com rampa alternativa em tema claro       |
| `web/public/favicon.ico`               | 16/32/48  | Contêiner ICO com três PNG, para quem ainda pede `.ico`     |
| `web/public/apple-touch-icon.png`      | 180       | iOS, com placa Mirage 950 — o sistema ignora SVG e alfa     |
| `web/public/icon-192/512.png`          | 192, 512  | Manifesto                                                   |
| `web/public/icon-maskable-512.png`     | 512       | Android recorta em círculo: a diagonal da marca é que cabe  |

O favicon é pintado pelo cromo do navegador, não pela página, então segue o tema do sistema e não o `data-theme`. A rampa clara desce nas escalas Gold e Blue até cada parada passar de 2.9:1 sobre branco puro; o gerador falha se alguma parada não passar.

Duas cores da marca não pertencem às escalas de tokens e ficaram como foram desenhadas: `#48AFF5` na faixa e `#ED9E04` no chevron. As outras duas do export diferiam do token em 1/255 por canal — ruído de arredondamento — e foram alinhadas a Blue 200 e Mirage 700.


## Cores por intenção

| Uso                  | Token                             | Escuro     | Claro      |
| -------------------- | --------------------------------- | ---------- | ---------- |
| Canvas               | `--lastre-bg-canvas`              | Mirage 950 | Mirage 50  |
| Superfície           | `--lastre-bg-surface`             | Mirage 900 | Branco     |
| Texto principal      | `--lastre-text-primary`           | Mirage 50  | Mirage 900 |
| Texto secundário     | `--lastre-text-secondary`         | Mirage 200 | Mirage 600 |
| Texto auxiliar       | `--lastre-text-muted`             | Mirage 300 | Mirage 500 |
| Ação principal       | `--lastre-action-primary`         | Blue 500   | Blue 500   |
| Texto de ação        | `--lastre-action-text`            | Branco     | Branco     |
| Links/foco           | `--lastre-link`, `--lastre-focus` | Blue 200   | Blue 600   |
| Destaque             | `--lastre-accent`                 | Gold 200   | Gold 200   |
| Texto sobre destaque | `--lastre-accent-text`            | Mirage 950 | Mirage 950 |
| Aviso                | `--lastre-warning`                | Gold 200   | Gold 700   |

Use tokens semânticos em componentes. Use os primitivos diretamente para a identidade de marca, amostras e ilustrações com cores fixas. Gold não substitui a ação principal. Sucesso e erro recebem cores e rótulos próprios; invalidade permanece um resultado registrado, não uma evidência descartada.

```css
.evidence-card {
  color: var(--lastre-text-primary);
  background: var(--lastre-bg-surface);
  border: 1px solid var(--lastre-border-subtle);
  border-radius: var(--lastre-radius-lg);
  padding: var(--lastre-space-6);
}
```

O tema usa `data-theme="dark"` ou `data-theme="light"`; a aplicação mantém a preferência através de `app/src/lib/theme.ts`. Para superfícies aninhadas, defina `data-theme` no container.

## Tipografia e geometria

- **Manrope, 500/600:** títulos do app e do site; display fluido 36–64px, heading 32px, seção 24px. Tracking de −0.025 a −0.04em. O logotipo é um vetor independente, não texto na fonte da interface.
- **Inter, 400/500/600:** interface 14–16px, linha 1.5. Carregada pelo HTML existente do app/site, com fallback de sistema.
- **JetBrains Mono:** hashes, IDs e anotações, 12–14px; números tabulares quando útil. Carregada pelo HTML existente.
- **Espaçamento:** múltiplos de 4px; `space-1` = 4px, `space-6` = 24px, `space-16` = 64px.
- **Raios:** `sm` 6px, `md` 10px, `lg` 16px, `pill` 999px.
- **Controles:** 40px compacto, 44px padrão, 52px amplo. Preferir 44px ou mais para interação por toque.
- **Movimento:** 120/180ms. Botões usam escala 0.96 durante o pressionamento, com opt-out `static`. Em `prefers-reduced-motion`, transições, escala e spinner ficam estáticos.
- **Foco e camadas:** tokens próprios para espessura/afastamento do foco, opacidade desabilitada e níveis sticky/popover/modal/toast/tooltip.
- **Escala tipográfica:** `text-display/title/section/body/label/caption`, com entrelinhas e pesos compartilhados. Labels de documentação têm no mínimo 11px; corpo e controles usam 14–16px.

## Gradiente Gold

O dourado simula reflexos de metal como acento pontual. `--lastre-gradient-gold` usa Gold 600 → 200 → 50 → 300 → 500; `--lastre-glow-gold` fornece um brilho suave. Use em filetes, selos e superfícies de destaque. Como orientação de composição, escolha um ponto de destaque por bloco; não é uma restrição técnica do componente.

Para texto, use `--lastre-gradient-accent-text` ou `.lastre-gold-text`: o tema claro usa tons mais profundos e o escuro usa tons luminosos. Os stops são verificados contra as três superfícies do sistema. Não colocar texto pequeno diretamente sobre o gradiente decorativo; use uma base sólida para rótulos.

Aplicações: destaque no título da biblioteca, palavra de destaque do hero do site, filete do painel de prova, da próxima ação no overview, do Trilho Selado e dos cartões com `accent`. Ações e links permanecem azuis. Sem animação contínua de brilho.

## Componentes React

Componentes em `app/src/components/ui/`. CSS convencional; nenhuma nova biblioteca de interface foi instalada.

```tsx
import { Button } from "./components/ui/Button";
import { TextField } from "./components/ui/TextField";
import { SelectField } from "./components/ui/SelectField";
import { ActionLink } from "./components/ui/ActionLink";
import { StatusBadge } from "./components/ui/StatusBadge";
import { InlineNotice } from "./components/ui/InlineNotice";

<Button variant="primary" loading={isVerifying} onClick={verify}>
  Verificar origem
</Button>
<TextField label="Nome do ativo" hint="Use um nome fácil de identificar."
  error={error} required value={name} onChange={e => setName(e.target.value)} />
<SelectField label="Categoria" defaultValue="mineral">
  <option value="mineral">Mineral</option>
  <option value="carbon_credit">Crédito de carbono</option>
</SelectField>
<ActionLink to="/audit" variant="secondary">Abrir auditoria</ActionLink>
<StatusBadge label="Verificado" tone="success" circle="filled" />
<InlineNotice tone="danger" title="Não foi possível carregar"
  action={<Button variant="secondary" onClick={retry}>Tentar novamente</Button>}>
  Tente carregar as evidências novamente.
</InlineNotice>
```

| Componente       | API principal                                                                                 | Comportamento                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`         | `variant`, `size`, `loading`, `startIcon`, `endIcon`, `iconOnly`, `static`, atributos nativos | Primário/secundário/ghost/danger; loading impede clique, expõe `aria-busy` e preserva largura com o mesmo rótulo; tipo padrão `button` |
| `ActionLink`     | `to` ou `href`, `variant`, `size`, atributos de link                                          | Mesma hierarquia de Button; mantém navegação e semântica de link                                                                       |
| `SelectField`    | `label`, `hint`, `error`, `hideLabel`, atributos nativos                                      | Seletor nativo, rótulo associado, ajuda/erro e estados compartilhados com TextField                                                    |
| `TextField`      | `label`, `hint`, `error`, atributos nativos                                                   | ID automático, label associado, ajuda/erro descritos, `aria-invalid`, readonly selecionável; input de 16px em telas pequenas           |
| `InlineNotice`   | `tone`, `title`, `children`, `action`, `live`                                                 | Informação/sucesso/aviso/erro com ícone, título e ação opcional; `live` ativa status ou alert para feedback dinâmico                   |
| `LastreWordmark` | `className`                                                                                   | Vetor original em máscara CSS; herda a cor; nome acessível Lastre                                                                      |
| `StatusBadge`    | `label`, `tone`, `circle`, `size`                                                             | Componente existente; significado por texto e indicador, além da cor                                                                   |
| `MetricCard`     | `label`, `value`, `hint`, `tone`                                                              | Componente existente; contexto dos indicadores                                                                                         |
| `SearchInput`    | `value`, `onChange`, `ariaLabel`                                                              | Componente existente; busca controlada                                                                                                 |
| `Tabs`           | `tabs`, `active`, `onChange`, `children`                                                      | Componente existente; setas/Home/End, tabulação única, painel associado                                                                |

O rótulo do botão permanece no DOM durante `loading`, com opacidade zero: a leitura assistiva conserva seu nome e a largura não muda. Use uma mensagem de status no contexto da operação para informar conclusão ou falha. Ícones de apoio são decorativos; botões somente com ícone precisam de `aria-label`.

`InlineNotice` não anuncia exemplos estáticos automaticamente. Use `live` somente quando a mensagem responder a uma operação, sem duplicar regiões de anúncio. A presença do papel ARIA não substitui testes com leitor de tela.

Não usar status visual como substituto de autorização ou validação de dados. Os exemplos da biblioteca são fictícios, locais e não chamam APIs.

## Adoção no app

A migração cobre navegação, login, boas-vindas, overview, lotes e detalhe, captura, processamento, auditoria e detalhe, escalações, marketplace e detalhe, meus ativos e detalhe, agentes e configurações.

- **Ações e formulários:** `Button`, `ActionLink`, `TextField` e `SelectField` substituem as implementações duplicadas. As classes das telas definem composição; os componentes definem aparência e estados. Busca, abas, escolhas e navegação preservam seus comportamentos específicos e usam os mesmos tokens.
- **Feedback:** `InlineNotice` padroniza carregamento com falha, recuperação, exportação, captura e respostas de ações. Campos inválidos associam o erro ao input; botões de operação preservam o rótulo no carregamento.
- **Superfícies e dados:** cores de painéis, tabelas, mapas, gráficos, indicadores e previews de provas usam os papéis canônicos. Cores fixas de fotografias, marcas externas e cartografia continuam sendo conteúdo.
- **Tema:** `useTheme` observa uma preferência compartilhada, sincronizando menus, modal e página de configurações, inclusive entre abas do navegador.
- **Teclado:** foco visível, atalho para o conteúdo e `useDialogFocus` nos diálogos de captura, configurações, busca, lotes, avisos, mapas, câmeras e demo. O hook contém a tabulação e restaura o elemento anterior quando ele permanece na página.
- **Celular:** campos de 16px, controles consistentes, ações que quebram linha, barra superior compacta e guia de primeiros passos recolhível. Grids de Agentes e Auditoria acomodam telas de 320px. Movimento reduzido apresenta o conteúdo sem esperar animações de entrada.

## Pen.dev

O CLI foi consultado, mas estava sem autenticação. A pedido da usuária, a entrega seguiu somente no projeto, sem Pen.dev e sem alteração do arquivo do Figma.

## Validação desta entrega

- `npm run tokens:check`: 118 pares de contraste (incluindo fundos de feedback), integridade de referências e sincronização JSON/CSS.
- `npm --prefix app run build` e `npm --prefix web run build`: aprovados.
- `npm --prefix app run lint` e `npm --prefix web run lint`: aprovados. A verificação do servidor requer os artefatos compilados dos pacotes locais `agent/sealer`, `agent/x402` e `agent/orchestrator`.
- Navegador: temas claro/escuro; 1440, 1024, 768, 390 e 320px; busca e cópia; inspetor de tokens e radios por teclado; variantes, tamanhos e estados do playground; cópia de JSX; largura estável no carregamento; campos; abas por teclado; vazio/erro/recuperação; download; preferência e aninhamento de tema; movimento reduzido. Sem erros de JavaScript ou requisições falhas na biblioteca.
- App compilado: 112 visitas a 14 rotas nos temas claro/escuro e larguras 1440, 768, 390 e 320px, sem erros JavaScript ou overflow horizontal do documento. Login verificado separadamente em 1440, 390 e 320px.
- Interações: busca, ordenação e modos de lotes; abas e teclado do drawer; busca de comandos e retorno de foco; captura com validação, upload, selo e envio à fila local; tema compartilhado e persistido; feedback de configurações; exportação de auditoria; filtros do marketplace e meus ativos; erro de API com recuperação; guia recolhível.
- Evidências locais: `output/app-design-system/production-audit.json`, `interaction-checks.json` e screenshots por rota/tema/largura (diretório ignorado pelo Git).
- Os testes de fluxos usam a API local de demonstração, pagamento mock e snapshot de chain de fallback. Não validam transações externas nem produção. Permanecem avisos de tamanho dos bundles de mapas no build.

## Evolução 1.1

- **Três níveis de decisão:** primitivos → semânticos → componentes. 73 papéis semânticos por tema e 24 aliases de componente permitem evoluir botões, campos e avisos sem repetir valores.
- **Referência utilizável:** inspetor mostra papel, primitivo e valor resolvido; playground gera JSX com a configuração atual.
- **Estados de produto:** exemplos de carregamento, lista vazia, erro e retorno ao estado com dados usam os mesmos componentes do app.
- **Critérios de adoção:** hierarquia de ações, Gold pontual, estados completos e alteração na fonte de tokens documentados na biblioteca.
- **Compatibilidade:** nomes `--lastro-*` permanecem disponíveis. O app usa diretamente a entrada canônica e os componentes compartilhados; o tamanho compacto de `Button` é 40px.

A biblioteca apresenta os contratos usados no app. Os testes descritos não equivalem a uma auditoria completa de acessibilidade com tecnologias assistivas.
