import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { Map as MapboxMap } from "mapbox-gl";
import { CaptureWizardTrigger } from "../components/capture/CaptureWizardTrigger";
import { MarketMapDrawer } from "../components/marketplace/MarketMapDrawer";
import { MarketplaceAssetBadge } from "../components/marketplace/MarketplaceAssetBadge";
import { MarketplaceFilters } from "../components/marketplace/MarketplaceFilters";
import { SealedMarketRail } from "../components/marketplace/SealedMarketRail";
import { PageHeader } from "../components/layout/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { useOnboarding } from "../context/OnboardingContext";
import { getLots } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import {
  buildLotMap,
  buildMapPoints,
  enrichMarketplaceAsset,
  mergeMarketplaceAssets,
} from "../lib/marketplaceAssets";
import { resolveMapCredentials, applyMarketplaceMapAppearance, type MapCredentials } from "../lib/mapConfig";
import { MARKETPLACE_COVER_FALLBACK } from "../lib/marketplaceCovers";
import type { EnrichedAsset, MapPoint, MarketplacePersona } from "../lib/marketplaceTypes";
import "maplibre-gl/dist/maplibre-gl.css";
import "./marketplace.css";

const DEMO_PERSONA_STORAGE_KEY = "casper-demo-persona";
const MARKETPLACE_PAGE_SIZE = 5;
const MARKETPLACE_ANCHOR = { label: "Casper Testnet anchor", lat: 37.7749, lng: -122.4194 };
const MARKETPLACE_MAP_CONFIG = resolveMapCredentials();
const EMPTY_LOTS: never[] = [];

function useLatest<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

function readDemoStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeDemoStorage(key: string, value: string | null): void {
  if (typeof window === "undefined") return;

  if (value) {
    window.localStorage.setItem(key, value);
  } else {
    window.localStorage.removeItem(key);
  }
}

function readStoredPersona(): MarketplacePersona {
  const stored = readDemoStorage(DEMO_PERSONA_STORAGE_KEY);
  return stored === "public" || stored === "buyer" || stored === "defi" || stored === "operator"
    ? stored
    : "buyer";
}

