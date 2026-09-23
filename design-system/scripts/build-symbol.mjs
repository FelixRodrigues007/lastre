/**
 * Símbolo da Lastre — geometria exata.
 *
 * O SVG que saiu do Figma (assets/lastre-icon.svg) é um desenho a caneta: cada
 * aresta reta virou uma cúbica com alças fora de eixo, vértices que deveriam
 * coincidir diferem na terceira casa, e o mesmo canto aparece com dois raios.
 * Este script não corrige aquele arquivo — ele reconstrói a marca a partir das
 * retas de construção que o desenho aproxima, e derruba todo vértice de uma
 * interseção. O arquivo do Figma continua no repo como procedência; as amostras
 * abaixo são os pontos dele que pertencem a cada reta.
 *
 * Estrutura da marca (cinco regiões que se encaixam sem sobra nem folga):
 *   chevron  "<" à esquerda, dois cantos filetados
 *   losango   no meio, diagonais na horizontal e na vertical
 *   telhado   a montanha, acima da horizontal média
 *   faixa     o azul, entre a horizontal média e a base
 *   vale      o triângulo escuro dentro da faixa
 *
 * Invariantes que o desenho original só aproximava e que aqui são exatos:
 *   · o losango é um losango — diagonais ortogonais, centro sobre a horizontal média
 *   · a meia-diagonal vertical do losango = altura da faixa (y_low − y_mid)
 *   · K (ponta direita do losango) é o canto de base do telhado
 *   · Q (ponta de baixo do losango) está sobre a horizontal de baixo da faixa
 *   · N (a mordida na montanha) está sobre a reta M→K do losango
 *   · os dois ápices no topo e as duas pontas embaixo compartilham y
 *   · os três cantos filetados têm o mesmo comprimento de tangente
 *
 * Uso: node design-system/scripts/build-symbol.mjs [--check]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../../", import.meta.url);
const check = process.argv.includes("--check");

/* ─── 1. amostras: pontos do export do Figma, agrupados pela reta que percorrem ─── */

const SAMPLES = {
  R1: [[107.751, 9.72974], [108.627, 10.7209], [115.146, 21.4352], [122.536, 34.292], [134.25, 54.8389], [141.932, 69.0025]],
  R2: [[141.932, 69.0025], [138.325, 75.7004], [130.307, 90.2235], [130.307, 90.2237], [107.608, 131.046]],
  R3: [[74.6046, 63.3891], [82.2488, 50.7232], [96.2552, 27.7718], [107.751, 9.72974]],
  R7: [[97.331, 120.139], [84.6719, 98.4162], [84.6719, 98.4164], [79.9425, 90.2317], [79.9425, 90.2319]],
  R8: [[92.9696, 128.259], [94.2223, 125.929], [96.5841, 121.548], [97.331, 120.139], [97.3309, 120.139], [113.499, 90.2329]],
  H_MID: [[137.259, 68.9802], [127.925, 68.9835], [121.551, 68.9966], [109.164, 68.9884], [78.0572, 68.9828], [141.932, 69.0025]],
  H_LOW: [[79.9425, 90.2317], [78.0113, 90.2409], [113.499, 90.2329], [130.307, 90.2237], [68.6661, 90.2368], [63.6255, 90.292], [63.6256, 90.2919]],
  H_BOT: [[107.608, 131.046], [97.2931, 131.045], [51.555, 131.097]],
  Y_TOP: [[107.751, 9.72974], [52.6077, 9.72107]],
  SM: [[50.1488, 69.2145], [55.9388, 60.6171], [64.6112, 47.8877]],
  MK: [[64.6112, 47.8877], [74.6046, 63.3891], [78.0195, 68.9124], [78.0196, 68.9123]],
  KQ: [[78.0571, 68.9828], [73.9572, 74.9503], [63.6256, 90.2919]],
  QS: [[63.6256, 90.2919], [61.0444, 86.6957], [57.8327, 81.5513], [50.1488, 69.2145]],
  L_UO: [[18.7166, 64.4912], [20.896, 61.0043], [41.337, 27.7938], [48.6392, 15.9684], [52.6077, 9.72107]],
  L_LO: [[51.555, 131.097], [18.6345, 74.4442]],
  L_UI: [[61.9737, 25.3559], [46.7351, 49.7024], [38.3441, 63.1632]],
  L_LI: [[38.2337, 74.0963], [52.203, 99.1755], [61.1393, 115.336]],
  L_TOPCUT: [[52.6077, 9.72107], [60.7827, 23.2733], [61.9737, 25.3559]],
  L_BOTCUT: [[61.1393, 115.336], [57.713, 120.981], [51.555, 131.097]],
};

