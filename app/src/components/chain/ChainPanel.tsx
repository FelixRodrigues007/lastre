import { useState } from "react";
import type { ChainSummary } from "../../lib/types";
import type { ChainTimelineEntry, VerdictFilter } from "../../lib/chainTimeline";
import { useLocaleContext } from "../../context/LocaleContext";
import { truncateMiddle } from "../../lib/format";
import { Icon } from "../ui/Icon";
import { ChainTimeline } from "./ChainTimeline";
import "./chain-panel.css";

type ChainPanelProps = {
  summary: ChainSummary;
  sessionEntries: ChainTimelineEntry[];
  historyEntries: ChainTimelineEntry[];
};

export function ChainPanel({ summary, sessionEntries, historyEntries }: ChainPanelProps) {
  const { t } = useLocaleContext();
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const [filter, setFilter] = useState<VerdictFilter>("all");
  const { testnet } = summary;
  const isLive = testnet.source === "live";

  return (
    <div className="chain-panel">
      <div className="chain-panel__notices">
        <p className="chain-panel__session-notice" role="note">
          {t("chain.sessionNotice")}
        </p>
        <span
          className={`chain-panel__source chain-panel__source--${testnet.source}`}
          role="status"
        >
          {isLive ? t("chain.source.live") : t("chain.source.fallback")}
        </span>
      </div>

      <div className="chain-panel__immutable" role="note">
        <span className="chain-panel__lock" aria-hidden="true">
          <Icon name="lock" size={18} />
        </span>
        <p className="chain-panel__immutable-text">{t("chain.immutable")}</p>
      </div>

      <ChainTimeline
        sessionEntries={sessionEntries}
        historyEntries={historyEntries}
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className="chain-panel__technical">
        <button
          type="button"
          className="chain-panel__technical-toggle"
          aria-expanded={technicalOpen}
          onClick={() => setTechnicalOpen((open) => !open)}
        >
          <Icon name={technicalOpen ? "chevron-down" : "chevron-right"} size={14} />
          {t("chain.technical.toggle")}
        </button>

        {technicalOpen ? (
          <dl className="chain-panel__technical-body mono-block">
            <div>
              <dt>{t("chain.technical.contract")}</dt>
              <dd>ProofOfOrigin</dd>
            </div>
            <div>
              <dt>{t("chain.technical.network")}</dt>
              <dd>{testnet.network}</dd>
            </div>
            <div>
              <dt>{t("chain.technical.package")}</dt>
              <dd>
                <code>{truncateMiddle(testnet.packageHash, 52)}</code>
              </dd>
            </div>
            <div>
              <dt>{t("chain.technical.packageUrl")}</dt>
              <dd>
                <a href={testnet.packageUrl} target="_blank" rel="noopener noreferrer">
                  {truncateMiddle(testnet.packageUrl, 56)}
                </a>
              </dd>
            </div>
            {testnet.fetchedAt ? (
              <div>
                <dt>{t("chain.technical.fetched")}</dt>
                <dd>{new Date(testnet.fetchedAt).toLocaleString()}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
    </div>
  );
}
