import { readFileSync } from "node:fs";
import test from "node:test";
import { equal, notEqual } from "node:assert/strict";
import {
  buildPassport,
  canonicalize,
  computeSeal,
  hashFrame,
  verifySeal,
  type ProvenanceArtifact,
} from "../src/sealer.js";

function loadSample(name: string): ProvenanceArtifact {
  return JSON.parse(readFileSync(`samples/${name}`, "utf8")) as ProvenanceArtifact;
}

const valid = loadSample("valid.json");
const tampered = loadSample("tampered.json");

// Hash conhecido-bom do valid.json. Fixá-lo transforma o teste de determinismo
// num golden test: qualquer mudança acidental no algoritmo (ex.: trocar a regra
// de ordenação de chaves) quebra aqui, em vez de passar silenciosamente.
const VALID_SEAL =
  "472c927a8129dfba4eea2aea00d683d127f8d6387db6fe9d2f779741e4b500f2";

test("computeSeal is deterministic for the same artifact", () => {
  // (a) mesmo input chamado 2x -> mesmo hash
  equal(computeSeal(valid), computeSeal(valid));
  // (b) e bate com o valor conhecido-bom (estabilidade entre execuções/ambientes)
  equal(computeSeal(valid), VALID_SEAL);
});

test("computeSeal changes when any provenance field changes", () => {
  notEqual(computeSeal(valid), computeSeal(tampered));
});

test("object key order does not affect the seal", () => {
  const reordered: ProvenanceArtifact = {
    operator: valid.operator,
    capturedAtISO: valid.capturedAtISO,
    massGrams: valid.massGrams,
    frameHash: valid.frameHash,
    origin: {
      site: valid.origin.site,
      lng: valid.origin.lng,
      lat: valid.origin.lat,
    },
    assetId: valid.assetId,
  };

  equal(canonicalize(reordered), canonicalize(valid));
  equal(computeSeal(reordered), computeSeal(valid));
});

test("verifySeal mirrors the on-chain comparison", () => {
  const validSeal = computeSeal(valid);

  equal(verifySeal(valid, validSeal), true);
  equal(verifySeal(valid, computeSeal(tampered)), false);

  const passport = buildPassport(valid);
  equal(passport.seal, validSeal);
  equal(passport.sealAlgo, "SHA-256");
  equal(passport.version, "1.0.0");

  equal(
    hashFrame(Buffer.from("lastro-demo-frame-mina-valedouro-lote-001-v1", "utf8")),
    valid.frameHash,
  );
});
