# Lastre Design System · 1.0

A identidade de produto da Lastre, implementada em React e CSS a partir do [Figma, seção 69:725](https://www.figma.com/design/qs8aJnnERxiPfreitHGkfV/Lastre?node-id=69-725).

## Abrir a biblioteca

```sh
npm ci --prefix app
npm --prefix app run dev:web
```

Acesse **http://localhost:5174/design-system**. A biblioteca é pública, não precisa de login, não inicializa sessão de demonstração e não depende do backend. Inclui temas claro/escuro, busca e cópia das cores, download de tokens, tipografia, geometria, botões, campos, estados, métricas e tabela com abas interativas.

## Fonte de verdade

Edite `tokens/lastre.tokens.json` e execute:

```sh
npm run tokens:build
npm run tokens:check
```

O gerador produz `lastre.css` e `lastre-compat.css`. O segundo comando detecta arquivos desatualizados e verifica 92 combinações de contraste nos dois temas: texto ≥ 4.5:1, foco e contornos de controles ≥ 3:1. Esses testes cobrem os papéis semânticos; não representam uma auditoria de acessibilidade de todas as telas existentes.

| Camada | Arquivo | Responsabilidade |
| --- | --- | --- |
| Fonte | `tokens/lastre.tokens.json` | Primitivos, fundamentos e semânticos dos dois temas |
| CSS | `tokens/lastre.css` | Variáveis `--lastre-*`, geradas automaticamente |
| Compatibilidade | `tokens/lastre-compat.css` | Nomes `--lastro-*` existentes apontam para a nova identidade |
| Entrada compartilhada | `tokens/lastro.css` | Importa definições legadas, nova identidade e compatibilidade |
| Arquivo histórico | `tokens/lastro-legacy.css`, `tokens/lastro.tokens.json` | Paleta anterior e contratos antigos ainda usados no produto |
| Marca | `assets/lastre-wordmark.svg` | SVG original exportado do Figma, sem redesenho |
| Fonte display | `assets/fonts/` | Manrope variável, local, com licença OFL |

O app e a landing já importavam `lastro.css`, por isso recebem a nova base compartilhada. CSS específico de telas com valores literais, gráficos e ilustrações antigos ainda pode conservar escolhas anteriores; sua revisão completa é uma migração separada. Os materiais publicitários históricos permanecem documentados em [ADVERTISING.md](ADVERTISING.md).

## O que veio do Figma

- **Marca:** vetor do nó `69:727`, exportado a partir de `69:726`.
- **Mirage:** 11 tons, de `50 #F0F1F3` a `950 #0F1116`.
- **Blue:** 11 tons, com `500 #107CA4` como cor principal.
- **Gold:** 11 tons, com `200 #FDA82D` como cor secundária.
- **Tipografia de referência:** o quadro usa Science Gothic e Inter. Por orientação da usuária, o produto adota Manrope nos títulos e Inter nos textos/controles. A tipografia do logotipo permanece no SVG original.

Referências: funções de cor em `69:740`; escalas em `69:757`. O quadro usa Mirage 900 como base escura; a implementação usa esse tom nas superfícies e Mirage 950 no canvas para separar níveis.

São **extensões de implementação**, não especificações presentes no Figma: a escolha de Manrope e os gradientes dourados solicitados pela usuária, os papéis semânticos, os tons de sucesso/erro, a escala de espaçamento, os raios, as alturas de controle, o movimento e os estados dos componentes. JetBrains Mono foi mantida do produto para hashes e IDs.

## Cores por intenção

| Uso | Token | Escuro | Claro |
| --- | --- | --- | --- |
| Canvas | `--lastre-bg-canvas` | Mirage 950 | Mirage 50 |
| Superfície | `--lastre-bg-surface` | Mirage 900 | Branco |
| Texto principal | `--lastre-text-primary` | Mirage 50 | Mirage 900 |
| Texto secundário | `--lastre-text-secondary` | Mirage 200 | Mirage 600 |
| Texto auxiliar | `--lastre-text-muted` | Mirage 300 | Mirage 500 |
| Ação principal | `--lastre-action-primary` | Blue 500 | Blue 500 |
| Texto de ação | `--lastre-action-text` | Branco | Branco |
| Links/foco | `--lastre-link`, `--lastre-focus` | Blue 200 | Blue 600 |
| Destaque | `--lastre-accent` | Gold 200 | Gold 200 |
| Texto sobre destaque | `--lastre-accent-text` | Mirage 950 | Mirage 950 |
| Aviso | `--lastre-warning` | Gold 200 | Gold 700 |

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

- **Manrope, 500/600:** títulos do app e do site; display 48–64px, heading 32px, seção 24px. Tracking de −0.025 a −0.04em. O logotipo é um vetor independente, não texto na fonte da interface.
- **Inter, 400/500/600:** interface 14–16px, linha 1.5. Carregada pelo HTML existente do app/site, com fallback de sistema.
- **JetBrains Mono:** hashes, IDs e anotações, 12–14px; números tabulares quando útil. Carregada pelo HTML existente.
- **Espaçamento:** múltiplos de 4px; `space-1` = 4px, `space-6` = 24px, `space-16` = 64px.
- **Raios:** `sm` 6px, `md` 10px, `lg` 16px, `pill` 999px.
- **Controles:** 36px compacto, 44px padrão, 52px amplo. Preferir 44px ou mais para interação por toque.
- **Movimento:** 120/180ms, sem animações essenciais à compreensão. Respeitar `prefers-reduced-motion`.

## Gradiente Gold

O dourado simula reflexos de metal como acento pontual. `--lastre-gradient-gold` usa Gold 600 → 200 → 50 → 300 → 500; `--lastre-glow-gold` fornece um brilho suave. Use em filetes, selos e superfícies de destaque.

Para texto, use `--lastre-gradient-accent-text` ou `.lastre-gold-text`: o tema claro usa tons mais profundos e o escuro usa tons luminosos. Os stops são verificados contra as três superfícies do sistema. Não colocar texto pequeno diretamente sobre o gradiente decorativo; use uma base sólida para rótulos.

Aplicações: destaque no título da biblioteca, palavra de destaque do hero do site, filete do painel de prova e dos cartões com `accent`. Ações e links permanecem azuis. Sem animação contínua de brilho.

## Componentes React

Componentes em `app/src/components/ui/`. CSS convencional; nenhuma nova biblioteca de interface foi instalada.

```tsx
import { Button } from "./components/ui/Button";
import { TextField } from "./components/ui/TextField";
import { StatusBadge } from "./components/ui/StatusBadge";

<Button variant="primary" loading={isVerifying} onClick={verify}>
  {isVerifying ? "Verificando…" : "Verificar origem"}
</Button>
<TextField label="Nome do ativo" hint="Use um nome fácil de identificar."
  error={error} required value={name} onChange={e => setName(e.target.value)} />
<StatusBadge label="Verificado" tone="success" circle="filled" />
```

| Componente | API principal | Comportamento |
| --- | --- | --- |
| `Button` | `variant`, `size`, `loading`, atributos nativos | Primário/secundário/ghost/danger; loading impede clique e expõe `aria-busy`; tipo padrão `button` |
| `TextField` | `label`, `hint`, `error`, atributos nativos | ID automático, label associado, ajuda/erro descritos, `aria-invalid` |
| `LastreWordmark` | `className` | Vetor original em máscara CSS; herda a cor; nome acessível Lastre |
| `StatusBadge` | `label`, `tone`, `circle`, `size` | Componente existente; significado por texto e indicador, além da cor |
| `MetricCard` | `label`, `value`, `hint`, `tone` | Componente existente; contexto dos indicadores |
| `SearchInput` | `value`, `onChange`, `ariaLabel` | Componente existente; busca controlada |
| `Tabs` | `tabs`, `active`, `onChange`, `children` | Componente existente; setas/Home/End, tabulação única, painel associado |

Não usar status visual como substituto de autorização ou validação de dados. Os exemplos da biblioteca são fictícios, locais e não chamam APIs.

## Pen.dev

O CLI foi consultado, mas estava sem autenticação. A pedido da usuária, a entrega seguiu somente no projeto, sem Pen.dev e sem alteração do arquivo do Figma.

## Validação desta entrega

- `npm run tokens:check`: 92 pares de contraste e sincronização JSON/CSS.
- `npm --prefix app run build` e `npm --prefix web run build`: aprovados.
- `npm --prefix web run lint`: aprovado.
- Navegador: temas claro/escuro; 1440, 390 e 320px; cópia de cores; busca; download; campos; estado de carregamento; abas por teclado; preferência de tema; movimento reduzido. Sem erros de JavaScript ou requisições falhas na biblioteca.
- `npm --prefix app run lint`: frontend aprovado; etapa do servidor bloqueada por artefatos ausentes em `agent/orchestrator/dist`, `agent/sealer/dist` e `agent/x402/dist` no checkout local. O backend não faz parte desta alteração.
