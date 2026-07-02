import type {
  AuditRecord,
  AuditSummary,
  BatchResult,
  ChainSummary,
  DeciderMode,
  LiveTestnetSnapshot,
  LotDetail,
  LotListItem,
  AppSettings,
} from "./types";
import { ApiError } from "./types";

// Base URL for the console API. In dev, Vite proxies "/api" to the local
// app server on :3001 (see vite.config.ts), so the empty default works.
// In a split deployment (static UI + separately hosted API), set
// VITE_API_BASE_URL to the API origin, e.g. https://app-api.lastre.io
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

function apiUrl(path: string): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${suffix}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = (await response.json()) as T & { error?: string; message?: string };

  if (!response.ok) {
    throw new ApiError(body.message ?? body.error ?? response.statusText, response.status);
  }

  return body;
}

export function getChainSummary() {
  return apiFetch<ChainSummary>("/api/chain/summary");
}

export function getAuditSummary() {
  return apiFetch<AuditSummary>("/api/audit/summary");
}

export function getLots() {
  return apiFetch<{ lots: LotListItem[] }>("/api/lots");
}

export function getLot(assetId: string) {
  return apiFetch<LotDetail>(`/api/lots/${encodeURIComponent(assetId)}`);
}

export function getChainTestnet() {
  return apiFetch<LiveTestnetSnapshot>("/api/chain/testnet");
}

export function getAudit() {
  return apiFetch<{ records: AuditRecord[] }>("/api/audit");
}

export function getAuditRecord(assetId: string) {
  return apiFetch<AuditRecord>(`/api/audit/${encodeURIComponent(assetId)}`);
}

export function getEscalations() {
  return apiFetch<{ records: AuditRecord[] }>("/api/escalations");
}

export function getProcessDefaults() {
  return apiFetch<{ assetIds: string[]; decider: DeciderMode }>("/api/process/defaults");
}

export function processBatch(assetIds: string[], decider: DeciderMode) {
  return apiFetch<BatchResult>("/api/process/batch", {
    method: "POST",
    body: JSON.stringify({ assetIds, decider }),
  });
}

export function getSettings() {
  return apiFetch<AppSettings>("/api/settings");
}

export function updateSettings(decider: DeciderMode) {
  return apiFetch<AppSettings>("/api/settings", {
    method: "POST",
    body: JSON.stringify({ decider }),
  });
}

export async function downloadAuditExport(): Promise<void> {
  const response = await fetch(apiUrl("/api/audit/export"));
  if (!response.ok) {
    throw new ApiError("Export failed", response.status);
  }
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/u);
  const filename = match?.[1] ?? `lastro-audit-${new Date().toISOString().slice(0, 10)}.json`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function createArtifact(artifact: any) {
  return apiFetch<any>("/api/artifacts", {
    method: "POST",
    body: JSON.stringify(artifact),
  });
}

export async function computeSealForArtifact(artifact: any) {
  return apiFetch<{ seal: string; passport: any }>("/api/seal", {
    method: "POST",
    body: JSON.stringify(artifact),
  });
}

export async function mintAsset(assetId: string, minter?: string) {
  return apiFetch<{ success: boolean; txHash?: string; lot?: any; error?: string }>("/api/mint", {
    method: "POST",
    body: JSON.stringify({ assetId, minter }),
  });
}

export async function lockCollateral(assetId: string, owner: string) {
  return apiFetch<{ success: boolean; error?: string }>("/api/defi/lock", {
    method: "POST",
    body: JSON.stringify({ assetId, owner }),
  });
}

export async function releaseCollateral(assetId: string, owner: string) {
  return apiFetch<{ success: boolean; error?: string }>("/api/defi/release", {
    method: "POST",
    body: JSON.stringify({ assetId, owner }),
  });
}
