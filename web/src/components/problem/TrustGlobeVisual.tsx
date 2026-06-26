import { useEffect, useRef } from "react";

type LatLng = readonly [lat: number, lng: number];

type OrbitNode = {
  id: string;
  lat: number;
  lng: number;
  kind: "claim" | "agent" | "sensor";
  anchor: { x: number; y: number };
};

const ORBIT_NODES: OrbitNode[] = [
  { id: "nyc", lat: 40.7, lng: -74, kind: "claim", anchor: { x: 1.34, y: 0.88 } },
  { id: "lon", lat: 51.5, lng: -0.1, kind: "agent", anchor: { x: 1.38, y: 0.42 } },
  { id: "sp", lat: -23.5, lng: -46.6, kind: "sensor", anchor: { x: 1.32, y: 1.18 } },
];

function hash2(a: number, b: number): number {
  const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

/** Simplified land mask — continent sampling for dotted globe. */
function isLand(lat: number, lng: number): boolean {
  const n = ((lng + 180) % 360) - 180;

  if (lat >= 49 && lat <= 72 && n >= -168 && n <= -52) return true;
  if (lat >= 24 && lat <= 49 && n >= -125 && n <= -66) return true;
  if (lat >= 14 && lat <= 32 && n >= -118 && n <= -86) return true;
  if (lat >= 7 && lat <= 20 && n >= -92 && n <= -77) return true;
  if (lat >= 18 && lat <= 30 && n >= -105 && n <= -80) return n < -82 || lat > 22;

  if (lat >= -56 && lat <= 13 && n >= -82 && n <= -34) return true;

  if (lat >= 36 && lat <= 71 && n >= -10 && n <= 32) return true;
  if (lat >= 50 && lat <= 60 && n >= -6 && n <= 2) return true;
  if (lat >= 55 && lat <= 72 && n >= 22 && n <= 32) return false;

  if (lat >= -35 && lat <= 37 && n >= -18 && n <= 52) return true;
  if (lat >= 4 && lat <= 16 && n >= -18 && n <= 16) return true;

  if (lat >= 10 && lat <= 55 && n >= 35 && n <= 145) return true;
  if (lat >= 55 && lat <= 77 && n >= 40 && n <= 180) return true;
  if (lat >= 55 && lat <= 72 && n >= -170 && n <= -130) return true;
  if (lat >= 30 && lat <= 46 && n >= 129 && n <= 146) return true;
  if (lat >= -8 && lat <= 6 && n >= 95 && n <= 141) return true;
  if (lat >= 12 && lat <= 28 && n >= 68 && n <= 92) return true;

  if (lat >= -44 && lat <= -10 && n >= 113 && n <= 154) return true;
  if (lat >= -47 && lat <= -34 && n >= 166 && n <= 179) return true;

  if (lat >= 60 && lat <= 72 && n >= -75 && n <= -12) return true;

  return false;
}

function generateLandPoints(): LatLng[] {
  const points: LatLng[] = [];
  const step = 1.65;

  for (let lat = -58; lat <= 76; lat += step) {
    for (let lng = -180; lng < 180; lng += step) {
      if (!isLand(lat, lng)) continue;
      const jitter = step * 0.42;
      points.push([
        lat + (hash2(lat, lng) - 0.5) * jitter,
        lng + (hash2(lng, lat) - 0.5) * jitter,
      ]);
    }
  }

  return points;
}

function project(
  lat: number,
  lng: number,
  rotY: number,
  radius: number,
  cx: number,
  cy: number,
) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + rotY) * Math.PI) / 180;

  const x3 = Math.sin(phi) * Math.cos(theta);
  const y3 = Math.cos(phi);
  const z3 = Math.sin(phi) * Math.sin(theta);

  return {
    x: cx + x3 * radius,
    y: cy - y3 * radius,
    z: z3,
  };
}

const LAND_POINTS = generateLandPoints();

function ClaimGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M3.5 4.5h7M3.5 7h4.5M3.5 9.5h5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.5 6.5l2 1.25-2 1.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AgentGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="4.5" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.5 12c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SensorGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="2" fill="currentColor" />
      <path
        d="M7 1.5v1.5M7 11v1.5M1.5 7H3M11 7h1.5M3.05 3.05l1.06 1.06M9.89 9.89l1.06 1.06M3.05 10.95l1.06-1.06M9.89 4.11l1.06-1.06"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Decorative spinning dotted globe — global trust gap without proof of origin. */
