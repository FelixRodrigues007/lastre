import type { Locale } from "../../i18n/translations";
import type { L10n } from "../types";
import { BRAZIL, WORLD, brazilXY, worldXY } from "./geo-data";
import { Fig, Marker, W } from "./Marker";

/* ─────────────────────────────────────────────────────────────────────────
 * Os dois mapas.
 *
 * O mapa não é o objeto — o marcador é. A silhueta é pálida de propósito:
 * existe para o olho saber onde está, não para ser lida. Nada de grade, nada
 * de meridiano, nada de oceano.
 *
 * Os dois são desenhados no espaço de autoria do deck (1200 de largura), onde
 * o marcador tem o raio de sempre. A silhueta entra escalada e o resto da
 * folha vira goteira de rótulo — é lá que o argumento é lido. Os marcadores
 * usam as mesmas funções de projeção do gerador; daí caírem no lugar
 * geográfico certo, e não perto dele.
 *
 * A silhueta entra num <svg> aninhado, e não num <g transform>: o reset de
 * impressão zera transform em tudo dentro da folha, e a silhueta saía 1,33×
 * maior que os marcadores no PDF.
 * ───────────────────────────────────────────────────────────────────────── */

/** A silhueta e o halo que a descola da folha. Uma path, desenhada duas vezes. */
function Silhouette({ d, fill }: { d: string; fill?: boolean }) {
  return (
    <>
      <path className="dk-fig__geo-halo" d={d} />
      <path className={fill ? "dk-fig__geo dk-fig__geo--fill" : "dk-fig__geo"} d={d} />
    </>
  );
}

/* ── o mundo · a rede de custódia ─────────────────────────────────────── */

const WK = W / WORLD.w;
/* O Ártico não tem marcador nenhum e comia um sexto da folha: sai do viewBox.
 * O sul fica inteiro — continente cortado no meio lê como erro, não como
 * recorte. */
const WCROP = 66;
const WH = Math.round(WORLD.h * WK) - WCROP;

type Site = {
  lon: number;
  lat: number;
  /** y do centro do círculo, já no espaço recortado. A haste é vertical. */
  stemTop: number;
  label: string;
  sub?: string;
  /** O elo que não existe: zero coral, anel vazio. */
  zero?: boolean;
  side?: "left" | "right";
};

export function WorldMap({
  locale,
  title,
  sites,
}: {
  locale: Locale;
  title: L10n;
  sites: Site[];
}) {
  return (
    <Fig locale={locale} title={title} height={WH} className="dk-fig--map">
      <svg
        x={0}
        y={-WCROP}
        width={WORLD.w * WK}
        height={WORLD.h * WK}
        viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
      >
        <Silhouette d={WORLD.d} />
      </svg>
      {sites.map((s, i) => {
        const [x, y] = worldXY(s.lon, s.lat);
        return (
          <Marker
            key={s.label}
            x={x * WK}
            y={y * WK - WCROP}
            stemTop={s.stemTop}
            value={s.zero ? 0 : undefined}
            pct={s.zero ? 0 : 1}
            tone={s.zero ? "negative" : "default"}
            label={s.label}
            sub={s.sub}
            side={s.side}
            order={i}
          />
        );
      })}
    </Fig>
  );
}

/* ── o brasil · onde o ouro está ──────────────────────────────────────── */

/* O Brasil é vertical e estreito. Ele fica no meio, grande, e as duas
 * goteiras de 250 recebem os rótulos — que aqui são o conteúdo. */
const BK = 700 / BRAZIL.w;
const BX = Math.round((W - BRAZIL.w * BK) / 2);
const BY = 60;
const BH = Math.round(BRAZIL.h * BK) + BY + 60;

type Place = {
  lon: number;
  lat: number;
  stemTop: number;
  label: string;
  sub?: string;
  side?: "left" | "right";
};

export function BrazilMap({
  locale,
  title,
  hero,
  places,
}: {
  locale: Locale;
  title: L10n;
  /** O único ponto com número — o Pará. Os outros são referência, não medida. */
  hero: Place & { value: string; pct: number };
  places: Place[];
}) {
  const at = (lon: number, lat: number): [number, number] => {
    const [x, y] = brazilXY(lon, lat);
    return [x * BK + BX, y * BK + BY];
  };
  const [hx, hy] = at(hero.lon, hero.lat);

  return (
    <Fig locale={locale} title={title} height={BH} className="dk-fig--map dk-fig--brasil">
      <svg
        x={BX}
        y={BY}
        width={BRAZIL.w * BK}
        height={BRAZIL.h * BK}
        viewBox={`0 0 ${BRAZIL.w} ${BRAZIL.h}`}
      >
        <Silhouette d={BRAZIL.d} />
        <Silhouette d={BRAZIL.para} fill />
      </svg>
      <Marker
        x={hx}
        y={hy}
        stemTop={hero.stemTop}
        value={hero.value}
        pct={hero.pct}
        label={hero.label}
        sub={hero.sub}
        side={hero.side}
        order={0}
      />
      {places.map((p, i) => {
        const [x, y] = at(p.lon, p.lat);
        return (
          <Marker
            key={p.label}
            x={x}
            y={y}
            stemTop={p.stemTop}
            label={p.label}
            sub={p.sub}
            side={p.side}
            bare
            order={i + 1}
          />
        );
      })}
    </Fig>
  );
}
