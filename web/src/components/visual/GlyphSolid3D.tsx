import { useEffect, useRef } from "react";
import "./glyph-field.css";

type Vec3 = readonly [number, number, number];

type GlyphSolid3DProps = {
  className?: string;
  /** Radians added to the spin per frame (≈ rev speed). */
  speed?: number;
  /** Glyphs sampled along each edge of the outer solid. */
  perEdge?: number;
  /** Unit-scale vertices of the wireframe solid. */
  verts?: readonly Vec3[];
  /** Vertex-index pairs describing every edge. */
  edges?: readonly (readonly [number, number])[];
  /** Draw a second, smaller, counter-rotating copy inside the first. */
  nested?: boolean;
  /** Fraction of the box the outer solid spans (≈ size). Default 0.6. */
  fill?: number;
};

const CHAR_POOL = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

/* Continuous "encrypting" churn cadence. */
const SCRAMBLE_EVERY = 3;
const SCRAMBLE_FRACTION = 0.05;

/* Projection tuning (normalised units, scaled at paint). */
const DEFAULT_FILL = 0.6; // fraction of the box the outer solid spans
const TILT_X = -0.42; // fixed tilt → top facet shows, reads as 3D head-on
const DEPTH_NEAR = 1.0; // brightness at the closest edge
const DEPTH_FAR = 0.45; // …at the furthest edge (kept high → crisp, not ghosted)
const INNER_RATIO = 0.5; // inner solid size relative to outer
const MAX_DPR = 2;

/* Edge thickness: a thin 2-glyph-wide ribbon offset perpendicular to the edge. */
const EDGE_THICK = 0.05;
const RIBBON_OFFSETS = [-0.5, 0.5] as const;

/* ── Octahedron (crystal/diamond): 6 axis vertices, 12 edges. ──────────
   0:+x 1:-x 2:+y 3:-y 4:+z 5:-z — two pyramids glued at a square equator. */
const OCTA_VERTS: readonly Vec3[] = [
  [1, 0, 0], [-1, 0, 0],
  [0, 1, 0], [0, -1, 0],
  [0, 0, 1], [0, 0, -1],
];
export const OCTAHEDRON: readonly (readonly [number, number])[] = [
  [2, 0], [2, 4], [2, 1], [2, 5], // top apex → equator
  [3, 0], [3, 4], [3, 1], [3, 5], // bottom apex → equator
  [0, 4], [4, 1], [1, 5], [5, 0], // equatorial square
];
export const OCTAHEDRON_VERTS = OCTA_VERTS;

/* ── Agent network: a central hub (0) wired to two offset rings of nodes,
   plus ring + cross links — reads as autonomous agents around a coordinator.
   All outer nodes sit on the unit sphere so it fills the box like a solid. */
const R = 0.5944; // horizontal radius of the diagonal ring nodes (√(1²−0.55²)/√2)
const RING_Y = 0.55;
const AGENT_VERTS: readonly Vec3[] = [
  [0, 0, 0], // 0 — hub / coordinator
  [R, RING_Y, R], [-R, RING_Y, R], [-R, RING_Y, -R], [R, RING_Y, -R], // 1–4 top ring
  [0.835, -RING_Y, 0], [0, -RING_Y, 0.835], [-0.835, -RING_Y, 0], [0, -RING_Y, -0.835], // 5–8 bottom ring
];
export const AGENT_NETWORK_VERTS = AGENT_VERTS;
export const AGENT_NETWORK: readonly (readonly [number, number])[] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], // hub spokes
  [1, 2], [2, 3], [3, 4], [4, 1], // top ring
  [5, 6], [6, 7], [7, 8], [8, 5], // bottom ring
  [1, 5], [2, 6], [3, 7], [4, 8], // top→bottom cross links
];

type Point = { bx: number; by: number; bz: number; dir: 1 | -1; char: string };

const pickChar = () => CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];

/** Sample a ribbon of glyphs along every edge of a solid scaled by `half`. */
function buildSolid(
  verts: readonly Vec3[],
  edges: readonly (readonly [number, number])[],
  half: number,
  dir: 1 | -1,
  perEdge: number,
): Point[] {
  const out: Point[] = [];
  for (const [a, b] of edges) {
    const va: Vec3 = [verts[a][0] * half, verts[a][1] * half, verts[a][2] * half];
    const vb: Vec3 = [verts[b][0] * half, verts[b][1] * half, verts[b][2] * half];

    // Edge direction, then a perpendicular unit vector u = d × worldUp so the
    // ribbon widens sideways regardless of how the edge is oriented in space.
    let dx = vb[0] - va[0];
    let dy = vb[1] - va[1];
    let dz = vb[2] - va[2];
    const dl = Math.hypot(dx, dy, dz) || 1;
    dx /= dl;
    dy /= dl;
    dz /= dl;
    let ux = -dz;
    let uy = 0;
    let uz = dx;
    let ul = Math.hypot(ux, uy, uz);
    if (ul < 1e-4) {
      // Edge parallel to up → fall back to the x axis for the offset.
      ux = 1;
      uy = 0;
      uz = 0;
      ul = 1;
    }
    ux /= ul;
    uy /= ul;
    uz /= ul;

    for (let i = 0; i <= perEdge; i += 1) {
      const t = i / perEdge;
      const px = va[0] + (vb[0] - va[0]) * t;
      const py = va[1] + (vb[1] - va[1]) * t;
      const pz = va[2] + (vb[2] - va[2]) * t;
      for (const o of RIBBON_OFFSETS) {
        out.push({
          bx: px + ux * o * EDGE_THICK,
          by: py + uy * o * EDGE_THICK,
          bz: pz + uz * o * EDGE_THICK,
          dir,
          char: pickChar(),
        });
      }
    }
  }
  return out;
}

