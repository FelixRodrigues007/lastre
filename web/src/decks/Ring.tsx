import type { CSSProperties } from "react";
import { SealMark } from "../components/ui/SealMark";
import type { Locale } from "../i18n/translations";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { CAMADAS } from "./content/publicos-data";

export const CX = 360;
export const CY = 360;
export const CENTER_R = 96;
export const DOT_R = 118;
export const INNER_R = 158;
export const OUTER_R = 278;
export const WEDGE = 46;
export const LABEL_R = (INNER_R + OUTER_R) / 2;

export type SectorId = "origem" | "mercado" | "capital" | "defi" | "infra" | "estado";

type SectorDef = {
  id: SectorId;
  num: string;
  angle: number;
  namePt: string;
  nameEn: string;
  count: number;
  crossCut?: boolean;
};

export const SECTORS: SectorDef[] = [
  { id: "origem", num: "01", angle: -90, namePt: "Origem", nameEn: "Origin", count: 8 },
  { id: "mercado", num: "03", angle: -30, namePt: "Mercado", nameEn: "Market", count: 5 },
  { id: "capital", num: "04", angle: 30, namePt: "Capital", nameEn: "Capital", count: 7 },
  { id: "defi", num: "05", angle: 90, namePt: "DeFi", nameEn: "DeFi", count: 7 },
  { id: "infra", num: "06", angle: 150, namePt: "Infraestrutura", nameEn: "Infrastructure", count: 7, crossCut: true },
  { id: "estado", num: "07", angle: 210, namePt: "Estado", nameEn: "State", count: 8, crossCut: true },
];

const CHAIN: SectorId[] = ["origem", "mercado", "capital", "defi"];

export const polar = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
};

const wedgePath = (angle: number) => {
  const a0 = angle - WEDGE / 2;
  const a1 = angle + WEDGE / 2;
  const o0 = polar(OUTER_R, a0);
  const o1 = polar(OUTER_R, a1);
  const i1 = polar(INNER_R, a1);
  const i0 = polar(INNER_R, a0);
  const large = WEDGE > 180 ? 1 : 0;
  return `M ${o0.x} ${o0.y} A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${o1.x} ${o1.y} L ${i1.x} ${i1.y} A ${INNER_R} ${INNER_R} 0 ${large} 0 ${i0.x} ${i0.y} Z`;
};

/** Shrink only the sector name when it would exceed the wedge width at LABEL_R. */
const nameFontSize = (name: string) => {
  const wedgeWidth = 2 * LABEL_R * Math.sin((WEDGE / 2) * (Math.PI / 180));
  const est = name.length * 14;
  if (est <= wedgeWidth * 0.92) return 26;
  if (est <= wedgeWidth * 1.15) return 20;
  return 16;
};

type Props = {
  lit?: SectorId[];
  locale: Locale;
  labels?: boolean;
};

