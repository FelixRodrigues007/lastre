import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { ChainPanel } from "../components/chain/ChainPanel";
import { BtnIcon } from "../components/ui/BtnIcon";
import { EmptyState } from "../components/ui/EmptyState";
import { useLocaleContext } from "../context/LocaleContext";
import { useOnboarding } from "../context/OnboardingContext";
import { getAudit, getChainSummary } from "../lib/api";
import {
  buildHistoryEntries,
  buildSessionEntries,
} from "../lib/chainTimeline";
import { useAsyncData } from "../hooks/useAsyncData";
import "./chain.css";

export function Chain() {
  const { t } = useLocaleContext();
  const chain = useAsyncData(getChainSummary);
  const audit = useAsyncData(getAudit);
  const { completeStep } = useOnboarding();
  useEffect(() => {
    completeStep("casper");
  }, [completeStep]);

  const sessionEntries = useMemo(
    () => buildSessionEntries(audit.data?.records ?? []),
    [audit.data?.records],
  );
  const historyEntries = useMemo(
    () => buildHistoryEntries(chain.data?.testnet.attestations ?? []),
    [chain.data?.testnet.attestations],
  );

  const hasSessionProof = sessionEntries.length > 0;
  const loading = chain.loading || audit.loading;
  const error = chain.error ?? audit.error;

  return (
    <div className="page chain-page">
      <PageHeader
        kicker={t("nav.chain")}
        title={t("chain.title")}
        lead={t("chain.lead")}
      />

      <StatePanel
        loading={loading}
        error={error}
        skeleton="split"
        onRetry={() => {
          void chain.reload();
          void audit.reload();
        }}
      >
        {chain.data ? (
          <div className="chain-layout">
            {!hasSessionProof ? (
              <EmptyState
                icon="chain"
                title={t("chain.empty.title")}
                hint={t("chain.empty.hint")}
                action={
                  <Link className="route-cta" to="/process">
                    <BtnIcon icon="process">{t("chain.empty.cta")}</BtnIcon>
                  </Link>
                }
              />
            ) : (
              <section className="chain-session-metrics panel" aria-label={t("chain.metrics.aria")}>
                <div className="chain-session-metrics__item">
                  <span className="chain-session-metrics__label">{t("common.valid")}</span>
                  <span className="chain-session-metrics__value">{chain.data.session.accepted}</span>
                </div>
                <div className="chain-session-metrics__item">
                  <span className="chain-session-metrics__label">{t("common.invalid")}</span>
                  <span className="chain-session-metrics__value chain-session-metrics__value--invalid">
                    {chain.data.session.rejected}
                  </span>
                </div>
              </section>
            )}

            <ChainPanel
              summary={chain.data}
              sessionEntries={sessionEntries}
              historyEntries={historyEntries}
            />
          </div>
        ) : null}
      </StatePanel>
    </div>
  );
}
