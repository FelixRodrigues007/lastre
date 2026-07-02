import { Link } from "react-router-dom";
import type { LotDetail } from "../../lib/types";
import { VerdictBadge } from "../proof/Badges";
import { ProofRail, proofStepFromLot } from "../proof/ProofRail";
import { BtnIcon } from "../ui/BtnIcon";
import "./lot-proof-status.css";

type LotProofStatusProps = {
  lot: LotDetail;
};

export function LotProofStatus({ lot }: LotProofStatusProps) {
  const proofStep = proofStepFromLot(lot);
  const isTokenizable = lot.auditRecord?.outcome === "tokenizable";

  let ctaTo = "/process";
  let ctaLabel = "Run demo batch";
  let ctaIcon: "process" | "audit" | "globe" | "capture" = "process";

  if (!lot.auditRecord) {
    ctaTo = "/process";
    ctaLabel = "Run demo batch";
    ctaIcon = "process";
  } else if (isTokenizable) {
    ctaTo = "/marketplace";
    ctaLabel = "Marketplace (demo)";
    ctaIcon = "globe";
  } else {
    ctaTo = `/audit/${encodeURIComponent(lot.artifact.assetId)}`;
    ctaLabel = "Audit record";
    ctaIcon = "audit";
  }

  const quantity =
    lot.artifact.tonnesCO2e != null
      ? `${lot.artifact.tonnesCO2e.toLocaleString()} tCO₂e`
      : lot.artifact.massGrams != null
        ? `${lot.artifact.massGrams.toLocaleString()} g`
        : "—";

  return (
    <aside className="lot-proof-status panel" aria-label="Current proof status">
      <p className="mono-label">Proof status</p>

      <div className="lot-proof-status__verdict">
        <VerdictBadge verdict={lot.latestVerdict} />
      </div>

      <p className="lot-proof-status__role">{lot.demoRole}</p>

      <dl className="lot-proof-status__facts">
        <div>
          <dt>Quantity</dt>
          <dd>{quantity}</dd>
        </div>
        <div>
          <dt>Operator</dt>
          <dd>{lot.artifact.operator}</dd>
        </div>
        <div>
          <dt>Site</dt>
          <dd>{lot.artifact.origin.site}</dd>
        </div>
        <div>
          <dt>Attested</dt>
          <dd>{lot.attested ? "Yes" : "No"}</dd>
        </div>
      </dl>

      <div className="lot-proof-status__rail">
        <p className="lot-proof-status__rail-label">Chain of proof</p>
        <ProofRail activeStep={proofStep} verdict={lot.latestVerdict} />
      </div>

      <div className="lot-proof-status__actions">
        <Link className="route-cta" to={ctaTo}>
          <BtnIcon icon={ctaIcon}>{ctaLabel}</BtnIcon>
        </Link>
        <Link className="route-cta route-cta--ghost" to="/lots">
          Back to catalog
        </Link>
      </div>
    </aside>
  );
}
