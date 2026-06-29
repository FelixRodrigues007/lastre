import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import type { COBEOptions } from "cobe";

const MAX_DPR = 2;
const AUTO_SPIN = 0.003;
const DRAG_SENSITIVITY = 0.005;

/** Mutable per-frame state cobe passes to onRender (not in published types). */
type GlobeRenderState = { phi: number; width: number; height: number };
type GlobeInit = COBEOptions & { onRender: (state: GlobeRenderState) => void };

/** Brand olive palette over the olive-950 stage — no markers, no arcs. */
const GLOBE_OPTIONS: Omit<COBEOptions, "width" | "height" | "phi" | "devicePixelRatio"> = {
  dark: 1,
  diffuse: 1.1,
  mapSamples: 16000,
  mapBrightness: 5,
  baseColor: [0.19, 0.31, 0.27], // #314e44 — medium olive
  glowColor: [0.37, 0.49, 0.44], // #5e7d70 — light olive glow
  markerColor: [0.37, 0.49, 0.44],
  markers: [],
  theta: 0.25,
  scale: 1,
  offset: [0, 0],
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Premium 3D globe (cobe), slowly auto-rotating with optional drag. Decorative. */
export function TrustGlobeVisual() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const reduceMotion = prefersReducedMotion();

    // Mutable render state shared with cobe's onRender loop.
    let phi = 0;
    let widthPx = 0;
    let heightPx = 0;

    // Pointer-drag state.
    let pointerDownX: number | null = null;
    let dragOffset = 0;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      // Square globe sized to the limiting dimension, centred in the stage.
      const side = Math.min(rect.width, rect.height);
      widthPx = Math.max(1, Math.round(side * dpr));
      heightPx = widthPx;
      canvas.width = widthPx;
      canvas.height = heightPx;
    };

    measure();

    const initOptions: GlobeInit = {
      ...GLOBE_OPTIONS,
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, MAX_DPR),
      width: widthPx,
      height: heightPx,
      phi: 0,
      onRender: (state) => {
        if (!reduceMotion && pointerDownX === null) {
          phi += AUTO_SPIN;
        }
        state.phi = phi + dragOffset;
        state.width = widthPx;
        state.height = heightPx;
      },
    };

    const globe = createGlobe(canvas, initOptions);

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(stage);

    // Drag to rotate (pauses auto-spin while held).
    const onPointerDown = (event: PointerEvent) => {
      pointerDownX = event.clientX - dragOffset / DRAG_SENSITIVITY;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (pointerDownX === null) return;
      dragOffset = (event.clientX - pointerDownX) * DRAG_SENSITIVITY;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (pointerDownX === null) return;
      // Fold the drag into phi so auto-spin resumes from the current angle.
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

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      globe.destroy();
    };
  }, []);

  return (
    <div className="trust-globe" aria-hidden="true">
      <div className="trust-globe__stage" ref={stageRef}>
        <canvas className="trust-globe__canvas" ref={canvasRef} />
      </div>
    </div>
  );
}
