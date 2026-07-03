import { VerdictBadge } from "../proof/Badges";
import { StatusBadge } from "../ui/StatusBadge";
import { useLocaleContext } from "../../context/LocaleContext";
import type { EnrichedAsset } from "../../lib/marketplaceTypes";
import type { VerificationVerdict } from "../../lib/types";

type MarketplaceAssetBadgeProps = {
  item: EnrichedAsset;
  size?: "sm" | "md";
  className?: string;
};

function resolveVerdict(item: EnrichedAsset): VerificationVerdict | null {
  const lot = item.lot as
    | {
        latestVerdict?: VerificationVerdict | null;
        sealMatchesReference?: boolean | null;
      }
    | undefined;

  if (lot?.latestVerdict === "Valid" || lot?.latestVerdict === "Invalid") {
    return lot.latestVerdict;
  }
  if (lot?.sealMatchesReference === false) return "Invalid";
  if (item.isValidProof) return "Valid";
  return null;
}

export function MarketplaceAssetBadge({
  item,
  size = "sm",
  className = "",
}: MarketplaceAssetBadgeProps) {
  const { t } = useLocaleContext();

  if (item.isMinted) {
    return (
      <StatusBadge
        label={t("marketplace.status.minted")}
        tone="success"
        circle="filled"
        size={size}
        className={className}
      />
    );
  }

  return (
    <span className={className || undefined}>
      <VerdictBadge verdict={resolveVerdict(item)} size={size} />
    </span>
  );
}
