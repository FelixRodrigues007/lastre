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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
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
  const response = await fetch("/api/audit/export");
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
