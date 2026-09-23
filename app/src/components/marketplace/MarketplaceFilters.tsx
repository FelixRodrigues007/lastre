import { SelectField } from "../ui/SelectField";
import type { MarketplacePersona } from "../../lib/marketplaceTypes";
import "./marketplace-filters.css";

export const MARKETPLACE_CARBON_TYPES = [
  "VCS",
  "GoldStandard",
  "ARR",
  "IREC",
  "REDD+",
  "CER",
  "VCU",
  "RenewableEnergy",
  "Solar",
  "Wind",
  "Biomass",
  "PCH",
] as const;

export type MarketplaceCategoryFilter = "all" | "mineral" | "carbon_credit";
export type MarketplaceStatusFilter = "all" | "proven" | "minted" | "available";

const PERSONA_OPTIONS: Array<{ value: MarketplacePersona; label: string }> = [
  { value: "public", label: "Verifier" },
  { value: "buyer", label: "Claimer / collector" },
  { value: "defi", label: "DeFi collateral" },
  { value: "operator", label: "Operator" },
];

type MarketplaceFiltersProps = {
  category: MarketplaceCategoryFilter;
  status: MarketplaceStatusFilter;
  creditType: string;
  persona: MarketplacePersona;
  totals: { all: number; mineral: number; carbon: number };
  onCategoryChange: (value: MarketplaceCategoryFilter) => void;
  onStatusChange: (value: MarketplaceStatusFilter) => void;
  onCreditTypeChange: (value: string) => void;
  onPersonaChange: (value: MarketplacePersona) => void;
};

export function MarketplaceFilters({
  category,
  status,
  creditType,
  persona,
  totals,
  onCategoryChange,
  onStatusChange,
  onCreditTypeChange,
  onPersonaChange,
}: MarketplaceFiltersProps) {
  const creditDisabled = category === "mineral";

  return (
    <div className="marketplace-filters" role="group" aria-label="Marketplace filters">
      <SelectField label="Category" className="marketplace-filters__field"
value={category}
onChange={(event) => {
            const next = event.target.value as MarketplaceCategoryFilter;
            onCategoryChange(next);
            if (next === "mineral") onCreditTypeChange("all");
          }}
aria-label="Filter by category">
          <option value="all">All ({totals.all})</option>
          <option value="mineral">Minerals ({totals.mineral})</option>
          <option value="carbon_credit">Carbon ({totals.carbon})</option>
        </SelectField>

      <SelectField label="Status" className="marketplace-filters__field"
value={status}
onChange={(event) => onStatusChange(event.target.value as MarketplaceStatusFilter)}
aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="proven">Proven</option>
          <option value="minted">Minted</option>
          <option value="available">Claimable</option>
        </SelectField>

      <SelectField label="Credit type" className="marketplace-filters__field"
value={creditType}
disabled={creditDisabled}
onChange={(event) => onCreditTypeChange(event.target.value)}
aria-label="Filter by carbon credit type">
          <option value="all">All credits</option>
          {MARKETPLACE_CARBON_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </SelectField>

      <SelectField label="Buyer role" className="marketplace-filters__field"
value={persona}
onChange={(event) => onPersonaChange(event.target.value as MarketplacePersona)}
aria-label="Demo buyer role">
          {PERSONA_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
    </div>
  );
}
