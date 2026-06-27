import { Link, useParams } from "react-router-dom";
import { useCallback } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { ArtifactPanel } from "../components/lots/ArtifactPanel";
import { VerdictBadge } from "../components/proof/Badges";
import { ProofRail, proofStepFromLot } from "../components/proof/ProofRail";
import { SealChip } from "../components/proof/SealChip";
import { MetricCard } from "../components/ui/MetricCard";
import { getLot } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import "./lot-detail.css";

export function LotDetail() {
  const { assetId = "" } = useParams();
  const loader = useCallback(() => getLot(assetId), [assetId]);
  const lot = useAsyncData(loader, [assetId]);

  const data = lot.data;
  const proofStep = data ? proofStepFromLot(data) : 1;
  const sealMismatch = data?.sealMatchesReference === false;

  return (
    <div className="page">
      <PageHeader
        kicker="Lot detail"
        title={assetId || "Unknown lot"}
        lead={data?.demoRole ?? "Artifact fields, computed seal, reference seal, and proof rail."}
      />

      <StatePanel loading={lot.loading} error={lot.error} onRetry={lot.reload}>
        {data ? (
          <>
            <div className="lot-detail-hero">
              <MetricCard
                label="Mass"
                value={`${data.artifact.massGrams.toLocaleString()} g`}
                size="lg"
              />
              <MetricCard
                label="Proof step"
                value={`${proofStep + 1} / 5`}
                hint="Chain of proof progress"
                tone="accent"
              />
              <MetricCard
                label="Attested"
                value={data.attested ? "Yes" : "No"}
                hint={
                  data.auditRecord ? (
                    <Link to={`/audit/${encodeURIComponent(data.artifact.assetId)}`}>
                      View audit record
                    </Link>
                  ) : (
                    "Not yet processed"
                  )
                }
                tone={data.attested ? "valid" : "default"}
              />
              <div className="lot-detail-hero__verdict panel">
                <p className="mono-label">Latest verdict</p>
                <div className="lot-detail-hero__badge">
                  <VerdictBadge verdict={data.latestVerdict} />
                </div>
              </div>
            </div>

            <div className="lot-detail">
              <section className="panel lot-detail__section lot-detail__section--wide">
                <header className="panel__head">
                  <span className="mono-label">Proof rail</span>
                </header>
                <ProofRail activeStep={proofStep} verdict={data.latestVerdict} />
              </section>

              <section className="panel lot-detail__section lot-detail__section--wide">
                <header className="panel__head">
                  <span className="mono-label">Seals</span>
                  {sealMismatch ? (
                    <span className="lot-detail__mismatch">Mismatch — tampered artifact</span>
                  ) : data.sealMatchesReference ? (
                    <span className="lot-detail__match">Matches reference</span>
                  ) : null}
                </header>
                <div className="lot-detail__seals">
                  <SealChip hash={data.computedSeal} label="computed" />
                  {data.referenceSeal ? (
                    <SealChip hash={data.referenceSeal} label="reference" />
                  ) : (
                    <p className="lot-detail__empty">No reference seal registered</p>
                  )}
                </div>
              </section>

              <section className="panel lot-detail__section lot-detail__section--wide">
                <header className="panel__head">
                  <span className="mono-label">Artifact</span>
                </header>
                <ArtifactPanel
                  artifact={data.artifact}
                  highlightFields={sealMismatch ? ["massGrams"] : []}
                />
              </section>

              {data.testnetAttestation ? (
                <section className="panel lot-detail__section lot-detail__section--wide">
                  <header className="panel__head">
                    <span className="mono-label">Casper Testnet</span>
                    <VerdictBadge verdict={data.testnetAttestation.verdict} />
                  </header>
                  <div className="lot-detail__seals">
                    <SealChip hash={data.testnetAttestation.providedSeal} label="on-chain seal" />
                    {data.testnetAttestation.referenceSeal ? (
                      <SealChip hash={data.testnetAttestation.referenceSeal} label="reference" />
                    ) : null}
                  </div>
                  {data.testnetAttestation.explorerUrl ? (
                    <a
                      className="lot-detail__explorer"
                      href={data.testnetAttestation.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View attestation on cspr.live
                    </a>
                  ) : null}
                </section>
              ) : null}
            </div>
          </>
        ) : null}
      </StatePanel>

      <p className="lot-detail__back">
        <Link className="route-cta route-cta--ghost" to="/lots">
          All lots
        </Link>
      </p>
    </div>
  );
}