/** Comprimento de tangente dos cantos filetados, na escala de origem.
 *  Medido no export: 5.74, 5.81, 5.82, 5.89, 6.18, 6.52 — um só valor. */
const FILLET = 6;

/* ─── 2. álgebra ─── */

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const len = (a) => Math.hypot(a[0], a[1]);
const unit = (a) => { const l = len(a); return [a[0] / l, a[1] / l]; };
const line = (p, angle) => ({ p, u: [Math.cos(angle), Math.sin(angle)] });

/** Reta de mínimos quadrados totais (a distância medida é perpendicular, não vertical). */
function fitLine(pts) {
  const mx = mean(pts.map((p) => p[0]));
  const my = mean(pts.map((p) => p[1]));
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of pts) { sxx += (x - mx) ** 2; syy += (y - my) ** 2; sxy += (x - mx) * (y - my); }
  return line([mx, my], 0.5 * Math.atan2(2 * sxy, sxx - syy));
}

/** Melhor ângulo para uma reta obrigada a passar por `anchor`. */
function fitAngleThrough(pts, anchor) {
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of pts) {
    const dx = x - anchor[0], dy = y - anchor[1];
    sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
  }
  return 0.5 * Math.atan2(2 * sxy, sxx - syy);
}

function intersect(a, b) {
  const den = cross(a.u, b.u);
  if (Math.abs(den) < 1e-12) throw new Error("retas paralelas não se cruzam");
  return [a.p[0] + a.u[0] * (cross(sub(b.p, a.p), b.u) / den), a.p[1] + a.u[1] * (cross(sub(b.p, a.p), b.u) / den)];
}

const horizontal = (y) => ({ p: [0, y], u: [1, 0] });
const maxDev = (pts, l) => Math.max(...pts.map((q) => Math.abs(cross(l.u, sub(q, l.p)))));

/* ─── 3. solução ─── */

