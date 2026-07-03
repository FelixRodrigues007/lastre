import type { LotDetail } from "../../lib/types";
import { buildFieldDiffRows } from "../../lib/artifactDiff";
import { resolveVerdictTone } from "../../lib/lotVerdict";
import type { VerdictHeroTone } from "./VerdictHero";
import "./evidence-room-tabs.css";

export type EvidenceTab = "summary" | "comparison" | "technical";

export function defaultEvidenceTab(tone: VerdictHeroTone): EvidenceTab {
  return tone === "invalid" ? "comparison" : "summary";
}

export function buildEvidenceTabs(data: LotDetail) {
  const tone = resolveVerdictTone(data);
  const diffRows = data.referenceSeal
    ? buildFieldDiffRows(data.artifact, data.referenceArtifact ?? data.artifact)
    : [];
  const divergeCount = diffRows.filter((row) => row.diverges).length;
  const comparisonAlert = tone === "invalid" || divergeCount > 0;

  const tabs: {
    id: EvidenceTab;
    label: string;
    alert?: boolean;
    badge?: string;
  }[] = [
    { id: "summary", label: "Summary" },
    {
      id: "comparison",
      label: "Comparison",
      alert: comparisonAlert,
      badge: divergeCount > 0 ? String(divergeCount) : comparisonAlert ? "!" : undefined,
    },
    { id: "technical", label: "Technical" },
  ];

  return { tabs, tone };
}

type EvidenceRoomTabBarProps = {
  tabs: ReturnType<typeof buildEvidenceTabs>["tabs"];
  active: EvidenceTab;
  onChange: (tab: EvidenceTab) => void;
};

export function EvidenceRoomTabBar({ tabs, active, onChange }: EvidenceRoomTabBarProps) {
  return (
    <nav className="evidence-room-tabs" role="tablist" aria-label="Evidence sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`evidence-tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`evidence-panel-${tab.id}`}
          className={`evidence-room-tabs__tab${active === tab.id ? " evidence-room-tabs__tab--active" : ""}${tab.alert ? " evidence-room-tabs__tab--alert" : ""}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.label}</span>
          {tab.badge ? (
            <span className="evidence-room-tabs__badge" aria-label={`${tab.badge} issues`}>
              {tab.badge}
            </span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}
