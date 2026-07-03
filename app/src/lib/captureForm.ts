import { DEMO_OPERATOR_CAPTURE } from "./onboarding";
import type { CarbonCreditType } from "./types";

export const CARBON_TYPES: CarbonCreditType[] = [
  "VCU",
  "VCS",
  "GoldStandard",
  "CER",
  "REDD+",
  "ARR",
  "RenewableEnergy",
  "Biomass",
  "Wind",
  "Solar",
  "PCH",
  "IREC",
];

export interface CaptureFormState {
  assetId: string;
  category: "mineral" | "carbon_credit";
  operator: string;
  site: string;
  lat: number;
  lng: number;
  capturedAtISO: string;
  mineral?: string;
  mineralType?: string;
  massGrams?: number;
  creditType?: CarbonCreditType;
  tonnesCO2e?: number;
  vintage?: string;
  methodology?: string;
  projectId?: string;
  verifier?: string;
}

export function defaultCaptureForm(operatorDemo: boolean): CaptureFormState {
  if (operatorDemo) return { ...DEMO_OPERATOR_CAPTURE };
  return {
    assetId: `USER-${Date.now().toString().slice(-6)}`,
    category: "carbon_credit",
    operator: "User Capture (fictional)",
    site: "Captured Site",
    lat: -3.12,
    lng: -60.01,
    capturedAtISO: new Date().toISOString(),
    creditType: "VCS",
    tonnesCO2e: 45000,
    vintage: "2025",
    methodology: "REDD+ / ARR",
  };
}

export const DEMO_VALID_CARBON_PATCH: Partial<CaptureFormState> = {
  assetId: "CARBON-VCS-AMAZONIA-2024-001",
  category: "carbon_credit",
  creditType: "VCS",
  tonnesCO2e: 125000,
  vintage: "2024",
  site: "Amazon REDD+ Zone A — fictional",
  operator: "Amazonia REDD+ Cooperative (fictional)",
  lat: -3.12,
  lng: -60.01,
};

/** Tampered tonnes — expected Invalid after process vs reference seal. */
export const DEMO_INVALID_CARBON_PATCH: Partial<CaptureFormState> = {
  ...DEMO_VALID_CARBON_PATCH,
  tonnesCO2e: 127500,
};

export function validateCaptureStep1(form: CaptureFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.assetId.trim()) errors.assetId = "required";
  if (!form.operator.trim()) errors.operator = "required";
  if (!form.site.trim()) errors.site = "required";
  if (!Number.isFinite(form.lat) || form.lat < -90 || form.lat > 90) errors.lat = "range";
  if (!Number.isFinite(form.lng) || form.lng < -180 || form.lng > 180) errors.lng = "range";
  if (!form.capturedAtISO.trim()) errors.capturedAtISO = "required";
  if (form.category === "mineral") {
    if (!form.massGrams || form.massGrams <= 0) errors.massGrams = "positive";
  } else if (!form.tonnesCO2e || form.tonnesCO2e <= 0) {
    errors.tonnesCO2e = "positive";
  }
  return errors;
}

export async function hashCaptureFrame(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.slice(0, 500));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function buildArtifactFromForm(
  form: CaptureFormState,
  frameHash: string,
): Record<string, unknown> {
  const artifact: Record<string, unknown> = {
    assetId: form.assetId,
    category: form.category,
    origin: { lat: form.lat, lng: form.lng, site: form.site },
    frameHash: frameHash || `simulated-frame-${Date.now().toString(36)}`,
    capturedAtISO: form.capturedAtISO,
    operator: form.operator,
  };

  if (form.category === "mineral") {
    artifact.massGrams = form.massGrams || 100000;
    artifact.mineral = form.mineral || "Gold";
    artifact.mineralType = form.mineralType || "Ore";
  } else {
    artifact.tonnesCO2e = form.tonnesCO2e || 50000;
    artifact.creditType = form.creditType;
    artifact.vintage = form.vintage;
    artifact.methodology = form.methodology;
    artifact.projectId = form.projectId;
    artifact.verifier = form.verifier || "Verra";
  }

  return artifact;
}