function solve() {
  const y_top = mean(SAMPLES.Y_TOP.map((p) => p[1]));
  const y_mid = mean(SAMPLES.H_MID.map((p) => p[1]));
  const y_low = mean(SAMPLES.H_LOW.map((p) => p[1]));
  const y_bot = mean(SAMPLES.H_BOT.map((p) => p[1]));
  const b = y_low - y_mid; // meia-diagonal vertical do losango = altura da faixa

  // losango: só (cx, a) ficam livres. Newton sobre a soma dos quadrados das
  // distâncias das amostras dos quatro lados.
  const cost = (cx, a) => {
    const V = { S: [cx - a, y_mid], M: [cx, y_mid - b], K: [cx + a, y_mid], Q: [cx, y_mid + b] };
    let c = 0;
    for (const [name, [from, to]] of Object.entries({ SM: [V.S, V.M], MK: [V.M, V.K], KQ: [V.K, V.Q], QS: [V.Q, V.S] })) {
      const u = unit(sub(to, from));
      for (const q of SAMPLES[name]) c += cross(u, sub(q, from)) ** 2;
    }
    return c;
  };
  let cx = 64, a = 14;
  for (let i = 0; i < 60; i += 1) {
    const h = 1e-5, c0 = cost(cx, a);
    const gx = (cost(cx + h, a) - cost(cx - h, a)) / (2 * h);
    const ga = (cost(cx, a + h) - cost(cx, a - h)) / (2 * h);
    const hx = (cost(cx + h, a) - 2 * c0 + cost(cx - h, a)) / h ** 2;
    const ha = (cost(cx, a + h) - 2 * c0 + cost(cx, a - h)) / h ** 2;
    cx -= gx / hx; a -= ga / ha;
  }
  const S = [cx - a, y_mid], M = [cx, y_mid - b], K = [cx + a, y_mid], Q = [cx, y_mid + b];

  // elemento direito — o vértice da direita nasce na horizontal média
  const t1 = fitLine(SAMPLES.R1).u;
  const a1 = Math.atan2(t1[1], t1[0]);
  const P_R = intersect(fitLine(SAMPLES.R1), horizontal(y_mid));
  const R1 = line(P_R, a1);
  const A_R = intersect(R1, horizontal(y_top));
  const R2 = line(P_R, fitAngleThrough(SAMPLES.R2, P_R));
  const R3 = line(A_R, fitAngleThrough(SAMPLES.R3.filter((p) => p[1] > 20), A_R));
  const N = intersect(R3, { p: M, u: unit(sub(K, M)) });
  const R7 = fitLine(SAMPLES.R7);
  const R8 = fitLine(SAMPLES.R8);
  const H_LOW = horizontal(y_low), H_BOT = horizontal(y_bot);

  // chevron esquerdo — as duas arestas externas fixam o cotovelo e as pontas
  const L_UO = fitLine(SAMPLES.L_UO), L_LO = fitLine(SAMPLES.L_LO);
  const L_UI = fitLine(SAMPLES.L_UI), L_LI = fitLine(SAMPLES.L_LI);
  const A_L = intersect(L_UO, horizontal(y_top));
  const D_L = intersect(L_LO, horizontal(y_bot));

  const V = {
    A_R, P_R, N, K, M, Q, S,
    P_BR: intersect(R2, H_BOT),
    C0: intersect(R8, H_BOT),
    W: intersect(R8, H_LOW),
    X: intersect(R7, R8),
    U: intersect(R7, H_LOW),
    A_L, D_L,
    E_out: intersect(L_UO, L_LO),
    E_in: intersect(L_UI, L_LI),
    B_L: intersect(line(A_L, fitAngleThrough(SAMPLES.L_TOPCUT, A_L)), L_UI),
    C_L: intersect(line(D_L, fitAngleThrough(SAMPLES.L_BOTCUT, D_L)), L_LI),
  };
  const lines = { R1, R2, R3, R7, R8, L_UO, L_LO, L_UI, L_LI };
  return { V, lines, axes: { y_top, y_mid, y_low, y_bot }, rhombus: { cx, a, b } };
}

/* ─── 4. regiões ─────────────────────────────────────────────────────────────
 *
 * Dois polígonos adjacentes que dividem uma aresta deixam costura: o
 * rasterizador compõe 50% de cobertura sobre 50% e chega a 75%, não a 100%, e
 * aparece um fio claro no meio da marca. O arquivo do Figma evitava isso
 * empilhando: uma forma-base inteira embaixo e as outras por cima.
 *
 * Aqui as camadas são declaradas na ordem de pintura, e toda aresta interna cai
 * sobre uma camada já pintada — nenhuma encosta na anterior pela lateral. A
 * silhueta é a união exata das quatro regiões da direita, então o espectro é um
 * traçado só e não tem aresta interna nenhuma.
 */

const SILHOUETTE = (V) => ({ pts: [V.A_R, V.P_R, V.P_BR, V.C0, V.X, V.U, V.Q, V.S, V.M, V.N], round: [3] });
const CHEVRON = (V) => ({ pts: [V.A_L, V.B_L, V.E_in, V.C_L, V.D_L, V.E_out], round: [2, 5] });

/** Camadas do desenho chapado, de baixo para cima. A base é a silhueta inteira
 *  na cor da faixa — porque a faixa é exatamente a silhueta menos as outras três,
 *  que caem inteiras sobre ela. Nenhuma aresta interna fica transparente. */
