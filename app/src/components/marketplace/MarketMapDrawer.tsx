import { useEffect, useId } from "react";
import { Link } from "react-router-dom";
import { MarketplaceAssetBadge } from "./MarketplaceAssetBadge";
import { shortHash } from "../../lib/format";
import type { EnrichedAsset } from "../../lib/marketplaceTypes";
import "./market-map-drawer.css";

type MarketMapDrawerProps = {
  asset: EnrichedAsset;
  onClose: () => void;
};

export function MarketMapDrawer({ asset, onClose }: MarketMapDrawerProps) {
  const titleId = useId();
  const assetId = String(asset.asset.assetId);
  const origin = asset.asset.origin as { site?: string; label?: string } | undefined;
  const site = origin?.site || origin?.label;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="market-map-drawer-overlay" onClick={onClose} role="presentation">
      <aside
        className="market-map-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="market-map-drawer__head">
          <MarketplaceAssetBadge item={asset} size="sm" />
          <div className="market-map-drawer__titles">
            <h3 id={titleId} className="market-map-drawer__title">
              {asset.label}
            </h3>
            <p className="market-map-drawer__meta">
              {site ? `${site} · ` : ""}
              <span className="mono-label">{assetId}</span>
            </p>
          </div>
          <button
            type="button"
            className="market-map-drawer__close"
            onClick={onClose}
            aria-label="Close preview"
          >
            ×
          </button>
        </header>

        <div className="market-map-drawer__seal-row">
          <span className="market-map-drawer__seal-label">Seal</span>
          <code className="market-map-drawer__seal">{shortHash(asset.computedSeal, 10, 6)}</code>
          <span className="market-map-drawer__score">Score {asset.provScore}</span>
        </div>

        <p className="market-map-drawer__note small">
          Declared origin — fictional demo coordinates. Not GPS tracking or real-world custody.
        </p>

        <div className="market-map-drawer__actions">
          <Link className="route-cta" to={`/lots?lot=${encodeURIComponent(assetId)}`}>
            Ver evidências
          </Link>
          <Link className="route-cta route-cta--ghost" to={`/marketplace/${encodeURIComponent(assetId)}`}>
            Open asset page
          </Link>
        </div>
      </aside>
    </div>
  );
}
