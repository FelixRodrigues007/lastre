import type { ProvenanceArtifact } from "../../lib/types";
import "./artifact-panel.css";

type ArtifactPanelProps = {
  artifact: ProvenanceArtifact;
  /** Field keys to highlight (e.g. escalation triggers) */
  highlightFields?: string[];
};

function formatArtifactField(artifact: ProvenanceArtifact, key: string): string {
  if (key === "assetId") return artifact.assetId;
  if (key === "operator") return artifact.operator;
  if (key === "origin.site") return artifact.origin.site;
  if (key === "origin.lat") return artifact.origin.lat.toFixed(6);
  if (key === "origin.lng") return artifact.origin.lng.toFixed(6);
  if (key === "capturedAtISO") return artifact.capturedAtISO;
  if (key === "frameHash") return artifact.frameHash;

  if (key === "category") return artifact.category;

  if (key === "massGrams") {
    return artifact.massGrams != null ? `${artifact.massGrams.toLocaleString()} g` : "—";
  }

  // Carbon fields
  if (key === "creditType") return artifact.creditType ?? "—";
  if (key === "tonnesCO2e") {
    return artifact.tonnesCO2e != null ? `${artifact.tonnesCO2e.toLocaleString()} tCO2e` : "—";
  }
  if (key === "vintage") return artifact.vintage ?? "—";
  if (key === "methodology") return artifact.methodology ?? "—";
  if (key === "projectId") return artifact.projectId ?? "—";
  if (key === "verifier") return artifact.verifier ?? "—";
  if (key === "mineral" || key === "mineralType") return (artifact as any)[key] ?? "—";

  return String((artifact as any)[key] ?? "—");
}

export function ArtifactPanel({ artifact, highlightFields = [] }: ArtifactPanelProps) {
  const highlights = new Set(highlightFields);

  // Core fields + dynamic based on category
  const fields: Array<{ key: string; label: string }> = [
    { key: "assetId", label: "Asset ID" },
    { key: "category", label: "Category" },
    { key: "operator", label: "Operator" },
    { key: "origin.site", label: "Site" },
    { key: "origin.lat", label: "Latitude" },
    { key: "origin.lng", label: "Longitude" },
    { key: "capturedAtISO", label: "Captured" },
    { key: "frameHash", label: "Frame hash" },
  ];

  if (artifact.category === "mineral") {
    fields.splice(6, 0, { key: "massGrams", label: "Mass" });
    if (artifact.mineral) fields.push({ key: "mineral", label: "Mineral" });
    if (artifact.mineralType) fields.push({ key: "mineralType", label: "Type" });
  } else {
    fields.splice(6, 0, { key: "tonnesCO2e", label: "Tonnes CO2e" });
    if (artifact.creditType) fields.push({ key: "creditType", label: "Credit Type" });
    if (artifact.vintage) fields.push({ key: "vintage", label: "Vintage" });
    if (artifact.methodology) fields.push({ key: "methodology", label: "Methodology" });
    if (artifact.verifier) fields.push({ key: "verifier", label: "Verifier" });
    if (artifact.projectId) fields.push({ key: "projectId", label: "Project ID" });
  }

  return (
    <dl className="artifact-panel">
      {fields.map(({ key, label }) => {
        const isHighlight = highlights.has(key) || highlights.has(key as any);
        return (
          <div
            key={key}
            className={`artifact-panel__row${isHighlight ? " artifact-panel__row--highlight" : ""}`}
          >
            <dt>{label}</dt>
            <dd>{formatArtifactField(artifact, key)}</dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Infer highlighted fields from escalation reasoning text. */
export function escalationHighlights(reasoning: string): string[] {
  const lower = reasoning.toLowerCase();
  const fields: string[] = [];

  if (lower.includes("geolocation") || lower.includes("perimeter")) {
    fields.push("origin.lat", "origin.lng", "origin.site");
  }
  if (lower.includes("mass")) {
    fields.push("massGrams");
  }
  if (lower.includes("required field") || lower.includes("empty or invalid")) {
    fields.push("assetId", "frameHash", "operator", "capturedAtISO");
  }

  return fields;
}