const REGIONS = (V) => [
  { id: "faixa", ...SILHOUETTE(V) },
  { id: "losango", pts: [V.S, V.M, V.K, V.Q], round: [] },
  { id: "telhado", pts: [V.A_R, V.P_R, V.K, V.N], round: [] },
  { id: "vale", pts: [V.U, V.W, V.X], round: [] },
  { id: "chevron", ...CHEVRON(V) },
];

/** O espectro: silhueta e chevron, um traçado, um gradiente. */
const OUTLINE = (V) => [SILHOUETTE(V), CHEVRON(V)];

/* ─── 5. emissão ─── */

const fmt = (n) => {
  const r = Math.abs(n) < 5e-4 ? 0 : n;
  return String(Number(r.toFixed(3)));
};

/** Polígono com cantos filetados por arcos circulares exatos (comando A). */
function toPath(pts, round, d, xf) {
  const n = pts.length;
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const P = pts[i];
    if (!round.includes(i)) { out.push({ to: P }); continue; }
    const u = unit(sub(P, pts[(i - 1 + n) % n]));
    const v = unit(sub(pts[(i + 1) % n], P));
    const delta = Math.atan2(cross(u, v), dot(u, v)); // ângulo de giro
    const r = d / Math.tan(Math.abs(delta) / 2);
    out.push({ to: [P[0] - u[0] * d, P[1] - u[1] * d] });
    out.push({ to: [P[0] + v[0] * d, P[1] + v[1] * d], arc: r, sweep: delta > 0 ? 1 : 0 });
  }
  const at = (p) => { const q = xf(p); return `${fmt(q[0])} ${fmt(q[1])}`; };
  const scale = len(sub(xf([1, 0]), xf([0, 0])));
  // Z fecha de volta ao primeiro ponto — que já é o ponto de tangência correto
  // quando o vértice 0 é filetado, então nenhum L final é necessário.
  return out.slice(1).reduce(
    (d_, seg) => d_ + (seg.arc
      ? `A${fmt(seg.arc * scale)} ${fmt(seg.arc * scale)} 0 0 ${seg.sweep} ${at(seg.to)}`
      : `L${at(seg.to)}`),
    `M${at(out[0].to)}`,
  ) + "Z";
}

export { solve, REGIONS, OUTLINE, SILHOUETTE, CHEVRON, toPath, FILLET, SAMPLES, maxDev, fitLine };

/* ─── 6. paleta ─── */

const T = {
  mirage500: "#676C80", mirage700: "#3E424F", mirage950: "#0F1116",
  gold100: "#FED3B1", gold200: "#FDA82D", gold300: "#E99A20",
  gold400: "#CE871A", gold500: "#AF7215", gold600: "#8E5C0F",
  blue100: "#B9E2FE", blue200: "#5DC9FD", blue300: "#1CAFE5",
  blue400: "#1694C3", blue500: "#107CA4", blue600: "#0B6586",
};

/** Preenchimentos chapados. band e chevron não pertencem à escala de tokens —
 *  ficam como a marca foi desenhada. rhombus e valley diferiam do token em 1/255
 *  por canal (ruído de arredondamento do export) e foram alinhados. */
const FLAT = {
  telhado: "url(#lastre-roof)",
  faixa: "#48AFF5",
  vale: T.mirage700,
  losango: T.blue200,
  chevron: "#ED9E04",
};

/** O espectro: uma só rampa atravessando a marca inteira, na diagonal da bbox.
 *  Paradas simétricas em torno de 0.5 — o pico de luz fica no meio. */
const STOPS = [0, 0.22, 0.44, 0.56, 0.78, 1];
const RAMP = {
  dark: [T.gold300, T.gold200, T.gold100, T.blue100, T.blue200, T.blue300],
  light: [T.gold600, T.gold500, T.gold400, T.blue400, T.blue500, T.blue600],
};

