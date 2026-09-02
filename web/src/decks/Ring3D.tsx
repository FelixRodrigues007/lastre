import { useEffect, useRef, useState, type CSSProperties } from "react";
import * as THREE from "three";
import type { Locale } from "../i18n/translations";
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

const CHAIN: SectorId[] = ["origem", "mercado", "capital", "defi"];

const polar3D = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: r * Math.cos(rad), z: r * Math.sin(rad) };
};

const nameFontSize = (name: string) => {
  const wedgeWidth = 2 * rLabel * Math.sin((WEDGE / 2) * (Math.PI / 180));
  const est = name.length * 14;
  if (est <= wedgeWidth * 0.92) return 26;
  if (est <= wedgeWidth * 1.15) return 20;
  return 16;
};

type DkColors = {
  ink: THREE.Color;
  mint: THREE.Color;
  accent: THREE.Color;
  dim: THREE.Color;
  line: THREE.Color;
};

const readColors = (el: HTMLElement): DkColors => {
  const cs = getComputedStyle(el);
  const c = (token: string) => new THREE.Color(cs.getPropertyValue(token).trim());
  return {
    ink: c("--dk-ink"),
    mint: c("--dk-mint"),
    accent: c("--dk-accent"),
    dim: c("--dk-dim"),
    line: c("--dk-line"),
  };
};

const wedgeShape = (angle: number) => {
  const a0 = ((angle - WEDGE / 2) * Math.PI) / 180;
  const a1 = ((angle + WEDGE / 2) * Math.PI) / 180;
  const shape = new THREE.Shape();
  shape.moveTo(rOuter * Math.cos(a0), rOuter * Math.sin(a0));
  shape.absarc(0, 0, rOuter, a0, a1, false);
  shape.lineTo(rInner * Math.cos(a1), rInner * Math.sin(a1));
  shape.absarc(0, 0, rInner, a1, a0, true);
  shape.closePath();
  return shape;
};

