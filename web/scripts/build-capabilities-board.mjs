/* Generates the two language versions of the "capabilities" board that
 * /decks/capacidades embeds, from the one bilingual source below.
 *
 *   npm run board:capacidades
 *
 * Deliberately NOT part of the build. The boards it writes are committed, and
 * /diagram can edit them by hand; running this on every build would silently
 * throw those edits away. Run it when the wording changes, look at the diff,
 * commit it. */

import fs from "node:fs";

let seedCounter = 1;
const rnd = () => (seedCounter = (seedCounter * 1103515245 + 12345) % 2147483648);

const FONT = 20;              // Excalidraw "hand-drawn" (Virgil)
const LH = 1.25;
const CHAR = FONT * 0.62;     // Virgil advance, measured against the rendered canvas
const PAD = 16;

const base = (over) => ({
  angle: 0,
  strokeColor: "#1e1e1e",
  backgroundColor: "transparent",
  fillStyle: "solid",
  strokeWidth: 2,
  strokeStyle: "solid",
  roughness: 1,
  opacity: 100,
  groupIds: [],
  frameId: null,
  roundness: null,
  seed: rnd(),
  version: 1,
  versionNonce: rnd(),
  isDeleted: false,
  boundElements: null,
  updated: 1,
  link: null,
  locked: false,
  ...over,
});

const wrap = (text, maxPx) => {
  const max = Math.max(6, Math.floor(maxPx / CHAR));
  const out = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const next = line ? line + " " + word : word;
      if (next.length > max && line) { out.push(line); line = word; }
      else line = next;
    }
    out.push(line);
  }
  return out;
};

let elements = [];

/** A labelled box: rectangle + bound text, height derived from the wrapped label. */
const box = (id, x, y, w, label, opts = {}) => {
  const lines = wrap(label, w - PAD * 2);
  const textH = Math.round(lines.length * FONT * LH);
  const h = opts.height ?? Math.max(72, textH + PAD * 2);
  const textId = id + "-t";

  elements.push(base({
    id, type: "rectangle", x, y, width: w, height: h,
    backgroundColor: opts.fill ?? "transparent",
    fillStyle: "solid",
    strokeColor: opts.stroke ?? "#1e1e1e",
    strokeWidth: opts.strokeWidth ?? 2,
    roundness: { type: 3 },
    boundElements: [{ type: "text", id: textId }],
  }));

  elements.push(base({
    id: textId, type: "text",
    x: x + PAD, y: y + Math.round((h - textH) / 2),
    width: w - PAD * 2, height: textH,
    strokeColor: opts.stroke ?? "#1e1e1e",
    text: lines.join("\n"),
    originalText: label,
    fontSize: FONT, fontFamily: 1,
    textAlign: "center", verticalAlign: "middle",
    containerId: id, lineHeight: LH, autoResize: true,
    boundElements: null,
  }));

  return { id, x, y, w, h, cx: x + w / 2, cy: y + h / 2, right: x + w, bottom: y + h };
};

/** Arrow bound to both ends so the boxes stay draggable without breaking the flow. */
const arrow = (a, b, opts = {}) => {
  const id = `arw-${elements.length}`;
  const from = opts.from ?? "right";
  const to = opts.to ?? "left";
  const p = (nodeSide, n) => ({
    right: [n.right, n.cy], left: [n.x, n.cy],
    bottom: [n.cx, n.bottom], top: [n.cx, n.y],
  })[nodeSide];
  const [x1, y1] = p(from, a);
  const [x2, y2] = p(to, b);

  elements.push(base({
    id, type: "arrow",
    x: x1, y: y1, width: Math.abs(x2 - x1), height: Math.abs(y2 - y1),
    points: [[0, 0], [x2 - x1, y2 - y1]],
    lastCommittedPoint: null,
    startBinding: { elementId: a.id, focus: 0, gap: 6 },
    endBinding: { elementId: b.id, focus: 0, gap: 6 },
    startArrowhead: null, endArrowhead: "arrow",
    elbowed: false,
    roundness: { type: 2 },
    strokeColor: opts.stroke ?? "#1e1e1e",
  }));

  for (const node of [a, b]) {
    const rect = elements.find((e) => e.id === node.id);
    rect.boundElements = [...(rect.boundElements ?? []), { type: "arrow", id }];
  }
};

