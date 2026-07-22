import { Link } from "react-router-dom";
import { MarketSiteDashboard } from "./MarketSiteDashboard";
import { MarketplaceAssetBadge } from "./MarketplaceAssetBadge";
import { useLocaleContext } from "../../context/LocaleContext";
import { shortHash } from "../../lib/format";
import { resolveMapCredentials, MAPBOX_MARKETPLACE_STYLE } from "../../lib/mapConfig";
import { getSiteCameras } from "../../lib/siteCameras";
import type { EnrichedAsset, MarketplacePersona } from "../../lib/marketplaceTypes";
import "./market-asset-detail.css";

function staticMapUrl(lat: number, lng: number): string | null {
  const mapbox = resolveMapCredentials();
  if (mapbox.provider !== "mapbox" || !mapbox.token) return null;
  const pin = `pin-s+72c458(${lng},${lat})`;
  const styleId = MAPBOX_MARKETPLACE_STYLE.replace("mapbox://styles/mapbox/", "");
  return `https://api.mapbox.com/styles/v1/mapbox/${styleId}/static/${pin}/${lng},${lat},10,0/520x280@2x?access_token=${encodeURIComponent(mapbox.token)}`;
}

type MarketAssetDetailProps = {
  asset: EnrichedAsset;
  persona: MarketplacePersona;
  locked: boolean;
  layout?: "panel" | "page";
  onClose: () => void;
  onClaim: () => void;
  onLock: () => void;
  onRelease: () => void;
};

export function MarketAssetDetail({
  asset,
  persona,
  locked,
  layout = "panel",
  onClose,
  onClaim,
  onLock,
  onRelease,
}: MarketAssetDetailProps) {
  const { t } = useLocaleContext();
  const assetId = String(asset.asset.assetId);
  const lockReasonId = `market-lock-reason-${assetId}`;
  const cameras = getSiteCameras({
    isCarbon: asset.isCarbon,
    label: asset.label,
    assetId,
  });
  const origin = asset.mapPoint;
  const mapPreview = origin ? staticMapUrl(origin.lat, origin.lng) : null;
  const siteName = String(
    (asset.asset.origin as { site?: string } | undefined)?.site ?? asset.label,
  );
  const siteDash = siteName.indexOf(" — ");
  const siteTitle = siteDash >= 0 ? siteName.slice(0, siteDash) : siteName;
  const siteDisclaimer = siteDash >= 0 ? siteName.slice(siteDash + 3) : null;

  return (
    <article
      className={`market-detail${layout === "page" ? " market-detail--page" : ""}`}
      aria-label={`Asset detail: ${asset.label}`}
    >
      <header className="market-detail__head">
        {layout === "page" ? null : (
          <button type="button" className="market-detail__close" onClick={onClose} aria-label="Close detail">
            ×
          </button>
        )}
      </header>

      <div className="market-detail__layout">
        <div className="market-detail__monitor">
          <header className="market-detail__site-head">
            <MarketplaceAssetBadge item={asset} size="sm" />
            <h1 className="market-detail__title">
              {siteTitle}
              {siteDisclaimer ? (
                <span className="market-detail__title-disclaimer"> — {siteDisclaimer}</span>
              ) : null}
            </h1>
            <p className="market-detail__id mono-label">{assetId}</p>
          </header>

          <section className="market-detail__section market-detail__section--cams" aria-label="Site monitoring">
            <MarketSiteDashboard asset={asset} cameras={cameras} siteName={siteName} />
          </section>
        </div>

        <aside className="market-detail__rail">
          <section className="market-detail__section market-detail__section--prov" aria-labelledby="market-prov-title">
            <h3 id="market-prov-title" className="market-detail__section-label">Provenance</h3>
            <dl className="market-detail-metrics">
              <div>
                <dt>Score</dt>
                <dd>{asset.provScore}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{asset.status}</dd>
              </div>
              <div>
                <dt>Seal</dt>
                <dd><code>{shortHash(asset.computedSeal, 8, 6)}</code></dd>
              </div>
              <div>
                <dt>Volume</dt>
                <dd>
                  {asset.quantity
                    ? `${asset.quantity.toLocaleString()} ${asset.unit}`
                    : asset.detail}
                </dd>
              </div>
            </dl>
          </section>

          <section className="market-detail__section" aria-labelledby="market-origin-title">
            <h3 id="market-origin-title" className="market-detail__section-label">Origin</h3>
            <p className="market-detail__coords">
              {origin ? `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}` : "No coordinates"}
            </p>
            {mapPreview ? (
              <img className="market-detail-map" src={mapPreview} alt={`Map preview for ${asset.label}`} />
            ) : (
              <div className="market-detail-map market-detail-map--empty">Map preview unavailable</div>
            )}
          </section>

          <section className="market-detail__section market-detail__section--actions" aria-labelledby="market-actions-title">
            <h3 id="market-actions-title" className="market-detail__section-label">Next steps</h3>
            <p className="market-detail__hint">Symbolic demo — no real ownership transfer.</p>
            <div className="market-detail__actions">
              <Link className="route-cta" to={`/lots?lot=${encodeURIComponent(assetId)}`}>
                Open evidence room
              </Link>
              {asset.isValidProof && !asset.isMinted ? (
                <button type="button" className="route-cta route-cta--ghost" onClick={onClaim}>
                  Claim (demo)
                </button>
              ) : null}
              {asset.isMinted && (persona === "defi" || persona === "buyer") && !locked ? (
                <>
                  <button
                    type="button"
                    className="route-cta route-cta--ghost"
                    onClick={onLock}
                    disabled={!asset.isValidProof}
                    aria-describedby={!asset.isValidProof ? lockReasonId : undefined}
                  >
                    Lock collateral
                  </button>
                  {!asset.isValidProof ? (
                    <p id={lockReasonId} className="market-detail__hint market-detail__hint--danger">
                      {t("myassets.rail.lockDisabledReason")}
                    </p>
                  ) : null}
                </>
              ) : null}
              {asset.isMinted && locked ? (
                <button type="button" className="route-cta route-cta--ghost" onClick={onRelease}>
                  Release collateral
                </button>
              ) : null}
            </div>
            <p className="market-detail__hint">{t("myassets.rail.collateralHonesty")}</p>
          </section>
        </aside>
      </div>
    </article>
  );
}
