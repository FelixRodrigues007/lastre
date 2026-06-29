import { useEffect, useRef } from "react";
import "./glyph-field.css";

type CubeField3DProps = {
  className?: string;
  /** Radians added to the spin per frame (≈ rev speed). */
  speed?: number;
  /** Glyphs sampled along each of the 12 edges of the outer cube. */
  perEdge?: number;
};

const CHAR_POOL = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

/* Continuous "encrypting" churn cadence. */
const SCRAMBLE_EVERY = 3;
const SCRAMBLE_FRACTION = 0.05;

/* Projection tuning (normalised units, scaled at paint). */
const FILL = 0.54; // fraction of the box the outer cube spans
const TILT_X = -0.42; // fixed tilt → top face shows, reads as 3D head-on
const DEPTH_NEAR = 1.0; // brightness at the closest edge
const DEPTH_FAR = 0.45; // …at the furthest edge (kept high → crisp, not ghosted)
const INNER_RATIO = 0.5; // inner cube size relative to outer
const MAX_DPR = 2;

/* Edge thickness: a thin 2-glyph-wide ribbon — fine, not a chunky tube, but
   still more than a single line. Density runs along the edge, not across it. */
const EDGE_THICK = 0.05;
const EDGE_OFFSETS = [
  [0.5, 0], [-0.5, 0],
] as const;

/* Unit cube: 8 vertices, 12 edges. */
const CUBE_VERTS = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
] as const;
const CUBE_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0], // back face
  [4, 5], [5, 6], [6, 7], [7, 4], // front face
  [0, 4], [1, 5], [2, 6], [3, 7], // connectors
] as const;

type Point = { bx: number; by: number; bz: number; dir: 1 | -1; char: string };

/** Sample a ribbon of glyphs along every edge of a cube of half-extent `half`. */
function buildCube(half: number, dir: 1 | -1, perEdge: number): Point[] {
  const out: Point[] = [];
  for (const [a, b] of CUBE_EDGES) {
    const va = CUBE_VERTS[a];
    const vb = CUBE_VERTS[b];
    // The edge varies along exactly one axis; the other two carry the ribbon.
    const axis = vb[0] !== va[0] ? 0 : vb[1] !== va[1] ? 1 : 2;
    const perp = [0, 1, 2].filter((k) => k !== axis);
    for (let i = 0; i <= perEdge; i += 1) {
      const t = i / perEdge;
      const base = [
        (va[0] + (vb[0] - va[0]) * t) * half,
        (va[1] + (vb[1] - va[1]) * t) * half,
        (va[2] + (vb[2] - va[2]) * t) * half,
      ];
      for (const [oa, ob] of EDGE_OFFSETS) {
        const p = [base[0], base[1], base[2]];
        p[perp[0]] += oa * EDGE_THICK;
        p[perp[1]] += ob * EDGE_THICK;
        out.push({
          bx: p[0],
          by: p[1],
          bz: p[2],
          dir,
          char: CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)],
        });
      }
    }
  }
  return out;
}

/**
 * Two nested wireframe cubes drawn as a live ASCII field: each glyph is a
 * point on a cube edge, projected in perspective so near edges grow and
 * brighten. The outer and inner cubes counter-rotate around Y under a fixed
 * X tilt, and glyphs continuously re-scramble ("encrypting"). 2D canvas — no
 * WebGL. Honours reduced-motion (static) and pauses while off-screen.
 */
export function CubeField3D({ className, speed = 0.007, perEdge = 16 }: CubeField3DProps) {
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
    const points = [
      ...buildCube(0.5, 1, perEdge),
      ...buildCube(0.5 * INNER_RATIO, -1, innerEdge),
    ];
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
      scale = size * FILL;
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
        // rotate around Y — inner cube (dir -1) spins the opposite way
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
        // Near-uniform glyph size (perspective stays in the position, not the
        // type size) → clean and consistent like the persona cards.
        c2d.font = `500 ${(baseFont * (0.78 + 0.22 * d.s)).toFixed(2)}px ${monoFamily}`;
        // Snap to whole pixels so rotation never renders blurry sub-pixel text.
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
            p.char = CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
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
  }, [speed, perEdge]);

  return (
    <div ref={wrapRef} className={`glyph-field${className ? ` ${className}` : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} className="glyph-field__canvas" />
    </div>
  );
}