/**
 * Two nested wireframe solids drawn as a live ASCII field: each glyph is a
 * point on an edge, projected in perspective so near edges grow and brighten.
 * Outer and inner solids counter-rotate around Y under a fixed X tilt, and
 * glyphs continuously re-scramble ("encrypting"). 2D canvas — no WebGL.
 * Honours reduced-motion (static) and pauses while off-screen.
 *
 * Same engine as CubeField3D, but geometry-driven — defaults to an octahedron.
 */
export function GlyphSolid3D({
  className,
  speed = 0.007,
  perEdge = 16,
  verts = OCTA_VERTS,
  edges = OCTAHEDRON,
  nested = true,
  fill = DEFAULT_FILL,
}: GlyphSolid3DProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapEl = wrapRef.current;
    const canvasEl = canvasRef.current;
    if (!wrapEl || !canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    const wrap = wrapEl;
    const cnv = canvasEl;
    const c2d = context;

    const innerEdge = Math.max(6, Math.round(perEdge * INNER_RATIO * 1.4));
    const points = nested
      ? [
          ...buildSolid(verts, edges, 0.5, 1, perEdge),
          ...buildSolid(verts, edges, 0.5 * INNER_RATIO, -1, innerEdge),
        ]
      : buildSolid(verts, edges, 0.5, 1, perEdge);
    const rootStyle = getComputedStyle(document.documentElement);
    const monoFamily = rootStyle.getPropertyValue("--lastro-font-mono").trim() || "monospace";

    let cssW = 0;
    let cssH = 0;
    let scale = 1;
    let focal = 1;
    let baseFont = 12;
    let color = "126, 244, 208";
    let theta = 0;
    let frame = 0;
    let raf = 0;
    let visible = true;

    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function parseColor(input: string): string {
      const m = input.match(/(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/);
      return m ? `${m[1]}, ${m[2]}, ${m[3]}` : color;
    }

    function layout() {
      const box = wrap.getBoundingClientRect();
      const W = box.width;
      const H = box.height;
      if (!W || !H) return;
      color = parseColor(getComputedStyle(wrap).color);

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      cnv.width = Math.round(W * dpr);
      cnv.height = Math.round(H * dpr);
      cnv.style.width = `${W}px`;
      cnv.style.height = `${H}px`;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      cssW = W;
      cssH = H;

      const size = Math.min(W, H);
      scale = size * fill;
      focal = size * 1.6;
      baseFont = size * 0.023;
    }

    function paint() {
      c2d.clearRect(0, 0, cssW, cssH);
      const cx = cssW / 2;
      const cy = cssH / 2;
      const cosY = Math.cos(theta);
      const sinY = Math.sin(theta);
      const cosX = Math.cos(TILT_X);
      const sinX = Math.sin(TILT_X);

      const drawn = points.map((p) => {
        // rotate around Y — inner solid (dir -1) spins the opposite way
        const sY = sinY * p.dir;
        const x = p.bx * cosY + p.bz * sY;
        let z = -p.bx * sY + p.bz * cosY;
        let y = p.by;
        // fixed tilt around X
        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;
        y = y2;
        z = z2;
        const pz = scale * z;
        const s = focal / (focal + pz);
        return { sx: cx + scale * x * s, sy: cy + scale * y * s, s, z, char: p.char };
      });
      drawn.sort((a, b) => b.z - a.z);

      c2d.textBaseline = "middle";
      c2d.textAlign = "center";
      for (const d of drawn) {
        const t = Math.max(0, Math.min(1, 0.5 - d.z));
        const a = DEPTH_FAR + (DEPTH_NEAR - DEPTH_FAR) * t;
        c2d.fillStyle = `rgba(${color}, ${a.toFixed(3)})`;
        c2d.font = `500 ${(baseFont * (0.78 + 0.22 * d.s)).toFixed(2)}px ${monoFamily}`;
        c2d.fillText(d.char, Math.round(d.sx), Math.round(d.sy));
      }
    }

    function step() {
      raf = 0;
      theta += speed;
      frame += 1;
      if (frame % SCRAMBLE_EVERY === 0) {
        for (const p of points) {
          if (Math.random() < SCRAMBLE_FRACTION) {
            p.char = pickChar();
          }
        }
      }
      paint();
      if (visible) raf = requestAnimationFrame(step);
    }

    function wake() {
      if (!raf && visible && !reduce) raf = requestAnimationFrame(step);
    }

    layout();
    paint();

    if (reduce) {
      const ro = new ResizeObserver(() => {
        layout();
        paint();
      });
      ro.observe(wrap);
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) wake();
      },
      { rootMargin: "120px" },
    );
    io.observe(wrap);

    const ro = new ResizeObserver(() => {
      layout();
      paint();
    });
    ro.observe(wrap);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [speed, perEdge, verts, edges, nested, fill]);

  return (
    <div ref={wrapRef} className={`glyph-field${className ? ` ${className}` : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} className="glyph-field__canvas" />
    </div>
  );
}
