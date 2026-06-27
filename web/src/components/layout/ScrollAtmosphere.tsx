import { ATMO_PRESETS, type AtmoZone } from "../../lib/initScrollAtmosphere";
import "./scroll-atmosphere.css";

const ZONES = Object.keys(ATMO_PRESETS) as AtmoZone[];

/** Fixed background stack — colors driven by html[data-atmo]. */
export function ScrollAtmosphere() {
  return (
    <div className="scroll-atmo" aria-hidden="true">
      <div className="scroll-atmo__base" />
      {ZONES.map((zone) => (
        <div key={zone} className={`scroll-atmo__wash scroll-atmo__wash--${zone}`} />
      ))}
      <div className="scroll-atmo__mesh" />
    </div>
  );
}
