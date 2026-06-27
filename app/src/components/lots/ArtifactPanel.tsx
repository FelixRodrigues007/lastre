import type { ProvenanceArtifact } from "../../lib/types";
import "./artifact-panel.css";

type ArtifactPanelProps = {
  artifact: ProvenanceArtifact;
  /** Field keys to highlight (e.g. escalation triggers) */
  highlightFields?: string[];
};

const FIELDS: Array<{
  key: keyof ProvenanceArtifact | "origin.lat" | "origin.lng" | "origin.site";
  label: string;
  format: (artifact: ProvenanceArtifact) => string;
}> = [
  { key: "assetId", label: "Asset ID", format: (a) => a.assetId },
  { key: "operator", label: "Operator", format: (a) => a.operator },
  { key: "origin.site", label: "Site", format: (a) => a.origin.site },
  {
    key: "origin.lat",
    label: "Latitude",
    format: (a) => a.origin.lat.toFixed(6),
  },
  {
    key: "origin.lng",
    label: "Longitude",
    format: (a) => a.origin.lng.toFixed(6),
  },
  {
    key: "massGrams",
    label: "Mass",
    format: (a) => `${a.massGrams.toLocaleString()} g`,
  },
  { key: "capturedAtISO", label: "Captured", format: (a) => a.capturedAtISO },
  { key: "frameHash", label: "Frame hash", format: (a) => a.frameHash },
];

export function ArtifactPanel({ artifact, highlightFields = [] }: ArtifactPanelProps) {
  const highlights = new Set(highlightFields);

  return (
    <dl className="artifact-panel">
      {FIELDS.map(({ key, label, format }) => (
        <div
          key={key}
          className={`artifact-panel__row${highlights.has(key) ? " artifact-panel__row--highlight" : ""}`}
        >
          <dt>{label}</dt>
          <dd>{format(artifact)}</dd>
        </div>
      ))}
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
