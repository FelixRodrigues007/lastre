import { useEffect, useRef } from "react";
import "./glyph-field.css";

export type GlyphShape = "magnifier" | "blocks" | "shield" | "seal";

type GlyphFieldProps = {
  /** Which silhouette to render as a character mosaic. */
  shape: GlyphShape;
  className?: string;
  /** Mosaic resolution. Cols ≈ 2.1× rows keeps cells visually square. */
  cols?: number;
  rows?: number;
  /** Continuously re-scramble glyphs ("encrypting" churn), not just on hover. */
  animate?: boolean;
};

const CHAR_POOL = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

/* Continuous-scramble cadence: re-roll a slice of glyphs every few frames so
   the silhouette reads as live encryption rather than static ASCII art. */
const SCRAMBLE_EVERY = 3;
const SCRAMBLE_FRACTION = 0.06;

/* Monospace cell geometry (charW = fs·CW, lineH = fs·LH) — matches the paint
   step so the silhouette renders undistorted. */
const CW = 0.62;
const LH = 1.3;
const GLYPH_SCALE = 1.28;
const MAX_DPR = 2;

/* Cursor-repel + spring-return physics, ported from the cassator.com
   ascii-particles scatter (tuned lighter for small cards). */
const CURSOR_RADIUS = 130;
const CURSOR_FORCE = 1.4;
const RETURN_SPEED = 0.06;
const FRICTION = 0.78;
const MAX_DISPLACE = 64;

