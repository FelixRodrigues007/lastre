// SPDX-License-Identifier: BUSL-1.1
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

const valid = { ...loadSample("valid.json"), category: "mineral" as const };
const tampered = { ...loadSample("tampered.json"), category: "mineral" as const };

// Known-good hash for valid.json. Pinning it turns the determinism test into a
// golden test: any accidental algorithm change (for example, changing the key
// ordering rule) breaks here instead of passing silently.
const VALID_SEAL =
  "e8738d5caacc30152561e3aac63c450b99e668df33f620932d76cfd037441d2a";

test("computeSeal is deterministic for the same artifact", () => {
  // (a) same input called twice -> same hash
  equal(computeSeal(valid), computeSeal(valid));
  // (b) and it matches the known-good value (stable across executions/environments)
  equal(computeSeal(valid), VALID_SEAL);
});

test("computeSeal changes when any provenance field changes", () => {
  notEqual(computeSeal(valid), computeSeal(tampered));
});

test("object key order does not affect the seal", () => {
  const reordered: ProvenanceArtifact = {
    assetId: valid.assetId,
    category: "mineral",
    origin: {
      site: valid.origin.site,
      lng: valid.origin.lng,
      lat: valid.origin.lat,
    },
    frameHash: valid.frameHash,
    massGrams: valid.massGrams,
    capturedAtISO: valid.capturedAtISO,
    operator: valid.operator,
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
