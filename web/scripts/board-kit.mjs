/* The shared drawing kit behind every committed Excalidraw board under
 * public/diagrams. One sheet per script; the geometry, the palettes and the
 * file writing live here so the scripts hold only their own layout and copy.
 *
 * Every helper is deterministic: the same calls in the same order produce the
 * same ids and seeds, which is what keeps the diff readable when only the
 * wording changes. */

import fs from "node:fs";

export const FONT = 20;            // Excalidraw "hand-drawn" (Virgil)
export const LH = 1.25;
export const CHAR = FONT * 0.62;   // Virgil advance, measured against the rendered canvas
export const PAD = 16;

/* Excalidraw's own dark mode is a filter over the canvas (invert + hue-rotate),
 * which lifts every stroke towards white at once — a black border and black
 * text come out the same near-white, and neither can be softened without the
 * other. So the dark board is not a filtered light board: it is drawn dark,
 * with its own colours, and rendered with the filter off. */
export const PALETTES = {
  light: {
    bg: "#f7f9f7",
    ink: "#1e1e1e",   // text
    line: "#1e1e1e",  // box borders
    flow: "#1e1e1e",  // arrows
    blue: "#1971c2",
    red: "#e03131",
  },
  dark: {
    bg: "#121212",
    ink: "#e6ede9",
    line: "#6f7d77",  // grey, not white: the border frames, it does not shout
    flow: "#8b9a93",
    blue: "#6ea8fe",
    red: "#ff8b8b",
  },
};

/** One drawing surface: its own palette, its own element list, its own seed. */
export function sheet(palette) {
  const P = palette;
  const elements = [];
  let seedCounter = 1;
  const rnd = () => (seedCounter = (seedCounter * 1103515245 + 12345) % 2147483648);

  const base = (over) => ({
    angle: 0,
    strokeColor: P.ink,
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
      strokeColor: opts.accent ?? P.line,
      strokeWidth: opts.strokeWidth ?? 2,
      roundness: { type: 3 },
      boundElements: [{ type: "text", id: textId }],
    }));

    elements.push(base({
      id: textId, type: "text",
      x: x + PAD, y: y + Math.round((h - textH) / 2),
      width: w - PAD * 2, height: textH,
      strokeColor: opts.accent ?? P.ink,
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
      strokeColor: opts.accent ?? P.flow,
    }));

    for (const node of [a, b]) {
      const rect = elements.find((e) => e.id === node.id);
      rect.boundElements = [...(rect.boundElements ?? []), { type: "arrow", id }];
    }
  };

  const label = (id, x, y, text, size = 18, color = null, maxPx = 1200) => {
    /* Free text measures with its own size — the box helper's CHAR is tied to
     * FONT. Two different metrics on purpose: WRAP is the honest average
     * advance, so lines break where they look right; WIDE is deliberately
     * over-generous, because the width written here is the width Excalidraw
     * honours on load, and a text element narrower than its own string has
     * its last characters replaced by an ellipsis. A left-aligned label has
     * neither border nor fill, so slack costs nothing. */
    const per = size * 0.65;
    const wide = size * 0.85;
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
      width: Math.ceil((Math.max(...lines.map((l) => l.length)) + 1) * wide),
      height: Math.ceil(lines.length * size * LH),
      strokeColor: color ?? P.ink,
      text: lines.join("\n"), originalText: text,
      fontSize: size, fontFamily: 1,
      textAlign: "left", verticalAlign: "top",
      containerId: null, lineHeight: LH, autoResize: true,
    }));
  };


  /* ---- the drawing kit -----------------------------------------------------
   * A sheet made only of labelled boxes explains with words alone. These are
   * the three strokes a pictogram needs — a closed figure, an open line and a
   * lone glyph. They take absolute coordinates like everything else, bind no
   * text and are never arrow targets: they are the drawing, not the diagram.
   *
   * Everything is measured from the column centre the pictogram sits on, so a
   * box can move without its picture coming loose. */
  const shape = (type, x, y, w, h, opts = {}) =>
    elements.push(base({
      id: `${type[0]}${elements.length}`,
      type, x, y, width: w, height: h,
      strokeColor: opts.stroke ?? P.line,
      backgroundColor: opts.fill ?? "transparent",
      strokeWidth: opts.strokeWidth ?? 2,
      strokeStyle: opts.strokeStyle ?? "solid",
      roundness: opts.roundness ?? null,
    }));

  const ellipse = (x, y, w, h, opts) => shape("ellipse", x, y, w, h, opts);
  const rect = (x, y, w, h, opts) => shape("rectangle", x, y, w, h, opts);

  /** An open stroke through points measured from (x, y); the first is [0, 0].
   *  Pass roundness { type: 2 } for a curve, leave it off for a fold. */
  const poly = (x, y, points, opts = {}) => {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    elements.push(base({
      id: `ln${elements.length}`,
      type: "line", x, y,
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
      points,
      lastCommittedPoint: null,
      startBinding: null,
      endBinding: null,
      startArrowhead: null,
      endArrowhead: null,
      strokeColor: opts.stroke ?? P.line,
      backgroundColor: opts.fill ?? "transparent",
      strokeWidth: opts.strokeWidth ?? 2,
      strokeStyle: opts.strokeStyle ?? "solid",
      roundness: opts.roundness ?? null,
    }));
  };

  /** A character or two inside a drawing, centred on cx rather than left-set:
   *  a "?" that hangs off its own anchor stops being part of the picture. */
  const glyph = (cx, y, text, size, color = null) => {
    const w = Math.ceil(text.length * size * 0.85);
    elements.push(base({
      id: `gl${elements.length}`,
      type: "text",
      x: Math.round(cx - w / 2), y,
      width: w, height: Math.ceil(size * LH),
      strokeColor: color ?? P.ink,
      text, originalText: text,
      fontSize: size, fontFamily: 1,
      textAlign: "center", verticalAlign: "top",
      containerId: null, lineHeight: LH, autoResize: true,
    }));
  };

  return { P, elements, box, arrow, label, ellipse, rect, poly, glyph };
}

/** Park the scene just below the top toolbar rather than under it. */
const frame = (els, zoom, marginX, marginY) => {
  const minX = Math.min(...els.map((e) => e.x));
  const minY = Math.min(...els.map((e) => e.y));
  return { scrollX: marginX / zoom - minX, scrollY: marginY / zoom - minY };
};

export const OUT = new URL("../public/diagrams/", import.meta.url);

/** The four files one board needs: two languages, each drawn light and dark. */
export function emit(stem, build, { zoom = 0.55, marginX = 90, marginY = 150 } = {}) {
  for (const [i, lang] of ["", "-en"].entries()) {
    for (const themeKey of ["light", "dark"]) {
      const els = build(i, PALETTES[themeKey]);
      const name = `${stem}${lang}${themeKey === "dark" ? "-dark" : ""}.excalidraw`;
      const scene = {
        type: "excalidraw",
        version: 2,
        source: "local",
        elements: els,
        appState: {
          gridSize: null,
          viewBackgroundColor: PALETTES[themeKey].bg,
          ...frame(els, zoom, marginX, marginY),
          zoom: { value: zoom },
        },
        files: {},
      };
      fs.writeFileSync(new URL(name, OUT), JSON.stringify(scene));
      console.log(`${name}: ${els.length} elements`);
    }
  }
}
