// SPDX-License-Identifier: BUSL-1.1
import { createHash } from "node:crypto";

/**
 * Version of the passport format produced by the sealer.
 *
 * This version is included in the Passport metadata, but the seal is computed
 * only from the provided ProvenanceArtifact. The same capture therefore always
 * produces the same seal without external state.
 */
export const PASSPORT_VERSION = "1.0.0" as const;
export const SEAL_ALGO = "SHA-256" as const;

/** Fictional provenance capture at the lot origin. */
export type ProvenanceArtifact = {
  /** Asset/lot identifier also used by the contract. */
  assetId: string;
  /** Geolocation and human-readable name of the origin point. */
  origin: {
    lat: number;
    lng: number;
    site: string;
  };
  /** Camera-frame hash. Simulated in the demo, but shaped for the future architecture. */
  frameHash: string;
  /** Lot mass in grams. */
  massGrams: number;
  /** Capture timestamp as input data; it is never generated automatically here. */
  capturedAtISO: string;
  /** Operator responsible for the capture at origin. */
  operator: string;
};

/** Offline passport that can feed the contract and an audit log. */
export type Passport = {
  artifact: ProvenanceArtifact;
  seal: string;
  sealAlgo: typeof SEAL_ALGO;
  version: typeof PASSPORT_VERSION;
};

type CanonicalValue =
  | null
  | string
  | number
  | boolean
  | CanonicalValue[]
  | { [key: string]: CanonicalValue };

/**
 * Hashes a raw camera frame.
 *
 * Today the samples use a fictional buffer; in the future, the same function
 * can receive real camera bytes without changing the sealer architecture.
 */
export function hashFrame(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Produces a deterministic canonical string for the artifact.
 *
 * The function sorts every object key recursively before serialization. This
 * prevents JSON/JavaScript object property order from changing the final hash.
 * There is no randomness, runtime-generated timestamp, network call, or
 * external dependency.
 *
 * Sorting uses code-unit (UTF-16) comparison, NOT `localeCompare`. This is
 * intentional: `localeCompare` depends on the environment's locale/ICU data and
 * could order keys differently on another machine, breaking determinism ("the
 * same input ALWAYS produces the same hash"). Code-unit ordering is stable and
 * environment-independent — the same rule used by the JSON Canonicalization
 * Scheme (RFC 8785).
 */
export function canonicalize(artifact: ProvenanceArtifact): string {
  return canonicalizeValue(artifact as unknown as CanonicalValue);
}

/** Returns the hexadecimal SHA-256 of the artifact's canonical representation. */
export function computeSeal(artifact: ProvenanceArtifact): string {
  return createHash("sha256").update(canonicalize(artifact)).digest("hex");
}

/** Builds the lot passport with the original artifact, seal, algorithm, and version. */
export function buildPassport(artifact: ProvenanceArtifact): Passport {
  return {
    artifact,
    seal: computeSeal(artifact),
    sealAlgo: SEAL_ALGO,
    version: PASSPORT_VERSION,
  };
}

/** Recomputes the seal and compares it with the expected value, mirroring the on-chain check. */
export function verifySeal(artifact: ProvenanceArtifact, expectedSeal: string): boolean {
  return computeSeal(artifact) === expectedSeal;
}

function canonicalizeValue(value: CanonicalValue): string {
  if (value === null || typeof value !== "object") {
    return serializePrimitive(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeValue(item)).join(",")}]`;
  }

  const entries = Object.entries(value).sort(([leftKey], [rightKey]) =>
    compareCodeUnits(leftKey, rightKey),
  );

  return `{${entries
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalizeValue(entryValue)}`)
    .join(",")}}`;
}

/**
 * Deterministic code-unit (UTF-16) comparison, independent of locale. Returns
 * -1, 0, or 1 for use in `Array.prototype.sort`.
 */
function compareCodeUnits(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function serializePrimitive(value: null | string | number | boolean): string {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error("Cannot canonicalize non-finite numbers");
  }

  return JSON.stringify(value);
}
