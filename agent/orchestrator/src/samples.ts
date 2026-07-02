import type { ProvenanceArtifact } from "../../sealer/dist/src/sealer.js";
import { TAMPERED_ASSET_ID, VALID_ASSET_ID } from "../../x402/dist/index.js";

const VALID_ARTIFACT: ProvenanceArtifact = {
  assetId: VALID_ASSET_ID,
  category: "mineral",
  origin: {
    lat: -20.123456,
    lng: -43.987654,
    site: "Mina Vale do Ouro - Frente Norte",
  },
  frameHash: "96e69d1a25f714b03dbe5e7ac8102654f921d16b8c71e1ecae15384a3a9989a4",
  massGrams: 125000,
  capturedAtISO: "2026-06-23T18:30:00.000Z",
  operator: "Mineradora Vale do Ouro",
  mineral: "Gold",
  mineralType: "Gold ore",
};

const CARBON_VALID_ARTIFACT: ProvenanceArtifact = {
  assetId: "CARBON-VCS-AMAZONIA-2024-001",
  category: "carbon_credit",
  origin: {
    lat: -3.12,
    lng: -60.01,
    site: "Amazon REDD+ Zone A — fictional",
  },
  frameHash: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
  capturedAtISO: "2026-06-20T10:00:00.000Z",
  operator: "Amazonia Conservation Ltda. (fictional)",
  creditType: "VCS",
  tonnesCO2e: 125000,
  vintage: "2024",
  methodology: "REDD+",
  projectId: "VCS-12345",
  verifier: "Verra",
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
  carbonValid: ProvenanceArtifact;
};

export function createDemoArtifacts(): DemoArtifacts {
  return {
    valid: cloneArtifact(VALID_ARTIFACT),
    tampered: cloneArtifact(TAMPERED_ARTIFACT),
    validDuplicate: cloneArtifact(VALID_ARTIFACT),
    outOfRegion: cloneArtifact(OUT_OF_REGION_ARTIFACT),
    carbonValid: cloneArtifact(CARBON_VALID_ARTIFACT),
  };
}

/** Genuine lots used to seed the gateway and mock-chain referenceSeals. */
export function createDemoReferenceArtifacts(): ProvenanceArtifact[] {
  return [cloneArtifact(VALID_ARTIFACT), cloneArtifact(VALID_REFERENCE_FOR_TAMPERED_ID)];
}

function cloneArtifact(artifact: ProvenanceArtifact): ProvenanceArtifact {
  return JSON.parse(JSON.stringify(artifact)) as ProvenanceArtifact;
}
