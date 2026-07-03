import type { TranslationKey } from "../i18n/translations";
import type { KnownLimits, ProvenanceArtifact } from "./types";

export type EscalationKind = "geo" | "mass" | "missing" | "review";

export function getEscalationKind(reasoning: string): EscalationKind {
  const lower = reasoning.toLowerCase();
  if (
    lower.includes("lat") ||
    lower.includes("lng") ||
    lower.includes("region") ||
    lower.includes("perimeter") ||
    lower.includes("geolocation")
  ) {
    return "geo";
  }
  if (lower.includes("mass")) return "mass";
  if (lower.includes("missing") || lower.includes("required field") || lower.includes("empty or invalid")) {
    return "missing";
  }
  return "review";
}

export const ESCALATION_KIND_LABEL_KEYS: Record<EscalationKind, TranslationKey> = {
  geo: "escalations.kind.geo",
  mass: "escalations.kind.mass",
  missing: "escalations.kind.missing",
  review: "escalations.kind.review",
};

export function isGeoEscalation(reasoning: string): boolean {
  return getEscalationKind(reasoning) === "geo";
}

export function truncateReasoning(reasoning: string, maxLength = 120): string {
  const trimmed = reasoning.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export type GeoPerimeterCheck = {
  lat: number;
  lng: number;
  latInRange: boolean;
  lngInRange: boolean;
  inPerimeter: boolean;
  perimeter: KnownLimits["minePerimeter"];
};

export function checkGeoPerimeter(
  artifact: ProvenanceArtifact,
  limits: KnownLimits,
): GeoPerimeterCheck {
  const { lat, lng } = artifact.origin;
  const perimeter = limits.minePerimeter;
  const latInRange = lat >= perimeter.minLat && lat <= perimeter.maxLat;
  const lngInRange = lng >= perimeter.minLng && lng <= perimeter.maxLng;

  return {
    lat,
    lng,
    latInRange,
    lngInRange,
    inPerimeter: latInRange && lngInRange,
    perimeter,
  };
}
