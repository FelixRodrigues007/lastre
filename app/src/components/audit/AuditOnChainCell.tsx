import type { AuditRecord } from "../../lib/types";
import { shortHash } from "../../lib/format";
import { useLocaleContext } from "../../context/LocaleContext";
import { resolveAuditOnChainLinks } from "../../lib/auditOnChainLinks";
import { MutedStatusBadge, VerdictBadge } from "../proof/Badges";
import "./audit-on-chain-cell.css";

type AuditOnChainCellProps = {
  record: AuditRecord;
};

export function AuditOnChainCell({ record }: AuditOnChainCellProps) {
  const { t } = useLocaleContext();
  const onChain = record.onChain;

  if (!onChain) {
    return (
      <div className="audit-on-chain audit-on-chain--empty">
        <MutedStatusBadge label={t("audit.evidence.onChain.awaiting")} />
      </div>
    );
  }

  // Only link canonical on-chain txs. Session receipt hashes are NOT on
  // Casper. For Carbon, expose the canonical Valid sample as a sample link
  // instead of pretending the session receipt is an asset-specific attestation.
  const { attestationUrl, sampleUrl } = resolveAuditOnChainLinks(record);

  return (
    <div
      className="audit-on-chain"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="audit-on-chain__summary">
        <VerdictBadge verdict={onChain.verdict} />
        <code className="audit-on-chain__tx" title={onChain.txHash}>
          {shortHash(onChain.txHash, 8, 6)}
        </code>
      </div>
      {attestationUrl ? (
        <a
          className="audit-on-chain__link"
          href={attestationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          {t("audit.evidence.onChain.viewAttestation")}
        </a>
      ) : (
        <>
          <span className="audit-on-chain__session" title={onChain.txHash}>
            {t("audit.evidence.onChain.sessionReceipt")}
          </span>
          {sampleUrl ? (
            <a
              className="audit-on-chain__link audit-on-chain__link--sample"
              href={sampleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {t("audit.evidence.onChain.viewValidSample")}
            </a>
          ) : null}
        </>
      )}
    </div>
  );
}
