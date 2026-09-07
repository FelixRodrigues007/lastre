/* Generates the four committed versions of the "capabilities" board that
 * /decks/capacidades embeds — two languages, each drawn light and dark — from
 * the one bilingual source below.
 *
 *   npm run board:capacidades
 *
 * The sheet has two halves. Above, the flow: what Lastre is able to do, from
 * proof of validity to settlement. Below, the workbench: one large empty block
 * per unit of the dossier, stacked, each the size of a diagram — the space is
 * reserved before there is anything to put in it, and the drawing happens
 * inside the block rather than on a sheet of its own.
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

/* Everything below carries the `sh-` id prefix: the deck frames the board on
 * the flow alone (BoardEmbed's `fitExclude`), because a sheet that opened on
 * nine empty blocks would show the flow at eight per cent.
 *
 * One block per unit, stacked — never side by side. A block is as wide as the
 * flow above and tall enough to hold a real diagram, because that is what it
 * is for: the drawing of the unit happens inside it. The board therefore grows
 * downwards as a workbench rather than sideways as a table. */
const SHELF_X = 120;
const SHELF_Y = 900;
const BLOCK_W = 2100;
const BLOCK_H = 760;
const UNIT_TOP = 990;   // first block's label
const UNIT_STEP = BLOCK_H + 190;

emit("lastre-capacidades", (i, palette) => {
  const { P, elements, box, arrow, label, rect } = sheet(palette);
  const c = (k) => COPY[k][i];

  label("title", 120, 140, c("title"), 28, P.blue);

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
  label("sh-title", SHELF_X, SHELF_Y, c("shelf"), 26, P.blue);
  label("sh-legenda", SHELF_X, SHELF_Y + 40, c("legenda"), 15, P.dim, BLOCK_W);

  UNITS.forEach((u, k) => {
    const y = UNIT_TOP + k * UNIT_STEP;
    const tone = u.state === "vazia" ? P.dim : u.state === "folha" ? P.blue : P.ink;
    const ancoras = u.ancoras.map((a) => a[i]).join("   ·   ");

    label(`sh-u${u.n}`, SHELF_X, y, `${u.n} · ${u.nome[i]}`, 26, tone, BLOCK_W);

    /* The anchors are the brief for the block, so they sit inside it, at the
     * top left — where whoever draws reads them before drawing. */
    rect(SHELF_X, y + 48, BLOCK_W, BLOCK_H, {
      id: `sh-u${u.n}-bloco`,
      stroke: tone,
      strokeWidth: u.state === "folha" ? 2 : 1,
      strokeStyle: u.state === "folha" ? "solid" : "dashed",
      roundness: { type: 3 },
    });
    label(`sh-u${u.n}-brief`, SHELF_X + 34, y + 84, ancoras, 16, P.dim, BLOCK_W - 68);
    if (u.state === "folha")
      label(`sh-u${u.n}-feita`, SHELF_X + 34, y + 116, c("feita"), 16, P.blue, BLOCK_W - 68);
  });

  return elements;
});
