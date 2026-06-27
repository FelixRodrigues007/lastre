import { useMemo } from "react";
import DottedMap from "dotted-map/without-countries";
import type { MapData } from "dotted-map/without-countries";
import mapJson from "../../data/trust-globe-map.json";

/** Muted olive grid + seal pins on major mineral / data origin regions. */
const MAP_BG = "#070708";
const DOT_COLOR = "#3f4329";
const PIN_COLOR = "#fef16f";

const DATA_ORIGINS = [
  { lat: -22.9, lng: -69.3 }, // Atacama — lithium / copper
  { lat: -2.8, lng: 23.5 }, // DRC — cobalt
  { lat: -23.7, lng: 133.9 }, // Australia
  { lat: -9.2, lng: -75.0 }, // Peru — copper
  { lat: 62.0, lng: 16.0 }, // EU critical minerals
  { lat: 40.0, lng: 116.4 }, // processing hub
] as const;

function buildTrustGlobeSvg() {
  const map = new DottedMap({ map: mapJson as MapData });

  for (const pin of DATA_ORIGINS) {
    map.addPin({
      lat: pin.lat,
      lng: pin.lng,
      svgOptions: { color: PIN_COLOR, radius: 0.55 },
    });
  }

  return map.getSVG({
    radius: 0.2,
    color: DOT_COLOR,
    shape: "circle",
    backgroundColor: MAP_BG,
  });
}

/** Dotted world map — global data flow without proof of origin. */
export function TrustGlobeVisual() {
  const svg = useMemo(() => buildTrustGlobeSvg(), []);

  return (
    <div className="trust-globe" aria-hidden="true">
      <div className="trust-globe__stage">
        <div className="trust-globe__map" dangerouslySetInnerHTML={{ __html: svg }} />

        <div className="trust-globe__veil" />

        <blockquote className="trust-globe__callout">
          <p>
            Physical readings flow worldwide — yet almost none carry{" "}
            <strong>proof of origin</strong>.
          </p>
        </blockquote>
      </div>
    </div>
  );
}
