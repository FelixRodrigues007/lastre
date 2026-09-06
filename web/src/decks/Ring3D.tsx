import { useEffect, useRef, useState, type CSSProperties } from "react";
import * as THREE from "three";
import type { DeckLocale as Locale } from "./types";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  Ring,
  SECTORS,
  CENTER_R,
  DOT_R,
  INNER_R,
  OUTER_R,
  WEDGE,
  LABEL_R,
  type SectorId,
} from "./Ring";

const S = 0.01;
const rCenter = CENTER_R * S;
const rDot = DOT_R * S;
const rInner = INNER_R * S;
const rOuter = OUTER_R * S;
const rLabel = LABEL_R * S;
const wedgeDepth = 0.22;
const coreHeight = 0.34;
const coreTop = coreHeight;
const litLift = 0.12;
const LIT_MS = 420;
const ENTRY_MS = 900;
const LABEL_ENTRY_MS = 420;
const LABEL_ENTRY_DELAY = 450;
const SLIDE_ROT_STEP = (52 * Math.PI) / 180;
const EDGE_THRESHOLD = 22;
const LIT_FILL_OPACITY = 0.35;

const CHAIN: SectorId[] = ["origem", "mercado", "capital", "defi"];

let accumulatedRotationY = 0;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const polar3D = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: r * Math.cos(rad), z: r * Math.sin(rad) };
};

const nameFontSize = (name: string) => {
  const wedgeWidth = 2 * LABEL_R * Math.sin((WEDGE / 2) * (Math.PI / 180));
  const est = name.length * 14;
  if (est <= wedgeWidth * 0.92) return 26;
  if (est <= wedgeWidth * 1.15) return 20;
  return 16;
};

type DkColors = {
  fg: THREE.Color;
  mint: THREE.Color;
  accent: THREE.Color;
  dim: THREE.Color;
  line: THREE.Color;
};

const readColors = (el: HTMLElement): DkColors => {
  const cs = getComputedStyle(el);
  const c = (token: string) => new THREE.Color(cs.getPropertyValue(token).trim());
  return {
    fg: c("--dk-fg"),
    mint: c("--dk-mint"),
    accent: c("--dk-accent"),
    dim: c("--dk-dim"),
    line: c("--dk-line"),
  };
};

const wedgeShape = (centerDeg: number, spanDeg: number) => {
  const a0 = ((centerDeg - spanDeg / 2) * Math.PI) / 180;
  const a1 = ((centerDeg + spanDeg / 2) * Math.PI) / 180;
  const shape = new THREE.Shape();
  shape.moveTo(rOuter * Math.cos(a0), rOuter * Math.sin(a0));
  shape.absarc(0, 0, rOuter, a0, a1, false);
  shape.lineTo(rInner * Math.cos(a1), rInner * Math.sin(a1));
  shape.absarc(0, 0, rInner, a1, a0, true);
  shape.closePath();
  return shape;
};

