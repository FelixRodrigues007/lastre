import { useParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { ArtifactPanel } from "../components/lots/ArtifactPanel";
import { LotEvidenceGrid } from "../components/lots/LotEvidenceGrid";
import { LotProofStatus } from "../components/lots/LotProofStatus";
import { SealCompare } from "../components/lots/SealCompare";
import { ProofJourney } from "../components/proof/ProofJourney";
import { VerdictBadge } from "../components/proof/Badges";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { SectionHead } from "../components/ui/SectionHead";
import { getLot } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import "./lot-detail.css";

function tamperFields(lot: { sealMatchesReference: boolean | null; artifact: { category: string } }): string[] {
  if (lot.sealMatchesReference !== false) return [];
  if (lot.artifact.category === "mineral") return ["massGrams"];
  return ["artifact fields"];
}

function verdictHeadline(lot: {
  sealMatchesReference: boolean | null;
  latestVerdict: "Valid" | "Invalid" | null;
  auditRecord: { outcome: string } | null;
}): { title: string; lead: string; tone: "valid" | "invalid" | "pending" } {
  if (lot.sealMatchesReference === false || lot.latestVerdict === "Invalid") {
    return {
      title: "Tamper detected",
      lead: "Seal mismatch — invalid is permanent proof, not a system error.",
      tone: "invalid",
    };
  }
  if (lot.latestVerdict === "Valid") {
    return {
      title: "Valid attestation",
      lead: "Computed seal matches reference. Proof is eligible for symbolic demo layers.",
      tone: "valid",
    };
  }
  if (lot.auditRecord) {
    return {
      title: "Processed — awaiting verdict",
      lead: "Agent acted on this lot. Seal verification may still be pending.",
      tone: "pending",
    };
  }
  return {
    title: "Awaiting proof",
    lead: "Artifact captured. Run Process to compare agent action against seal verdict.",
    tone: "pending",
  };
}

export function LotDetail() {
  const { assetId = "" } = useParams();
  const loader = useCallback(() => getLot(assetId), [assetId]);
  const lot = useAsyncData(loader, [assetId]);

  const data = lot.data;
  const headline = data ? verdictHeadline(data) : null;
  const highlightFields = useMemo(
    () => (data?.sealMatchesReference === false ? tamperFields(data) : []),
    [data],
  );

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Lots", to: "/lots" },
          { label: assetId || "Unknown lot" },
        ]}
      />

      <PageHeader
        kicker="Evidence room"
        title={assetId || "Unknown lot"}
        lead={data?.demoRole ?? "Forensic view of artifact, seals, and proof chain."}
      />

      <ProofJourney activePath={`/lots/${assetId}`} compact />

      <StatePanel loading={lot.loading} error={lot.error} skeleton="detail" onRetry={lot.reload}>
        {data && headline ? (
          <div className="lot-detail-layout">
            <div className="lot-detail-main">
              <section className={`lot-detail-verdict lot-detail-verdict--${headline.tone}`}>
                <div className="lot-detail-verdict__copy">
                  <h2 className="lot-detail-verdict__title">{headline.title}</h2>
                  <p className="lot-detail-verdict__lead">{headline.lead}</p>
                </div>
                <VerdictBadge verdict={data.latestVerdict} />
              </section>

              <LotEvidenceGrid lot={data} />

              {data.referenceSeal ? (
                <SealCompare
                  computed={data.computedSeal}
                  reference={data.referenceSeal}
                  matches={data.sealMatchesReference}
                  tamperFields={highlightFields}
                />
              ) : null}

              <section className="panel lot-detail__section">
                <SectionHead label="Artifact fields" aside={data.artifact.category} />
                <ArtifactPanel artifact={data.artifact} highlightFields={highlightFields} />
              </section>
            </div>

            <LotProofStatus lot={data} />
          </div>
        ) : null}
      </StatePanel>
    </div>
  );
}