export function TrustGlobeVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rotationRef = useRef(0);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawGraticule = (
      cx: number,
      cy: number,
      radius: number,
      rotY: number,
    ) => {
      const latitudes = [-60, -30, 0, 30, 60];
      for (const lat of latitudes) {
        const pts: Array<{ x: number; y: number; z: number }> = [];
        for (let lng = -180; lng <= 180; lng += 6) {
          pts.push(project(lat, lng, rotY, radius, cx, cy));
        }
        ctx.beginPath();
        let started = false;
        for (const p of pts) {
          if (p.z < -0.08) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = "rgba(231, 230, 208, 0.045)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let lng = -150; lng < 180; lng += 30) {
        const pts: Array<{ x: number; y: number; z: number }> = [];
        for (let lat = -80; lat <= 80; lat += 4) {
          pts.push(project(lat, lng, rotY, radius, cx, cy));
        }
        ctx.beginPath();
        let started = false;
        for (const p of pts) {
          if (p.z < -0.05) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = "rgba(231, 230, 208, 0.035)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const drawArcs = (
      cx: number,
      cy: number,
      radius: number,
      rotY: number,
      w: number,
    ) => {
      for (const node of ORBIT_NODES) {
        const p = project(node.lat, node.lng, rotY, radius, cx, cy);
        if (p.z < -0.12) continue;

        const nx = cx + (p.x - cx) * node.anchor.x + w * 0.04;
        const ny = cy + (p.y - cy) * node.anchor.y;
        const cpx = (p.x + nx) * 0.5 + 12;
        const cpy = (p.y + ny) * 0.5 - 28;

        const grad = ctx.createLinearGradient(p.x, p.y, nx, ny);
        grad.addColorStop(0, "rgba(254, 241, 111, 0.55)");
        grad.addColorStop(1, "rgba(254, 241, 111, 0.12)");

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.25;
        ctx.shadowColor = "rgba(254, 241, 111, 0.35)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(cpx, cpy, nx, ny);
        ctx.stroke();
        ctx.restore();

        const el = nodeRefs.current[node.id];
        if (el) {
          const visible = p.z > -0.12;
          el.style.opacity = visible ? String(0.35 + p.z * 0.65) : "0";
          el.style.transform = `translate(calc(${nx}px - 50%), calc(${ny}px - 50%))`;
          el.style.pointerEvents = visible ? "auto" : "none";
        }
      }
    };

    const draw = () => {
      if (!running) return;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w * 0.46;
      const cy = h * 0.54;
      const radius = Math.min(w, h) * 0.34;

      ctx.clearRect(0, 0, w, h);

      const rotY = rotationRef.current;

      const sphereShade = ctx.createRadialGradient(
        cx - radius * 0.28,
        cy - radius * 0.32,
        radius * 0.1,
        cx,
        cy,
        radius * 1.02,
      );
      sphereShade.addColorStop(0, "rgba(38, 41, 22, 0.55)");
      sphereShade.addColorStop(0.55, "rgba(18, 20, 7, 0.82)");
      sphereShade.addColorStop(1, "rgba(18, 20, 7, 0.2)");
      ctx.fillStyle = sphereShade;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.99, 0, Math.PI * 2);
      ctx.fill();

      const rim = ctx.createRadialGradient(cx, cy, radius * 0.84, cx, cy, radius * 1.02);
      rim.addColorStop(0, "rgba(254, 241, 111, 0)");
      rim.addColorStop(0.72, "rgba(111, 143, 46, 0.08)");
      rim.addColorStop(1, "rgba(254, 241, 111, 0.18)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.02, 0, Math.PI * 2);
      ctx.fill();

      drawGraticule(cx, cy, radius, rotY);

      const projected = LAND_POINTS.map(([lat, lng]) =>
        project(lat, lng, rotY, radius, cx, cy),
      ).sort((a, b) => a.z - b.z);

      for (const p of projected) {
        const depth = (p.z + 1) * 0.5;
        if (depth < 0.12) continue;

        const alpha = 0.08 + depth * 0.88;
        const size = 0.85 + depth * 1.35;

        ctx.save();
        if (depth > 0.55) {
          ctx.shadowColor = "rgba(254, 241, 111, 0.45)";
          ctx.shadowBlur = 3.5;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 241, 111, ${alpha})`;
        ctx.fill();
        ctx.restore();
      }

      ctx.strokeStyle = "rgba(254, 241, 111, 0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      drawArcs(cx, cy, radius, rotY, w);

      if (!reducedMotion) {
        rotationRef.current += 0.14;
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="trust-globe" aria-hidden="true">
      <div className="trust-globe__stage">
        <div className="trust-globe__grid" />
        <div className="trust-globe__rings" />
        <span className="trust-globe__reticle trust-globe__reticle--tl" />
        <span className="trust-globe__reticle trust-globe__reticle--tr" />
        <span className="trust-globe__reticle trust-globe__reticle--bl" />
        <span className="trust-globe__reticle trust-globe__reticle--br" />

        <canvas ref={canvasRef} className="trust-globe__canvas" />

        <div className="trust-globe__nodes">
          {ORBIT_NODES.map((node) => (
            <div
              key={node.id}
              ref={(el) => {
                nodeRefs.current[node.id] = el;
              }}
              className={`trust-globe__node trust-globe__node--${node.kind}`}
            >
              <span className="trust-globe__node-icon">
                {node.kind === "claim" ? (
                  <ClaimGlyph />
                ) : node.kind === "agent" ? (
                  <AgentGlyph />
                ) : (
                  <SensorGlyph />
                )}
              </span>
              <span className="trust-globe__node-pulse" />
            </div>
          ))}
        </div>

        <blockquote className="trust-globe__callout">
          <span className="trust-globe__callout-corner trust-globe__callout-corner--tl" />
          <span className="trust-globe__callout-corner trust-globe__callout-corner--tr" />
          <span className="trust-globe__callout-corner trust-globe__callout-corner--bl" />
          <span className="trust-globe__callout-corner trust-globe__callout-corner--br" />
          <p>
            Physical readings flow worldwide — yet almost none carry{" "}
            <strong>proof of origin</strong>.
          </p>
        </blockquote>
      </div>
    </div>
  );
}
