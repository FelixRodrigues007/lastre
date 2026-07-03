import { Link } from "react-router-dom";
import { AttestedBadge, VerdictBadge } from "../proof/Badges";
import { Icon } from "../ui/Icon";
import { useLocaleContext } from "../../context/LocaleContext";
import { getMarketplaceCoverFromAsset, MARKETPLACE_COVER_FALLBACK } from "../../lib/marketplaceCovers";
import { lotShortNameKey } from "../../lib/processLots";
import type { LotListItem } from "../../lib/types";
import "./lot-list-row.css";

export type LotRowTone = "valid" | "invalid" | "pending";

type LotListRowProps = {
  lot: LotListItem;
  tone: LotRowTone;
  href: string;
  isSelected?: boolean;
};

function lotStatsLine(lot: LotListItem): string {
  const artifact = lot.artifact;
  const qty =
    artifact.tonnesCO2e != null
      ? `${artifact.tonnesCO2e.toLocaleString()} tCO₂e`
      : artifact.massGrams != null
        ? `${artifact.massGrams.toLocaleString()} g`
        : null;
  const kind =
    artifact.category === "carbon_credit"
      ? (artifact.creditType ?? "Carbon")
      : (artifact.mineral ?? artifact.mineralType ?? "Mineral");
  return [qty, kind, artifact.operator].filter(Boolean).join(" · ");
}

export function LotListRow({ lot, tone, href, isSelected = false }: LotListRowProps) {
  const { t } = useLocaleContext();
  const assetId = lot.artifact.assetId;
  const coverUrl = getMarketplaceCoverFromAsset(lot.artifact as Record<string, unknown>);
  const stats = lotStatsLine(lot);
  const site = lot.artifact.origin.site;

  return (
    <Link
      to={href}
      className={`lot-list-row lot-list-row--${tone}${isSelected ? " lot-list-row--selected" : ""}`}
      aria-current={isSelected ? "true" : undefined}
    >
      <span className="lot-list-row__thumb" aria-hidden="true">
        <img
          className="lot-list-row__photo"
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
        <span className={`lot-list-row__tone lot-list-row__tone--${tone}`} />
      </span>

      <span className="lot-list-row__body">
        <strong className="lot-list-row__title">{t(lotShortNameKey(lot))}</strong>
        <span className="lot-list-row__stats">{stats}</span>
        <span className="lot-list-row__foot">
          {site}
          <span className="lot-list-row__sep" aria-hidden="true">
            ·
          </span>
          <span className="mono-label lot-list-row__id">{assetId}</span>
        </span>
      </span>

      <span className="lot-list-row__trail">
        <span className="lot-list-row__badges">
          <VerdictBadge verdict={lot.latestVerdict} size="sm" />
          <AttestedBadge attested={lot.attested} size="sm" />
        </span>
        <Icon name="chevron-right" size={16} className="lot-list-row__chevron" />
      </span>
    </Link>
  );
}
