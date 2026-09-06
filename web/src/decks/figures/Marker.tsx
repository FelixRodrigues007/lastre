import type { ReactNode } from "react";
import type { DeckLocale as Locale } from "../types";
import type { L10n } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * The marker — the grammar of the deck.
 *
 * A thin circle with a progress ring and a number, a vertical stem running
 * down to the exact point, and a label beside it. Three readings in one
 * gesture. Nothing in this anatomy varies from figure to figure: the same
 * radius, the same ring weight, the same stem, the same type. What changes
 * is only the substrate underneath — a stack, a rail, a ratio, a funnel.
 *
 * Every figure consumes this. No figure redraws a circle, a ring or a stem.
 * ───────────────────────────────────────────────────────────────────────── */

/** Circle radius, in substrate units. Never changes. */
export const R = 26;
/** Ring stroke weight. Never changes. */
export const RING = 1.5;
/** Every substrate is authored on this width, so the marker keeps its scale. */
export const W = 1200;

/* O arco desenhado à mão, começando às 12h e andando no sentido horário.
 * Era um `transform="rotate(-90)"` — e o reset de impressão zera transform em
 * tudo dentro da folha, o que girava o anel de volta na hora de imprimir. */
function arc(cx: number, cy: number, r: number, pct: number) {
  const a = 2 * Math.PI * pct;
  const ex = cx + r * Math.sin(a);
  const ey = cy - r * Math.cos(a);
  return `M${cx} ${cy - r}A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${ex.toFixed(3)} ${ey.toFixed(3)}`;
}

export type Tone = "default" | "negative";

export type MarkerProps = {
  /** The exact point on the substrate the stem lands on. */
  x: number;
  y: number;
  /** y of the circle centre. The stem's length is what resolves collisions. */
  stemTop: number;
  /** Number inside the circle. `0` with tone="negative" is the absent state. */
  value?: string | number;
  /** 0–1. Omitted → track only, no arc drawn. */
  pct?: number;
  /** Leave empty when the substrate is labelled beside the figure. */
  label: string;
  /** One short supporting line. SVG does not wrap — keep it short. */
  sub?: string;
  tone?: Tone;
  /** Which side of the circle the label sits on. */
  side?: "right" | "left";
  /**
   * Sem disco: âncora, haste e rótulo. Para substratos onde o círculo seria
   * ruído — o mapa do Brasil, onde só um ponto carrega número.
   */
  bare?: boolean;
  /** Reading order. Markers land 80ms apart, in this order. */
  order?: number;
};

/**
 * One marker. `stemTop` is the circle centre, `y` is where the stem lands —
 * the stem is always vertical, so `x` serves both.
 */
export function Marker({
  x,
  y,
  stemTop,
  value,
  pct,
  label,
  sub,
  tone = "default",
  side = "right",
  bare = false,
  order = 0,
}: MarkerProps) {
  const neg = tone === "negative";
  const gap = bare ? 11 : R + 13;
  const tx = side === "right" ? x + gap : x - gap;
  const anchor = side === "right" ? "start" : "end";
  /* the label hangs from the top of the circle, never centred on it —
   * without a disc there is nothing to hang from, so it sits on the stem head */
  const ty = bare ? stemTop + 5 : stemTop - R + 12;
  const p = pct == null ? 0 : Math.min(1, Math.max(0, pct));
  const style = { ["--dk-mk-d" as string]: `${order * 80}ms` };

  return (
    <g className={`dk-mk${neg ? " dk-mk--neg" : ""}`} style={style}>
      {/* the stem is vertical. always. */}
      <line
        className="dk-mk__stem"
        x1={x}
        y1={bare ? stemTop : stemTop + R}
        x2={x}
        y2={y}
        strokeWidth={1}
      />
      <circle className="dk-mk__anchor" cx={x} cy={y} r={2.5} />

      <g className="dk-mk__head">
        {/* the circle sits on the substrate — it covers it, it does not float */}
        {!bare && (
          <circle
            className="dk-mk__disc"
            cx={x}
            cy={stemTop}
            r={R}
            strokeWidth={RING}
          />
        )}
        {!bare && p > 0 && (
          p >= 0.999 ? (
            <circle
              className="dk-mk__ring"
              cx={x}
              cy={stemTop}
              r={R}
              fill="none"
              strokeWidth={RING}
              pathLength={1}
            />
          ) : (
            <path
              className="dk-mk__ring"
              d={arc(x, stemTop, R, p)}
              fill="none"
              strokeWidth={RING}
              pathLength={1}
            />
          )
        )}
        {!bare && value != null && value !== "" && (
          <text
            className="dk-mk__v"
            x={x}
            y={stemTop}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {value}
          </text>
        )}

        {label && (
          <text className="dk-mk__label" x={tx} y={ty} textAnchor={anchor}>
            {label}
          </text>
        )}
        {sub && (
          <text className="dk-mk__sub" x={tx} y={ty + 19} textAnchor={anchor}>
            {sub}
          </text>
        )}
      </g>
    </g>
  );
}

export type FigProps = {
  locale: Locale;
  /** Bilingual alternative text — the figure is an image, not decoration. */
  title: L10n;
  /** Authored height. */
  height: number;
  /** Authored width. Defaults to the band width every figure shares. */
  width?: number;
  className?: string;
  children: ReactNode;
};

/** The shell every substrate is drawn inside. */
export function Fig({ locale, title, height, width = W, className, children }: FigProps) {
  return (
    <svg
      className={className ? `dk-fig ${className}` : "dk-fig"}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
    >
      <title>{locale === "pt" ? title.pt : title.en}</title>
      {children}
    </svg>
  );
}

/** A substrate outline that draws itself in. Length-independent. */
export const draw = { pathLength: 1, strokeDasharray: "1 1" } as const;
/** Pair it with the class, so the outline draws itself in once. */
export const DRAW = "dk-fig__draw";