export function Ring({ lit, locale, labels = true }: Props) {
  const reduced = useReducedMotion();
  const pt = locale === "pt";
  const allLit = lit === undefined;
  const dimmed = lit?.length === 0;
  const isLit = (id: SectorId) => allLit || lit!.includes(id);
  const trans = reduced ? undefined : "opacity 420ms var(--dk-ease), fill 420ms var(--dk-ease)";

  const chainArcs: { d: string; dashed: boolean; inward?: boolean; key: string }[] = [];

  for (let i = 0; i < CHAIN.length; i++) {
    const sector = SECTORS.find((s) => s.id === CHAIN[i])!;
    const edge = polar(INNER_R + 18, sector.angle);
    const mid = polar((INNER_R + CENTER_R) / 2 + 12, sector.angle);
    chainArcs.push({
      key: `${sector.id}-in`,
      dashed: false,
      inward: true,
      d: `M ${edge.x} ${edge.y} Q ${mid.x} ${mid.y} ${CX} ${CY}`,
    });
    if (i < CHAIN.length - 1 && !dimmed) {
      const next = SECTORS.find((s) => s.id === CHAIN[i + 1])!;
      const nextEdge = polar(INNER_R + 18, next.angle);
      const midOut = polar((INNER_R + CENTER_R) / 2 + 12, next.angle);
      chainArcs.push({
        key: `${sector.id}-out`,
        dashed: false,
        inward: false,
        d: `M ${CX} ${CY} Q ${midOut.x} ${midOut.y} ${nextEdge.x} ${nextEdge.y}`,
      });
    }
  }

  for (const s of SECTORS.filter((x) => x.crossCut)) {
    const edge = polar(INNER_R + 22, s.angle);
    chainArcs.push({
      key: `${s.id}-cross`,
      dashed: true,
      d: `M ${edge.x} ${edge.y} L ${CX} ${CY}`,
    });
  }

  const chainOpacity = dimmed ? 0.62 : allLit ? 0.78 : 0.5;
  const crossOpacity = dimmed ? 0.28 : allLit ? 0.38 : 0.32;

  const prova = CAMADAS.find((c) => c.id === "prova")!;

  return (
    <svg
      className="dk-ring"
      viewBox="0 0 720 720"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="dk-ring-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--dk-accent)" />
        </marker>
      </defs>

      {/* chain arcs — solid, thick, accent, with arrowheads */}
      <g
        className="dk-ring__chain"
        fill="none"
        stroke="var(--dk-accent)"
        strokeWidth="2"
        strokeLinecap="round"
      >
        {chainArcs
          .filter((a) => !a.dashed)
          .map((a) => (
            <path
              key={a.key}
              d={a.d}
              markerEnd="url(#dk-ring-arrow)"
              opacity={chainOpacity}
              style={{ transition: trans }}
            />
          ))}
      </g>

      {/* cross-cut links — thin dashed, dim, no arrow */}
      <g
        className="dk-ring__cross"
        fill="none"
        stroke="var(--dk-dim)"
        strokeWidth="1"
        strokeDasharray="4 5"
        strokeLinecap="round"
      >
        {chainArcs
          .filter((a) => a.dashed)
          .map((a) => (
            <path key={a.key} d={a.d} opacity={crossOpacity} style={{ transition: trans }} />
          ))}
      </g>

      {/* outer sectors */}
      {SECTORS.map((s) => {
        const on = isLit(s.id);
        const anchor = polar(LABEL_R, s.angle);
        const name = pt ? s.namePt : s.nameEn;
        const nameSize = nameFontSize(name);

        return (
          <g key={s.id} className="dk-ring__sector" style={{ transition: trans, opacity: on ? 1 : 0.22 }}>
            <path
              d={wedgePath(s.angle)}
              fill={on ? "var(--dk-mint)" : "none"}
              stroke="var(--dk-ink)"
              strokeWidth={on ? 1.6 : 1}
              style={{ transition: trans }}
            />
            {labels && (
              <text
                x={anchor.x}
                y={anchor.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--dk-ink)"
              >
                <tspan
                  x={anchor.x}
                  dy="-0.62em"
                  fontFamily="var(--dk-mono)"
                  fontSize="13"
                  letterSpacing="0.14em"
                >
                  {s.num}
                </tspan>
                <tspan
                  x={anchor.x}
                  dy="1.24em"
                  fontFamily="var(--dk-sans)"
                  fontSize={nameSize}
                  fontWeight="600"
                >
                  {name}
                </tspan>
              </text>
            )}
          </g>
        );
      })}

      {/* centre — always on */}
      <circle className="dk-ring__core" cx={CX} cy={CY} r={CENTER_R} fill="var(--dk-ink)" />
      {/* the mark, not the word — inverts with the disc via --seal-mark-* */}
      <g
        className="dk-ring__mark"
        style={
          {
            "--seal-mark-outer": "var(--dk-sheet)",
            "--seal-mark-accent": "var(--dk-accent)",
            "--seal-mark-lines": "var(--dk-sheet)",
          } as CSSProperties
        }
      >
        <SealMark size={92} x={CX - 46} y={CY - 62} />
      </g>
      <text
        className="dk-ring__layer"
        x={CX}
        y={CY + 52}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--dk-mono)"
        fontSize="8"
        letterSpacing="0.14em"
        fill="var(--dk-faint)"
      >
        {pt ? "CAMADA 02 · PROVA" : "LAYER 02 · PROOF"}
      </text>

      {/* inner dot ring — 8 proof audiences */}
      {prova.publicos.map((_, i) => {
        const angle = -90 + i * 45;
        const p = polar(DOT_R, angle);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4.5}
            fill="var(--dk-accent)"
            stroke="var(--dk-sheet)"
            strokeWidth="1.2"
          />
        );
      })}
      <circle
        cx={CX}
        cy={CY}
        r={DOT_R}
        fill="none"
        stroke="var(--dk-line)"
        strokeWidth="1"
        strokeDasharray="3 5"
      />
    </svg>
  );
}