const luminance = (hex) => {
  const c = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/* ─── 7. enquadramento ─── */

const model = solve();

/** bbox real da marca, com os arcos dos filetes achatados. */
function bbox() {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const { pts, round } of OUTLINE(model.V)) {
    const n = pts.length;
    for (let i = 0; i < n; i += 1) {
      const P = pts[i];
      if (!round.includes(i)) { x0 = Math.min(x0, P[0]); x1 = Math.max(x1, P[0]); y0 = Math.min(y0, P[1]); y1 = Math.max(y1, P[1]); continue; }
      const u = unit(sub(P, pts[(i - 1 + n) % n]));
      const v = unit(sub(pts[(i + 1) % n], P));
      const delta = Math.atan2(cross(u, v), dot(u, v));
      const r = FILLET / Math.tan(Math.abs(delta) / 2);
      const t1 = [P[0] - u[0] * FILLET, P[1] - u[1] * FILLET];
      const t2 = [P[0] + v[0] * FILLET, P[1] + v[1] * FILLET];
      const w = unit([-u[0] + v[0], -u[1] + v[1]]);
      const c = [P[0] + w[0] * Math.hypot(r, FILLET), P[1] + w[1] * Math.hypot(r, FILLET)];
      const a1 = Math.atan2(t1[1] - c[1], t1[0] - c[0]);
      for (let k = 0; k <= 32; k += 1) {
        const ang = a1 + delta * (k / 32);
        const p = [c[0] + r * Math.cos(ang), c[1] + r * Math.sin(ang)];
        x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
      }
    }
  }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}
const BOX = bbox();

/** Transformação para uma caixa quadrada de lado `side`, marca centrada na bbox. */
function frame(side, longest) {
  const k = longest / Math.max(BOX.w, BOX.h);
  const dx = side / 2 - k * (BOX.x0 + BOX.x1) / 2;
  const dy = side / 2 - k * (BOX.y0 + BOX.y1) / 2;
  return { xf: (p) => [p[0] * k + dx, p[1] * k + dy], k, side };
}

/* ─── 8. documentos ─── */

const GEN = "<!-- Gerado por design-system/scripts/build-symbol.mjs. Não editar à mão. -->";

function shapes(xf, fillFor) {
  return REGIONS(model.V)
    .map(({ id, pts, round }) => `  <path d="${toPath(pts, round, FILLET, xf)}" fill="${fillFor(id)}"/>`)
    .join("\n");
}

/** Um traçado só, dois subtraçados — sem nenhuma aresta interna para costurar. */
function outline(xf, fill) {
  const d = OUTLINE(model.V).map(({ pts, round }) => toPath(pts, round, FILLET, xf)).join("");
  return `  <path d="${d}" fill="${fill}"/>`;
}

function roofGradient(xf) {
  const top = xf([0, model.axes.y_top])[1];
  const base = xf([0, model.axes.y_mid])[1];
  return `    <linearGradient id="lastre-roof" gradientUnits="userSpaceOnUse" x1="0" y1="${fmt(top)}" x2="0" y2="${fmt(base)}">\n` +
    `      <stop stop-color="${T.mirage500}"/>\n      <stop offset="1" stop-color="${T.mirage700}"/>\n    </linearGradient>`;
}

/** Eixo do espectro: canto inferior esquerdo → canto superior direito da bbox. */
function spectrumAxis(xf) {
  const a = xf([BOX.x0, BOX.y1]), b = xf([BOX.x1, BOX.y0]);
  return `x1="${fmt(a[0])}" y1="${fmt(a[1])}" x2="${fmt(b[0])}" y2="${fmt(b[1])}"`;
}
const rampStops = (scheme, indent) =>
  STOPS.map((o, i) => `${indent}<stop${o ? ` offset="${o}"` : ""} stop-color="${RAMP[scheme][i]}"/>`).join("\n");

function flatSvg(side, longest, title) {
  const { xf } = frame(side, longest);
  return `${GEN}\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" width="${side}" height="${side}" role="img" aria-label="${title}">\n  <title>${title}</title>\n  <defs>\n${roofGradient(xf)}\n  </defs>\n${shapes(xf, (id) => FLAT[id])}\n</svg>\n`;
}

