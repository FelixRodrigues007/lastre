import { useState } from "react";
import { Link } from "react-router-dom";
import { VerdictBadge } from "../proof/Badges";
import { useLocaleContext } from "../../context/LocaleContext";
import { shortHash } from "../../lib/format";
import type { ChainTimelineEntry } from "../../lib/chainTimeline";
import { Icon } from "../ui/Icon";
import "./chain-timeline-item.css";

type ChainTimelineItemProps = {
  entry: ChainTimelineEntry;
};

export function ChainTimelineItem({ entry }: ChainTimelineItemProps) {
  const { t } = useLocaleContext();
  const [copied, setCopied] = useState(false);
  const isValid = entry.verdict === "Valid";

  async function copySeal() {
    if (!entry.providedSeal) return;
    try {
      await navigator.clipboard.writeText(entry.providedSeal);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <li
      className={`chain-list__row chain-list__row--${isValid ? "valid" : "invalid"}`}
    >
      <div className="chain-list__primary">
        <Link className="chain-list__asset" to={`/lots/${encodeURIComponent(entry.assetId)}`}>
          {entry.assetId}
        </Link>
        <VerdictBadge verdict={entry.verdict} size="sm" />
      </div>

      {entry.providedSeal ? (
        <div className="chain-list__seal">
          <span className="mono-label">{t("chain.timeline.seal")}</span>
          <div className="chain-list__seal-row">
            <code>{shortHash(entry.providedSeal, 10, 6)}</code>
            <button
              type="button"
              className={`chain-list__copy${copied ? " chain-list__copy--done" : ""}`}
              onClick={copySeal}
              aria-label={t("chain.timeline.copySeal")}
            >
              {copied ? t("chain.timeline.copied") : t("chain.timeline.copy")}
            </button>
          </div>
        </div>
      ) : null}

      {entry.explorerUrl ? (
        <a
          className="chain-list__attestation"
          href={entry.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("chain.timeline.viewAttestation")}
          <Icon name="external" size={12} />
        </a>
      ) : entry.sessionReceipt ? (
        <span className="chain-list__attestation chain-list__attestation--session">
          {t("chain.timeline.sessionReceipt")}
        </span>
      ) : null}
    </li>
  );
}
