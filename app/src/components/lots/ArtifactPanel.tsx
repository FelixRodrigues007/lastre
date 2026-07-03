import type { ProvenanceArtifact } from "../../lib/types";
import { formatArtifactFieldValue, getArtifactDisplayFields } from "../../lib/artifactFields";
import "./artifact-panel.css";

type ArtifactPanelProps = {
  artifact: ProvenanceArtifact;
  highlightFields?: string[];
};

export function ArtifactPanel({ artifact, highlightFields = [] }: ArtifactPanelProps) {
  const highlights = new Set(highlightFields);
  const fields = getArtifactDisplayFields(artifact);

  return (
    <dl className="artifact-panel">
      {fields.map(({ key, label, sealRelevant }) => {
        const isHighlight = highlights.has(key);
        return (
          <div
            key={key}
            className={`artifact-panel__row${isHighlight ? " artifact-panel__row--highlight" : ""}`}
          >
            <dt>
              {label}
              {!sealRelevant ? (
                <span className="artifact-panel__note">not in seal</span>
              ) : null}
            </dt>
            <dd className={sealRelevant ? "artifact-panel__mono" : undefined}>
              {formatArtifactFieldValue(artifact, key)}
            </dd>
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
