import { readFileSync } from "node:fs";
import { computeSeal, type ProvenanceArtifact } from "../../sealer/dist/src/sealer.js";

/** Genuine artifact used to populate the local reference registry. */
const validArtifact = readArtifact("valid.json");
/** Tampered artifact from the sealer sample. */
const tamperedRaw = readArtifact("tampered.json");

export const VALID_ASSET_ID = validArtifact.assetId;
export const TAMPERED_ASSET_ID = `${VALID_ASSET_ID}-TAMPERED`;

/**
 * To test paid rejection with only GET /verify?assetId=..., we expose
 * tampered.json under its own demo assetId. The reference seal for that assetId
 * is computed from valid.json with the same assetId; the only relevant
 * provenance difference remains the tampered field (`massGrams`).
 */
const validReferenceForTamperedId: ProvenanceArtifact = {
  ...validArtifact,
  assetId: TAMPERED_ASSET_ID,
};

const tamperedArtifact: ProvenanceArtifact = {
  ...tamperedRaw,
  assetId: TAMPERED_ASSET_ID,
};

const artifacts = new Map<string, ProvenanceArtifact>([
  [VALID_ASSET_ID, validArtifact],
  [TAMPERED_ASSET_ID, tamperedArtifact],
]);

const referenceSeals = new Map<string, string>([
  [VALID_ASSET_ID, computeSeal(validArtifact)],
  [TAMPERED_ASSET_ID, computeSeal(validReferenceForTamperedId)],
]);

export function getArtifact(assetId: string): ProvenanceArtifact | undefined {
  return artifacts.get(assetId);
}

export function getReferenceSeal(assetId: string): string | undefined {
  return referenceSeals.get(assetId);
}

function readArtifact(fileName: "valid.json" | "tampered.json"): ProvenanceArtifact {
  const url = new URL(`../../sealer/samples/${fileName}`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf8")) as ProvenanceArtifact;
}
