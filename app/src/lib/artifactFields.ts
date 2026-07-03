import type { ProvenanceArtifact } from "./types";

export type ArtifactFieldDef = {
  key: string;
  label: string;
  sealRelevant: boolean;
};

export function formatArtifactFieldValue(artifact: ProvenanceArtifact, key: string): string {
  if (key === "assetId") return artifact.assetId;
  if (key === "category") return artifact.category;
  if (key === "operator") return artifact.operator;
  if (key === "origin.site") return artifact.origin.site;
  if (key === "origin.lat") return artifact.origin.lat.toFixed(6);
  if (key === "origin.lng") return artifact.origin.lng.toFixed(6);
  if (key === "capturedAtISO") return artifact.capturedAtISO;
  if (key === "frameHash") return artifact.frameHash;
  if (key === "massGrams") {
    return artifact.massGrams != null ? artifact.massGrams.toLocaleString() : "—";
  }
  if (key === "creditType") return artifact.creditType ?? "—";
  if (key === "tonnesCO2e") {
    return artifact.tonnesCO2e != null ? artifact.tonnesCO2e.toLocaleString() : "—";
  }
  if (key === "vintage") return artifact.vintage ?? "—";
  if (key === "methodology") return artifact.methodology ?? "—";
  if (key === "projectId") return artifact.projectId ?? "—";
  if (key === "verifier") return artifact.verifier ?? "—";
  if (key === "mineral" || key === "mineralType") {
    return String((artifact as Record<string, unknown>)[key] ?? "—");
  }
  return "—";
}

/** Fields included in the SHA-256 seal (excludes frameHash — simulated capture only). */
export function getSealFieldDefs(artifact: ProvenanceArtifact): ArtifactFieldDef[] {
  const fields: ArtifactFieldDef[] = [
    { key: "assetId", label: "Asset ID", sealRelevant: true },
    { key: "category", label: "Category", sealRelevant: true },
    { key: "operator", label: "Operator", sealRelevant: true },
    { key: "origin.site", label: "Site", sealRelevant: true },
    { key: "origin.lat", label: "Latitude", sealRelevant: true },
    { key: "origin.lng", label: "Longitude", sealRelevant: true },
    { key: "capturedAtISO", label: "Captured", sealRelevant: true },
  ];

  if (artifact.category === "mineral") {
    fields.push(
      { key: "massGrams", label: "Mass (g)", sealRelevant: true },
      ...(artifact.mineral ? [{ key: "mineral", label: "Mineral", sealRelevant: true }] : []),
      ...(artifact.mineralType ? [{ key: "mineralType", label: "Type", sealRelevant: true }] : []),
    );
  } else {
    fields.push(
      { key: "tonnesCO2e", label: "Tonnes CO₂e", sealRelevant: true },
      ...(artifact.creditType ? [{ key: "creditType", label: "Credit type", sealRelevant: true }] : []),
      ...(artifact.vintage ? [{ key: "vintage", label: "Vintage", sealRelevant: true }] : []),
      ...(artifact.methodology ? [{ key: "methodology", label: "Methodology", sealRelevant: true }] : []),
      ...(artifact.verifier ? [{ key: "verifier", label: "Verifier", sealRelevant: true }] : []),
      ...(artifact.projectId ? [{ key: "projectId", label: "Project ID", sealRelevant: true }] : []),
    );
  }

  return fields;
}

export function getArtifactDisplayFields(artifact: ProvenanceArtifact): ArtifactFieldDef[] {
  return [
    ...getSealFieldDefs(artifact),
    { key: "frameHash", label: "Frame hash", sealRelevant: false },
  ];
}
