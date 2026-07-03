import { getDemoCatalogAsset } from "../../lib/demoCatalog";
import { getMarketplaceCoverUrl, MARKETPLACE_COVER_FALLBACK } from "../../lib/marketplaceCovers";
import { computeProvScore } from "../../lib/provenanceScore";
import type { LotListItem } from "../../lib/types";
import "./my-assets-asset-list.css";

type MyAssetsAssetListProps = {
  assets: LotListItem[];
  selectedId: string | null;
  onSelect: (assetId: string) => void;
};

export function assetDisplayName(lot: LotListItem): string {
  const catalog = getDemoCatalogAsset(lot.artifact.assetId);
  if (catalog?.name) return catalog.name;

  const a = lot.artifact;
  if (a.creditType && a.vintage) return `${a.creditType} · ${a.vintage}`;
  if (a.creditType) return `${a.creditType} credit`;
  if (a.mineral) return `${a.mineral} · ${a.origin.site.split("—")[0]?.trim() ?? a.origin.site}`;
  return a.assetId;
}

function assetCoverUrl(lot: LotListItem): string {
  const a = lot.artifact;
  return getMarketplaceCoverUrl({
    assetId: a.assetId,
    isCarbon: a.category === "carbon_credit" || Boolean(a.creditType),
    creditType: a.creditType,
    mineral: a.mineral,
  });
}

export function MyAssetsAssetList({ assets, selectedId, onSelect }: MyAssetsAssetListProps) {
  return (
    <div className="my-assets-strip" aria-label="Asset collection">
      <p className="my-assets-strip__hint">Selecione o ativo</p>
      <ul className="my-assets-strip__cards" role="listbox" aria-label="Select an asset">
        {assets.map((lot) => {
          const a = lot.artifact;
          const selected = selectedId === a.assetId;
          const label = assetDisplayName(lot);
          const score = computeProvScore(lot);

          return (
            <li key={a.assetId} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                className={`my-assets-strip__card${selected ? " my-assets-strip__card--selected" : ""}`}
                onClick={() => onSelect(a.assetId)}
              >
                <span className="my-assets-strip__thumb" aria-hidden="true">
                  <img
                    className="my-assets-strip__photo"
                    src={assetCoverUrl(lot)}
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
                <span className="my-assets-strip__body">
                  <span className="my-assets-strip__label">{label}</span>
                  <span className="my-assets-strip__score">Score {score}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
