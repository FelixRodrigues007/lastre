export type MapProvider = "mapbox" | "maptiler" | "none";

export type MapCredentials = {
  provider: MapProvider;
  token: string;
  styleUrl: string;
  label: string;
  ready: boolean;
};

/** Pastel ocean fill — matches reference cartography and map panel chrome. */
export const MARKETPLACE_MAP_OCEAN = "#aadaff";

/** Flat traditional map — blue ocean, no globe halo (Mapbox GL v3 defaults to globe). */
export const MAPBOX_MARKETPLACE_STYLE = "mapbox://styles/mapbox/streets-v12";

/**
 * Resolves map tiles for Marketplace / Global Mundi.
 * Mapbox uses the official mapbox-gl SDK; MapTiler uses MapLibre GL JS.
 */
export function resolveMapCredentials(): MapCredentials {
  const mapbox = import.meta.env.VITE_MAPBOX_TOKEN?.trim() ?? "";
  const maptiler = import.meta.env.VITE_MAPTILER_KEY?.trim() ?? "";

  if (mapbox) {
    return {
      provider: "mapbox",
      token: mapbox,
      styleUrl: MAPBOX_MARKETPLACE_STYLE,
      label: "Mapbox",
      ready: true,
    };
  }

  if (maptiler) {
    return {
      provider: "maptiler",
      token: maptiler,
      styleUrl: `https://api.maptiler.com/maps/streets-v4/style.json?key=${encodeURIComponent(maptiler)}`,
      label: "MapLibre · MapTiler",
      ready: true,
    };
  }

  return {
    provider: "none",
    token: "",
    styleUrl: "",
    label: "SVG fallback",
    ready: false,
  };
}

/** Keep marketplace map flat with pastel space — Mapbox GL v3 defaults to globe + fog. */
export function applyMarketplaceMapAppearance(map: {
  setProjection: (projection: "mercator" | "globe") => void;
  setFog?: (fog: Record<string, string | number> | null) => void;
}): void {
  map.setProjection("mercator");
  map.setFog?.({
    color: MARKETPLACE_MAP_OCEAN,
    "high-color": MARKETPLACE_MAP_OCEAN,
    "horizon-blend": 0.02,
    "space-color": MARKETPLACE_MAP_OCEAN,
    "star-intensity": 0,
  });
}