const wedgeGeometry = (angle: number) => {
  const geo = new THREE.ExtrudeGeometry(wedgeShape(angle), {
    depth: wedgeDepth,
    bevelEnabled: false,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, wedgeDepth, 0);
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
  projectLabels: () => void;
};

type Props = {
  lit?: SectorId[];
  locale: Locale;
  labels?: boolean;
};

export function Ring3D({ lit, locale, labels = true }: Props) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sceneRef = useRef<SceneHandle | null>(null);
  const litRef = useRef(lit);
  litRef.current = lit;
  const [fallback, setFallback] = useState(false);

  const pt = locale === "pt";
  const allLit = lit === undefined;
  const dimmed = lit?.length === 0;
  const isLit = (id: SectorId) => sectorLit(lit, id);

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
    let resizeObs: ResizeObserver | null = null;
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];
    const vec = new THREE.Vector3();
    const camDir = new THREE.Vector3();

    const track = <T extends THREE.BufferGeometry | THREE.Material>(obj: T): T => {
      disposables.push(obj);
      return obj;
    };

    const applyLitTargets = (handle: SceneHandle, litProp: SectorId[] | undefined) => {
      handle.litStart = performance.now();
      handle.sectorMeshes.forEach((sm, i) => {
        const on = sectorLit(litProp, SECTORS[i].id);
        sm.from = { ...sm.current };
        sm.to = {
          fill: on ? 0.9 : 0,
          edge: on ? 1 : 0.22,
          lift: on ? litLift : 0,
        };
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

      const colors = readColors(container);
      rootGroup = new THREE.Group();
      const ring = rootGroup;
      scene.add(ring);

      sectorMeshes = SECTORS.map((sector) => {
        const geo = track(wedgeGeometry(sector.angle));
        const fillMat = track(
          new THREE.MeshBasicMaterial({
            color: colors.mint,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          }),
        );
        const mesh = new THREE.Mesh(geo, fillMat);
        const edgeGeo = track(new THREE.EdgesGeometry(geo));
        const edgeMat = track(
          new THREE.LineBasicMaterial({
            color: colors.ink,
            transparent: true,
            opacity: 0.22,
          }),
        );
        const edges = new THREE.LineSegments(edgeGeo, edgeMat);
        const group = new THREE.Group();
        group.add(mesh, edges);
        ring.add(group);

        const on = sectorLit(lit, sector.id);
        const state: SectorMeshes = {
          group,
          fillMat,
          edgeMat,
          from: { fill: 0, edge: 0.22, lift: 0 },
          to: {
            fill: on ? 0.9 : 0,
            edge: on ? 1 : 0.22,
            lift: on ? litLift : 0,
          },
          current: {
            fill: on ? 0.9 : 0,
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
      const coreMat = track(new THREE.MeshBasicMaterial({ color: colors.ink }));
      ring.add(new THREE.Mesh(coreGeo, coreMat));
      ring.add(
        new THREE.LineSegments(
          track(new THREE.EdgesGeometry(coreGeo)),
          track(new THREE.LineBasicMaterial({ color: colors.ink })),
        ),
      );

      const torusGeo = track(new THREE.TorusGeometry(0.62, 0.012, 8, 64));
      const torus = new THREE.Mesh(
        torusGeo,
        track(new THREE.MeshBasicMaterial({ color: colors.accent })),
      );
      torus.rotation.x = Math.PI / 2;
      torus.position.y = coreTop + 0.002;
      ring.add(torus);

      const marker = new THREE.Mesh(
        track(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16)),
        track(new THREE.MeshBasicMaterial({ color: colors.accent })),
      );
      marker.position.y = coreTop + 0.012;
      ring.add(marker);

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

      const halfBase = 3.4;
      const resize = () => {
        if (!renderer || !camera || !container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h, false);
        const aspect = w / h;
        camera.left = -halfBase * aspect;
        camera.right = halfBase * aspect;
        camera.top = halfBase;
        camera.bottom = -halfBase;
        cam.updateProjectionMatrix();
      };

      resizeObs = new ResizeObserver(resize);
      resizeObs.observe(container);
      resize();

      const projectLabels = () => {
        if (labels === false || !container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        cam.getWorldDirection(camDir);
        SECTORS.forEach((sector, i) => {
          const el = labelRefs.current[i];
          if (!el) return;
          const sm = sectorMeshes[i];
          const anchor = polar3D(rLabel, sector.angle);
          vec.set(anchor.x, coreTop + sm.current.lift, anchor.z);
          ring.localToWorld(vec);
          const behind = vec.clone().sub(cam.position).dot(camDir) < 0;
          const facing = behind ? 0.25 : 1;
          const litAlpha = 0.22 + (sm.current.fill / 0.9) * 0.78;
          const projected = vec.clone().project(cam);
          const px = (projected.x * 0.5 + 0.5) * w;
          const py = (-projected.y * 0.5 + 0.5) * h;
          el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
          el.style.opacity = String(litAlpha * facing);
        });
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
        projectLabels,
      };
      sceneRef.current = handle;
      applyLitTargets(handle, lit);

      let last = performance.now();

      const renderFrame = (now: number) => {
        if (!renderer || !scene || !cam) return;
        const delta = (now - last) / 1000;
        last = now;
        const t = now / 1000;

        const litProgress = Math.min(1, (now - handle.litStart) / LIT_MS);
        for (const sm of sectorMeshes) {
          sm.current.fill = sm.from.fill + (sm.to.fill - sm.from.fill) * litProgress;
          sm.current.edge = sm.from.edge + (sm.to.edge - sm.from.edge) * litProgress;
          sm.current.lift = sm.from.lift + (sm.to.lift - sm.from.lift) * litProgress;
          sm.fillMat.opacity = sm.current.fill;
          sm.edgeMat.opacity = sm.current.edge;
          sm.group.position.y = sm.current.lift;
        }

        if (!reduced) {
          ring.rotation.y += delta * 0.16;
          ring.position.y = Math.sin(t * 0.8) * 0.09;
          ring.rotation.x = -0.05 + Math.sin(t * 0.55) * 0.035;
          ring.rotation.z = Math.sin(t * 0.42) * 0.02;
        } else {
          ring.rotation.y = -0.35;
          ring.rotation.x = -0.05;
          ring.rotation.z = 0;
          ring.position.y = 0;
        }

        renderer.render(scene, cam);
        projectLabels();
      };

      if (reduced) {
        renderFrame(performance.now());
      } else {
        const loop = (now: number) => {
          renderFrame(now);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      }

      return () => {
        sceneRef.current = null;
        cancelAnimationFrame(raf);
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
    if (!handle) return;
    const litStart = performance.now();
    handle.litStart = litStart;
    handle.sectorMeshes.forEach((sm, i) => {
      const on = sectorLit(lit, SECTORS[i].id);
      sm.from = { ...sm.current };
      sm.to = {
        fill: on ? 0.9 : 0,
        edge: on ? 1 : 0.22,
        lift: on ? litLift : 0,
      };
    });
    handle.chainMats.forEach((m) => {
      m.opacity = chainOpacity;
    });
    handle.crossMats.forEach((m) => {
      m.opacity = crossOpacity;
    });

    if (reduced) {
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
      handle.projectLabels();
    }
  }, [lit, chainOpacity, crossOpacity, reduced]);

  if (fallback) {
    return <Ring lit={lit} locale={locale} labels={labels} />;
  }

  return (
    <div className="dk-ring3d" ref={containerRef} aria-hidden="true">
      {labels !== false && (
        <div className="dk-ring3d__labels">
          {SECTORS.map((sector, i) => {
            const name = pt ? sector.namePt : sector.nameEn;
            const size = nameFontSize(name);
            const on = isLit(sector.id);
            return (
              <span
                key={sector.id}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className="dk-ring3d__label"
                style={
                  {
                    opacity: on ? 1 : 0.22,
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
      )}
    </div>
  );
}