const label = (id, x, y, text, size = 18, color = "#1e1e1e", maxPx = 1200) => {
  // Free text measures with its own size — the box helper's CHAR is tied to FONT.
  const per = size * 0.62;
  const max = Math.max(6, Math.floor(maxPx / per));
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? line + " " + word : word;
    if (next.length > max && line) { lines.push(line); line = word; } else line = next;
  }
  lines.push(line);
  elements.push(base({
    id, type: "text", x, y,
    width: Math.ceil(Math.max(...lines.map((l) => l.length)) * per),
    height: Math.ceil(lines.length * size * LH),
    strokeColor: color,
    text: lines.join("\n"), originalText: text,
    fontSize: size, fontFamily: 1,
    textAlign: "left", verticalAlign: "top",
    containerId: null, lineHeight: LH, autoResize: true,
  }));
};


/* ---- the sheet, in both languages ----------------------------------------
 * One entry per box: [pt, en]. The layout is shared, so the two files differ
 * only in the strings — which is what makes the diff readable when the wording
 * changes. */

const RED = "#e03131";
const BLUE = "#1971c2";

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
};

const build = (i) => {
  elements = [];
  seedCounter = 1; // deterministic ids and seeds, so the two files diff cleanly
  const c = (k) => COPY[k][i];

  label("title", 120, 140, c("title"), 28, BLUE);

  const prova = box("prova", 120, 390, 250, c("prova"));
  const valido = box("valido", 460, 390, 200, c("valido"), { stroke: BLUE });
  const semGar = box("semgar", 450, 620, 230, c("semgar"), { stroke: RED });
  const token = box("token", 780, 390, 220, c("token"));

  const compra = box("compra", 1080, 70, 340, c("compra"));
  const supply = box("supply", 1080, 360, 340, c("supply"));
  const entrep = box("entrep", 1080, 650, 340, c("entrep"));

  const escrow = box("escrow", 1530, 380, 280, c("escrow"), { stroke: BLUE });

  const defi = box("defi", 1920, 120, 300, c("defi"));
  const staking = box("staking", 1920, 380, 300, c("staking"));
  const fim = box("fim", 1920, 630, 300, c("fim"));

  arrow(prova, valido);
  arrow(valido, token);
  arrow(valido, semGar, { from: "bottom", to: "top", stroke: RED });
  arrow(token, compra, { from: "top", to: "left" });
  arrow(token, supply);
  arrow(token, entrep, { from: "bottom", to: "left" });
  arrow(supply, escrow);
  arrow(entrep, escrow, { from: "right", to: "bottom" });
  arrow(escrow, defi, { from: "top", to: "left" });
  arrow(escrow, staking);
  arrow(escrow, fim, { from: "bottom", to: "left" });
  arrow(compra, defi);

  return elements;
};

/** Park the scene just below the top toolbar rather than under it. */
const frame = (els, zoom, marginX, marginY) => {
  const minX = Math.min(...els.map((e) => e.x));
  const minY = Math.min(...els.map((e) => e.y));
  return { scrollX: marginX / zoom - minX, scrollY: marginY / zoom - minY };
};

const OUT = new URL("../public/diagrams/", import.meta.url);

["lastre-capacidades.excalidraw", "lastre-capacidades-en.excalidraw"].forEach(
  (name, i) => {
    const els = build(i);
    const scene = {
      type: "excalidraw",
      version: 2,
      source: "local",
      elements: els,
      appState: {
        gridSize: null,
        viewBackgroundColor: "#ffffff",
        ...frame(els, 0.55, 90, 150),
        zoom: { value: 0.55 },
      },
      files: {},
    };
    fs.writeFileSync(new URL(name, OUT), JSON.stringify(scene));
    console.log(`${name}: ${els.length} elements`);
  },
);
