import type { Locale } from "../../i18n/translations";
import type { L10n } from "../types";
import { DRAW, Fig, Marker, draw } from "./Marker";

/* ─────────────────────────────────────────────────────────────────────────
 * The substrates. One marker, many grounds.
 *
 * Every figure here is inline SVG on `currentColor`, so it inherits the ink
 * set of whichever sheet it lands on and works on all four skins. No figure
 * carries data of its own — the numbers live in the content file, next to
 * the text that cites them.
 * ───────────────────────────────────────────────────────────────────────── */

/* ── chain · links in series, one of which may be missing ─────────────── */

export type Link = {
  /** Shown inside the marker. */
  n: string;
  label: string;
  /** A hollow link carries no load: dashed outline, negative ink, zero ring. */
  missing?: boolean;
};

export function Chain({ locale, title, links }: { locale: Locale; title: L10n; links: Link[] }) {
  const w = 300;
  const h = 76;
  const pitch = 258;
  const x0 = (1200 - (w + pitch * (links.length - 1))) / 2;
  const cy = 128;

  return (
    <Fig locale={locale} title={title} height={172}>
      {links.map((link, i) => {
        const x = x0 + i * pitch;
        return (
          <rect
            key={`l-${link.n}`}
            className={`dk-fig__link ${link.missing ? "dk-fig__link--gone" : DRAW}`}
            x={x}
            y={cy - h / 2}
            width={w}
            height={h}
            rx={h / 2}
            {...(link.missing ? {} : draw)}
          />
        );
      })}
      {links.map((link, i) => (
        <Marker
          key={`m-${link.n}`}
          x={x0 + i * pitch + w / 2}
          y={cy - h / 2}
          stemTop={32}
          value={link.missing ? 0 : link.n}
          pct={link.missing ? 0 : 1}
          label={link.label}
          tone={link.missing ? "negative" : "default"}
          order={i}
        />
      ))}
    </Fig>
  );
}

/** The same links, read top to bottom — the gutter of a numbered list. */
export function ChainColumn({ locale, title, links }: { locale: Locale; title: L10n; links: Link[] }) {
  const pitch = 108;
  const h = 62;
  const height = pitch * (links.length - 1) + h + 40;

  return (
    <Fig locale={locale} title={title} height={height} className="dk-fig--col" width={130}>
      {links.map((link, i) => {
        const y = 20 + i * pitch;
        return (
          <rect
            key={`l-${link.n}`}
            className={`dk-fig__link ${link.missing ? "dk-fig__link--gone" : DRAW}`}
            x={39}
            y={y}
            width={52}
            height={h}
            rx={26}
            {...(link.missing ? {} : draw)}
          />
        );
      })}
      {links.map((link, i) => (
        <Marker
          key={`m-${link.n}`}
          x={65}
          y={20 + i * pitch + h / 2}
          stemTop={20 + i * pitch + h / 2}
          value={link.missing ? 0 : link.n}
          pct={link.missing ? 0 : 1}
          label=""
          tone={link.missing ? "negative" : "default"}
          order={i}
        />
      ))}
    </Fig>
  );
}

/* ── stack · four floors, and the one that must exist ─────────────────── */

export function Stack({ locale, title, base }: { locale: Locale; title: L10n; base: string }) {
  /* floors 3 → 0, top to bottom. floor 3 sits offset and dashed: it is a
   * separate entity, not another storey of the same building. */
  const slabs = [
    { k: 3, x: 64, y: 16, w: 190, h: 86, loose: true },
    { k: 2, x: 20, y: 118, w: 190, h: 86 },
    { k: 1, x: 20, y: 220, w: 190, h: 86 },
    { k: 0, x: 20, y: 322, w: 280, h: 98, base: true },
  ];

  return (
    <Fig locale={locale} title={title} height={452} className="dk-fig--stack" width={320}>
      {slabs.map((s) => (
        <rect
          key={s.k}
          className={`dk-fig__slab${s.loose ? " dk-fig__slab--loose" : ` ${DRAW}`}${s.base ? " dk-fig__slab--base" : ""}`}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          {...(s.loose ? {} : draw)}
        />
      ))}
      <Marker x={285} y={322} stemTop={60} value={0} pct={1} label="" sub={base} order={0} />
    </Fig>
  );
}

/* ── ratio · a mass against a thread ──────────────────────────────────── */

export function Ratio({
  locale,
  title,
  mass,
  metal,
  share,
}: {
  locale: Locale;
  title: L10n;
  mass: string;
  metal: string;
  share: string;
}) {
  const y = 138;
  const h = 46;

  return (
    <Fig locale={locale} title={title} height={200}>
      <rect className={`dk-fig__mass ${DRAW}`} x={40} y={y} width={1120} height={h} {...draw} />
      {/* the metal, to scale: three ten-thousandths of the bar */}
      <rect className="dk-fig__thread" x={40} y={y - 10} width={2} height={h + 20} />
      <Marker x={1050} y={y} stemTop={40} pct={1} label={mass} order={1} />
      <Marker x={41} y={y} stemTop={40} pct={0.000003} label={metal} sub={share} order={0} />
    </Fig>
  );
}

/* ── bars · one rail, three recoveries ────────────────────────────────── */

export type Mark = { pct: number; value: string; label: string; side?: "left" | "right" };

