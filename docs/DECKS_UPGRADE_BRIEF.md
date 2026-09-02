# Brief de execução — `/decks`: uma gramática visual, vinte e três telas

Repositório `~/Projects/lastre`, rota `/decks` (`web/src/decks/`). A rota existe,
está bilíngue, tem sistema próprio e está commitada até `253b12c`.
**Não reconstrua nada.** Resolva um problema específico.

---

## A ideia central — leia isto duas vezes antes de escrever qualquer linha

A referência que originou este brief é o mapa de talentos da Braintrust. E o que
faz aquela página funcionar **não é o mapa**. É o marcador.

Um círculo fino com um anel de progresso, um número dentro, uma haste vertical
descendo até o ponto exato, e um rótulo ao lado — pousado sobre uma silhueta
pálida quase sem contraste. O olho lê o número, desce pela haste, encontra o
lugar. Três informações em um gesto.

**A entrega desta rodada: essa anatomia vira a gramática do deck inteiro.**

Um marcador. Doze substratos.

O marcador nunca muda — mesmo raio, mesma espessura de anel, mesma haste, mesma
tipografia. O que muda é **o que está embaixo dele**: um mapa-múndi, o mapa do
Brasil, um prédio de quatro andares, uma linha do tempo, um funil, uma grade de
dez células, um quadrante 2×2, uma régua de proporção.

É isso que separa uma página desenhada de uma página montada. Doze desenhos
diferentes viram doze desenhos. Um marcador sobre doze substratos vira um
sistema — e um sistema é o que faz a sala confiar antes de entender.

Enquanto isso não estiver claro na sua cabeça, não comece.

---

## 1. O problema, medido

**13 das 23 telas são tipo + texto sobre folha vazia.** Onde há vazio, ele é
sobra, não decisão. O olho lê a manchete, cai na base, e não tem para onde ir no
meio. Numa tela de sala, vista de longe e por poucos segundos, isso vira slide de
consultoria.

Toda tela passa a ter um objeto, ou um vazio que alguém escolheu. Nada no meio.

## 2. O que já existe — não recriar

```
web/src/decks/
  DecksApp.tsx     router de path + idioma (chave lastre-deck-locale, PT padrão)
  DeckChrome.tsx   cabeçalho: SealMark + toggle PT/EN.  NÃO TOCAR.
  Deck.tsx         viewer: teclado, direção, auto-fit por ResizeObserver, TOC em G
  DecksIndex.tsx   gaveta de pastas
  Motion.tsx       Figure (count-up) + SealCard (selo vivo)
  Ring.tsx         ⚠ diagrama radial de 6 setores — CONSTRUÍDO E NUNCA LIGADO
  decks.css        o sistema, namespace .dk-
  types.ts         Deck/Slide/L10n + helper tx(locale)
  content/geral.tsx (12 telas) · content/publicos.tsx (11 telas)
  content/publicos-data.ts  ⚠ dados dos setores — também ocioso
```

Layout pronto: `.dk-top`/`.dk-bottom` · `.dk-row--2/3/4/wide/media/top` ·
`.dk-floor--0..3` · `.dk-steps` · `.dk-kv` · `.dk-calc` · `.dk-cards` ·
`.dk-metric` · `.dk-panel` · `.dk-label` (rótulo ❖ com filete) · `.dk-tag` ·
`.dk-quote` · `.dk-portraits` · `.dk-shot--phone/laptop` · `.dk-seal` ·
`.dk-half-l/r` · `.dk-src`

Peles: `light` `#f7f9f7` · `dark` `#16281f` · `mint` `#d7e7e0` · `wave` (dither em
duas camadas). O ink set inverte inteiro via `--dk-fg*`.

Movimento pronto: `dk-rise` (entrada escalonada, vinda do lado para onde o deck
anda) · `dk-curtain` (manchete) · `dk-media` + `dk-float` · `dk-tide`.

---

## 3. O marcador — especificação única, obedecer ao pixel

