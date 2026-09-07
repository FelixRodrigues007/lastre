/* Generates the four committed versions of the "capabilities" board that
 * /decks/capacidades embeds — two languages, each drawn light and dark — from
 * the one bilingual source below.
 *
 *   npm run board:capacidades
 *
 * The sheet has two halves. Above, the flow: what Lastre is able to do, from
 * proof of validity to settlement. Below, the workbench: nine large empty
 * blocks, one per unit of the dossier, laid out three by three — the space is
 * reserved before there is anything to put in it, and the drawing happens
 * inside the block rather than on a sheet of its own.
 *
 * Three by three and not one under the other: nine stacked blocks make a strip
 * ten thousand tall that reads as a queue, and a queue hides how much work
 * there is. The grid shows all nine at once, and its proportion stays close to
 * the sheet's.
 *
 * Both halves hang from the same left margin. The grid is wider than the flow,
 * so the board is heavier on the right at the top — the alternative was to
 * centre the flow over the grid, which pushes the workbench's own title off
 * the left of the deck's opening frame and cuts it mid-word.
 *
 * Deliberately NOT part of the build. The boards it writes are committed, and
 * /diagram can edit them by hand; running this on every build would silently
 * throw those edits away. Run it when the wording changes, look at the diff,
 * commit it. */

import { sheet, emit } from "./board-kit.mjs";

/* ---- the sheet, in both languages ----------------------------------------
 * One entry per box: [pt, en]. The layout is shared, so the two files differ
 * only in the strings — which is what makes the diff readable when the wording
 * changes. */
const COPY = {
  title: [
    "① O QUE A LASTRE É CAPAZ DE FAZER?",
    "① WHAT IS LASTRE CAPABLE OF?",
  ],
  prova: ["FAZER A PROVA DE VALIDADE", "PROVE VALIDITY"],
  valido: ["É VÁLIDO?", "IS IT VALID?"],
  semgar: ["SEM GARANTIA ✗", "NO GUARANTEE ✗"],
  token: ["TOKENIZAÇÃO", "TOKENISATION"],
  compra: [
    "PERMISSÃO DE COMPRA DE TOKENS (SENDO INTERMEDIÁRIA) POR INVESTIDORES EXTERNOS",
    "TOKEN PURCHASE BY EXTERNAL INVESTORS, WITH LASTRE AS INTERMEDIARY",
  ],
  supply: [
    "ACOMPANHAMENTO DE TODO O SUPPLY CHAIN DO COMMODITY, DESDE A COMPRA/VENDA DE ATIVOS TOKENIZADOS",
    "TRACKING THE WHOLE SUPPLY CHAIN OF THE COMMODITY, FROM THE PURCHASE/SALE OF TOKENISED ASSETS",
  ],
  entrep: [
    "SERVIR DE ENTREPOSTO DE ANÁLISES E SEGURANÇA — PERMITIR PRÉ-LIQUIDEZ CONSTANTE DE COMPRA/VENDA DE COMMODITY, MINÉRIOS ETC",
    "ACT AS A WAREHOUSE OF ANALYSIS AND SECURITY — ALLOW CONSTANT PRE-LIQUIDITY ON THE PURCHASE/SALE OF COMMODITY, MINERALS ETC",
  ],
  escrow: ["SEGURANÇA ESCROW E PROTOCOLO PCQ", "ESCROW SECURITY AND PCQ PROTOCOL"],
  defi: [
    "POSSIBILITAR DEFI DOS ATIVOS TOKENIZADOS VÁLIDOS",
    "ENABLE DEFI ON VALID TOKENISED ASSETS",
  ],
  staking: [
    "PERMITIR STAKING DOS ATIVOS TOKENIZADOS",
    "ALLOW STAKING OF TOKENISED ASSETS",
  ],
  fim: ["FINALIZAR OPERAÇÃO DE VENDA/COMPRA", "SETTLE THE BUY/SELL OPERATION"],

  shelf: [
    "O DOSSIÊ — UM BLOCO POR UNIDADE, PARA DESENHAR DENTRO",
    "THE DOSSIER — ONE BLOCK PER UNIT, TO DRAW INSIDE",
  ],
  legenda: [
    "CONTÍNUO = JÁ DESENHADO   ·   TRACEJADO = BLOCO VAZIO, ESPERANDO O DIAGRAMA   ·   CINZA = UNIDADE AINDA NÃO ESCRITA NO DOSSIÊ",
    "SOLID = ALREADY DRAWN   ·   DASHED = EMPTY BLOCK, WAITING FOR ITS DIAGRAM   ·   GREY = UNIT NOT YET WRITTEN IN THE DOSSIER",
  ],
  feita: [
    "DESENHADA — VER A FOLHA 02 DO DECK",
    "DRAWN — SEE SHEET 02 OF THE DECK",
  ],
};

