import { MarketplaceAssetBadge } from "./MarketplaceAssetBadge";
import { shortHash } from "../../lib/format";
import { MARKETPLACE_COVER_FALLBACK } from "../../lib/marketplaceCovers";
import type { EnrichedAsset } from "../../lib/marketplaceTypes";
import "./market-lot-card.css";

type MarketLotCardProps = {
  item: EnrichedAsset;
  isHovered: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
};

export function MarketLotCard({
  item,
  isHovered,
  isSelected,
  onSelect,
  onHover,
}: MarketLotCardProps) {
  const assetId = String(item.asset.assetId);
  const origin = item.asset.origin as { site?: string; label?: string } | undefined;
  const location = origin?.site || origin?.label;
  const stats = [
    item.isCarbon ? String(item.asset.creditType || "Carbon") : String(item.asset.mineral || item.asset.mineralType || "Mineral"),
    item.quantity ? `${item.quantity.toLocaleString()} ${item.unit}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      className={`market-lot-card${isHovered ? " market-lot-card--hovered" : ""}${isSelected ? " market-lot-card--selected" : ""}`}
      aria-label={`Open ${item.label}`}
      aria-pressed={isSelected}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <span className="market-lot-card__cover" aria-hidden="true">
        <img
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
      <span className="market-lot-card__body">
        <span className="market-lot-card__head">
          <MarketplaceAssetBadge item={item} size="sm" />
          <span className="market-lot-card__score">{item.provScore}</span>
        </span>
        <strong className="market-lot-card__title">{item.label}</strong>
        <span className="market-lot-card__stats">{stats}</span>
        <span className="market-lot-card__seal mono-label">{shortHash(item.computedSeal, 8, 4)}</span>
        <span className="market-lot-card__foot">
          {location ? `${location} · ` : ""}
          <span className="mono-label">{assetId}</span>
        </span>
      </span>
    </button>
  );
}
