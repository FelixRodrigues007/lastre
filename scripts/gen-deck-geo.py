#!/usr/bin/env python3
"""
Gera web/src/decks/figures/geo-data.ts — as silhuetas dos dois mapas do deck.

Offline, roda à mão. O runtime não ganha dependência nenhuma: recebe string
de path e duas funções de projeção que usam exatamente as constantes daqui.

    python3 scripts/gen-deck-geo.py

Fontes (baixadas para um diretório de trabalho, ver SOURCES):
  world-atlas@2/countries-110m.json          → silhueta do mundo (objeto `land`)
  world-atlas@2/countries-50m.json           → Brasil (objeto `countries`, id 076)
  click_that_hood/brazil-states.geojson      → Pará

Armadilhas que já custaram uma iteração cada, e por que o código é assim:

  1. Arredondar para inteiro e formatar como inteiro. Nada de `rstrip("0")`,
     que transforma 100 em 1 e o mapa num emaranhado de riscos.
  2. A Antártida cruza o mapa inteiro; clampada em latitude vira uma faixa
     horizontal atravessando tudo. Descartada antes de projetar.
  3. O antimeridiano: a Eurásia é um anel único que passa de +180 para -180 em
     Chukotka. Cortar o anel destrói a forma. A longitude é *desenrolada* —
     somando ±360 para que dois pontos consecutivos nunca difiram de 180° — e
     o excesso sai do viewBox, que é o comportamento desejado.
  4. O domínio de x vem de -180/+180 fixos, não dos dados; senão o mapa é
     espremido pelo excesso da Chukotka. O de y continua vindo dos dados.
"""

from __future__ import annotations

import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "web/src/decks/figures/geo-data.ts")

SOURCES = {
    "world": "world-110m.json",
    "brazil": "world-50m.json",
    "states": "br-states.geojson",
}

# ── topojson à mão ────────────────────────────────────────────────────────


def decode_arcs(topo):
    """Aplica transform.scale/translate e desfaz o delta-encoding dos arcos."""
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    out = []
    for arc in topo["arcs"]:
        x = y = 0
        ring = []
        for dx, dy in arc:
            x += dx
            y += dy
            ring.append((x * sx + tx, y * sy + ty))
        out.append(ring)
    return out


def stitch(arcs, indexes):
    """Um anel = uma sequência de índices de arco. Negativo = arco invertido."""
    ring = []
    for i in indexes:
        arc = arcs[i] if i >= 0 else arcs[~i][::-1]
        ring.extend(arc if not ring else arc[1:])
    return ring


def rings_of(topo, arcs, obj_name, keep=None):
    """Todos os anéis de um objeto topojson, filtrando geometrias por `keep`."""
    out = []
    geoms = topo["objects"][obj_name]
    geoms = geoms["geometries"] if geoms["type"] == "GeometryCollection" else [geoms]
    for g in geoms:
        if keep and not keep(g):
            continue
        if g["type"] == "Polygon":
            polys = [g["arcs"]]
        elif g["type"] == "MultiPolygon":
            polys = g["arcs"]
        else:
            continue
        for poly in polys:
            for ring in poly:
                out.append(stitch(arcs, ring))
    return out


def geojson_rings(feature):
    geom = feature["geometry"]
    polys = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
    return [[(p[0], p[1]) for p in ring] for poly in polys for ring in poly]


# ── projeções ─────────────────────────────────────────────────────────────

WORLD_W = 1600.0
BRAZIL_W = 900.0
BR_TILT = math.cos(math.radians(-14.0))


def miller_y(lat):
    phi = math.radians(max(-84.0, min(84.0, lat)))
    return -1.25 * math.log(math.tan(math.pi / 4 + 0.4 * phi))


def unwrap(ring):
    """Desenrola a longitude: nenhum salto consecutivo maior que 180°."""
    out = []
    off = 0.0
    prev = None
    for lon, lat in ring:
        if prev is not None:
            d = (lon + off) - prev
            if d > 180:
                off -= 360
            elif d < -180:
                off += 360
        out.append((lon + off, lat))
        prev = lon + off
    return out


def area(pts):
    s = 0.0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2