```
        ╭───────╮
        │  53%  │  ← anel: r=26, stroke 1.5, arco = pct do perímetro,
        ╰───────╯     início às 12h, sentido horário
            │      ← haste: 1px, currentColor a 55%, do fundo do círculo
            │        até o ponto exato do substrato
            ●      ← âncora: r=2.5, preenchida
```

- Círculo: `r=26`, `stroke-width` 1.5, `fill` = cor da folha (o marcador **tapa**
  o substrato, não flutua translúcido sobre ele).
- Número dentro: mono, 13px, `letter-spacing 0`, centralizado por
  `dominant-baseline="central"`.
- Anel de progresso: segundo `<circle>` com `stroke-dasharray`, `transform:
  rotate(-90deg)` a partir do centro. Sem percentual → anel completo a 20% de
  opacidade.
- Haste: sempre **vertical**. Nunca diagonal, nunca curva, nunca cotovelo.
  Comprimento variável, é ela que resolve a colisão entre rótulos.
- Rótulo: à direita do círculo, `dk-h3` para o nome e `dk-p--fine` para a linha
  de apoio. Alinhado ao topo do círculo, nunca centralizado nele.
- Estado ausente/negativo: número `0`, anel vazio, tudo em `--dk-coral`.
  **O zero é o marcador mais importante do deck.**

Um componente: `figures/Marker.tsx`. Props: `x`, `y` (âncora no substrato),
`stemTop` (y do centro do círculo), `value?`, `pct?`, `label`, `sub?`, `tone?:
"default" | "negative"`. Todos os outros objetos o consomem — nenhum redesenha
círculo, anel ou haste.

---

## 4. Os dois mapas

### 4.1 Mapa-múndi — "A rede de custódia tem 32 endereços"

Deck `Mapa de públicos`, tela nova, entre `canal` e `precedente`. Pele `light`.

Silhueta pálida (`fill` `#e4ece8` no claro, `rgba(255,255,255,.05)` no escuro),
contorno `0.9px` a 45% de opacidade, e um halo: a mesma path repetida atrás com
`stroke-width: 16`, `opacity .35`, `stroke-linejoin: round`. Sem grade, sem
meridianos, sem oceano.

Marcadores — **só o que está na pesquisa, zero número inventado**:

| ponto | lon, lat | marcador | rótulo |
|---|---|---|---|
| Europa/Londres | -0.13, 51.5 | anel cheio | LBMA · 100% dos refinadores Good Delivery integrados |
| Ásia | 103.8, 1.35 | anel cheio | rede LME |
| América do Norte | -83.0, 42.3 | anel cheio | rede LME |
| **América do Sul** | -58.0, -15.0 | **`0`, coral, anel vazio** | **instalações da rede LME** |
| África dos Grandes Lagos | 29.0, -2.0 | anel cheio | BGR · AFP desde 2006 · 3T, não cobre ouro |

Nota de rodapé na tela: `+450 instalações · 32 locais · nenhum na América do Sul
— rede LME`. Fonte na `.dk-src`.

O argumento inteiro da custódia — o elo que não existe e trava os três andares
seguintes — cabe num zero coral no meio do Atlântico Sul. Esta é a melhor tela
possível dos dois decks. Trate-a como tal.

### 4.2 Mapa do Brasil — "Onde o ouro está"

Tela nova, logo depois. Pele `light` ou `mint`.

Mesmo tratamento de silhueta. **Pará preenchido** um tom acima do resto
(`#cfe0d8`), com o marcador principal ancorado no centro do estado:
`≈65%` · "do ouro garimpável do país · hoje nenhuma DTVM legal".

Pontos de referência — todos reais, todos já citados na pesquisa deste projeto.
**Não é um cadastro de minas, e a tela precisa dizer isso.**

| ponto | lon, lat | rótulo |
|---|---|---|
| Belém / PA | -48.50, -1.46 | Selo Amarelo · refinaria North Star |
| Itaituba / PA | -55.98, -4.28 | Serabi Gold · primeira certificada |
| Poconé / MT | -56.62, -16.26 | Minery · piloto Certimine |
| Nova Lima / MG | -43.85, -19.99 | AngloGold · LBMA renovada jul/2024 |
| São Paulo / SP | -46.63, -23.55 | C. Steinweg · Prosegur Digital Gold |

