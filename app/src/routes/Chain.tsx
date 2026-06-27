import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { ChainSnapshot } from "../components/chain/ChainSnapshot";
import { DonutStat } from "../components/ui/DonutStat";
import { MetricCard } from "../components/ui/MetricCard";
import { getChainTestnet } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import "./chain.css";

export function Chain() {
  const chain = useAsyncData(getChainTestnet);

  const total = chain.data ? chain.data.accepted + chain.data.rejected : 0;
  const rate = total > 0 && chain.data ? (chain.data.accepted / total) * 100 : 0;

  return (
    <div className="page">
      <PageHeader
        kicker="Chain"
        title="Casper Testnet state"
        lead="Live read-only snapshot from ProofOfOrigin on casper-test. Invalid attestations are permanent proof."
      />

      <StatePanel loading={chain.loading} error={chain.error} skeleton="split" onRetry={chain.reload}>
        {chain.data ? (
          <div className="chain-layout">
            <section className="chain-metrics panel">
              <DonutStat
                percent={rate}
                label="Acceptance rate"
                sublabel={`${chain.data.accepted} valid · ${chain.data.rejected} invalid`}
                tone="valid"
              />
              <div className="chain-metrics__grid">
                <MetricCard label="Accepted" value={chain.data.accepted} tone="valid" />
                <MetricCard label="Rejected" value={chain.data.rejected} tone="invalid" />
                <MetricCard
                  label="Attestations"
                  value={chain.data.attestations.length}
                  hint={
                    chain.data.source === "live"
                      ? "Live contract query"
                      : "README fallback data"
                  }
                />
              </div>
            </section>

            <ChainSnapshot snapshot={chain.data} />
          </div>
        ) : null}
      </StatePanel>
    </div>
  );
}
