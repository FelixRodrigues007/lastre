import { PageHeader } from "../components/layout/PageHeader";
import { RoutePlaceholder } from "../components/layout/RoutePlaceholder";

export function Settings() {
  return (
    <div className="page">
      <PageHeader
        kicker="Settings"
        title="Demo configuration"
        lead="Decider mode, known operational limits, and theme. Server-side keys stay off the client."
      />

      <RoutePlaceholder
        phase="Preferences"
        blocks={[
          { label: "Decider", hint: "RuleDecider (default) vs LlmDecider" },
          { label: "Theme", hint: "Dark default · light via data-theme" },
          { label: "Mine perimeter", hint: "lat −21…−19 · lng −44.5…−43" },
          { label: "Mass range", hint: "0 < mass ≤ 1,000,000 g" },
        ]}
      />
    </div>
  );
}
