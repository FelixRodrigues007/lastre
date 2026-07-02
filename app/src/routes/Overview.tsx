import { Link } from "react-router-dom";
import { useMemo } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { ChainSnapshot } from "../components/chain/ChainSnapshot";
import { OutcomeBadge, VerdictBadge } from "../components/proof/Badges";
import { ProofJourney } from "../components/proof/ProofJourney";
import { OverviewNextStep } from "../components/overview/OverviewNextStep";
import { BarChart } from "../components/ui/BarChart";
import { BtnIcon } from "../components/ui/BtnIcon";
import { DonutStat } from "../components/ui/DonutStat";
import { OutcomeBreakdown } from "../components/ui/OutcomeBreakdown";
import { RatioBar } from "../components/ui/RatioBar";
import { SectionHead } from "../components/ui/SectionHead";
import { useLocaleContext } from "../context/LocaleContext";
import { getAudit, getAuditSummary, getChainSummary, getLots } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import "./overview.css";

export function Overview() {
  const { t } = useLocaleContext();
  const chain = useAsyncData(getChainSummary);
  const audit = useAsyncData(getAuditSummary);
  const auditLog = useAsyncData(getAudit);
  const lots = useAsyncData(getLots);

  const loading = chain.loading || audit.loading || lots.loading;
  const error = chain.error ?? audit.error ?? lots.error;

  const testnetTotal =
    chain.data ? chain.data.testnet.accepted + chain.data.testnet.rejected : 0;
  const acceptanceRate =
    testnetTotal > 0 && chain.data
      ? (chain.data.testnet.accepted / testnetTotal) * 100
      : 0;

  const lotCount = lots.data?.lots.length ?? 0;

  const trustLayers = useMemo(() => {
    const records = auditLog.data?.records ?? [];
    return {
      agentActions: records.length,
      sealChecks: records.filter((r) => r?.verification).length,
      onChain: records.filter((r) => r?.onChain).length,
      valid: records.filter(
        (r) => (r?.verification?.verdict ?? r?.onChain?.verdict) === "Valid",
      ).length,
      invalid: records.filter(
        (r) => (r?.verification?.verdict ?? r?.onChain?.verdict) === "Invalid",
      ).length,
    };
  }, [auditLog.data]);

  const recent = useMemo(
    () =>
      (auditLog.data?.records ?? [])
        .filter((record) => record?.assetId)
        .slice(-5)
        .reverse(),
    [auditLog.data],
  );

  return (
    <div className="page">
      <PageHeader
        kicker={t("overview.kicker")}
        title={t("overview.title")}
        lead={t("overview.lead")}
        actions={
          <Link className="route-cta route-cta--ghost" to="/process">
            <BtnIcon icon="process">{t("common.runBatch")}</BtnIcon>
          </Link>
        }
      />

      <ProofJourney activePath="/" compact />

      <StatePanel
        loading={loading}
        error={error}
        skeleton="dashboard"
        onRetry={() => {
          chain.reload();
          audit.reload();
          auditLog.reload();
          lots.reload();
        }}
      >
        {chain.data && audit.data ? (
          <div className="overview-layout">
            <OverviewNextStep audit={audit.data} lotCount={lotCount} />

            <div className="overview-grid overview-grid--charts">
              <BarChart
                title={t("overview.pipeline.title")}
                subtitle={t("overview.pipeline.subtitle")}
                items={[
                  {
                    label: t("overview.pipeline.lots"),
                    value: lotCount,
                    tone: "muted",
                    hint: t("overview.pipeline.lotsHint"),
                  },
                  {
                    label: t("overview.pipeline.processed"),
                    value: audit.data.total,
                    tone: "seal",
                    hint: t("overview.pipeline.processedHint"),
                  },
                  {
                    label: t("overview.pipeline.sealVerified"),
                    value: trustLayers.sealChecks,
                    tone: "seal",
                  },
                  {
                    label: t("overview.pipeline.onCasper"),
                    value: trustLayers.onChain,
                    tone: "accent",
                  },
                  {
                    label: t("overview.pipeline.tokenizable"),
                    value: audit.data.tokenizable,
                    tone: "valid",
                  },
                ]}
                layout="horizontal"
                emptyLabel={t("overview.pipeline.empty")}
              />

              <BarChart
                title={t("overview.trust.title")}
                subtitle={t("overview.trust.subtitle")}
                items={[
                  {
                    label: t("overview.trust.agentActions"),
                    value: trustLayers.agentActions,
                    tone: "accent",
                  },
                  {
                    label: t("overview.trust.sealChecks"),
                    value: trustLayers.sealChecks,
                    tone: "seal",
                  },
                  {
                    label: t("common.valid"),
                    value: trustLayers.valid,
                    tone: "valid",
                  },
                  {
                    label: t("common.invalid"),
                    value: trustLayers.invalid,
                    tone: "invalid",
                  },
                ]}
                layout="vertical"
                emptyLabel={t("overview.trust.empty")}
              />
            </div>

            <div className="overview-grid overview-grid--health">
              <section className="panel overview-health">
                <SectionHead
                  label={t("overview.testnet.label")}
                  aside={
                    chain.data.testnet.source === "live"
                      ? t("common.live")
                      : t("common.fallback")
                  }
                />
                <div className="overview-health__body">
                  <DonutStat
                    percent={acceptanceRate}
                    label={t("overview.testnet.acceptance")}
                    sublabel={t("overview.testnet.split", {
                      valid: chain.data.testnet.accepted,
                      invalid: chain.data.testnet.rejected,
                    })}
                    tone="valid"
                  />
                  <RatioBar
                    ariaLabel={t("overview.testnet.splitAria")}
                    segments={[
                      {
                        value: chain.data.testnet.accepted,
                        label: t("common.valid"),
                        tone: "valid",
                      },
                      {
                        value: chain.data.testnet.rejected,
                        label: t("common.invalid"),
                        tone: "invalid",
                      },
                    ]}
                  />
                </div>
              </section>

              {audit.data.total > 0 ? (
                <OutcomeBreakdown
                  title={t("overview.sessionOutcomes")}
                  tokenizable={audit.data.tokenizable}
                  rejected={audit.data.rejected}
                  skipped={audit.data.skipped}
                  escalated={audit.data.escalated}
                />
              ) : (
                <section className="panel overview-health overview-health--empty">
                  <SectionHead label={t("overview.sessionOutcomes")} />
                  <p className="overview-health__empty">{t("overview.sessionEmpty")}</p>
                  <Link className="route-cta" to="/process">
                    {t("common.runDemoBatch")}
                  </Link>
                </section>
              )}
            </div>

            <section className="panel overview-activity">
              <header className="overview-activity__head">
                <SectionHead
                  label={t("overview.recentActivity")}
                  aside={t("overview.lastFive")}
                />
                <Link className="overview-activity__link" to="/audit">
                  {t("overview.fullAudit")}
                </Link>
              </header>

              {recent.length > 0 ? (
                <div className="overview-activity__table-wrap">
                  <table className="overview-activity__table">
                    <thead>
                      <tr>
                        <th scope="col">{t("common.asset")}</th>
                        <th scope="col">{t("common.agent")}</th>
                        <th scope="col">{t("common.verdict")}</th>
                        <th scope="col">{t("common.outcome")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((record, index) => (
                        <tr key={`${record.assetId}-${index}`}>
                          <td>
                            <Link to={`/audit/${encodeURIComponent(record.assetId)}`}>
                              {record.assetId}
                            </Link>
                          </td>
                          <td className="overview-activity__mono">{record.decision.action}</td>
                          <td>
                            <VerdictBadge
                              verdict={
                                record.verification?.verdict ?? record.onChain?.verdict ?? null
                              }
                            />
                          </td>
                          <td>
                            <OutcomeBadge outcome={record.outcome} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="overview-health__empty">{t("overview.noActivity")}</p>
              )}
            </section>

            <details className="overview-chain panel">
              <summary className="overview-chain__summary">
                <SectionHead
                  label={t("overview.contract")}
                  aside={t("overview.technicalDetails")}
                />
              </summary>
              <ChainSnapshot snapshot={chain.data.testnet} />
            </details>
          </div>
        ) : null}
      </StatePanel>
    </div>
  );
}
