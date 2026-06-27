import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { ChainSnapshot } from "../components/chain/ChainSnapshot";
import { BtnIcon } from "../components/ui/BtnIcon";
import { DonutStat } from "../components/ui/DonutStat";
import { MetricCard } from "../components/ui/MetricCard";
import { OutcomeBreakdown } from "../components/ui/OutcomeBreakdown";
import { RatioBar } from "../components/ui/RatioBar";
import { SectionHead } from "../components/ui/SectionHead";
import { getAuditSummary, getChainSummary } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import "./overview.css";

export function Overview() {
  const chain = useAsyncData(getChainSummary);
  const audit = useAsyncData(getAuditSummary);

  const loading = chain.loading || audit.loading;
  const error = chain.error ?? audit.error;

  const testnetTotal =
    chain.data ? chain.data.testnet.accepted + chain.data.testnet.rejected : 0;
  const acceptanceRate =
    testnetTotal > 0 && chain.data
      ? (chain.data.testnet.accepted / testnetTotal) * 100
      : 0;

  return (
    <div className="page">
      <PageHeader
        kicker="Overview"
        title="Provenance console"
        lead="Operational snapshot — on-chain attestations, session audit, and demo batch state."
        actions={
          <>
            <Link className="route-cta route-cta--ghost" to="/chain">
              <BtnIcon icon="chain">Testnet state</BtnIcon>
            </Link>
            <Link className="route-cta" to="/process">
              <BtnIcon icon="process">Run demo batch</BtnIcon>
            </Link>
          </>
        }
      />

      <StatePanel
        loading={loading}
        error={error}
        onRetry={() => {
          chain.reload();
          audit.reload();
        }}
      >
        {chain.data && audit.data ? (
          <div className="overview-layout">
            <section className="overview-hero panel">
              <div className="overview-hero__primary">
                <DonutStat
                  percent={acceptanceRate}
                  label="Testnet acceptance"
                  sublabel={`${chain.data.testnet.accepted} of ${testnetTotal} attestations valid on Casper`}
                  tone="valid"
                />
                <div className="overview-hero__ratio">
                  <SectionHead
                    label="Attestation split"
                    aside={
                      chain.data.testnet.source === "live" ? "Live query" : "README fallback"
                    }
                  />
                  <RatioBar
                    ariaLabel="Testnet attestation split"
                    segments={[
                      {
                        value: chain.data.testnet.accepted,
                        label: "Accepted",
                        tone: "valid",
                      },
                      {
                        value: chain.data.testnet.rejected,
                        label: "Rejected",
                        tone: "invalid",
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="overview-metrics">
                <MetricCard
                  label="Session on-chain"
                  value={`${chain.data.session.accepted} / ${chain.data.session.rejected}`}
                  hint="Mock chain from this console session"
                  tone="accent"
                />
                <MetricCard
                  label="Audit records"
                  value={audit.data.total}
                  hint={
                    audit.data.lastBatch
                      ? `Last batch · ${audit.data.lastBatch.tokenizable} tokenizable`
                      : "Run a batch from Process"
                  }
                />
                <MetricCard
                  label="Testnet rejected"
                  value={chain.data.testnet.rejected}
                  hint="Invalid attestations are permanent proof"
                  tone="invalid"
                />
                <MetricCard
                  label="Escalations"
                  value={audit.data.escalated}
                  hint={
                    audit.data.escalated > 0 ? (
                      <Link to="/escalations">Open review queue</Link>
                    ) : (
                      "None in this session"
                    )
                  }
                />
              </div>
            </section>

            {audit.data.total > 0 ? (
              <OutcomeBreakdown
                title="Session audit"
                tokenizable={audit.data.tokenizable}
                rejected={audit.data.rejected}
                skipped={audit.data.skipped}
                escalated={audit.data.escalated}
              />
            ) : null}

            <section className="overview-chain">
              <SectionHead label="Casper testnet" aside="ProofOfOrigin contract" />
              <ChainSnapshot snapshot={chain.data.testnet} />
            </section>
          </div>
        ) : null}
      </StatePanel>
    </div>
  );
}