function spectrumSvg(side, longest, title, { adaptive = false, plate = null, id = "lastre-espectro" } = {}) {
  const { xf } = frame(side, longest);
  // O favicon é pintado pelo cromo do navegador, não pela página: segue o tema do
  // sistema. A rampa clara desce nas escalas até cada parada passar de 2.9:1 no branco.
  const style = adaptive
    ? `  <style>\n    @media (prefers-color-scheme: light) {\n${STOPS.map((_, i) => `      #${id} stop:nth-of-type(${i + 1}) { stop-color: ${RAMP.light[i]} }`).join("\n")}\n    }\n  </style>\n`
    : "";
  const bg = plate ? `  <rect width="${side}" height="${side}" fill="${plate}"/>\n` : "";
  return `${GEN}\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" width="${side}" height="${side}" role="img" aria-label="${title}">\n  <title>${title}</title>\n${style}  <defs>\n    <linearGradient id="${id}" gradientUnits="userSpaceOnUse" ${spectrumAxis(xf)}>\n${rampStops("dark", "      ")}\n    </linearGradient>\n  </defs>\n${bg}${outline(xf, `url(#${id})`)}\n</svg>\n`;
}

export { model, BOX, frame, flatSvg, spectrumSvg, T, RAMP, STOPS, contrast, fmt, bbox };

/* ─── 9. alvos ─── */

const SIDE = 128;
const DIAG = Math.hypot(BOX.w, BOX.h);
/** Android recorta o ícone maskable em um círculo de 80% do lado: a diagonal da
 *  marca, não o lado dela, é o que precisa caber. */
const MASKABLE = (0.8 * Math.max(BOX.w, BOX.h)) / DIAG;

const TITLE = "Lastre";
const PLATE = T.mirage950;

const SVGS = {
  "design-system/assets/lastre-symbol.svg": flatSvg(SIDE, 112, TITLE),
  "design-system/assets/lastre-symbol-espectro.svg": spectrumSvg(SIDE, 112, TITLE),
  "web/public/favicon.svg": spectrumSvg(SIDE, 120, TITLE, { adaptive: true }),
  "app/public/favicon.svg": spectrumSvg(SIDE, 120, TITLE, { adaptive: true }),
};

const PNGS = [
  ["web/public/apple-touch-icon.png", 180, 0.62, PLATE],
  ["web/public/icon-192.png", 192, 0.78, PLATE],
  ["web/public/icon-512.png", 512, 0.78, PLATE],
  ["web/public/icon-maskable-512.png", 512, MASKABLE, PLATE],
  ["app/public/apple-touch-icon.png", 180, 0.62, PLATE],
];

const manifest = (v) => `${JSON.stringify({
  name: "Lastre — Proof before token.",
  short_name: "Lastre",
  start_url: "/",
  theme_color: "#070708",
  background_color: PLATE,
  icons: [
    { src: `/favicon.svg?v=${v}`, sizes: "any", type: "image/svg+xml" },
    { src: `/icon-192.png?v=${v}`, sizes: "192x192", type: "image/png" },
    { src: `/icon-512.png?v=${v}`, sizes: "512x512", type: "image/png" },
    { src: `/icon-maskable-512.png?v=${v}`, sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}, null, 2)}\n`;

/* ─── 10. cache de favicon ───────────────────────────────────────────────────
 *
 * O Chrome guarda o favicon por origem no perfil, num banco separado do cache
 * HTTP: recarregar a página não repede o arquivo, e quem já visitou o site fica
 * com o ícone antigo por tempo indeterminado. A saída é o href mudar junto com o
 * conteúdo. O `v` é o resumo dos próprios ícones — o manifesto não entra no
 * cálculo porque carrega o resultado dele.
 */

const VERSIONED = ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "site.webmanifest"];
const stamp = (html, v) =>
  html.replace(
    /href="\/([A-Za-z0-9._-]+)(?:\?v=[0-9a-f]+)?"/g,
    (whole, file) => (VERSIONED.includes(file) ? `href="/${file}?v=${v}"` : whole),
  );

