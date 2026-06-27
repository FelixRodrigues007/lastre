import { Link } from "react-router-dom";
import { useMemo } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { VerdictBadge } from "../components/proof/Badges";
import { MetricCard } from "../components/ui/MetricCard";
import { SectionHead } from "../components/ui/SectionHead";
import { getLots } from "../lib/api";
import { shortHash } from "../lib/format";
import { useAsyncData } from "../hooks/useAsyncData";
import "./lots.css";

function lotTone(lot: {
  latestVerdict: "Valid" | "Invalid" | null;
  attested: boolean;
  sealMatchesReference: boolean | null;
}): "valid" | "invalid" | "pending" {
  if (lot.latestVerdict === "Invalid" || lot.sealMatchesReference === false) return "invalid";
  if (lot.latestVerdict === "Valid" || lot.attested) return "valid";
  return "pending";
}

export function Lots() {
  const lots = useAsyncData(getLots);

  const stats = useMemo(() => {
    const items = lots.data?.lots ?? [];
    return {
      total: items.length,
      attested: items.filter((l) => l.attested).length,
      valid: items.filter((l) => l.latestVerdict === "Valid").length,
      invalid: items.filter((l) => l.latestVerdict === "Invalid").length,
    };
  }, [lots.data]);

  return (
    <div className="page">
      <PageHeader
        kicker="Lots"
        title="Lot queue"
        lead="Demo assets from Mineradora Vale do Ouro — inspect artifacts before attestation."
        actions={
          <Link className="route-cta" to="/process">
            Run batch
          </Link>
        }
      />

      <StatePanel loading={lots.loading} error={lots.error} onRetry={lots.reload}>
        {lots.data ? (
          <>
            <div className="lots-summary">
              <MetricCard label="Total lots" value={stats.total} size="lg" />
              <MetricCard
                label="Attested"
                value={stats.attested}
                hint={`${stats.total - stats.attested} pending`}
                tone="accent"
              />
              <MetricCard label="Valid verdict" value={stats.valid} tone="valid" />
              <MetricCard label="Invalid verdict" value={stats.invalid} tone="invalid" />
            </div>

            <SectionHead label="Artifacts" aside={`${stats.total} in queue`} />

            <div className="lots-grid">
              {lots.data.lots.map((lot) => {
                const tone = lotTone(lot);
                return (
                  <article
                    key={lot.artifact.assetId}
                    className={`panel lot-card lot-card--${tone}`}
                  >
                    <header className="lot-card__head">
                      <div>
                        <p className="lot-card__mass">
                          {lot.artifact.massGrams.toLocaleString()}
                          <span className="lot-card__unit"> g</span>
                        </p>
                        <h2 className="lot-card__title">
                          <Link to={`/lots/${encodeURIComponent(lot.artifact.assetId)}`}>
                            {lot.artifact.assetId}
                          </Link>
                        </h2>
                      </div>
                      <VerdictBadge verdict={lot.latestVerdict} />
                    </header>
                    <p className="lot-card__role">{lot.demoRole}</p>
                    <dl className="lot-card__meta">
                      <div>
                        <dt>Operator</dt>
                        <dd>{lot.artifact.operator}</dd>
                      </div>
                      <div>
                        <dt>Site</dt>
                        <dd>{lot.artifact.origin.site}</dd>
                      </div>
                      <div>
                        <dt>Seal</dt>
                        <dd className="lot-card__seal">
                          {shortHash(lot.computedSeal, 10, 6)}
                          {lot.sealMatchesReference === false ? (
                            <span className="lot-card__mismatch"> mismatch</span>
                          ) : null}
                        </dd>
                      </div>
                      <div>
                        <dt>Attested</dt>
                        <dd>{lot.attested ? "Yes" : "No"}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </>
        ) : null}
      </StatePanel>
    </div>
  );
}