Aqui as hastes são **curtas** e os rótulos alternam esquerda/direita — o Brasil é
vertical e estreito, o padrão do mapa-múndi não serve. Marcadores sem número:
âncora + haste + rótulo, sem círculo, exceto o do Pará.

Legenda obrigatória, `.dk-src`:
`Pontos de referência citados nesta pesquisa. Não é um cadastro de minas.`

### 4.3 Geometria — receita validada, quatro armadilhas

O pipeline abaixo **já foi testado e produz o resultado correto**. Siga-o. Cada
armadilha custou uma iteração; estão todas aqui para você não pagar de novo.

Fontes (baixe com `curl`, funcionam pelo proxy):
```
https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json   (mundo)
https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json    (Brasil)
https://cdn.jsdelivr.net/gh/codeforamerica/click_that_hood@master/public/data/brazil-states.geojson   (Pará)
```

Decodifique o TopoJSON à mão (aplique `transform.scale`/`translate`, os arcos são
delta-encoded, índice negativo = arco invertido). Use o objeto **`land`** para o
mundo — `countries` dobra o tamanho para dar fronteiras internas que a silhueta
não usa. Para o Brasil, `countries` com `id === "076"`.

Projeção: **Miller** no mundo (`y = -1.25·ln(tan(π/4 + 0.4·φ))`), equirretangular
com `x` multiplicado por `cos(-14°)` no Brasil. Largura de referência: 1600 e 900.

**Armadilha 1 — o `rstrip` que come inteiros.** Arredondando para 0 casas,
`f"{100:.0f}".rstrip("0")` vira `"1"` e o mapa sai como um emaranhado de riscos.
Só faça `rstrip` quando houver ponto decimal na string.

**Armadilha 2 — a Antártida vira uma faixa.** Ela cruza o mapa inteiro e, ao ser
clampada em latitude, gera retângulos horizontais atravessando tudo. Descarte
qualquer anel cujo `max(lat) < -56` **antes** de projetar.

**Armadilha 3 — o antimeridiano.** A Eurásia é um anel único que passa de +180
para -180 em Chukotka. Cortar o anel e fechar cada pedaço destrói a forma (some a
Índia, aparece um triângulo gigante). A solução certa é **desenrolar** a
longitude: percorra o anel somando ±360 para que dois pontos consecutivos nunca
difiram mais que 180°. O pedaço que passa de 180° sai do viewBox e o SVG corta —
que é exatamente o comportamento desejado.

**Armadilha 4 — o domínio de x.** Depois de desenrolar, calcule os limites de `x`
a partir de **-180°/+180° fixos**, não dos dados; senão o mapa é espremido pelo
excesso da Chukotka. Os limites de `y` continuam vindo dos dados.

Filtros de simplificação que deram o melhor equilíbrio: descartar anéis com área
projetada `< 22` (mundo) e `< 6` (Brasil); descartar pontos consecutivos a menos
de `1.6px` um do outro; arredondar ao inteiro.

Resultado esperado, para você conferir que acertou:

| | viewBox | path |
|---|---|---|
| mundo | 1600 × 782 | ~33,5 kB |
| Brasil | 900 × 923 | ~12,3 kB |
| Pará | mesmo transform do Brasil | ~3,7 kB |

Saída em `figures/geo-data.ts`, marcada `NÃO EDITAR À MÃO — REGERAR`, exportando
`WORLD`, `BRAZIL`, `worldXY(lon,lat)` e `brazilXY(lon,lat)` — as funções de
projeção precisam usar exatamente as mesmas constantes do gerador, ou os
marcadores caem no lugar errado. Guarde o script gerador em `scripts/`.

**Orçamento de bundle:** ~50 kB de path cru é ~15 kB gz. O teto do deck sobe de
30 kB para **45 kB gz** por causa dos mapas, e só por isso. Se passar disso,
importe `geo-data.ts` dinamicamente dentro dos componentes de mapa.

---

## 5. Os outros dez substratos

