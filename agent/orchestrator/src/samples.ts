import type { ProvenanceArtifact } from "../../sealer/dist/src/sealer.js";
import { TAMPERED_ASSET_ID, VALID_ASSET_ID } from "../../x402/dist/index.js";

const VALID_ARTIFACT: ProvenanceArtifact = {
  assetId: VALID_ASSET_ID,
  origin: {
    lat: -20.123456,
    lng: -43.987654,
    site: "Mina Vale do Ouro - Frente Norte",
  },
  frameHash: "96e69d1a25f714b03dbe5e7ac8102654f921d16b8c71e1ecae15384a3a9989a4",
  massGrams: 125000,
  capturedAtISO: "2026-06-23T18:30:00.000Z",
  operator: "Mineradora Vale do Ouro",
};

const VALID_REFERENCE_FOR_TAMPERED_ID: ProvenanceArtifact = {
  ...VALID_ARTIFACT,
  assetId: TAMPERED_ASSET_ID,
};

const TAMPERED_ARTIFACT: ProvenanceArtifact = {
  ...VALID_REFERENCE_FOR_TAMPERED_ID,
  massGrams: 125500,
};

const OUT_OF_REGION_ARTIFACT: ProvenanceArtifact = {
  ...VALID_ARTIFACT,
  assetId: "LOTE-OUTOFREGION",
  origin: {
    lat: 10.0,
    lng: 20.0,
    site: "Ponto suspeito fora da mina",
  },
};

export type DemoArtifacts = {
  valid: ProvenanceArtifact;
  tampered: ProvenanceArtifact;
  validDuplicate: ProvenanceArtifact;
  outOfRegion: ProvenanceArtifact;
};

export function createDemoArtifacts(): DemoArtifacts {
  return {
    valid: cloneArtifact(VALID_ARTIFACT),
    tampered: cloneArtifact(TAMPERED_ARTIFACT),
    validDuplicate: cloneArtifact(VALID_ARTIFACT),
    outOfRegion: cloneArtifact(OUT_OF_REGION_ARTIFACT),
  };
}

/** Lotes íntegros que alimentam os referenceSeal do gateway e da chain mock. */
export function createDemoReferenceArtifacts(): ProvenanceArtifact[] {
  return [cloneArtifact(VALID_ARTIFACT), cloneArtifact(VALID_REFERENCE_FOR_TAMPERED_ID)];
}

function cloneArtifact(artifact: ProvenanceArtifact): ProvenanceArtifact {
  return JSON.parse(JSON.stringify(artifact)) as ProvenanceArtifact;
}
