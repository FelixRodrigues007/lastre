import { PageHeader } from "../components/layout/PageHeader";
import { RoutePlaceholder } from "../components/layout/RoutePlaceholder";

export function Lots() {
  return (
    <div className="page">
      <PageHeader
        kicker="Lots"
        title="Fictional lot queue"
        lead="Demo assets from Mineradora Vale do Ouro — browse artifacts before processing or attestation."
      />

      <RoutePlaceholder
        phase="Lot registry"
        blocks={[
          {
            label: "MINA-VALEDOURO-LOTE-002",
            hint: "Genuine lot · expected Valid when processed",
          },
          {
            label: "MINA-VALEDOURO-LOTE-001",
            hint: "Tampered mass · expected Invalid on-chain",
          },
          {
            label: "LOTE-OUTOFREGION",
            hint: "Geo outside perimeter · expected escalate",
          },
        ]}
        cta={{ label: "Open process batch →", to: "/process" }}
      />
    </div>
  );
}