Mesmo marcador. Muda o que está embaixo. Todos em SVG inline,
`stroke="currentColor"`, herdando `--dk-fg*` para funcionar nas quatro peles,
com `role="img"` e `<title>` bilíngue.

| Componente | Substrato | Onde |
|---|---|---|
| `Chain` | elos em série; um pode faltar (vazado, coral) | geral/`onde-vive`, publicos/`fecho` |
| `Stack` | prédio de 4 lajes; a de baixo deslocada e tracejada | geral/`como-funciona`, publicos/`andares` |
| `Ratio` | barra enorme contra um fio, com o percentual | geral/`caso` |
| `Bars` | trilho do total com três marcas de recuperação | geral/`faixa` |
| `Scale` | régua de preço com marcadores posicionados por valor | geral/`acrescenta` |
| `Converge` | dois fluxos entrando num ponto | geral/`quem-paga` |
| `Timeline` | eixo com marcos datados e uma janela hachurada | publicos/`relogio`, `precedente` |
| `Funnel` | portas afunilando, uma apagada | publicos/`canal` |
| `Dots` | grade de N, M acesas | publicos/`threat` |
| `Quadrant` | eixo 2×2 com o quadrante vazio marcado | publicos/`concorrencia` |
| `Ring` | **já existe** — setores acendendo por `lit` | publicos/`capa`, `esquecidos` |
| `Watermark` | SealMark gigante cortado pela borda, 4% | telas de frase |

Nenhum dado hard-coded dentro da figura. Os números moram no arquivo de conteúdo,
junto do texto que os cita.

---

## 6. A doutrina do vazio

**Estratégico quando:** o vazio *é* o assunto (tela de frase); ou emoldura **um**
objeto grande e único; ou é a respiração entre manchete e base, e o conjunto
ainda lê como composição — topo pesado, base pesada, meio limpo.

**Falha quando:** existe um quadrante da folha (≥25%) sem tinta e sem objeto; a
banda de baixo ocupa menos de 30% da largura útil; o olho termina a manchete e
não tem segunda parada; a tela é de dado e o dado está só em texto.

**Teste operacional, para rodar de verdade:** screenshot de cada tela, dividido em
quatro quadrantes, medindo a fração de pixels que difere do fundo da folha em mais
de 6%. Quadrante abaixo de **4%** exige justificativa escrita no relatório final.
Máximo de **4 telas justificadas** nos dois decks somados.

---

## 7. Tela por tela

### Deck 01 · `A Lastre em cinco tempos`

| # | id | pele | o que fazer |
|---|---|---|---|
| 00 | `capa` | wave | Tem o `SealCard`. Acrescentar a **régua dos cinco tempos** no rodapé direito: cinco traços com os nomes dos movimentos, o primeiro aceso. Vira sumário e volta no fecho. |
| 01 | `problema` | light | `Chain` no miolo: leitura → declaração → token, **elo do meio vazado**. Os três números descem para a base. |
| 02 | `o-que-e` | dark | Trocar os painéis Valid/Invalid por **dois `SealCard` em estados opostos**, com um caractere do hash divergindo em coral. |
| 03 | `produto` | dark | Não mexer. Tela mais resolvida do deck. |
| 04 | `frase` | mint | **Vazio deliberado.** Só o risco em "declarou" como path SVG animado e o `Watermark` a 4%. |
| 05 | `como-funciona` | light | `Stack` à esquerda, textos alinhados por laje. Andar 3 deslocado e tracejado. |
| 06 | `caso` | light | `Ratio` na base, largura inteira: 2.500.000 t contra o fio de 7,5 t. **"0,0003% da massa"** em mono. |
| 07 | `faixa` | dark | `Bars` acima dos painéis; os painéis viram legenda. |
| 08 | `acrescenta` | light | `Scale` na base: Fairtrade 2.000, Fairmined 4.000, teto do Estado convertido. |
| 09 | `quem-paga` | dark | `Converge` no miolo, com saída lateral fina para "quem paga antes de 2027". |
| 10 | `onde-vive` | light | `Chain` **vertical** à direita, elo 04 em coral, etiqueta `irrecuperável`. |
| 11 | `fecho` | wave | A régua dos cinco tempos, inteira acesa. Espelha a capa. |

