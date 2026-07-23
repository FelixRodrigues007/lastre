import { Link } from "react-router-dom";
import { EvidenceStatusBadge } from "../audit/EvidenceStatusBadge";
import { getEvidenceStatus, evidenceSubtitle } from "../../lib/auditEvidence";
import type { AuditRecord } from "../../lib/types";
import { shortHash } from "../../lib/format";
import { useLocaleContext } from "../../context/LocaleContext";
import { explorerUrlFromTx, resolveAttestationUrl } from "../../lib/chainTimeline";
import { ActionBadge, VerdictBadge } from "./Badges";
import { SealChip } from "./SealChip";
import "./audit-record-card.css";

type AuditRecordCardProps = {
  record: AuditRecord;
  index?: number;
  compact?: boolean;
  disableTitleLink?: boolean;
};

export function AuditRecordCard({
  record,
  index,
  compact = false,
  disableTitleLink = false,
}: AuditRecordCardProps) {
  const { t } = useLocaleContext();
  const verdict = record.verification?.verdict ?? record.onChain?.verdict ?? null;
  const attestationUrl = record.onChain
    ? resolveAttestationUrl(record.assetId, explorerUrlFromTx(record.onChain.txHash), record.onChain.verdict)
    : null;

  return (
    <article className={`audit-card panel${compact ? " audit-card--compact" : ""}`}>
      <header className="audit-card__head">
        <div>
          {index !== undefined ? (
            <p className="mono-label audit-card__index">Record {index}</p>
          ) : null}
          <h3 className="audit-card__title">
            {disableTitleLink ? (
              <span>{record.assetId}</span>
            ) : (
              <Link to={`/audit/${encodeURIComponent(record.assetId)}`}>{record.assetId}</Link>
            )}
          </h3>
        </div>
        <EvidenceStatusBadge status={getEvidenceStatus(record)} />
      </header>

      <p className="audit-card__subtitle">{evidenceSubtitle(record)}</p>

      <section className="audit-card__section">
        <p className="audit-card__section-label">Agent decision</p>
        <div className="audit-card__row">
          <ActionBadge action={record.decision.action} />
          <span className="audit-card__meta">by {record.decision.decidedBy}</span>
        </div>
        {!compact ? <p className="audit-card__reason">{record.decision.reasoning}</p> : null}
      </section>

      {record.verification ? (
        <section className="audit-card__section">
          <p className="audit-card__section-label">Seal verification</p>
          <div className="audit-card__row">
            <VerdictBadge verdict={verdict} />
          </div>
          {!compact ? (
            <div className="audit-card__seals">
              <SealChip hash={record.verification.seal} label="provided" />
              <SealChip hash={record.verification.referenceSeal} label="reference" />
            </div>
          ) : null}
        </section>
      ) : (
        <section className="audit-card__section">
          <p className="audit-card__section-label">Verification</p>
          <p className="audit-card__empty">— not paid or verified</p>
        </section>
      )}

      {record.onChain ? (
        <section className="audit-card__section">
          <p className="audit-card__section-label">{t("audit.evidence.col.onChain")}</p>
          <div className="audit-card__row">
            <VerdictBadge verdict={record.onChain.verdict} />
            <code className="audit-card__tx">tx {shortHash(record.onChain.txHash)}</code>
          </div>
          {attestationUrl ? (
            <a
              className="audit-card__explorer"
              href={attestationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {t("audit.evidence.onChain.viewAttestation")}
            </a>
          ) : (
            <span className="audit-card__session" onClick={(event) => event.stopPropagation()}>
              {t("audit.evidence.onChain.sessionReceipt")}
            </span>
          )}
        </section>
      ) : null}
    </article>
  );
}
