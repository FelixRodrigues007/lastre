import { getMarketplaceCoverFromAsset, MARKETPLACE_COVER_FALLBACK } from "../../lib/marketplaceCovers";
import type { ProvenanceArtifact } from "../../lib/types";
import "./lot-preview-thumb.css";

type LotPreviewThumbProps = {
  artifact: ProvenanceArtifact;
  size?: "sm" | "md";
  className?: string;
};

export function LotPreviewThumb({ artifact, size = "sm", className = "" }: LotPreviewThumbProps) {
  const coverUrl = getMarketplaceCoverFromAsset(artifact as Record<string, unknown>);
  const classes = ["lot-preview-thumb", `lot-preview-thumb--${size}`, className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-hidden="true">
      <img
        className="lot-preview-thumb__photo"
        src={coverUrl}
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
  );
}