const bladeGeometry = (centerDeg: number, spanDeg: number, depth: number) => {
  const geo = new THREE.ExtrudeGeometry(wedgeShape(centerDeg, spanDeg), {
    depth,
    bevelEnabled: false,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, depth, 0);
  return geo;
};

const sectorLit = (lit: SectorId[] | undefined, id: SectorId) =>
  lit === undefined || lit.includes(id);

type SectorMeshes = {
  group: THREE.Group;
  fillMat: THREE.MeshBasicMaterial;
  edgeMat: THREE.LineBasicMaterial;
  from: { fill: number; edge: number; lift: number };
  to: { fill: number; edge: number; lift: number };
  current: { fill: number; edge: number; lift: number };
};

type SceneHandle = {
  sectorMeshes: SectorMeshes[];
  chainMats: THREE.MeshBasicMaterial[];
  crossMats: THREE.LineDashedMaterial[];
  rootGroup: THREE.Group;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  litStart: number;
  mountTime: number;
  entryStart: number | null;
  entryFromRotY: number;
  entryToRotY: number;
  ensureLoop: () => void;
  projectLabels: (now: number) => void;
};

type Props = {
  lit?: SectorId[];
  locale: Locale;
  labels?: boolean;
};

const labelSectors = (lit: SectorId[] | undefined, labels: boolean) => {
  if (labels === false || lit === undefined || lit.length === 0) return [];
  return SECTORS.filter((s) => lit.includes(s.id));
};

export function Ring3D({ lit, locale, labels = true }: Props) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Partial<Record<SectorId, HTMLSpanElement | null>>>({});
  const calloutRefs = useRef<Partial<Record<SectorId, SVGLineElement | null>>>({});
  const sceneRef = useRef<SceneHandle | null>(null);
  const litRef = useRef(lit);
  litRef.current = lit;
  const [fallback, setFallback] = useState(false);

  const pt = locale === "pt";
  const dimmed = lit?.length === 0;
  const allLit = lit === undefined;
  const visibleLabels = labelSectors(lit, labels);

  const chainOpacity = dimmed ? 0.62 : allLit ? 0.78 : 0.5;
  const crossOpacity = dimmed ? 0.28 : allLit ? 0.38 : 0.32;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.OrthographicCamera | null = null;
    let rootGroup: THREE.Group | null = null;
    let sectorMeshes: SectorMeshes[] = [];
    let chainMats: THREE.MeshBasicMaterial[] = [];
    let crossMats: THREE.LineDashedMaterial[] = [];
    let raf = 0;
    let mountRaf = 0;
    let resizeObs: ResizeObserver | null = null;
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];
    const vec = new THREE.Vector3();

    const track = <T extends THREE.BufferGeometry | THREE.Material>(obj: T): T => {
      disposables.push(obj);
      return obj;
    };

    const colors = readColors(container);

    const entryFromRotY = accumulatedRotationY;
    const entryToRotY = accumulatedRotationY + SLIDE_ROT_STEP;
    accumulatedRotationY = entryToRotY;
    const mountTime = performance.now();
    const entryStart = reduced ? null : mountTime;

    const applyLitTargets = (handle: SceneHandle, litProp: SectorId[] | undefined) => {
      handle.litStart = performance.now();
      handle.sectorMeshes.forEach((sm, i) => {
        const on = sectorLit(litProp, SECTORS[i].id);
        sm.from = { ...sm.current };
        sm.to = {
          fill: on ? LIT_FILL_OPACITY : 0,
          edge: on ? 1 : 0.22,
          lift: on ? litLift : 0,
        };
        sm.edgeMat.color.copy(on ? colors.accent : colors.fg);
      });
      const dim = litProp?.length === 0;
      const all = litProp === undefined;
      const cOp = dim ? 0.62 : all ? 0.78 : 0.5;
      const xOp = dim ? 0.28 : all ? 0.38 : 0.32;
      handle.chainMats.forEach((m) => {
        m.opacity = cOp;
      });
      handle.crossMats.forEach((m) => {
        m.opacity = xOp;
      });
    };

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      container.insertBefore(renderer.domElement, container.firstChild);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
      const cam = camera;
      cam.position.set(4.0, 4.2, 6.0);
      cam.lookAt(0, 0, 0);

      rootGroup = new THREE.Group();
      const ring = rootGroup;
      ring.rotation.x = -0.05;
      ring.rotation.z = 0;
      if (reduced) {
        ring.rotation.y = entryToRotY;
        ring.position.y = 0;
      } else {
        ring.rotation.y = entryFromRotY;
        ring.position.y = 0.15;
      }
      scene.add(ring);

      sectorMeshes = SECTORS.map((sector) => {
        const on = sectorLit(lit, sector.id);
        const geo = track(bladeGeometry(sector.angle, WEDGE, wedgeDepth));

        const fillMat = track(
          new THREE.MeshBasicMaterial({
            color: colors.mint,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          }),
        );
        const mesh = new THREE.Mesh(geo, fillMat);
        const edgeMat = track(
          new THREE.LineBasicMaterial({
            color: on ? colors.accent : colors.fg,
            transparent: true,
            opacity: 0.22,
          }),
        );
        const edges = new THREE.LineSegments(
          track(new THREE.EdgesGeometry(geo, EDGE_THRESHOLD)),
          edgeMat,
        );
        const group = new THREE.Group();
        group.add(mesh, edges);
        ring.add(group);

        const state: SectorMeshes = {
          group,
          fillMat,
          edgeMat,
          from: { fill: 0, edge: 0.22, lift: 0 },
          to: {
            fill: on ? LIT_FILL_OPACITY : 0,
            edge: on ? 1 : 0.22,
            lift: on ? litLift : 0,
          },
          current: {
            fill: on ? LIT_FILL_OPACITY : 0,
            edge: on ? 1 : 0.22,
            lift: on ? litLift : 0,
          },
        };
        fillMat.opacity = state.current.fill;
        edgeMat.opacity = state.current.edge;
        group.position.y = state.current.lift;
        return state;
      });

      const coreGeo = track(
        new THREE.CylinderGeometry(rCenter, rCenter, coreHeight, 64, 1, false),
      );
      coreGeo.translate(0, coreHeight / 2, 0);
      const coreMat = track(new THREE.MeshBasicMaterial({ color: colors.fg }));
      ring.add(new THREE.Mesh(coreGeo, coreMat));

      for (let i = 0; i < 8; i++) {
        const angle = -90 + i * 45;
        const p = polar3D(rDot, angle);
        const dot = new THREE.Mesh(
          track(new THREE.SphereGeometry(0.035, 8, 8)),
          track(new THREE.MeshBasicMaterial({ color: colors.accent })),
        );
        dot.position.set(p.x, coreTop, p.z);
        ring.add(dot);
      }

      const ringPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(rDot * Math.cos(a), coreTop, rDot * Math.sin(a)));
      }
      const ringGeo = track(new THREE.BufferGeometry().setFromPoints(ringPts));
      const ringMat = track(
        new THREE.LineDashedMaterial({
          color: colors.line,
          dashSize: 0.03,
          gapSize: 0.05,
        }),
      );
      const ringLine = new THREE.Line(ringGeo, ringMat);
      ringLine.computeLineDistances();
      ring.add(ringLine);

      const makeTube = (start: THREE.Vector3, ctrl: THREE.Vector3, end: THREE.Vector3) => {
        const curve = new THREE.QuadraticBezierCurve3(start, ctrl, end);
        const tubeGeo = track(new THREE.TubeGeometry(curve, 40, 0.014, 6, false));
        const mat = track(
          new THREE.MeshBasicMaterial({
            color: colors.accent,
            transparent: true,
            opacity: chainOpacity,
          }),
        );
        chainMats.push(mat);
        ring.add(new THREE.Mesh(tubeGeo, mat));
      };

      for (let i = 0; i < CHAIN.length; i++) {
        const sector = SECTORS.find((s) => s.id === CHAIN[i])!;
        const edge = polar3D(rInner + 0.18, sector.angle);
        const mid = polar3D((rInner + rCenter) / 2 + 0.12, sector.angle);
        makeTube(
          new THREE.Vector3(edge.x, coreTop, edge.z),
          new THREE.Vector3(mid.x, 0.5, mid.z),
          new THREE.Vector3(0, coreTop * 0.5, 0),
        );
        if (i < CHAIN.length - 1 && !dimmed) {
          const next = SECTORS.find((s) => s.id === CHAIN[i + 1])!;
          const nextEdge = polar3D(rInner + 0.18, next.angle);
          const midOut = polar3D((rInner + rCenter) / 2 + 0.12, next.angle);
          makeTube(
            new THREE.Vector3(0, coreTop * 0.5, 0),
            new THREE.Vector3(midOut.x, 0.5, midOut.z),
            new THREE.Vector3(nextEdge.x, coreTop, nextEdge.z),
          );
        }
      }

      for (const s of SECTORS.filter((x) => x.crossCut)) {
        const edge = polar3D(rInner + 0.22, s.angle);
        const pts = [
          new THREE.Vector3(edge.x, coreTop, edge.z),
          new THREE.Vector3(0, coreTop * 0.5, 0),
        ];
        const lineGeo = track(new THREE.BufferGeometry().setFromPoints(pts));
        const lineMat = track(
          new THREE.LineDashedMaterial({
            color: colors.dim,
            dashSize: 0.04,
            gapSize: 0.05,
            transparent: true,
            opacity: crossOpacity,
          }),
        );
        crossMats.push(lineMat);
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        ring.add(line);
      }

      const FRUSTUM_MARGIN = 0.06;
      const LABEL_PAD = 8;
      const bounds = new THREE.Box3();
      const viewCorner = new THREE.Vector3();
      const boxCorners = [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ];

      const fitFrustum = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;

        ring.updateMatrixWorld(true);
        bounds.setFromObject(ring);
        const { min, max } = bounds;
        boxCorners[0].set(min.x, min.y, min.z);
        boxCorners[1].set(max.x, min.y, min.z);
        boxCorners[2].set(min.x, max.y, min.z);
        boxCorners[3].set(max.x, max.y, min.z);
        boxCorners[4].set(min.x, min.y, max.z);
        boxCorners[5].set(max.x, min.y, max.z);
        boxCorners[6].set(min.x, max.y, max.z);
        boxCorners[7].set(max.x, max.y, max.z);

        cam.updateMatrixWorld(true);
        let minViewX = Infinity;
        let maxViewX = -Infinity;
        let minViewY = Infinity;
        let maxViewY = -Infinity;
        for (let i = 0; i < 8; i++) {
          viewCorner.copy(boxCorners[i]).applyMatrix4(cam.matrixWorldInverse);
          minViewX = Math.min(minViewX, viewCorner.x);
          maxViewX = Math.max(maxViewX, viewCorner.x);
          minViewY = Math.min(minViewY, viewCorner.y);
          maxViewY = Math.max(maxViewY, viewCorner.y);
        }

        const viewCenterX = (minViewX + maxViewX) / 2;
        const viewCenterY = (minViewY + maxViewY) / 2;
        const contentHalfW = (maxViewX - minViewX) / 2 / (1 - 2 * FRUSTUM_MARGIN);
        const contentHalfH = (maxViewY - minViewY) / 2 / (1 - 2 * FRUSTUM_MARGIN);
        const aspect = w / h;
        let frustumHalfW = contentHalfW;
        let frustumHalfH = contentHalfH;
        if (frustumHalfW / frustumHalfH < aspect) {
          frustumHalfW = frustumHalfH * aspect;
        } else {
          frustumHalfH = frustumHalfW / aspect;
        }

        cam.left = viewCenterX - frustumHalfW;
        cam.right = viewCenterX + frustumHalfW;
        cam.top = viewCenterY + frustumHalfH;
        cam.bottom = viewCenterY - frustumHalfH;
        cam.updateProjectionMatrix();
      };
      const centerWorld = new THREE.Vector3();
      const centerNDC = new THREE.Vector3();

      const labelEntryProgress = (now: number) => {
        const sectors = labelSectors(litRef.current, labels);
        if (reduced || sectors.length === 0) return 1;
        const elapsed = now - mountTime - LABEL_ENTRY_DELAY;
        if (elapsed <= 0) return 0;
        return easeOutCubic(Math.min(1, elapsed / LABEL_ENTRY_MS));
      };

      const projectLabels = (now: number) => {
        const sectors = labelSectors(litRef.current, labels);
        if (sectors.length === 0 || !container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;

        const scale = Math.max(0.7, w / 640);
        container.style.setProperty("--dk-ring3d-scale", String(scale));

        const entryT = labelEntryProgress(now);
        const entryOffset = (1 - entryT) * 6;

        ring.updateMatrixWorld(true);
        centerWorld.set(0, coreTop, 0);
        ring.localToWorld(centerWorld);
        centerNDC.copy(centerWorld).project(cam);
        const centerPxX = (centerNDC.x * 0.5 + 0.5) * w;
        const centerPxY = (-centerNDC.y * 0.5 + 0.5) * h;
        const centerDepth = centerNDC.z;

        const containerRect = container.getBoundingClientRect();
        const labelPads: Partial<
          Record<SectorId, { x: number; y: number; onLeft: boolean }>
        > = {};

        for (const sector of sectors) {
          const i = SECTORS.findIndex((s) => s.id === sector.id);
          const el = labelRefs.current[sector.id];
          if (!el || i < 0) continue;
          const sm = sectorMeshes[i];
          const anchor = polar3D(rLabel, sector.angle);
          vec.set(anchor.x, coreTop + sm.current.lift, anchor.z);
          ring.localToWorld(vec);
          const sectorNDC = vec.clone().project(cam);
          const sectorPxX = (sectorNDC.x * 0.5 + 0.5) * w;
          const sectorPxY = (-sectorNDC.y * 0.5 + 0.5) * h;

          const behind = sectorNDC.z > centerDepth;
          const facing = behind ? 0.35 : 1;
          const alpha = facing * entryT;

          let dx = sectorPxX - centerPxX;
          let dy = sectorPxY - centerPxY;
          const radialLen = Math.hypot(dx, dy) || 1;
          dx /= radialLen;
          dy /= radialLen;

          let t = Infinity;
          if (dx > 0) t = Math.min(t, (w - LABEL_PAD - centerPxX) / dx);
          if (dx < 0) t = Math.min(t, (LABEL_PAD - centerPxX) / dx);
          if (dy > 0) t = Math.min(t, (h - LABEL_PAD - centerPxY) / dy);
          if (dy < 0) t = Math.min(t, (LABEL_PAD - centerPxY) / dy);
          if (!Number.isFinite(t) || t < 0) t = 0;

          let labelPxX = centerPxX + dx * t;
          let labelPxY = centerPxY + dy * t + entryOffset;
          const onLeft = labelPxX < centerPxX;

          el.style.textAlign = onLeft ? "right" : "left";
          el.style.transform = `translate3d(${labelPxX}px, ${labelPxY}px, 0) translate(${onLeft ? "-100%" : "0%"}, -50%)`;
          el.style.opacity = String(alpha);

          const labelW = el.offsetWidth;
          const labelH = el.offsetHeight;

          if (onLeft) {
            labelPxX = Math.max(LABEL_PAD + labelW, Math.min(labelPxX, w - LABEL_PAD));
          } else {
            labelPxX = Math.max(LABEL_PAD, Math.min(labelPxX, w - LABEL_PAD - labelW));
          }
          labelPxY = Math.max(
            LABEL_PAD + labelH / 2,
            Math.min(labelPxY, h - LABEL_PAD - labelH / 2),
          );

          el.style.transform = `translate3d(${labelPxX}px, ${labelPxY}px, 0) translate(${onLeft ? "-100%" : "0%"}, -50%)`;

          labelPads[sector.id] = { x: sectorPxX, y: sectorPxY, onLeft };
        }

        for (const sector of sectors) {
          const el = labelRefs.current[sector.id];
          const line = calloutRefs.current[sector.id];
          const pad = labelPads[sector.id];
          if (!el || !line || !pad) continue;

          const labelRect = el.getBoundingClientRect();
          const lineEndX = pad.onLeft
            ? labelRect.right - containerRect.left
            : labelRect.left - containerRect.left;
          const lineEndY = labelRect.top - containerRect.top + labelRect.height / 2;
          const alpha = Number(el.style.opacity) || 0;

          line.setAttribute("x1", String(pad.x));
          line.setAttribute("y1", String(pad.y));
          line.setAttribute("x2", String(lineEndX));
          line.setAttribute("y2", String(lineEndY));
          line.style.opacity = String(alpha);
        }
      };

      const renderOnce = (now: number) => {
        if (!renderer || !scene || !cam) return;
        renderer.render(scene, cam);
        projectLabels(now);
      };

      const resize = () => {
        if (!renderer || !cam || !container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h, false);
        fitFrustum();
        renderOnce(performance.now());
      };

      resizeObs = new ResizeObserver(resize);
      resizeObs.observe(container);
      resize();

      const isAnimating = (now: number, handle: SceneHandle) => {
        if (handle.entryStart !== null && now - handle.entryStart < ENTRY_MS) return true;
        if (now - handle.litStart < LIT_MS) return true;
        if (
          !reduced &&
          labelSectors(litRef.current, labels).length > 0 &&
          now - handle.mountTime < LABEL_ENTRY_DELAY + LABEL_ENTRY_MS
        ) {
          return true;
        }
        return false;
      };

      const renderFrame = (now: number, handle: SceneHandle) => {
        if (!renderer || !scene || !cam) return;

        if (handle.entryStart !== null) {
          const t = Math.min(1, (now - handle.entryStart) / ENTRY_MS);
          const e = easeOutCubic(t);
          ring.rotation.y = handle.entryFromRotY + (handle.entryToRotY - handle.entryFromRotY) * e;
          ring.position.y = 0.15 * (1 - e);
          if (t >= 1) {
            handle.entryStart = null;
            ring.position.y = 0;
            ring.rotation.y = handle.entryToRotY;
          }
        }

        const litProgress = Math.min(1, (now - handle.litStart) / LIT_MS);
        for (const sm of sectorMeshes) {
          sm.current.fill = sm.from.fill + (sm.to.fill - sm.from.fill) * litProgress;
          sm.current.edge = sm.from.edge + (sm.to.edge - sm.from.edge) * litProgress;
          sm.current.lift = sm.from.lift + (sm.to.lift - sm.from.lift) * litProgress;
          sm.fillMat.opacity = sm.current.fill;
          sm.edgeMat.opacity = sm.current.edge;
          sm.group.position.y = sm.current.lift;
        }

        renderer.render(scene, cam);
        projectLabels(now);
      };

      const handle: SceneHandle = {
        sectorMeshes,
        chainMats,
        crossMats,
        rootGroup: ring,
        camera: cam,
        renderer,
        scene,
        litStart: performance.now(),
        mountTime,
        entryStart,
        entryFromRotY,
        entryToRotY,
        ensureLoop: () => {
          if (raf) return;
          const loop = (now: number) => {
            renderFrame(now, handle);
            if (isAnimating(now, handle)) {
              raf = requestAnimationFrame(loop);
            } else {
              raf = 0;
            }
          };
          raf = requestAnimationFrame(loop);
        },
        projectLabels,
      };
      sceneRef.current = handle;
      applyLitTargets(handle, lit);

      mountRaf = requestAnimationFrame((now) => {
        mountRaf = 0;
        resize();
        if (isAnimating(now, handle)) {
          renderFrame(now, handle);
          handle.ensureLoop();
        }
      });

      return () => {
        sceneRef.current = null;
        cancelAnimationFrame(raf);
        cancelAnimationFrame(mountRaf);
        resizeObs?.disconnect();
        for (const d of disposables) d.dispose();
        renderer?.dispose();
        if (renderer?.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch {
      setFallback(true);
      return undefined;
    }
  }, [reduced, labels, dimmed, chainOpacity, crossOpacity]);

  useEffect(() => {
    const handle = sceneRef.current;
    const container = containerRef.current;
    if (!handle || !container) return;
    const colors = readColors(container);
    handle.litStart = performance.now();
    handle.sectorMeshes.forEach((sm, i) => {
      const on = sectorLit(lit, SECTORS[i].id);
      sm.from = { ...sm.current };
      sm.to = {
        fill: on ? LIT_FILL_OPACITY : 0,
        edge: on ? 1 : 0.22,
        lift: on ? litLift : 0,
      };
      sm.edgeMat.color.copy(on ? colors.accent : colors.fg);
    });
    handle.chainMats.forEach((m) => {
      m.opacity = chainOpacity;
    });
    handle.crossMats.forEach((m) => {
      m.opacity = crossOpacity;
    });

    if (reduced || document.documentElement.hasAttribute("data-dk-print")) {
      const litProgress = 1;
      handle.sectorMeshes.forEach((sm) => {
        sm.current.fill = sm.from.fill + (sm.to.fill - sm.from.fill) * litProgress;
        sm.current.edge = sm.from.edge + (sm.to.edge - sm.from.edge) * litProgress;
        sm.current.lift = sm.from.lift + (sm.to.lift - sm.from.lift) * litProgress;
        sm.fillMat.opacity = sm.current.fill;
        sm.edgeMat.opacity = sm.current.edge;
        sm.group.position.y = sm.current.lift;
      });
      handle.renderer.render(handle.scene, handle.camera);
      handle.projectLabels(performance.now());
    } else {
      handle.ensureLoop();
    }
  }, [lit, chainOpacity, crossOpacity, reduced]);

  if (fallback) {
    return <Ring lit={lit} locale={locale} labels={labels} />;
  }

  return (
    <div className="dk-ring3d" ref={containerRef} aria-hidden="true">
      {visibleLabels.length > 0 && (
        <>
          <svg className="dk-ring3d__callouts" aria-hidden="true">
            {visibleLabels.map((sector) => (
              <line
                key={sector.id}
                ref={(el) => {
                  calloutRefs.current[sector.id] = el;
                }}
                className="dk-ring3d__callout"
              />
            ))}
          </svg>
          <div className="dk-ring3d__labels">
            {visibleLabels.map((sector) => {
              const name = pt ? sector.namePt : sector.nameEn;
              const size = nameFontSize(name);
              return (
                <span
                  key={sector.id}
                  ref={(el) => {
                    labelRefs.current[sector.id] = el;
                  }}
                  className="dk-ring3d__label"
                  style={
                    {
                      "--dk-ring3d-name-size": `${size}px`,
                    } as CSSProperties
                  }
                >
                  <span className="dk-ring3d__label-num">{sector.num}</span>
                  <span className="dk-ring3d__label-name">{name}</span>
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