export function Marketplace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const railAnchorRef = useRef<HTMLDivElement | null>(null);
  const lotsData = useAsyncData(getLots);
  const { completeStep } = useOnboarding();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | "mineral" | "carbon_credit">("all");
  const [creditFilter, setCreditFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "proven" | "minted" | "available">("all");
  const [page, setPage] = useState(1);
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<EnrichedAsset | null>(null);
  const [persona, setPersona] = useState<MarketplacePersona>(() => readStoredPersona());

  useEffect(() => {
    completeStep("marketplace");
  }, [completeStep]);

  useEffect(() => {
    setPage(1);
  }, [search, catFilter, creditFilter, statusFilter]);

  function updatePersona(nextPersona: MarketplacePersona) {
    writeDemoStorage(DEMO_PERSONA_STORAGE_KEY, nextPersona);
    setPersona(nextPersona);
  }

  // `?rail=1` (e.g. from a landing-page deep link) focuses the Sealed Market
  // Rail panel: switch to the DeFi/builder persona view and scroll it into
  // sight. Read once on mount — it must not fight persona changes made later
  // from the filters dropdown.
  useEffect(() => {
    if (searchParams.get("rail") !== "1") return;
    updatePersona("defi");
    railAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lots = lotsData.data?.lots ?? EMPTY_LOTS;

  const lotMap = useMemo(() => buildLotMap(lots as never[]), [lots]);
  const merged = useMemo(() => mergeMarketplaceAssets(lots as never[]), [lots]);

  const categoryTotals = useMemo(
    () => ({
      all: merged.length,
      mineral: merged.filter(
        (a: Record<string, unknown>) =>
          (a.category || (!a.creditType ? "mineral" : "carbon_credit")) === "mineral",
      ).length,
      carbon: merged.filter(
        (a: Record<string, unknown>) => a.category === "carbon_credit" || Boolean(a.creditType),
      ).length,
    }),
    [merged],
  );

  const visible = useMemo(() => {
    return merged.filter((a: any) => {
      const matchesSearch = !search || `${a.assetId} ${a.operator || ""} ${a.name || ""}`.toLowerCase().includes(search.toLowerCase());
      const cat = a.category || (a.creditType ? "carbon_credit" : "mineral");
      const matchesCat = catFilter === "all" || cat === catFilter;
      const matchesCredit = creditFilter === "all" || a.creditType === creditFilter;

      const lot = lotMap.get(a.assetId);
      const isInvalidProof =
        lot?.latestVerdict === "Invalid" || lot?.sealMatchesReference === false;
      const isValidProof =
        !isInvalidProof &&
        (lot?.latestVerdict === "Valid" || (a.expectedOnChain === "Valid" && !lot));
      const isMinted = !!lot?.isMinted || !!a.isMinted;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "proven" && isValidProof) ||
        (statusFilter === "minted" && isMinted) ||
        (statusFilter === "available" && isValidProof && !isMinted);

      // provenance score (demo, deterministic-ish on attestation + seal)
      const score = lot
        ? Math.min(99, 68 + (lot.attested ? 18 : 0) + (lot.sealMatchesReference ? 8 : 0) + (lot.latestVerdict === "Valid" ? 5 : 0))
        : (a.expectedOnChain === "Valid" ? 91 : 62);

      const matchesScore = score >= 60; // simple baseline; could be user filter

      return matchesSearch && matchesCat && matchesCredit && matchesStatus && matchesScore;
    });
  }, [merged, search, catFilter, creditFilter, statusFilter, lotMap]);

  const mapPoints = useMemo(
    () => buildMapPoints(visible, lotMap),
    [visible, lotMap],
  );

  const enrichedAssets = useMemo(
    () => visible.map((asset) => enrichMarketplaceAsset(asset, lotMap, mapPoints)),
    [visible, lotMap, mapPoints],
  );

  const pageCount = Math.max(1, Math.ceil(enrichedAssets.length / MARKETPLACE_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedAssets = useMemo(() => {
    const start = (currentPage - 1) * MARKETPLACE_PAGE_SIZE;
    return enrichedAssets.slice(start, start + MARKETPLACE_PAGE_SIZE);
  }, [enrichedAssets, currentPage]);

  const openAsset = useCallback(
    (assetId: string) => {
      navigate(`/marketplace/${encodeURIComponent(assetId)}`);
    },
    [navigate],
  );

  const handleSelectMapPoint = useCallback(
    (point: MapPoint) => {
      const asset = enrichedAssets.find((item) => String(item.asset.assetId) === point.assetId);
      if (asset) setPreviewAsset(asset);
    },
    [enrichedAssets],
  );

  const selectedMapAssetId = previewAsset ? String(previewAsset.asset.assetId) : null;

  return (
    <div className="page market-page">
      <div className="market-page__intro">
        <PageHeader
          kicker="Marketplace"
          title="Provenance Marketplace"
          lead="Browse verified assets on the map. Select a lot to inspect origin, proof status, and claim options (demo)."
          actions={
            <CaptureWizardTrigger className="route-cta">Capture New</CaptureWizardTrigger>
          }
        />

        <div ref={railAnchorRef}>
          <SealedMarketRail persona={persona} onPersonaChange={updatePersona} />
        </div>
      </div>

      <aside className="market-list" aria-label="Marketplace assets">
        <div className="market-list__search">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search assets…"
            ariaLabel="Search marketplace assets"
          />
        </div>

        <MarketplaceFilters
          category={catFilter}
          status={statusFilter}
          creditType={creditFilter}
          persona={persona}
          totals={categoryTotals}
          onCategoryChange={setCatFilter}
          onStatusChange={setStatusFilter}
          onCreditTypeChange={setCreditFilter}
          onPersonaChange={updatePersona}
        />

        <div className="market-list__scroll">
          {enrichedAssets.length === 0 ? (
            <p className="market-list__empty muted">No matching assets. Try clearing filters.</p>
          ) : (
            pagedAssets.map((item) => {
              const assetId = String(item.asset.assetId);
              return (
                <MarketListItem
                  key={assetId}
                  item={item}
                  isHovered={hoveredAssetId === assetId}
                  isSelected={selectedMapAssetId === assetId}
                  onSelect={() => openAsset(assetId)}
                  onHover={(hover) => setHoveredAssetId(hover ? assetId : null)}
                />
              );
            })
          )}
        </div>

        {enrichedAssets.length > MARKETPLACE_PAGE_SIZE ? (
          <MarketListPagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        ) : null}
      </aside>

      <div className="market-map" aria-label="Global Mundi provenance map">
        <MarketMapPanel
          points={mapPoints}
          hoveredAssetId={hoveredAssetId}
          selectedAssetId={selectedMapAssetId}
          previewAsset={previewAsset}
          onSelectPoint={handleSelectMapPoint}
          onHoverPoint={setHoveredAssetId}
          onClosePreview={() => setPreviewAsset(null)}
        />
      </div>
    </div>
  );
}

function MarketListPagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav className="market-list__pagination" aria-label="Asset list pages">
      <button
        type="button"
        className="market-list__page-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        ←
      </button>
      <div className="market-list__page-numbers" role="group" aria-label="Page numbers">
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`market-list__page-num${pageNumber === page ? " market-list__page-num--active" : ""}`}
            aria-current={pageNumber === page ? "page" : undefined}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="market-list__page-btn"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}

function MarketListItem({
  item,
  isHovered,
  isSelected,
  onSelect,
  onHover,
}: {
  item: EnrichedAsset;
  isHovered: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
}) {
  const assetId = String(item.asset.assetId);
  const origin = item.asset.origin as { site?: string; label?: string } | undefined;
  const location = origin?.site || origin?.label;
  const stats = [
    item.isCarbon ? String(item.asset.creditType || "Carbon") : String(item.asset.mineral || item.asset.mineralType || "Mineral"),
    item.quantity ? `${item.quantity.toLocaleString()} ${item.unit}` : null,
    `Score ${item.provScore}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      className={`market-list-item${isHovered ? " market-list-item--hovered" : ""}${isSelected ? " market-list-item--selected" : ""}`}
      aria-label={`Open ${item.label}`}
      aria-pressed={isSelected}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <span className="market-list-item__thumb" aria-hidden="true">
        <img
          className="market-list-item__photo"
          src={item.coverUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallback === "1") return;
            img.dataset.fallback = "1";
            img.src = MARKETPLACE_COVER_FALLBACK;
          }}
        />
      </span>
      <span className="market-list-item__body">
        <MarketplaceAssetBadge item={item} size="sm" className="market-list-item__status" />
        <strong className="market-list-item__title">{item.label}</strong>
        <span className="market-list-item__stats">{stats}</span>
        <span className="market-list-item__foot">
          {location ? `${location} · ` : ""}
          <span className="mono-label">{assetId}</span>
        </span>
      </span>
    </button>
  );
}

function MarketMapPanel({
  points,
  hoveredAssetId,
  selectedAssetId,
  previewAsset,
  onSelectPoint,
  onHoverPoint,
  onClosePreview,
}: {
  points: MapPoint[];
  hoveredAssetId: string | null;
  selectedAssetId: string | null;
  previewAsset: EnrichedAsset | null;
  onSelectPoint: (point: MapPoint) => void;
  onHoverPoint: (assetId: string | null) => void;
  onClosePreview: () => void;
}) {
  return (
    <div className="market-map-panel">
      <MundiMapCanvas
        points={points}
        anchor={MARKETPLACE_ANCHOR}
        mapConfig={MARKETPLACE_MAP_CONFIG}
        selectedAssetId={selectedAssetId}
        hoveredAssetId={hoveredAssetId}
        onSelectPoint={onSelectPoint}
        onHoverPoint={onHoverPoint}
      />

      <div className="market-map-legend" aria-label="Map legend">
        <div className="market-map-legend__items">
          <span>
            <i className="mundi-legend-dot mundi-legend-dot--origin mineral" aria-hidden="true" />
            Declared origin <em>(fictional)</em>
          </span>
          <span>
            <i className="mundi-legend-anchor" aria-hidden="true" />
            Casper on-chain anchor
          </span>
          <span>
            <i className="mundi-legend-line" aria-hidden="true" />
            Attestation route (demo)
          </span>
        </div>
        <p className="market-map-legend__note">
          Origins are operator-declared demo coordinates — not GPS tracking or real custody.
        </p>
      </div>

      {previewAsset ? (
        <MarketMapDrawer asset={previewAsset} onClose={onClosePreview} />
      ) : null}
    </div>
  );
}

type MundiMapInstance = MapLibreMap | MapboxMap;
type MundiMarkerHandle = { remove: () => void };

function createAnchorMarkerElement(label: string): HTMLDivElement {
  const markerEl = document.createElement("div");
  markerEl.className = "mundi-maplibre-marker mundi-maplibre-marker--anchor";
  markerEl.setAttribute("aria-label", label);
  markerEl.setAttribute("role", "img");
  markerEl.title = label;
  return markerEl;
}

function createMarkerElement(
  point: MapPoint,
  markerElsRef: MutableRefObject<Map<string, HTMLDivElement>>,
  onSelectPointRef: MutableRefObject<((point: MapPoint) => void) | undefined>,
  onHoverPointRef: MutableRefObject<((assetId: string | null) => void) | undefined>,
): HTMLDivElement {
  const markerEl = document.createElement("div");
  updateMarkerClasses(markerEl, point, null, null);
  markerEl.setAttribute("aria-label", `${point.label}: ${point.status}`);
  markerEl.setAttribute("role", "button");
  markerEl.tabIndex = 0;
  markerEl.dataset.assetId = point.assetId;
  markerElsRef.current.set(point.assetId, markerEl);

  markerEl.addEventListener("click", (event) => {
    event.stopPropagation();
    onSelectPointRef.current?.(point);
  });
  markerEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectPointRef.current?.(point);
    }
  });
  markerEl.addEventListener("mouseenter", () => onHoverPointRef.current?.(point.assetId));
  markerEl.addEventListener("mouseleave", () => onHoverPointRef.current?.(null));

  return markerEl;
}

function MundiMapCanvas({
  points,
  anchor,
  mapConfig,
  selectedAssetId,
  hoveredAssetId,
  onSelectPoint,
  onHoverPoint,
}: {
  points: MapPoint[];
  anchor: { label: string; lat: number; lng: number };
  mapConfig: MapCredentials;
  selectedAssetId?: string | null;
  hoveredAssetId?: string | null;
  onSelectPoint?: (point: MapPoint) => void;
  onHoverPoint?: (assetId: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MundiMapInstance | null>(null);
  const markersRef = useRef<MundiMarkerHandle[]>([]);
  const markerElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const mapReadyRef = useRef(false);
  const onSelectPointRef = useLatest(onSelectPoint);
  const onHoverPointRef = useLatest(onHoverPoint);
  const [mapStatus, setMapStatus] = useState<"fallback" | "loading" | "ready" | "error">(
    mapConfig.ready ? "loading" : "fallback",
  );

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    markerElsRef.current.clear();
  }, []);

  useEffect(() => {
    if (!mapConfig.ready || !containerRef.current) {
      setMapStatus("fallback");
      return;
    }

    let cancelled = false;
    let cleanup = () => {};
    const container = containerRef.current;
    mapReadyRef.current = false;
    setMapStatus("loading");

    const bindMap = (map: MundiMapInstance) => {
      mapRef.current = map;

      const resize = () => {
        if (!cancelled) map.resize();
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      const onLoad = () => {
        if (cancelled) return;
        if (mapConfig.provider === "mapbox" && "setProjection" in map) {
          applyMarketplaceMapAppearance(map as MapboxMap);
        }
        resize();
        mapReadyRef.current = true;
        setMapStatus("ready");
      };

      if (mapConfig.provider === "mapbox") {
        (map as MapboxMap).once("load", onLoad);
      } else {
        (map as MapLibreMap).once("load", onLoad);
      }

      cleanup = () => {
        resizeObserver.disconnect();
        clearMarkers();
        map.remove();
        mapRef.current = null;
        mapReadyRef.current = false;
      };
    };

    const boot = async () => {
      try {
        if (mapConfig.provider === "mapbox") {
          const mapboxgl = (await import("mapbox-gl")).default;
          await import("mapbox-gl/dist/mapbox-gl.css");
          if (cancelled || !container) return;

          mapboxgl.accessToken = mapConfig.token;
          const map = new mapboxgl.Map({
            container,
            style: mapConfig.styleUrl,
            center: [-45, -15],
            zoom: 2.1,
            projection: "mercator",
            attributionControl: true,
            cooperativeGestures: true,
          });

          map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
          bindMap(map);
          return;
        }

        const maplibre = await import("maplibre-gl");
        if (cancelled || !container) return;

        const map = new maplibre.Map({
          container,
          style: mapConfig.styleUrl,
          center: [0, 8],
          zoom: 1.08,
          attributionControl: { compact: true },
          cooperativeGestures: true,
        });

        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
        bindMap(map);
      } catch {
        if (!cancelled) setMapStatus("error");
      }
    };

    void boot();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [clearMarkers, mapConfig.provider, mapConfig.ready, mapConfig.styleUrl, mapConfig.token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current || mapStatus !== "ready") return;

    let cancelled = false;

    const sync = async () => {
      clearMarkers();

      if (mapConfig.provider === "mapbox") {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled || !mapRef.current) return;

        const mapboxMap = map as MapboxMap;
        markersRef.current = [
          ...points.map((point) => {
            const markerEl = createMarkerElement(point, markerElsRef, onSelectPointRef, onHoverPointRef);
            return new mapboxgl.Marker({ element: markerEl, anchor: "center" })
              .setLngLat([point.lng, point.lat])
              .addTo(mapboxMap);
          }),
          new mapboxgl.Marker({ element: createAnchorMarkerElement(anchor.label), anchor: "center" })
            .setLngLat([anchor.lng, anchor.lat])
            .addTo(mapboxMap),
        ];
      } else {
        const maplibre = await import("maplibre-gl");
        if (cancelled || !mapRef.current) return;

        const maplibreMap = map as MapLibreMap;
        markersRef.current = [
          ...points.map((point) => {
            const markerEl = createMarkerElement(point, markerElsRef, onSelectPointRef, onHoverPointRef);
            return new maplibre.Marker({ element: markerEl, anchor: "center" })
              .setLngLat([point.lng, point.lat])
              .addTo(maplibreMap);
          }),
          new maplibre.Marker({ element: createAnchorMarkerElement(anchor.label), anchor: "center" })
            .setLngLat([anchor.lng, anchor.lat])
            .addTo(maplibreMap),
        ];
      }

      updateMundiRouteLayer(map, points, anchor);
      fitMundiBounds(map, points, anchor);
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [anchor, clearMarkers, mapConfig.provider, mapStatus, points]);

  useEffect(() => {
    markerElsRef.current.forEach((el, assetId) => {
      const point = points.find((p) => p.assetId === assetId);
      if (point) updateMarkerClasses(el, point, selectedAssetId, hoveredAssetId);
    });
  }, [hoveredAssetId, points, selectedAssetId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedAssetId) return;
    const point = points.find((p) => p.assetId === selectedAssetId);
    if (!point) return;
    map.flyTo({
      center: [point.lng, point.lat],
      zoom: Math.max(map.getZoom(), 3.2),
      duration: 650,
      essential: true,
    });
  }, [points, selectedAssetId]);

  if (!mapConfig.ready || mapStatus === "error") {
    return (
      <MundiSvgFallback
        points={points}
        anchor={anchor}
        selectedAssetId={selectedAssetId}
        hoveredAssetId={hoveredAssetId}
        onSelectPoint={onSelectPoint}
        onHoverPoint={onHoverPoint}
      />
    );
  }

  return (
    <div className="mundi-maplibre-shell market-map-canvas">
      <div ref={containerRef} className="mundi-maplibre-canvas" aria-label="Interactive provenance map" />
      {mapStatus === "loading" ? (
        <div className="mundi-map-loading" role="status">Loading map…</div>
      ) : null}
    </div>
  );
}

function updateMarkerClasses(
  el: HTMLDivElement,
  point: MapPoint,
  selectedAssetId?: string | null,
  hoveredAssetId?: string | null,
) {
  const classes = ["mundi-maplibre-marker", "mundi-maplibre-marker--origin", point.category, point.status];
  if (selectedAssetId === point.assetId) classes.push("selected");
  if (hoveredAssetId === point.assetId) classes.push("hovered");
  el.className = classes.join(" ");
}

function buildMundiRouteGeoJson(points: MapPoint[], anchor: { lat: number; lng: number }) {
  return {
    type: "FeatureCollection" as const,
    features: points.map((point) => ({
      type: "Feature" as const,
      properties: { status: point.status },
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [point.lng, point.lat],
          [anchor.lng, anchor.lat],
        ],
      },
    })),
  };
}

function updateMundiRouteLayer(
  map: MundiMapInstance,
  points: MapPoint[],
  anchor: { lat: number; lng: number },
) {
  const data = buildMundiRouteGeoJson(points, anchor);
  const source = (map as MapboxMap).getSource("mundi-routes") as { setData?: (next: typeof data) => void } | undefined;

  if (source?.setData) {
    source.setData(data);
    return;
  }

  addMundiRouteLayer(map, points, anchor);
}

function addMundiRouteLayer(
  map: MundiMapInstance,
  points: MapPoint[],
  anchor: { lat: number; lng: number },
) {
  map.addSource("mundi-routes", {
    type: "geojson",
    data: buildMundiRouteGeoJson(points, anchor),
  });

  map.addLayer({
    id: "mundi-routes",
    type: "line",
    source: "mundi-routes",
    paint: {
      "line-color": ["match", ["get", "status"], "minted", "#6b9b5c", "proven", "#7a9aab", "#8a9aab"],
      "line-dasharray": [3, 3],
      "line-opacity": 0.72,
      "line-width": 1.4,
    },
  });
}

function fitMundiBounds(
  map: MundiMapInstance,
  points: MapPoint[],
  anchor: { lat: number; lng: number },
) {
  const coordinates = [...points.map((point) => [point.lng, point.lat] as const), [anchor.lng, anchor.lat] as const];
  const lngs = coordinates.map(([lng]) => lng);
  const lats = coordinates.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const padLng = minLng === maxLng ? 1 : 0;
  const padLat = minLat === maxLat ? 1 : 0;

  map.fitBounds(
    [
      [minLng - padLng, minLat - padLat],
      [maxLng + padLng, maxLat + padLat],
    ],
    { padding: 60, maxZoom: 3.5, duration: 700 },
  );
}

function MundiSvgFallback({
  points,
  anchor,
  selectedAssetId,
  hoveredAssetId,
  onSelectPoint,
  onHoverPoint,
}: {
  points: MapPoint[];
  anchor: { lat: number; lng: number };
  selectedAssetId?: string | null;
  hoveredAssetId?: string | null;
  onSelectPoint?: (point: MapPoint) => void;
  onHoverPoint?: (assetId: string | null) => void;
}) {
  return (
    <div className="mundi-canvas market-map-canvas">
      <svg viewBox="0 0 1000 520" role="img" aria-label="World map with provenance origin points">
        <rect width="1000" height="520" fill="#aadaff" />
        {[-120, -60, 0, 60, 120].map((lng) => (
          <line key={`lng-${lng}`} x1={project(lng, 85).x} x2={project(lng, -85).x} y1="42" y2="478" className="mundi-gridline" />
        ))}
        {[-60, -30, 0, 30, 60].map((lat) => (
          <line key={`lat-${lat}`} x1="70" x2="930" y1={project(0, lat).y} y2={project(0, lat).y} className="mundi-gridline" />
        ))}

        <path className="mundi-land" d="M178 177c42-35 117-52 164-17 34 25 15 71 56 85 35 12 62-19 91 2 33 24 8 73-27 89-53 24-135 2-188-29-44-26-132-84-96-130Z" />
        <path className="mundi-land" d="M416 124c66-44 204-42 272-8 50 25 78 72 52 106-34 45-126 14-168 45-35 26-4 79-54 97-56 20-136-39-148-100-9-46-24-103 46-140Z" />
        <path className="mundi-land" d="M666 298c56-19 129-7 164 36 31 38 3 91-53 104-69 16-165-25-171-78-4-30 20-49 60-62Z" />

        {points.map((point) => {
          const origin = project(point.lng, point.lat);
          const target = project(anchor.lng, anchor.lat);
          const isSelected = selectedAssetId === point.assetId;
          const isHovered = hoveredAssetId === point.assetId;
          return (
            <g
              key={point.assetId}
              className={`mundi-svg-point${isSelected ? " selected" : ""}${isHovered ? " hovered" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`${point.label}: ${point.status}`}
              aria-pressed={isSelected}
              onClick={() => onSelectPoint?.(point)}
              onMouseEnter={() => onHoverPoint?.(point.assetId)}
              onMouseLeave={() => onHoverPoint?.(null)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectPoint?.(point);
                }
              }}
            >
              <line x1={origin.x} y1={origin.y} x2={target.x} y2={target.y} className={`mundi-route ${point.status}`} />
              <circle cx={origin.x} cy={origin.y} r="7" className={`mundi-dot mundi-dot--origin ${point.category} ${point.status}`} />
              <title>{`${point.label} · ${point.detail} · ${point.status}`}</title>
            </g>
          );
        })}

        {points.length === 0 ? (
          <text x="500" y="262" textAnchor="middle" className="mundi-empty-svg">
            No mapped assets match the current filters
          </text>
        ) : null}

        <g>
          <polygon
            points={`${project(anchor.lng, anchor.lat).x},${project(anchor.lng, anchor.lat).y - 12} ${project(anchor.lng, anchor.lat).x + 10},${project(anchor.lng, anchor.lat).y} ${project(anchor.lng, anchor.lat).x},${project(anchor.lng, anchor.lat).y + 12} ${project(anchor.lng, anchor.lat).x - 10},${project(anchor.lng, anchor.lat).y}`}
            className="mundi-anchor-shape"
          />
          <text x={project(anchor.lng, anchor.lat).x + 18} y={project(anchor.lng, anchor.lat).y + 5} className="mundi-anchor-label">
            Casper anchor
          </text>
        </g>
      </svg>
    </div>
  );
}

function project(lng: number, lat: number) {
  return {
    x: ((lng + 180) / 360) * 1000,
    y: ((90 - lat) / 180) * 520,
  };
}
