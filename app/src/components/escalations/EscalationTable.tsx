import type { CSSProperties } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
import {
  ESCALATION_KIND_LABEL_KEYS,
  getEscalationKind,
  truncateReasoning,
} from "../../lib/escalations";
import { getMarketplaceCoverFromAsset, MARKETPLACE_COVER_FALLBACK } from "../../lib/marketplaceCovers";
import type { AuditRecord, ProvenanceArtifact } from "../../lib/types";
import { StatusBadge } from "../ui/StatusBadge";
import "./escalation-table.css";

type EscalationTableProps = {
  records: AuditRecord[];
  artifactById: Map<string, ProvenanceArtifact>;
  queueIndexById?: Map<string, number>;
  selectedAssetId: string | null;
  onSelect: (assetId: string) => void;
  compact?: boolean;
};

const KIND_BADGE: Record<
  ReturnType<typeof getEscalationKind>,
  { tone: "warning" | "danger" | "info"; circle: "dashed" | "ring" }
> = {
  geo: { tone: "warning", circle: "dashed" },
  mass: { tone: "warning", circle: "dashed" },
  missing: { tone: "danger", circle: "dashed" },
  review: { tone: "info", circle: "ring" },
};

function coverFor(artifact?: ProvenanceArtifact): string {
  if (!artifact) return MARKETPLACE_COVER_FALLBACK;
  return getMarketplaceCoverFromAsset(artifact as unknown as Record<string, unknown>);
}

export function EscalationTable({
  records,
  artifactById,
  queueIndexById,
  selectedAssetId,
  onSelect,
  compact = false,
}: EscalationTableProps) {
  const { t } = useLocaleContext();

  return (
    <div className={`escalation-table-wrap${compact ? " escalation-table-wrap--compact" : ""}`}>
      <table className="escalation-table">
        <thead>
          <tr>
            <th scope="col" className="escalation-table__col-thumb">
              <span className="sr-only">{t("escalations.table.image")}</span>
            </th>
            <th scope="col">{t("escalations.table.title")}</th>
            {!compact ? (
              <th scope="col">{t("escalations.table.description")}</th>
            ) : null}
            <th scope="col">{t("escalations.table.status")}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const artifact = artifactById.get(record.assetId);
            const kind = getEscalationKind(record.decision.reasoning);
            const kindStyle = KIND_BADGE[kind];
            const isSelected = selectedAssetId === record.assetId;
            const caseIndex = queueIndexById?.get(record.assetId) ?? index + 1;

            return (
              <tr
                key={record.assetId}
                className={`escalation-table__row escalation-table__row--${kind}${isSelected ? " escalation-table__row--selected" : ""}`}
                style={{ "--row-index": index } as CSSProperties}
                tabIndex={0}
                role="button"
                aria-current={isSelected ? "true" : undefined}
                aria-label={t("escalations.table.openCase", { assetId: record.assetId })}
                onClick={() => onSelect(record.assetId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(record.assetId);
                  }
                }}
              >
                <td className="escalation-table__thumb">
                  <img
                    className="escalation-table__preview"
                    src={coverFor(artifact)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={compact ? 48 : 40}
                    height={compact ? 48 : 40}
                  />
                </td>
                <td className="escalation-table__title">
                  <span className="escalation-table__case">{t("escalations.item.label", { index: caseIndex })}</span>
                  <span className="escalation-table__asset" title={record.assetId}>
                    {record.assetId}
                  </span>
                  {artifact && !compact ? (
                    <span className="escalation-table__site">{artifact.origin.site}</span>
                  ) : null}
                </td>
                {!compact ? (
                  <td className="escalation-table__desc">
                    {truncateReasoning(record.decision.reasoning)}
                  </td>
                ) : null}
                <td className="escalation-table__status">
                  <StatusBadge
                    label={t(ESCALATION_KIND_LABEL_KEYS[kind])}
                    tone={kindStyle.tone}
                    circle={kindStyle.circle}
                    size={compact ? "md" : "sm"}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