/* ---- the shelf ------------------------------------------------------------
 * One entry per unit of the dossier, in the order the dossier reads. `state`
 * is the only thing that changes as the work advances:
 *
 *   "folha"    the unit is drawn and has its own sheet in the deck
 *   "reservada"  written in the dossier, waiting to be drawn
 *   "vazia"    not written in the dossier either — named, and nothing more
 *
 * Drawing a unit is: write its script in web/scripts on the grammar of
 * build-strategy-board.mjs, add the sheet to the deck, and move the state. */
const UNITS = [
  {
    n: "01",
    nome: ["ESTRATÉGIA", "STRATEGY"],
    state: "folha",
    ancoras: [
      ["IDENTIDADE", "IDENTITY"],
      ["IDEIA", "IDEA"],
      ["SNAPSHOT", "SNAPSHOT"],
      ["MODELO DE NEGÓCIO", "BUSINESS MODEL"],
    ],
  },
  {
    n: "02",
    nome: ["PÚBLICO", "AUDIENCE"],
    state: "reservada",
    ancoras: [
      ["PERSONAS", "PERSONAS"],
      ["DISCOVERY", "DISCOVERY"],
      ["DOR → SOLUÇÃO", "PAIN → SOLUTION"],
      ["CONCORRENTES", "ALTERNATIVES"],
    ],
  },
  {
    n: "03",
    nome: ["OFERTA", "OFFER"],
    state: "reservada",
    ancoras: [
      ["OFERTAS", "OFFERS"],
      ["PRECIFICAÇÃO", "PRICING"],
      ["ROADMAP", "ROADMAP"],
    ],
  },
  {
    n: "04",
    nome: ["MARCA", "BRAND"],
    state: "reservada",
    ancoras: [
      ["VOZ DA MARCA", "BRAND VOICE"],
      ["PROVAS", "PROOF"],
      ["REPUTAÇÃO E CRISE", "REPUTATION AND CRISIS"],
    ],
  },
  {
    n: "05",
    nome: ["AQUISIÇÃO", "ACQUISITION"],
    state: "reservada",
    ancoras: [
      ["ESTRATÉGIA", "STRATEGY"],
      ["PARCERIAS", "PARTNERSHIPS"],
      ["EXPERIMENTOS", "EXPERIMENTS"],
    ],
  },
  {
    n: "06",
    nome: ["CONVERSÃO", "CONVERSION"],
    state: "reservada",
    ancoras: [
      ["FUNIL", "FUNNEL"],
      ["OBJEÇÕES", "OBJECTIONS"],
      ["PLAYBOOK", "PLAYBOOK"],
    ],
  },
  {
    n: "07",
    nome: ["CLIENTE", "CUSTOMER"],
    state: "reservada",
    ancoras: [
      ["SAÚDE E RETENÇÃO", "HEALTH AND RETENTION"],
      ["VOZ DO CLIENTE", "CUSTOMER VOICE"],
    ],
  },
  {
    n: "08",
    nome: ["OPERAÇÕES", "OPERATIONS"],
    state: "reservada",
    ancoras: [
      ["CAPACIDADE E FORNECEDORES", "CAPACITY AND SUPPLIERS"],
      ["QUALIDADE E RISCOS", "QUALITY AND RISK"],
    ],
  },
  {
    n: "09",
    nome: ["TECNOLOGIA", "TECHNOLOGY"],
    state: "vazia",
    ancoras: [
      ["ARQUITETURA", "ARCHITECTURE"],
      ["DADOS E ANALYTICS", "DATA AND ANALYTICS"],
      ["SEGURANÇA", "SECURITY"],
    ],
  },
];

/* Everything in the workbench carries the `sh-` id prefix: the deck frames the
 * board on the flow alone (BoardEmbed's `fitExclude`), because a sheet that
 * opened on the whole workbench would show the flow at a fifth of its size.
 *
 * A block is a container, not an outline: a head that names the unit and lists
 * the anchors it has to cover, a rule under the head, and below it an empty
 * body on its own paper — 1400 × 800 of it, which is the size of a real
 * diagram. The unit's number sits large and faint in the corner of the body,
 * so a block can be told apart while panning at any zoom. */