def thin(pts, min_d=1.6):
    """Descarta pontos consecutivos a menos de min_d px um do outro."""
    out = [pts[0]]
    for p in pts[1:]:
        q = out[-1]
        if (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 >= min_d * min_d:
            out.append(p)
    return out


def to_path(rings, min_area):
    d = []
    for pts in rings:
        if len(pts) < 4 or area(pts) < min_area:
            continue
        pts = thin(pts)
        if len(pts) < 4:
            continue
        d.append("M" + "L".join(f"{round(x)} {round(y)}" for x, y in pts) + "Z")
    return "".join(d)


# ── mundo ─────────────────────────────────────────────────────────────────


def build_world(topo):
    arcs = decode_arcs(topo)
    rings = rings_of(topo, arcs, "land")

    # armadilha 2 — a Antártida sai antes de projetar
    rings = [r for r in rings if max(lat for _, lat in r) >= -56]

    # armadilha 4 — x vem de ±180 fixos; y, dos dados
    s = WORLD_W / (2 * math.pi)
    unwrapped = [unwrap(r) for r in rings]
    ys = [miller_y(lat) for r in unwrapped for _, lat in r]
    y0, y1 = min(ys), max(ys)
    height = (y1 - y0) * s

    def xy(lon, lat):
        return ((math.radians(lon) + math.pi) * s, (miller_y(lat) - y0) * s)

    projected = [[xy(lon, lat) for lon, lat in r] for r in unwrapped]
    return to_path(projected, 22), round(height), {"s": s, "y0": y0}


# ── brasil e pará ─────────────────────────────────────────────────────────


def build_brazil(topo, states):
    arcs = decode_arcs(topo)
    rings = rings_of(topo, arcs, "countries", keep=lambda g: str(g.get("id")) == "076")

    lons = [lon for r in rings for lon, _ in r]
    lats = [lat for r in rings for _, lat in r]
    lon0, lat1 = min(lons), max(lats)
    s = BRAZIL_W / ((max(lons) - lon0) * BR_TILT)
    height = (lat1 - min(lats)) * s

    def xy(lon, lat):
        return ((lon - lon0) * BR_TILT * s, (lat1 - lat) * s)

    br = to_path([[xy(lon, lat) for lon, lat in r] for r in rings], 6)

    para = next(f for f in states["features"] if f["properties"]["sigla"] == "PA")
    pa = to_path([[xy(lon, lat) for lon, lat in r] for r in geojson_rings(para)], 6)

    return br, pa, round(height), {"s": s, "lon0": lon0, "lat1": lat1}


# ── saída ─────────────────────────────────────────────────────────────────

TEMPLATE = '''/* NÃO EDITAR À MÃO — REGERAR com `python3 scripts/gen-deck-geo.py`.
 *
 * Silhuetas dos dois mapas do deck e as funções de projeção que as acompanham.
 * As constantes abaixo são as mesmas do gerador — mexer numa sem mexer na
 * outra faz os marcadores caírem no lugar errado.
 */

export const WORLD = {{
  w: {ww},
  h: {wh},
  d: "{wd}",
}} as const;

export const BRAZIL = {{
  w: {bw},
  h: {bh},
  /** Contorno do país. */
  d: "{bd}",
  /** O Pará, no mesmo transform — preenchido um tom acima do resto. */
  para: "{pd}",
}} as const;

const WORLD_S = {ws};
const WORLD_Y0 = {wy0};
const BR_S = {bs};
const BR_LON0 = {blon0};
const BR_LAT1 = {blat1};
const BR_TILT = Math.cos((-14 * Math.PI) / 180);

const millerY = (lat: number) => {{
  const phi = (Math.max(-84, Math.min(84, lat)) * Math.PI) / 180;
  return -1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi));
}};

/** Miller. Longitude em radianos, domínio fixo em ±180°. */
export function worldXY(lon: number, lat: number): [number, number] {{
  return [((lon * Math.PI) / 180 + Math.PI) * WORLD_S, (millerY(lat) - WORLD_Y0) * WORLD_S];
}}

/** Equirretangular, com x inclinado por cos(-14°) — o Brasil é vertical. */
export function brazilXY(lon: number, lat: number): [number, number] {{
  return [(lon - BR_LON0) * BR_TILT * BR_S, (BR_LAT1 - lat) * BR_S];
}}
'''


def main():
    work = sys.argv[1] if len(sys.argv) > 1 else "."
    src = {k: os.path.join(work, v) for k, v in SOURCES.items()}
    for path in src.values():
        if not os.path.exists(path):
            sys.exit(
                f"falta {path}. Baixe as três fontes listadas no cabeçalho para {work}/ "
                "e rode de novo."
            )

    wd, wh, wc = build_world(json.load(open(src["world"])))
    bd, pd, bh, bc = build_brazil(
        json.load(open(src["brazil"])), json.load(open(src["states"]))
    )

    ts = TEMPLATE.format(
        ww=int(WORLD_W),
        wh=wh,
        wd=wd,
        bw=int(BRAZIL_W),
        bh=bh,
        bd=bd,
        pd=pd,
        ws=repr(round(wc["s"], 6)),
        wy0=repr(round(wc["y0"], 6)),
        bs=repr(round(bc["s"], 6)),
        blon0=repr(round(bc["lon0"], 6)),
        blat1=repr(round(bc["lat1"], 6)),
    )
    with open(OUT, "w") as f:
        f.write(ts)

    print(f"mundo   {int(WORLD_W)} × {wh}  ·  {len(wd) / 1024:.1f} kB")
    print(f"brasil  {int(BRAZIL_W)} × {bh}  ·  {len(bd) / 1024:.1f} kB")
    print(f"pará                    ·  {len(pd) / 1024:.1f} kB")
    print(f"→ {OUT}")


if __name__ == "__main__":
    main()
