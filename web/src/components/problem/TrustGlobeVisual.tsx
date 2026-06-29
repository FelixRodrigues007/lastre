import { useEffect, useRef } from "react";
import { DitherField } from "../visual/DitherField";

const MAX_DPR = 2;
/** Radians added to the spin each frame (~one slow revolution). */
const AUTO_SPIN = 0.0022;
const DRAG_SENSITIVITY = 0.006;
/** Extra rotation driven by page scroll position (radians per pixel scrolled). */
const SCROLL_SENSITIVITY = 0.0016;
/** Fixed tilt so the globe is seen slightly from above. */
const TILT_X = 0.38;
/** Sphere fills this fraction of the limiting canvas dimension. */
const RADIUS_RATIO = 0.46;
/** Glyph height as a fraction of the canvas side. */
const FONT_RATIO = 0.0155;
/** Candidate points sampled over the sphere; only those on land keep a glyph. */
const SAMPLE_COUNT = 8200;

/** Same character set + churn cadence as the brand seal field (CubeField3D). */
const CHAR_POOL = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
const SCRAMBLE_EVERY = 3;
const SCRAMBLE_FRACTION = 0.04;
/** Soft white — the glyphs read as a luminous network, not harsh pure white. */
const GLYPH_RGB = "238, 244, 239";

/** Land/water mask (land = dark, water = white) sampled to place glyphs. */
const WORLD_MASK_SRC = "/media/world-land.png";
const LAND_THRESHOLD = 110;
/** Ocean glyphs are kept but dimmed so continents read as the bright network. */
const OCEAN_DIM = 0.22;

type Glyph = { x: number; y: number; z: number; char: string; land: boolean };

