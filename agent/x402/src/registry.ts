import { readFileSync } from "node:fs";
import { computeSeal, type ProvenanceArtifact } from "../../sealer/dist/src/sealer.js";

/** Artifact íntegro usado para popular o registry de referência local. */
const validArtifact = readArtifact("valid.json");
/** Artifact adulterado vindo do sample do sealer. */
const tamperedRaw = readArtifact("tampered.json");

export const VALID_ASSET_ID = validArtifact.assetId;
export const TAMPERED_ASSET_ID = `${VALID_ASSET_ID}-TAMPERED`;

/**
 * Para testar a rejeição paga usando apenas GET /verify?assetId=..., expomos o
 * tampered.json sob um assetId de demo próprio. O reference seal desse assetId é
 * calculado a partir do valid.json com o mesmo assetId; a única diferença de
 * procedência relevante continua sendo o campo adulterado (`massGrams`).
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