### Deck 02 · `Mapa de públicos`

O `Ring` é o fio condutor: apagado na capa, **acendendo setor a setor** conforme o
deck anda. Passe `lit` por tela.

| # | id | pele | o que fazer |
|---|---|---|---|
| 00 | `capa` | wave | `Ring` grande à direita, todos os setores apagados. Hoje é a capa mais fraca dos dois decks. |
| 01 | `andares` | light | Mesmo `Stack` do deck 01, públicos ao lado de cada laje. Coerência entre decks é argumento. |
| 02 | `esquecidos` | mint | `Ring` com os seis setores acesos, cada rótulo ligado ao seu bloco por filete. A tela para a qual o `Ring` foi feito. |
| 03 | `relogio` | dark | `Timeline` na base: hoje → 18.02.2027 → 18.08.2027 → 26.07.2029, janela de 17 meses hachurada. |
| 04 | `canal` | light | `Funnel` de cinco portas; a do Pará apagada e vazada. **Hoje é só uma `kv`: a tela mais vazia dos dois decks.** |
| — | **`custodia`** | light | **NOVA — o mapa-múndi da §4.1.** |
| — | **`brasil`** | light/mint | **NOVA — o mapa do Brasil da §4.2.** |
| 05 | `precedente` | dark | `Timeline` curta: jan/2023 → set/2023 → set/2024, último ponto em coral. |
| 06 | `adversario` | mint | **Vazio deliberado.** Só o `Watermark`, selo invertido e cortado, como carimbo negado. |
| 07 | `threat` | dark | `Dots`: dez células, uma acesa. |
| 08 | `concorrencia` | light | `Quadrant`: prova-de-dado ↔ prova-física por laboratorial ↔ tempo-real. O quadrante da Lastre marcado como **vazio**, não ocupado. |
| 09 | `mesa` | light | Não mexer. |
| 10 | `fecho` | wave | `Chain` horizontal: leitura → selo → **depósito (elo faltando)** → redenção → arbitrador → pool. |

---

## 8. Movimento — o que acrescentar, e o teto

Não invente tipos novos de movimento. Acrescente só três:

1. **Traço que desenha.** Toda figura entra desenhando o contorno
   (`stroke-dashoffset` 100%→0), 700 ms, delay 240 ms, uma vez.
2. **Marcador que pousa.** Haste desce primeiro (250 ms), círculo entra em escala
   (`0.8→1`, 320 ms), anel varre por último. 80 ms entre marcadores, na ordem de
   leitura — no mapa-múndi, oeste para leste.
3. **Estado que acende.** Onde há elementos acesos (Ring, Dots, Bars, Timeline),
   acendem em sequência depois do traço, 60 ms entre cada.

O `Ring` do deck 02 **não** pode reanimar do zero a cada tela — só transicionar os
setores que mudaram. Resolva com transição CSS nos setores, não com remount.

Teto: **1,2 s** entre a troca de tela e o estado final. Acima disso a sala percebe
a espera.

---

## 9. Invariantes — quebrar qualquer uma reprova a entrega

1. **Bilíngue de verdade.** Toda string em `pt` e `en`, via `tx(locale)`. Nenhum
   texto solto, nenhum "TODO: traduzir". Rótulo de mapa é string.
2. **Auto-fit intacto.** Escala ≥ 0,90 em 1600×1000 e ≥ 0,82 em 1280×800.
   Nada de altura fixa em `px`.
3. **`noindex`** continua injetado.
4. **Sem linguagem de oferta.** Nada de rendimento, retorno, valorização.
5. **Tag `requer parecer`** continua na tela de jurisdição.
6. **Fonte e data** ao lado de todo número de terceiro. Vale para marcador de mapa.
7. **Impressão gera PDF.** Todo objeto novo precisa de estado impresso legível.
8. **Zero dependência nova.** Sem D3, sem topojson-client, sem biblioteca de
   gráfico. O gerador é script offline; o runtime recebe só string de path.