/** Deterministic pseudo-random in [0, 1) — keeps the char choice stable. */
function noise(seed: number): number {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

/** Shortest distance from point p to segment a→b, all in normalised space. */
function segmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  const t = lenSq ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function inRect(x: number, y: number, x0: number, y0: number, x1: number, y1: number): boolean {
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

/** Magnifier: a ring lens with a thick diagonal handle. */
function magnifier(x: number, y: number): boolean {
  const d = Math.hypot(x - 0.4, y - 0.38);
  const ring = d <= 0.3 && d >= 0.18;
  const handle = segmentDistance(x, y, 0.57, 0.55, 0.84, 0.86) < 0.06;
  return ring || handle;
}

/** Blocks: a pyramid of bricks — a thing being built. */
function blocks(x: number, y: number): boolean {
  const bottom =
    inRect(x, y, 0.06, 0.66, 0.3, 0.92) ||
    inRect(x, y, 0.38, 0.66, 0.62, 0.92) ||
    inRect(x, y, 0.7, 0.66, 0.94, 0.92);
  const middle = inRect(x, y, 0.22, 0.37, 0.46, 0.63) || inRect(x, y, 0.54, 0.37, 0.78, 0.63);
  const top = inRect(x, y, 0.38, 0.08, 0.62, 0.34);
  return bottom || middle || top;
}

/** Shield with the check carved out as negative space. */
function shield(x: number, y: number): boolean {
  const top = 0.1;
  const bottom = 0.92;
  const mid = 0.54;
  if (y < top || y > bottom) return false;
  let halfWidth = 0.34;
  if (y > mid) halfWidth = 0.34 * (1 - (y - mid) / (bottom - mid));
  if (y < top + 0.09) halfWidth *= (y - top) / 0.09; // round the shoulders
  const inside = Math.abs(x - 0.5) <= halfWidth;
  const check =
    segmentDistance(x, y, 0.33, 0.5, 0.45, 0.64) < 0.05 ||
    segmentDistance(x, y, 0.45, 0.64, 0.7, 0.32) < 0.05;
  return inside && !check;
}

/** Min distance from (x,y) to the closed polygon's edges, in normalised space. */
function polyRingDistance(x: number, y: number, pts: readonly (readonly [number, number])[]): number {
  let min = Infinity;
  for (let i = 0; i < pts.length; i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const d = segmentDistance(x, y, a[0], a[1], b[0], b[1]);
    if (d < min) min = d;
  }
  return min;
}

/* Lastre seal — pointy-top hexagon (outer lot + inner seal), a centred cross,
   and the on-chain node. Mirrors the SealMark SVG, normalised to 0–1. */
const SEAL_OUTER = [
  [0.5, 0.15], [0.8, 0.325], [0.8, 0.675], [0.5, 0.85], [0.2, 0.675], [0.2, 0.325],
] as const;
const SEAL_INNER = [
  [0.5, 0.294], [0.675, 0.397], [0.675, 0.603], [0.5, 0.706], [0.325, 0.603], [0.325, 0.397],
] as const;

function seal(x: number, y: number): boolean {
  const outer = polyRingDistance(x, y, SEAL_OUTER) < 0.038;
  const inner = polyRingDistance(x, y, SEAL_INNER) < 0.032;
  const cross =
    (Math.abs(y - 0.5) < 0.028 && x > 0.34 && x < 0.66) ||
    (Math.abs(x - 0.5) < 0.028 && y > 0.34 && y < 0.66);
  const node = Math.hypot(x - 0.5, y - 0.5) < 0.058;
  return outer || inner || cross || node;
}

const SHAPES: Record<GlyphShape, (x: number, y: number) => boolean> = {
  magnifier,
  blocks,
  shield,
  seal,
};

type Glyph = { col: number; row: number; char: string };
type Particle = { ox: number; oy: number; x: number; y: number; vx: number; vy: number; char: string };

/** Build the silhouette as a sparse list of filled cells (col, row, char). */
function buildGlyphs(shape: GlyphShape, cols: number, rows: number): Glyph[] {
  const filled = SHAPES[shape];
  const out: Glyph[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const nx = (col + 0.5) / cols;
      const ny = (row + 0.5) / rows;
      if (filled(nx, ny)) {
        const pick = Math.floor(noise(row * cols + col) * CHAR_POOL.length);
        out.push({ col, row, char: CHAR_POOL[pick] });
      }
    }
  }
  return out;
}

/**
 * Caret-style ASCII silhouette rendered as an animated particle field on a
 * 2D canvas (no WebGL → no GPU context budget). Each glyph repels from the
 * cursor and springs back, echoing the cassator.com scatter effect. Honours
 * reduced-motion (static paint) and pauses while off-screen.
 */
export function GlyphField({ shape, className, cols = 46, rows = 22, animate = false }: GlyphFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapEl = wrapRef.current;
    const canvasEl = canvasRef.current;
    if (!wrapEl || !canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    // Non-null aliases so the type survives into escaping closures (rAF,
    // event listeners) where TS would otherwise re-widen to `| null`.
    const wrap = wrapEl;
    const cnv = canvasEl;
    const c2d = context;

    const glyphs = buildGlyphs(shape, cols, rows);
    const rootStyle = getComputedStyle(document.documentElement);
    const monoFamily =
      rootStyle.getPropertyValue("--lastro-font-mono").trim() || "monospace";

    let particles: Particle[] = [];
    let cssW = 0;
    let cssH = 0;
    let fontPx = 12;
    let color = "rgb(126, 244, 208)";
    const mouse = { x: -9999, y: -9999, active: false };
    let raf = 0;
    let visible = true;
    let frame = 0;

    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function layout() {
      const box = wrap.getBoundingClientRect();
      const W = box.width;
      const H = box.height;
      if (!W || !H) return;
      color = getComputedStyle(wrap).color || color;

      // Largest font where the whole grid fits the box (contain).
      const FIT = 0.82;
      fontPx = Math.min(W / (cols * CW), H / (rows * LH)) * FIT;
      const charW = fontPx * CW;
      const lineH = fontPx * LH;
      const offX = (W - cols * charW) / 2;
      const offY = (H - rows * lineH) / 2;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      cnv.width = Math.round(W * dpr);
      cnv.height = Math.round(H * dpr);
      cnv.style.width = `${W}px`;
      cnv.style.height = `${H}px`;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      cssW = W;
      cssH = H;

      const prev = particles;
      particles = glyphs.map((g, i) => {
        const ox = offX + g.col * charW + charW / 2;
        const oy = offY + g.row * lineH;
        const p = prev[i];
        return { ox, oy, x: p ? p.x : ox, y: p ? p.y : oy, vx: 0, vy: 0, char: g.char };
      });
    }

    function paint() {
      c2d.clearRect(0, 0, cssW, cssH);
      const drawFs = fontPx * GLYPH_SCALE;
      const off = (fontPx - drawFs) / 2;
      c2d.font = `500 ${drawFs}px ${monoFamily}`;
      c2d.textBaseline = "top";
      c2d.textAlign = "center";
      c2d.fillStyle = color;
      for (const p of particles) c2d.fillText(p.char, p.x, p.y + off);
    }

    function step() {
      raf = 0;
      let moving = false;
      const rad = CURSOR_RADIUS;
      // Continuous "encrypting" churn: re-roll a slice of glyphs each cadence.
      if (animate) {
        frame += 1;
        if (frame % SCRAMBLE_EVERY === 0) {
          for (const p of particles) {
            if (Math.random() < SCRAMBLE_FRACTION) {
              p.char = CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
            }
          }
        }
      }
      for (const p of particles) {
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < rad * rad && dSq > 0) {
            const dist = Math.sqrt(dSq);
            const f = (rad - dist) / rad;
            const ang = Math.atan2(dy, dx);
            const str = f * f * CURSOR_FORCE * 0.5;
            p.vx += Math.cos(ang) * str;
            p.vy += Math.sin(ang) * str;
          }
        }
        // spring back to origin + friction
        p.vx += (p.ox - p.x) * RETURN_SPEED;
        p.vy += (p.oy - p.y) * RETURN_SPEED;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;
        // clamp displacement so a cursor flick can't fling glyphs off-shape
        const ddx = p.x - p.ox;
        const ddy = p.y - p.oy;
        const dd = ddx * ddx + ddy * ddy;
        if (dd > MAX_DISPLACE * MAX_DISPLACE) {
          const d = Math.sqrt(dd);
          p.x = p.ox + (ddx / d) * MAX_DISPLACE;
          p.y = p.oy + (ddy / d) * MAX_DISPLACE;
          p.vx *= 0.5;
          p.vy *= 0.5;
        }
        if (!moving && (Math.abs(p.vx) > 0.01 || Math.abs(p.vy) > 0.01 || dd > 0.1)) {
          moving = true;
        }
      }
      paint();
      if (visible && (moving || mouse.active || animate)) raf = requestAnimationFrame(step);
    }

    function wake() {
      if (!raf && visible && !reduce) raf = requestAnimationFrame(step);
    }

    function onPointerMove(e: PointerEvent) {
      const box = cnv.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      const pad = CURSOR_RADIUS;
      mouse.active = x > -pad && x < box.width + pad && y > -pad && y < box.height + pad;
      mouse.x = x;
      mouse.y = y;
      if (mouse.active) wake();
    }

    function onPointerLeave() {
      mouse.active = false;
      wake();
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

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [shape, cols, rows, animate]);

  return (
    <div ref={wrapRef} className={`glyph-field${className ? ` ${className}` : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} className="glyph-field__canvas" />
    </div>
  );
}
