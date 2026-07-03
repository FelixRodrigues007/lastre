export type OnboardingPersona = "judge" | "operator" | "explorer";

export type ChecklistStepIcon = "process" | "lots" | "chain" | "globe";

export type ChecklistStep = "batch" | "invalid" | "casper" | "marketplace";

export type ChecklistState = Record<ChecklistStep, boolean>;

export type ChecklistStepMeta = {
  step: ChecklistStep;
  icon: ChecklistStepIcon;
  to: string;
  labelKey:
    | "onboarding.checklist.batch"
    | "onboarding.checklist.invalid"
    | "onboarding.checklist.casper"
    | "onboarding.checklist.marketplace";
  hintKey:
    | "onboarding.checklist.batchHint"
    | "onboarding.checklist.invalidHint"
    | "onboarding.checklist.casperHint"
    | "onboarding.checklist.marketplaceHint";
};

export const CHECKLIST_STEPS: readonly ChecklistStepMeta[] = [
  {
    step: "batch",
    icon: "process",
    to: "/process",
    labelKey: "onboarding.checklist.batch",
    hintKey: "onboarding.checklist.batchHint",
  },
  {
    step: "invalid",
    icon: "lots",
    to: "/lots",
    labelKey: "onboarding.checklist.invalid",
    hintKey: "onboarding.checklist.invalidHint",
  },
  {
    step: "casper",
    icon: "chain",
    to: "/audit",
    labelKey: "onboarding.checklist.casper",
    hintKey: "onboarding.checklist.casperHint",
  },
  {
    step: "marketplace",
    icon: "globe",
    to: "/marketplace",
    labelKey: "onboarding.checklist.marketplace",
    hintKey: "onboarding.checklist.marketplaceHint",
  },
] as const;

const AUTH_KEY = "lastro-auth";
const PERSONA_KEY = "lastro-persona";
const CHECKLIST_KEY = "lastro-checklist";
const CHECKLIST_DISMISSED_KEY = "lastro-checklist-dismissed";

export const EMPTY_CHECKLIST: ChecklistState = {
  batch: false,
  invalid: false,
  casper: false,
  marketplace: false,
};

export function readAuthenticated(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "1";
}

export function writeAuthenticated(value: boolean): void {
  if (typeof localStorage === "undefined") return;
  if (value) localStorage.setItem(AUTH_KEY, "1");
  else localStorage.removeItem(AUTH_KEY);
}

export function readPersona(): OnboardingPersona | null {
  if (typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem(PERSONA_KEY);
  if (stored === "judge" || stored === "operator" || stored === "explorer") return stored;
  return null;
}

export function writePersona(persona: OnboardingPersona | null): void {
  if (typeof localStorage === "undefined") return;
  if (persona) localStorage.setItem(PERSONA_KEY, persona);
  else localStorage.removeItem(PERSONA_KEY);
}

export function readChecklist(): ChecklistState {
  if (typeof sessionStorage === "undefined") return { ...EMPTY_CHECKLIST };
  try {
    const raw = sessionStorage.getItem(CHECKLIST_KEY);
    if (!raw) return { ...EMPTY_CHECKLIST };
    const parsed = JSON.parse(raw) as Partial<ChecklistState>;
    return { ...EMPTY_CHECKLIST, ...parsed };
  } catch {
    return { ...EMPTY_CHECKLIST };
  }
}

export function writeChecklist(state: ChecklistState): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
}

export function isChecklistComplete(state: ChecklistState): boolean {
  return CHECKLIST_STEPS.every(({ step }) => state[step]);
}

export function readChecklistDismissed(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(CHECKLIST_DISMISSED_KEY) === "1";
}

export function writeChecklistDismissed(value: boolean): void {
  if (typeof sessionStorage === "undefined") return;
  if (value) sessionStorage.setItem(CHECKLIST_DISMISSED_KEY, "1");
  else sessionStorage.removeItem(CHECKLIST_DISMISSED_KEY);
}

export function resetChecklistDismissed(): void {
  writeChecklistDismissed(false);
}

export function resetChecklist(): void {
  writeChecklist({ ...EMPTY_CHECKLIST });
}

/** Demo lot pre-filled for the operator capture path. */
export const DEMO_OPERATOR_CAPTURE = {
  assetId: "CARBON-VCS-AMAZONIA-2024-001",
  category: "carbon_credit" as const,
  operator: "Amazonia REDD+ Cooperative (fictional)",
  site: "Amazon REDD+ Zone A — fictional",
  lat: -3.12,
  lng: -60.01,
  capturedAtISO: "2026-06-24T12:00:00.000Z",
  creditType: "VCS" as const,
  tonnesCO2e: 125000,
  vintage: "2024",
  methodology: "REDD+ / ARR",
  verifier: "Verra",
};
