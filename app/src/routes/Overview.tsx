import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { RoutePlaceholder } from "../components/layout/RoutePlaceholder";

export function Overview() {
  return (
    <div className="page">
      <PageHeader
        kicker="Overview"
        title="Provenance console"
        lead="Inspect on-chain proof, run the demo batch, and trace how the seal decides verdict while the agent decides action."
        actions={
          <Link className="route-cta" to="/process">
            Run demo batch
          </Link>
        }
      />

      <RoutePlaceholder
        phase="API wiring"
        blocks={[
          {
            label: "On-chain accepted",
            hint: "From GET /api/chain/summary — Casper Testnet ProofOfOrigin",
          },
          {
            label: "On-chain rejected",
            hint: "Invalid attestations are permanent proof, not errors",
          },
          {
            label: "Last batch",
            hint: "Tokenizable · rejected · skipped · escalated",
          },
          {
            label: "Package",
            hint: "hash-b8b505…560561 on casper-test",
          },
        ]}
        cta={{ label: "View audit log →", to: "/audit" }}
      />
    </div>
  );
}