function randChar(): string {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Globe drawn as a rotating field of monospace glyphs that trace the real
 * continents — the brand seal's "encrypting" character treatment wrapped onto
 * the world map, in soft white. Land positions come from an equirectangular
 * land mask sampled at mount; ocean points are dropped so the shapes read.
 *
 * Canvas 2D (no WebGL): the page already runs several WebGL shaders and browsers
 * hard-cap concurrent contexts, so a GL globe loses its slot and goes blank.
 */
export function TrustGlobeVisual() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = prefersReducedMotion();
    const tiltSin = Math.sin(TILT_X);
    const tiltCos = Math.cos(TILT_X);
    const monoFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--lastro-font-mono").trim() ||
      "monospace";

    // Glyphs are built once the land mask loads; until then the globe is empty.
    let glyphs: Glyph[] = [];
    let raf = 0;
    let frame = 0;
    let phi = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    let side = 0;

    // Pointer-drag state.
    let pointerDownX: number | null = null;
    let dragOffset = 0;
    // Scroll-driven rotation: tracks the page scroll position so the globe also
    // turns as the visitor scrolls, on top of the auto-spin.
    let scrollRot = window.scrollY * SCROLL_SENSITIVITY;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      side = Math.min(rect.width, rect.height);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };

    // Build a glyph for every sphere point; tag land vs ocean from the mask.
    const buildGlyphs = (mask: ImageData) => {
      const { width: mw, height: mh, data } = mask;
      const golden = Math.PI * (3 - Math.sqrt(5));
      const built: Glyph[] = [];
      for (let i = 0; i < SAMPLE_COUNT; i += 1) {
        const y = 1 - (i / (SAMPLE_COUNT - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = golden * i;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        // Sphere point → lat/long → equirectangular pixel.
        const lat = Math.asin(Math.max(-1, Math.min(1, y)));
        const lng = Math.atan2(z, x);
        const u = (lng + Math.PI) / (2 * Math.PI);
        const v = (Math.PI / 2 - lat) / Math.PI;
        const px = Math.min(mw - 1, Math.max(0, Math.round(u * (mw - 1))));
        const py = Math.min(mh - 1, Math.max(0, Math.round(v * (mh - 1))));
        const lum = data[(py * mw + px) * 4]; // R channel (grayscale mask)
        built.push({ x, y, z, char: randChar(), land: lum < LAND_THRESHOLD });
      }
      glyphs = built;
    };

    const scramble = () => {
      for (let i = 0; i < glyphs.length; i += 1) {
        if (Math.random() < SCRAMBLE_FRACTION) glyphs[i].char = randChar();
      }
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const radius = side * RADIUS_RATIO * dpr;
      const cx = w / 2;
      const cy = h / 2;
      const fontPx = Math.max(6, side * FONT_RATIO * dpr);

      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const angle = phi + scrollRot + dragOffset;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      for (const g of glyphs) {
        const x1 = g.x * cos + g.z * sin;
        const z1 = -g.x * sin + g.z * cos;
        const y2 = g.y * tiltCos - z1 * tiltSin;
        const z2 = g.y * tiltSin + z1 * tiltCos;

        const depth = (z2 + 1) / 2; // 0 far → 1 near
        const baseAlpha = 0.16 + depth * 0.78;
        const alpha = g.land ? baseAlpha : baseAlpha * OCEAN_DIM;
        ctx.font = `500 ${(fontPx * (0.72 + 0.28 * depth)).toFixed(2)}px ${monoFamily}`;
        ctx.fillStyle = `rgba(${GLYPH_RGB}, ${alpha.toFixed(3)})`;
        // Canvas Y grows downward, so subtract to put the north pole up top.
        ctx.fillText(g.char, Math.round(cx + x1 * radius), Math.round(cy - y2 * radius));
      }
    };

    const tick = () => {
      if (pointerDownX === null) phi += AUTO_SPIN;
      frame += 1;
      if (frame % SCRAMBLE_EVERY === 0) scramble();
      render();
      raf = requestAnimationFrame(tick);
    };

    let started = false;
    const start = () => {
      if (reduceMotion) {
        render();
        return;
      }
      if (started) return;
      started = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      started = false;
    };

    // Load the land mask, sample it, then build the continents.
    const img = new Image();
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;
      offCtx.drawImage(img, 0, 0);
      buildGlyphs(offCtx.getImageData(0, 0, off.width, off.height));
      render();
    };
    img.src = WORLD_MASK_SRC;

    // Drag to rotate (pauses auto-spin while held).
    const onPointerDown = (event: PointerEvent) => {
      pointerDownX = event.clientX - dragOffset / DRAG_SENSITIVITY;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (pointerDownX === null) return;
      dragOffset = (event.clientX - pointerDownX) * DRAG_SENSITIVITY;
      if (reduceMotion) render();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (pointerDownX === null) return;
      phi += dragOffset;
      dragOffset = 0;
      pointerDownX = null;
      canvas.style.cursor = "grab";
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    if (!reduceMotion) {
      canvas.style.cursor = "grab";
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
    }

    const onScroll = () => {
      scrollRot = window.scrollY * SCROLL_SENSITIVITY;
      // Reduced motion has no RAF loop — repaint the one frame on scroll.
      if (reduceMotion) render();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      measure();
      if (reduceMotion) render();
    });
    resizeObserver.observe(stage);

    // Only animate while near the viewport.
    let intersectionObserver: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => (entry?.isIntersecting ? start() : stop()),
        { rootMargin: "200px 0px", threshold: 0 },
      );
      intersectionObserver.observe(stage);
    } else {
      start();
    }

    measure();

    return () => {
      stop();
      intersectionObserver?.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      img.onload = null;
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div className="trust-globe" aria-hidden="true">
      <div className="trust-globe__stage" ref={stageRef}>
        {/* Colored dithered field (CSS, always paints) behind the glyph globe. */}
        <DitherField variant="seal" className="trust-globe__dither" />
        <canvas className="trust-globe__canvas" ref={canvasRef} />
      </div>
    </div>
  );
}
