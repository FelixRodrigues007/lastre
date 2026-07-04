export const FULL_DEMO_ASSET_ID = "CARBON-VCS-AMAZONIA-2024-001";
export const FULL_DEMO_STORAGE_KEY = "lastre-full-demo-state";

export type FullDemoStage = "capture" | "marketplace" | "x402" | "mint" | "complete";

export type FullDemoState = {
  active: boolean;
  assetId: string;
  stage: FullDemoStage;
  startedAt: string;
};

const FULL_DEMO_STAGES: readonly FullDemoStage[] = ["capture", "marketplace", "x402", "mint", "complete"];

export function isFullDemoStage(value: string | null | undefined): value is FullDemoStage {
  return FULL_DEMO_STAGES.includes(value as FullDemoStage);
}

export function createFullDemoState(
  stage: FullDemoStage,
  now: Date = new Date(),
  assetId = FULL_DEMO_ASSET_ID,
): FullDemoState {
  return {
    active: true,
    assetId,
    stage,
    startedAt: now.toISOString(),
  };
}

export function buildCaptureDemoUrl(assetId = FULL_DEMO_ASSET_ID): string {
  return `/capture?demo=full&assetId=${encodeURIComponent(assetId)}`;
}

export function buildMarketplaceDemoUrl(assetId = FULL_DEMO_ASSET_ID): string {
  return `/marketplace?demo=full&assetId=${encodeURIComponent(assetId)}`;
}

export function readFullDemoState(): FullDemoState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(FULL_DEMO_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<FullDemoState>;
    if (parsed.active === true && typeof parsed.assetId === "string" && isFullDemoStage(parsed.stage)) {
      return {
        active: true,
        assetId: parsed.assetId,
        stage: parsed.stage,
        startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : new Date().toISOString(),
      };
    }
  } catch {
    // Ignore stale or malformed demo state.
  }

  return null;
}

export function writeFullDemoState(state: FullDemoState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FULL_DEMO_STORAGE_KEY, JSON.stringify(state));
}

export function clearFullDemoState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(FULL_DEMO_STORAGE_KEY);
}
