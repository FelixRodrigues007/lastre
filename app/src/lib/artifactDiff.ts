import { formatArtifactFieldValue, getSealFieldDefs } from "./artifactFields";
import type { ProvenanceArtifact } from "./types";

export type FieldDiffRow = {
  key: string;
  label: string;
  reference: string;
  current: string;
  diverges: boolean;
};

export function buildFieldDiffRows(
  current: ProvenanceArtifact,
  reference: ProvenanceArtifact | null,
): FieldDiffRow[] {
  const ref = reference ?? current;

  return getSealFieldDefs(current).map(({ key, label }) => {
    const referenceValue = formatArtifactFieldValue(ref, key);
    const currentValue = formatArtifactFieldValue(current, key);
    return {
      key,
      label,
      reference: referenceValue,
      current: currentValue,
      diverges: referenceValue !== currentValue,
    };
  });
}

export function divergingFieldKeys(rows: FieldDiffRow[]): string[] {
  return rows.filter((row) => row.diverges).map((row) => row.key);
}