export function Bars({ locale, title, marks }: { locale: Locale; title: L10n; marks: Mark[] }) {
  const x0 = 60;
  const span = 1080;
  const y = 148;
  const h = 44;
  const central = marks[Math.floor(marks.length / 2)];

  return (
    <Fig locale={locale} title={title} height={214}>
      <rect className={`dk-fig__rail ${DRAW}`} x={x0} y={y} width={span} height={h} {...draw} />
      {central && (
        <rect className="dk-fig__fill" x={x0} y={y} width={span * central.pct} height={h} />
      )}
      {marks.map((m) => (
        <line
          key={`t-${m.value}`}
          className="dk-fig__tick"
          x1={x0 + span * m.pct}
          y1={y - 12}
          x2={x0 + span * m.pct}
          y2={y + h + 12}
        />
      ))}
      {marks.map((m, i) => (
        <Marker
          key={`m-${m.value}`}
          x={x0 + span * m.pct}
          y={y}
          stemTop={40}
          value={m.value}
          pct={m.pct}
          label={m.label}
          side={m.side}
          order={i}
        />
      ))}
    </Fig>
  );
}

/* ── scale · a ruler, markers placed by value ─────────────────────────── */

export type Stop = { at: number; value: string; label: string; sub?: string };

export function Scale({
  locale,
  title,
  max,
  step,
  unit,
  stops,
}: {
  locale: Locale;
  title: L10n;
  max: number;
  step: number;
  unit: string;
  stops: Stop[];
}) {
  const x0 = 60;
  const span = 1080;
  const y = 132;
  const at = (v: number) => x0 + span * (v / max);
  const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step);

  return (
    <Fig locale={locale} title={title} height={190}>
      <line className={`dk-fig__axis ${DRAW}`} x1={x0} y1={y} x2={x0 + span} y2={y} {...draw} />
      {ticks.map((v) => (
        <g key={v}>
          <line className="dk-fig__tick dk-fig__tick--minor" x1={at(v)} y1={y} x2={at(v)} y2={y + 12} />
          <text className="dk-fig__unit" x={at(v)} y={y + 34} textAnchor="middle">
            {v === 0 ? unit : v.toLocaleString(locale === "pt" ? "pt-BR" : "en-US")}
          </text>
        </g>
      ))}
      {stops.map((s, i) => (
        <Marker
          key={s.label}
          x={at(s.at)}
          y={y}
          stemTop={40}
          value={s.value}
          pct={s.at / max}
          label={s.label}
          sub={s.sub}
          order={i}
        />
      ))}
    </Fig>
  );
}

/* ── converge · two flows into one point, and a thin way out ──────────── */

export function Converge({
  locale,
  title,
  a,
  b,
  out,
}: {
  locale: Locale;
  title: L10n;
  a: string;
  b: string;
  out: string;
}) {
  const jx = 720;
  const jy = 172;

  return (
    <Fig locale={locale} title={title} height={252}>
      <path className={`dk-fig__flow ${DRAW}`} d={`M60 112 C 330 112, 480 172, ${jx} ${jy}`} {...draw} />
      <path className={`dk-fig__flow ${DRAW}`} d={`M60 232 C 330 232, 480 172, ${jx} ${jy}`} {...draw} />
      <circle className="dk-fig__node" cx={jx} cy={jy} r={7} />
      {/* the thin way out — cash before the mandate binds */}
      <path className={`dk-fig__branch ${DRAW}`} d={`M${jx} ${jy} L 1000 ${jy} L 1140 108`} {...draw} />
      <Marker x={190} y={126} stemTop={40} value="01" pct={1} label={a} order={0} />
      <Marker x={470} y={214} stemTop={40} value="02" pct={1} label={b} order={1} />
      <Marker x={1010} y={168} stemTop={40} value="03" pct={0.34} label={out} order={2} />
    </Fig>
  );
}

/* ── the rail of five movements — the deck's own contents ─────────────── */

export function TimeRail({
  locale,
  title,
  steps,
  lit,
}: {
  locale: Locale;
  title: L10n;
  steps: string[];
  lit: number;
}) {
  const pitch = 112;
  const width = pitch * steps.length;

  return (
    <Fig locale={locale} title={title} height={64} width={width} className="dk-fig--rail">
      {steps.map((s, i) => (
        <g key={s} className={`dk-fig__tempo${i < lit ? " is-lit" : ""}`} style={{ ["--dk-t-d" as string]: `${i * 60}ms` }}>
          <line x1={i * pitch + 6} y1={16} x2={i * pitch + pitch - 14} y2={16} />
          <text x={i * pitch + 6} y={44}>
            {s}
          </text>
        </g>
      ))}
    </Fig>
  );
}

/* ── watermark · the seal, oversized and cut by the edge ──────────────── */

export function Watermark() {
  return (
    <svg className="dk-watermark" viewBox="0 0 160 160" aria-hidden="true" focusable="false">
      <path d="M80 24L128 52V108L80 136L32 108V52L80 24Z" strokeWidth="4" strokeLinejoin="round" />
      <path d="M80 47L108 63.5V96.5L80 113L52 96.5V63.5L80 47Z" strokeWidth="3.4" strokeLinejoin="round" />
      <circle cx="80" cy="80" r="9" strokeWidth="3.4" />
    </svg>
  );
}