/** ICO é um contêiner: cabeçalho, uma entrada por tamanho, PNGs inteiros no fim. */
function ico(pngs) {
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let offset = head.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, e);
    head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt8(0, e + 2); head.writeUInt8(0, e + 3);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(data.length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.data)]);
}

async function main() {
  // A rampa clara precisa se sustentar sobre um branco puro.
  for (const hex of RAMP.light) {
    const c = contrast(hex, "#FFFFFF");
    if (c < 2.9) throw new Error(`Parada clara ${hex} tem só ${c.toFixed(2)}:1 no branco`);
  }
  for (const hex of RAMP.dark) {
    const c = contrast(hex, PLATE);
    if (c < 3) throw new Error(`Parada escura ${hex} tem só ${c.toFixed(2)}:1 sobre ${PLATE}`);
  }

  const { createRequire } = await import("node:module");
  const require = createRequire(new URL("web/package.json", root));
  let sharp;
  try { sharp = require("sharp"); } catch {
    throw new Error("sharp não resolveu a partir de web/. Rode npm --prefix web ci.");
  }

  const raster = async (side, fill, plate) => {
    const svg = spectrumSvg(SIDE, SIDE * fill, TITLE, { plate });
    return sharp(Buffer.from(svg)).resize(side, side).png({ compressionLevel: 9 }).toBuffer();
  };

  const outputs = new Map(Object.entries(SVGS).map(([f, c]) => [f, Buffer.from(c, "utf8")]));
  for (const [file, side, fill, plate] of PNGS) outputs.set(file, await raster(side, fill, plate));
  outputs.set("web/public/favicon.ico", ico(await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, data: await raster(size, 0.94, null) })),
  )));

  const digest = createHash("sha256");
  for (const file of [...outputs.keys()].sort()) digest.update(file).update(outputs.get(file));
  const v = digest.digest("hex").slice(0, 8);

  outputs.set("web/public/site.webmanifest", Buffer.from(manifest(v), "utf8"));
  for (const html of ["web/index.html", "app/index.html"]) {
    const source = readFileSync(fileURLToPath(new URL(html, root)), "utf8");
    outputs.set(html, Buffer.from(stamp(source, v), "utf8"));
  }

  let stale = 0;
  for (const [file, data] of outputs) {
    const path = fileURLToPath(new URL(file, root));
    if (check) {
      let current = null;
      try { current = readFileSync(path); } catch { /* ausente */ }
      if (!current || !current.equals(data)) { console.error(`desatualizado: ${file}`); stale += 1; }
    } else {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, data);
    }
  }
  if (stale) throw new Error(`${stale} arquivo(s) fora de sincronia; rode npm run symbol:build`);

  const ang = (l) => ((Math.atan2(l.u[1], l.u[0]) * 180) / Math.PI + 180) % 180;
  console.log(
    `Símbolo da Lastre ${check ? "verificado" : "gerado"}: ${outputs.size} arquivos, ` +
    `${REGIONS(model.V).length} camadas, ${Object.keys(model.V).length} vértices de interseção, ` +
    `bbox ${BOX.w.toFixed(3)}×${BOX.h.toFixed(3)} (${(BOX.w / BOX.h).toFixed(4)}:1), ` +
    `desvio máximo das amostras do Figma ${Math.max(
      ...Object.entries(model.lines).map(([k, l]) => maxDev(SAMPLES[k], l)),
    ).toFixed(3)} px.`,
  );
  if (!check) {
    console.log(`  ângulos: ${Object.entries(model.lines).map(([k, l]) => `${k} ${ang(l).toFixed(2)}°`).join(", ")}`);
    console.log(`  eixos: y_top ${fmt(model.axes.y_top)}, y_mid ${fmt(model.axes.y_mid)}, y_low ${fmt(model.axes.y_low)}, y_bot ${fmt(model.axes.y_bot)}`);
    console.log(`  losango: centro ${fmt(model.rhombus.cx)}, meia-diagonal ${fmt(model.rhombus.a)} × ${fmt(model.rhombus.b)}`);
  }
}

await main();
