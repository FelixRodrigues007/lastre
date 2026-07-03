import type { AuditRecord } from "../../lib/types";
import { shortHash } from "../../lib/format";
import { useLocaleContext } from "../../context/LocaleContext";
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

  const explorerUrl = `https://testnet.cspr.live/deploy/${onChain.txHash}`;

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
      <a
        className="audit-on-chain__link"
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        {t("audit.evidence.onChain.viewAttestation")}
      </a>
    </div>
  );
}
