import { useEffect, useMemo } from "react";
import { StatePanel } from "../components/layout/StatePanel";
import { OverviewActivityPanel } from "../components/overview/OverviewActivityPanel";
import { OverviewDashboardCard } from "../components/overview/OverviewDashboardCard";
import { OverviewNextStep } from "../components/overview/OverviewNextStep";
import { OverviewPipelineChart } from "../components/overview/OverviewPipelineChart";
import { OverviewProofProgress } from "../components/overview/OverviewProofProgress";
import { OverviewTrustChart } from "../components/overview/OverviewTrustChart";
import { useLocaleContext } from "../context/LocaleContext";
import { useOnboarding } from "../context/OnboardingContext";
import { getAudit, getAuditSummary, getChainSummary, getLots } from "../lib/api";
import { computeTrustLayersFromRecords } from "../lib/demoOverviewAudit";
import { useAsyncData } from "../hooks/useAsyncData";
import "./overview.css";

export function Overview() {
  const { t } = useLocaleContext();
  const { syncChecklistFromAudit } = useOnboarding();
  const chain = useAsyncData(getChainSummary);
  const audit = useAsyncData(getAuditSummary);
  const auditLog = useAsyncData(getAudit);
  const lots = useAsyncData(getLots);

  const loading = chain.loading || audit.loading || lots.loading;
  const error = chain.error ?? audit.error ?? lots.error;

  const auditTotal = audit.data?.total ?? 0;

  useEffect(() => {
    syncChecklistFromAudit(auditTotal);
  }, [auditTotal, syncChecklistFromAudit]);

  const lotCount = lots.data?.lots.length ?? 0;

  const sessionRecords = auditLog.data?.records ?? [];
  const overviewRecords = sessionRecords;

  const trustLayers = useMemo(
    () => computeTrustLayersFromRecords(overviewRecords),
    [overviewRecords],
  );

  const trustLayersForStats = useMemo(
    () => computeTrustLayersFromRecords(sessionRecords),
    [sessionRecords],
  );

  const recent = useMemo(
    () =>
      overviewRecords
        .filter((record) => record?.assetId)
        .slice(-5)
        .reverse(),
    [overviewRecords],
  );

  const pipelineStages = useMemo(
    () => [
      {
        label: t("overview.pipeline.short.lots"),
        value: lotCount,
        tone: "muted" as const,
      },
      {
        label: t("overview.pipeline.short.processed"),
        value: audit.data?.total ?? 0,
        tone: "seal" as const,
      },
      {
        label: t("overview.pipeline.short.seal"),
        value: trustLayersForStats.sealChecks,
        tone: "trust" as const,
      },
      {
        label: t("overview.pipeline.short.casper"),
        value: trustLayersForStats.onChain,
        tone: "accent" as const,
      },
      {
        label: t("overview.pipeline.short.token"),
        value: audit.data?.tokenizable ?? 0,
        tone: "valid" as const,
      },
    ],
    [audit.data, lotCount, t, trustLayersForStats.onChain, trustLayersForStats.sealChecks],
  );

  const trustSegments = useMemo(() => {
    const pending = Math.max(
      trustLayers.agentActions - trustLayers.valid - trustLayers.invalid,
      0,
    );
    return [
      { label: t("common.valid"), value: trustLayers.valid, tone: "valid" as const },
      { label: t("common.invalid"), value: trustLayers.invalid, tone: "invalid" as const },
      { label: t("overview.trust.pending"), value: pending, tone: "muted" as const },
    ];
  }, [t, trustLayers]);

  const progressPoints = useMemo(
    () => [
      { label: t("overview.pipeline.short.lots"), value: lotCount },
      { label: t("overview.pipeline.short.processed"), value: audit.data?.total ?? 0 },
      { label: t("overview.pipeline.short.seal"), value: trustLayersForStats.sealChecks },
      { label: t("overview.pipeline.short.casper"), value: trustLayersForStats.onChain },
      { label: t("overview.pipeline.short.token"), value: audit.data?.tokenizable ?? 0 },
    ],
    [audit.data, lotCount, t, trustLayersForStats.onChain, trustLayersForStats.sealChecks],
  );

  return (
    <div className="page overview-page">
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
            <div className="overview-main">
              <OverviewDashboardCard
                className="overview-card--pipeline"
                title={t("overview.pipeline.title")}
                subtitle={t("overview.pipeline.subtitle")}
                linkTo="/lots"
                linkLabel={t("overview.pipeline.link")}
              >
                <OverviewPipelineChart
                  stages={pipelineStages}
                  emptyLabel={t("overview.pipeline.empty")}
                />
              </OverviewDashboardCard>

              <div className="overview-aside">
                <OverviewNextStep audit={audit.data} lotCount={lotCount} />

                <OverviewDashboardCard
                  className="overview-card--trust"
                  title={t("overview.trust.title")}
                  subtitle={t("overview.trust.subtitle")}
                  linkTo="/audit"
                  linkLabel={t("overview.trust.link")}
                >
                  <OverviewTrustChart
                    compact
                    segments={trustSegments}
                    emptyLabel={t("overview.trust.empty")}
                  />
                </OverviewDashboardCard>
              </div>

              <OverviewDashboardCard
                className="overview-card--progress"
                title={t("overview.progress.title")}
                subtitle={t("overview.progress.subtitle")}
                linkTo="/process"
                linkLabel={t("overview.progress.link")}
              >
                <OverviewProofProgress
                  points={progressPoints}
                  baseline={Math.max(lotCount, 1)}
                  emptyLabel={t("overview.sessionEmpty")}
                />
              </OverviewDashboardCard>

              <OverviewDashboardCard
                className="overview-card--activity"
                title={t("overview.recentActivity")}
                subtitle={t("overview.activity.subtitle")}
                linkTo="/audit"
                linkLabel={t("overview.fullAudit")}
              >
                <OverviewActivityPanel records={recent} />
              </OverviewDashboardCard>
            </div>
          </div>
        ) : null}
      </StatePanel>
    </div>
  );
}
