import { useEffect, useMemo } from "react";
import { ArtifactPanel } from "./ArtifactPanel";
import { CasperProofPanel } from "./CasperProofPanel";
import { FieldDiff } from "./FieldDiff";
import { LotProofStatus } from "./LotProofStatus";
import { SealCompare } from "./SealCompare";
import { VerdictHero } from "./VerdictHero";
import { SectionHead } from "../ui/SectionHead";
import { useOnboarding } from "../../context/OnboardingContext";
import { buildFieldDiffRows, divergingFieldKeys } from "../../lib/artifactDiff";
import { resolveVerdictTone } from "../../lib/lotVerdict";
import type { LotDetail } from "../../lib/types";
import type { EvidenceTab } from "./EvidenceRoomTabs";
import "../../routes/lot-detail.css";

export { resolveVerdictTone } from "../../lib/lotVerdict";

type LotDetailContentProps = {
  data: LotDetail;
  compact?: boolean;
  activeTab?: EvidenceTab;
};

export function LotDetailContent({ data, compact = false, activeTab = "summary" }: LotDetailContentProps) {
  const { completeStep } = useOnboarding();
  const tone = resolveVerdictTone(data);

  const diffRows = useMemo(
    () =>
      data.referenceSeal
        ? buildFieldDiffRows(data.artifact, data.referenceArtifact ?? data.artifact)
        : [],
    [data],
  );

  const highlightFields = useMemo(() => {
    const fromDiff = divergingFieldKeys(diffRows);
    if (fromDiff.length > 0) return fromDiff;
    if (data.sealMatchesReference === false && data.artifact.category === "mineral") {
      return ["massGrams"];
    }
    return [];
  }, [data, diffRows]);

  const hasCasper = Boolean(data.testnetAttestation ?? data.auditRecord?.onChain);
  const showMarketplaceCta =
    tone === "valid" && (data.auditRecord?.outcome === "tokenizable" || data.latestVerdict === "Valid");
  const hasComparison = Boolean(data.referenceSeal);

  useEffect(() => {
    if (tone === "invalid") completeStep("invalid");
    if (hasCasper) completeStep("casper");
  }, [tone, hasCasper, completeStep]);

  if (compact) {
    return (
      <div
        className="lot-detail-tabpanel lot-detail-tabpanel--drawer"
        role="tabpanel"
        id={`evidence-panel-${activeTab}`}
        aria-labelledby={`evidence-tab-${activeTab}`}
      >
        {activeTab === "summary" ? <LotProofStatus lot={data} variant="drawer" /> : null}

        {activeTab === "comparison" ? (
          hasComparison ? (
            <>
              {diffRows.length > 0 ? (
                <FieldDiff rows={diffRows} matches={data.sealMatchesReference} />
              ) : null}
              <SealCompare
                computed={data.computedSeal}
                reference={data.referenceSeal!}
                matches={data.sealMatchesReference}
              />
            </>
          ) : (
            <p className="lot-detail-tabpanel__empty">
              No reference seal registered yet. Run Process to compare against a registered baseline.
            </p>
          )
        ) : null}

        {activeTab === "technical" ? (
          <>
            <section className="evidence-section lot-detail__section">
              <SectionHead
                label="Artifact fields"
                aside={`${data.artifact.category} · seal inputs`}
              />
              <p className="evidence-section__lead">
                Structured data that feeds the SHA-256 seal. Frame hash is capture metadata only.
              </p>
              <ArtifactPanel artifact={data.artifact} highlightFields={highlightFields} />
            </section>
            <CasperProofPanel lot={data} flat />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="lot-detail-layout">
      <aside className="lot-detail-rail">
        <LotProofStatus lot={data} variant="default" />
      </aside>

      <div className="lot-detail-main">
        <VerdictHero
          tone={tone}
          attested={hasCasper || data.attested}
          showMarketplaceCta={showMarketplaceCta}
        />

        {data.referenceSeal && diffRows.length > 0 ? (
          <FieldDiff rows={diffRows} matches={data.sealMatchesReference} />
        ) : null}

        {data.referenceSeal ? (
          <SealCompare
            computed={data.computedSeal}
            reference={data.referenceSeal}
            matches={data.sealMatchesReference}
          />
        ) : null}

        <section className="panel lot-detail__section">
          <SectionHead
            label="Artifact fields"
            aside={`${data.artifact.category} · seal inputs`}
          />
          <p className="lot-detail__section-lead">
            Structured data that feeds the SHA-256 seal. Frame hash is capture metadata only.
          </p>
          <ArtifactPanel artifact={data.artifact} highlightFields={highlightFields} />
        </section>

        <CasperProofPanel lot={data} />
      </div>
    </div>
  );
}