## 10. Ordem de execução

Construa e rode o build **depois de cada bloco**, não no fim.

1. `figures/Marker.tsx` sozinho, com uma tela de teste. Ele é a fundação — se a
   anatomia sair errada, os doze objetos saem errados.
2. Pipeline de geometria + `figures/geo-data.ts` + os dois mapas. É o bloco de
   maior risco técnico; faça enquanto o dia está inteiro.
3. Ligue o `Ring` que já existe: publicos/`capa` e `esquecidos`. Se
   `publicos-data.ts` não bater com os seis públicos do texto, **corrija o dado,
   não o texto**.
4. `Chain`, `Stack`, `Dots` — os três mais simples, para firmar a convenção.
5. As telas mais vazias: publicos/`canal`, publicos/`threat`, geral/`caso`,
   geral/`problema`.
6. O resto da tabela.
7. `Watermark` e a régua dos cinco tempos — acabamento, por último.

## 11. Verificação — obrigatória

- `npx tsc --noEmit` limpo e `npx vite build` sem erro a cada bloco.
- Percorra as 23+2 telas em **1600×1000 e 1280×800**, em **PT e EN**, registrando
  `scrollHeight - clientHeight` e a escala aplicada.
- Rode o **teste de quadrantes** da §6 e relate a cobertura por tela.
- `Cmd+P` dos dois decks: nenhuma figura cortada, invisível ou preta.
- **Abra pelo menos oito screenshots e olhe.** Métrica não vê feiura, e mapa
  errado passa em todo teste automático — confira que Londres cai na Inglaterra e
  que Belém cai na foz do Amazonas.

## 12. Critérios de aceite

- [ ] Marcador único, um componente, consumido por todos os objetos.
- [ ] Os dois mapas no ar, com marcadores no lugar geográfico certo.
- [ ] Todas as telas com objeto — no máximo 4 vazios justificados por escrito.
- [ ] Nenhum quadrante abaixo de 4% sem justificativa.
- [ ] Auto-fit ≥ 0,90 em 1600×1000; nenhuma tela rolando.
- [ ] PT e EN completos.
- [ ] `Ring` e `publicos-data.ts` em uso.
- [ ] Bundle ≤ 45 kB gz. Zero dependência nova.
- [ ] Impressão gera PDF legível.
- [ ] Um commit por bloco, mensagem em português, dizendo o que mudou e por quê.

## 13. O que não fazer

- Não redesenhe o sistema. Folha, tipografia, rodapé, cabeçalho e navegação estão
  decididos.
- Não use gradiente, sombra colorida, glassmorphism, ícone genérico de biblioteca,
  emoji, foto de banco de imagem, gráfico 3D, nem mapa com grade de meridianos.
- Não desenhe haste diagonal, curva ou com cotovelo. A haste é vertical. Sempre.
- **Não invente número.** Se uma figura precisa de um dado que não existe no
  conteúdo, **pare e pergunte**. Não estime, não arredonde para ficar bonito, não
  invente coordenada de mina. Os pontos do mapa do Brasil são os cinco da §4.2 —
  se quiserem mais, peça a lista.
- Não encha as duas telas de frase. Elas existem para respirar.
- Não toque em `DeckChrome.tsx`, no cabeçalho, no toggle de idioma nem no
  `noindex`.

---

## Aviso de concorrência — verifique antes da primeira linha

Esta árvore recebeu, no mesmo dia, trabalho de **duas sessões em paralelo**. Daí o
`Ring.tsx` e o `publicos-data.ts` construídos e nunca ligados, o diretório
`web/.deck-verify/`, e os PNGs soltos em `web/` (`relogio-slide.png`,
`tese-slide.png`, `risco-slide.png`) que não são referenciados por nada.

Antes de começar: confirme que **nenhuma outra sessão está editando
`web/src/decks/`** e rode `git status`. Se algo em `content/publicos.tsx` ou
`DecksIndex.tsx` parecer inacabado, **pergunte antes de reescrever** — pode ser
trabalho de outra frente no meio do caminho.
