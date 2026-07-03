import { Link } from "react-router-dom";
import type { LotDetail } from "../../lib/types";
import { VerdictBadge } from "../proof/Badges";
import { ProofRail, proofStepFromLot } from "../proof/ProofRail";
import { BtnIcon } from "../ui/BtnIcon";
import "./lot-proof-status.css";

type LotProofStatusProps = {
  lot: LotDetail;
  variant?: "default" | "drawer";
};

export function LotProofStatus({ lot, variant = "default" }: LotProofStatusProps) {
  const inDrawer = variant === "drawer";
  const proofStep = proofStepFromLot(lot);
  const isValid = lot.latestVerdict === "Valid" || lot.sealMatchesReference === true;
  const isTokenizable = lot.auditRecord?.outcome === "tokenizable";
  const hasAudit = Boolean(lot.auditRecord);

  let primaryTo = "/process";
  let primaryLabel = "Run demo batch";
  let primaryIcon: "process" | "audit" | "globe" = "process";

  if (!hasAudit) {
    primaryTo = "/process";
    primaryLabel = "Run demo batch";
    primaryIcon = "process";
  } else if (isValid && isTokenizable) {
    primaryTo = "/marketplace";
    primaryLabel = "Marketplace (demo)";
    primaryIcon = "globe";
  } else if (hasAudit) {
    primaryTo = `/audit/${encodeURIComponent(lot.artifact.assetId)}`;
    primaryLabel = "View audit record";
    primaryIcon = "audit";
  }

  const quantity =
    lot.artifact.tonnesCO2e != null
      ? `${lot.artifact.tonnesCO2e.toLocaleString()} tCO₂e`
      : lot.artifact.massGrams != null
        ? `${lot.artifact.massGrams.toLocaleString()} g`
        : "—";

  return (
    <aside
      className={`lot-proof-status${inDrawer ? " lot-proof-status--drawer" : " panel"}`}
      aria-label="Proof status rail"
    >
      {!inDrawer ? <p className="mono-label">Proof status</p> : null}

      {!inDrawer ? (
        <div className="lot-proof-status__verdict">
          <VerdictBadge verdict={lot.latestVerdict} />
        </div>
      ) : null}

      {!inDrawer ? <p className="lot-proof-status__role">{lot.demoRole}</p> : null}

      <dl className={inDrawer ? "lot-proof-status__group" : "lot-proof-status__facts"}>
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
          <dd>{lot.attested || lot.testnetAttestation ? "Yes" : "Awaiting"}</dd>
        </div>
      </dl>

      <div className="lot-proof-status__rail">
        {!inDrawer ? <p className="lot-proof-status__rail-label">Chain of proof</p> : null}
        {inDrawer ? <p className="lot-proof-status__section-label">Chain of proof</p> : null}
        <ProofRail activeStep={proofStep} verdict={lot.latestVerdict} layout={inDrawer ? "vertical" : "auto"} />
      </div>

      <div className="lot-proof-status__actions">
        <Link className="route-cta" to={primaryTo}>
          <BtnIcon icon={primaryIcon}>{primaryLabel}</BtnIcon>
        </Link>
        {hasAudit ? (
          <Link
            className="route-cta route-cta--ghost"
            to={`/audit/${encodeURIComponent(lot.artifact.assetId)}`}
          >
            View audit record
          </Link>
        ) : null}
        {isValid && isTokenizable && primaryTo !== "/marketplace" ? (
          <Link className="route-cta route-cta--ghost" to="/marketplace">
            Marketplace (demo)
          </Link>
        ) : null}
        {!inDrawer ? (
          <Link className="route-cta route-cta--ghost" to="/lots">
            Back to catalog
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
