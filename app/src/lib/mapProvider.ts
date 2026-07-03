/**
 * Map provider resolution — single source of truth for the Global Mundi map.
 *
 * The renderer is always MapLibre GL JS (open-source, vendor-neutral). The tile
 * source is pluggable so we can switch between providers WITHOUT touching the
 * map component:
 *
 *   - Mapbox   → set VITE_MAPBOX_TOKEN   (Laura's provider)
 *   - MapTiler → set VITE_MAPTILER_KEY   (current provider, kept working)
 *
 * If both are set, VITE_MAP_PROVIDER ("mapbox" | "maptiler") decides; otherwise
 * whichever token is present wins (Mapbox preferred). If neither is set — or the
 * tiles fail to load at runtime — the map component falls back to the zero-token
 * SVG surface so the demo never hard-breaks.
 *
 * Advanced: VITE_MAP_STYLE_URL overrides the default style for the active
 * provider (e.g. a custom Mapbox Studio style).
 *
 * DEMONSTRATION ONLY — fictional origin data, not GPS custody tracking.
 */

export type MapProvider = "mapbox" | "maptiler";

export interface MapProviderConfig {
  /** Chosen provider, or null when no key is configured. */
  provider: MapProvider | null;
  /** True when a style can actually be loaded (token/style available). */
  ready: boolean;
  /** Style URL passed to MapLibre. Empty string when not ready. */
  styleUrl: string;
  /** Optional request rewriter (Mapbox needs this for mapbox:// internals). */
  transformRequest?: (url: string) => { url: string } | undefined;
  /** Human label for the renderer row in the info panel. */
  rendererLabel: string;
  /** Human label for the tiles/styles row in the info panel. */
  tilesLabel: string;
  /** Human label for the API-key row in the info panel. */
  statusLabel: string;
  /** Short label for loading state, e.g. "Mapbox". */
  loadingLabel: string;
}

const RENDERER_LABEL = "MapLibre GL JS";
const DEFAULT_MAPBOX_STYLE = "https://api.mapbox.com/styles/v1/mapbox/streets-v12";
const DEFAULT_MAPTILER_STYLE = "https://api.maptiler.com/maps/streets-v4/style.json";

function readEnv(key: string): string {
  const value = (import.meta.env as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function withToken(url: string, param: string, token: string): string {
  if (new RegExp(`[?&]${param}=`).test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${param}=${encodeURIComponent(token)}`;
}

/**
 * Rewrites Mapbox `mapbox://` resource URLs to their https API equivalents and
 * injects the access token. Required because MapLibre does not resolve the
 * `mapbox://` protocol natively. Also appends the token to any bare
 * api.mapbox.com request (e.g. the initial style fetch).
 */
function mapboxTransformRequest(token: string): (url: string) => { url: string } | undefined {
  return (url: string) => {
    if (!url.startsWith("mapbox://")) {
      if (url.startsWith("https://api.mapbox.com/") && !/[?&]access_token=/.test(url)) {
        return { url: withToken(url, "access_token", token) };
      }
      return undefined;
    }

    const path = url.slice("mapbox://".length);

    // Fonts/glyphs: mapbox://fonts/{user}/{fontstack}/{range}.pbf
    if (path.startsWith("fonts/")) {
      return {
        url: withToken(`https://api.mapbox.com/fonts/v1/${path.slice("fonts/".length)}`, "access_token", token),
      };
    }

    // Sprites: mapbox://sprites/{user}/{style}[suffix] e.g. .json, .png, @2x.png
    if (path.startsWith("sprites/")) {
      const rest = path.slice("sprites/".length);
      const match = rest.match(/^([^/.@]+)\/([^/.@]+)(.*)$/u);
      if (match) {
        const [, user, style, suffix] = match;
        return {
          url: withToken(`https://api.mapbox.com/styles/v1/${user}/${style}/sprite${suffix}`, "access_token", token),
        };
      }
      return { url: withToken(`https://api.mapbox.com/styles/v1/${rest}`, "access_token", token) };
    }

    // Styles: mapbox://styles/{user}/{style}
    if (path.startsWith("styles/")) {
      return {
        url: withToken(`https://api.mapbox.com/styles/v1/${path.slice("styles/".length)}`, "access_token", token),
      };
    }

    // Tilesets / vector sources: mapbox://{tileset-id} -> TileJSON
    return { url: withToken(`https://api.mapbox.com/v4/${path}.json?secure`, "access_token", token) };
  };
}

function chooseProvider(mapboxToken: string, maptilerKey: string): MapProvider | null {
  const explicit = readEnv("VITE_MAP_PROVIDER").toLowerCase();
  if (explicit === "mapbox" || explicit === "maptiler") return explicit;
  if (mapboxToken) return "mapbox";
  if (maptilerKey) return "maptiler";
  return null;
}

export function resolveMapProvider(): MapProviderConfig {
  const mapboxToken = readEnv("VITE_MAPBOX_TOKEN") || readEnv("VITE_MAPBOX_ACCESS_TOKEN");
  const maptilerKey = readEnv("VITE_MAPTILER_KEY");
  const customStyle = readEnv("VITE_MAP_STYLE_URL");
  const provider = chooseProvider(mapboxToken, maptilerKey);

  if (provider === "mapbox") {
    const ready = Boolean(mapboxToken || customStyle);
    const baseStyle = customStyle || DEFAULT_MAPBOX_STYLE;
    const styleUrl = ready
      ? mapboxToken
        ? withToken(baseStyle, "access_token", mapboxToken)
        : baseStyle
      : "";
    return {
      provider,
      ready,
      styleUrl,
      transformRequest: mapboxToken ? mapboxTransformRequest(mapboxToken) : undefined,
      rendererLabel: RENDERER_LABEL,
      tilesLabel: "Mapbox",
      statusLabel: ready ? "VITE_MAPBOX_TOKEN configured" : "Waiting for VITE_MAPBOX_TOKEN",
      loadingLabel: "Mapbox",
    };
  }

  if (provider === "maptiler") {
    const ready = Boolean(maptilerKey || customStyle);
    const baseStyle = customStyle || DEFAULT_MAPTILER_STYLE;
    const styleUrl = ready
      ? maptilerKey
        ? withToken(baseStyle, "key", maptilerKey)
        : baseStyle
      : "";
    return {
      provider,
      ready,
      styleUrl,
      rendererLabel: RENDERER_LABEL,
      tilesLabel: "MapTiler Cloud",
      statusLabel: ready ? "VITE_MAPTILER_KEY configured" : "Waiting for VITE_MAPTILER_KEY",
      loadingLabel: "MapTiler",
    };
  }

  return {
    provider: null,
    ready: false,
    styleUrl: "",
    rendererLabel: RENDERER_LABEL,
    tilesLabel: "Mapbox or MapTiler",
    statusLabel: "Waiting for VITE_MAPBOX_TOKEN or VITE_MAPTILER_KEY",
    loadingLabel: "vector",
  };
}