const SHELF_X = 120;
const SHELF_Y = 940;
const GRID_TOP = 1060;
const BLOCK_W = 1400;
const BLOCK_H = 900;
const BLOCK_GAP_X = 150;
const BLOCK_GAP_Y = 150;
const HEAD_H = 96;
const COLS = 3;

const GRID_W = COLS * BLOCK_W + (COLS - 1) * BLOCK_GAP_X;

emit("lastre-capacidades", (i, palette) => {
  const { P, elements, box, arrow, label, rect, poly, glyph } = sheet(palette);
  const c = (k) => COPY[k][i];

  label("title", SHELF_X, 140, c("title"), 28, P.blue);

  const prova = box("prova", 120, 390, 250, c("prova"));
  const valido = box("valido", 460, 390, 200, c("valido"), { accent: P.blue });
  const semGar = box("semgar", 450, 620, 230, c("semgar"), { accent: P.red });
  const token = box("token", 780, 390, 220, c("token"));

  const compra = box("compra", 1080, 70, 340, c("compra"));
  const supply = box("supply", 1080, 360, 340, c("supply"));
  const entrep = box("entrep", 1080, 650, 340, c("entrep"));

  const escrow = box("escrow", 1530, 380, 280, c("escrow"), { accent: P.blue });

  const defi = box("defi", 1920, 120, 300, c("defi"));
  const staking = box("staking", 1920, 380, 300, c("staking"));
  const fim = box("fim", 1920, 630, 300, c("fim"));

  arrow(prova, valido);
  arrow(valido, token);
  arrow(valido, semGar, { from: "bottom", to: "top", accent: P.red });
  arrow(token, compra, { from: "top", to: "left" });
  arrow(token, supply);
  arrow(token, entrep, { from: "bottom", to: "left" });
  arrow(supply, escrow);
  arrow(entrep, escrow, { from: "right", to: "bottom" });
  arrow(escrow, defi, { from: "top", to: "left" });
  arrow(escrow, staking);
  arrow(escrow, fim, { from: "bottom", to: "left" });
  arrow(compra, defi);

  /* ---- the workbench ----------------------------------------------------- */
  label("sh-title", SHELF_X, SHELF_Y, c("shelf"), 28, P.blue);
  label("sh-legenda", SHELF_X, SHELF_Y + 44, c("legenda"), 15, P.dim, GRID_W);

  UNITS.forEach((u, k) => {
    const x = SHELF_X + (k % COLS) * (BLOCK_W + BLOCK_GAP_X);
    const y = GRID_TOP + Math.floor(k / COLS) * (BLOCK_H + BLOCK_GAP_Y);
    const tone = u.state === "vazia" ? P.dim : u.state === "folha" ? P.blue : P.ink;
    const drawn = u.state === "folha";

    /* The container. Its paper is a shade off the sheet, so an empty block
     * still reads as a surface to draw on rather than a hole in the board. */
    rect(x, y, BLOCK_W, BLOCK_H, {
      id: `sh-u${u.n}-bloco`,
      stroke: tone,
      fill: P.paper,
      strokeWidth: drawn ? 2 : 1,
      strokeStyle: drawn ? "solid" : "dashed",
      roundness: { type: 3 },
    });

    /* The head: the unit, the anchors it owes, and the rule that separates the
     * brief from the space the drawing gets. */
    label(`sh-u${u.n}`, x + 32, y + 24, `${u.n} · ${u.nome[i]}`, 24, tone, BLOCK_W - 64);
    label(
      `sh-u${u.n}-brief`,
      x + 32,
      y + 60,
      u.ancoras.map((a) => a[i]).join("   ·   "),
      14,
      P.dim,
      BLOCK_W - 64,
    );
    poly(x, y + HEAD_H, [[0, 0], [BLOCK_W, 0]], {
      id: `sh-u${u.n}-regua`,
      stroke: tone,
      strokeWidth: 1,
    });

    /* The number, large and faint in the corner of the body: at the zoom where
     * the head is unreadable, this is still what tells the blocks apart. */
    glyph(x + BLOCK_W - 110, y + BLOCK_H - 160, u.n, 120, P.ghost, `sh-u${u.n}-num`);

    if (drawn) label(`sh-u${u.n}-feita`, x + 32, y + HEAD_H + 36, c("feita"), 16, P.blue, BLOCK_W - 64);
  });

  return elements;
});
