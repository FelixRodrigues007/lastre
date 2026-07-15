import type {
  AuditRecord,
  AuditSummary,
  BatchResult,
  ChainSummary,
  DeciderMode,
  EscalationActionResult,
  LiveTestnetSnapshot,
  LotDetail,
  LotListItem,
  AppSettings,
} from "./types";
import { ApiError } from "./types";
import { buildDemoLotDetail } from "./demoCatalog";
import { getDemoOverviewAuditRecord } from "./demoOverviewAudit";
import { applyDemoMint, buildDemoMintedLotDetail } from "./demoMints";

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

export async function getLot(assetId: string): Promise<LotDetail> {
  try {
    const lot = await apiFetch<LotDetail>(`/api/lots/${encodeURIComponent(assetId)}`);
    return applyDemoMint(lot);
  } catch (error) {
    // Fictional showcase assets from the Marketplace/Global-Mundi catalog are
    // not always present in the console API. Instead of dead-ending on a 404
    // "Unknown lot" + Retry, resolve them locally as demo detail pages.
    // Any other id (typos, genuinely missing lots) still surfaces the error.
    if (error instanceof ApiError && error.status === 404) {
      const demoMinted = buildDemoMintedLotDetail(assetId);
      if (demoMinted) return demoMinted;
      const demo = buildDemoLotDetail(assetId);
      if (demo) return applyDemoMint(demo);
    }
    throw error;
  }
}

export function getChainTestnet() {
  return apiFetch<LiveTestnetSnapshot>("/api/chain/testnet");
}

export function getAudit() {
  return apiFetch<{ records: AuditRecord[] }>("/api/audit");
}

export async function getAuditRecord(assetId: string): Promise<AuditRecord> {
  try {
    return await apiFetch<AuditRecord>(`/api/audit/${encodeURIComponent(assetId)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const demo = getDemoOverviewAuditRecord(assetId);
      if (demo) return demo;
    }
    throw error;
  }
}

export function getEscalations() {
  return apiFetch<{ records: AuditRecord[] }>("/api/escalations");
}

export function requeueEscalation(assetId: string) {
  return apiFetch<EscalationActionResult>(
    `/api/escalations/${encodeURIComponent(assetId)}/requeue`,
    { method: "POST" },
  );
}

export function discardEscalation(assetId: string) {
  return apiFetch<EscalationActionResult>(
    `/api/escalations/${encodeURIComponent(assetId)}/discard`,
    { method: "POST" },
  );
}

export function overrideEscalation(assetId: string, overrideAction: "pay" | "skip") {
  return apiFetch<EscalationActionResult>(
    `/api/escalations/${encodeURIComponent(assetId)}/override`,
    {
      method: "POST",
      body: JSON.stringify({ overrideAction }),
    },
  );
}

export function getProcessDefaults() {
  return apiFetch<{ assetIds: string[]; decider: DeciderMode; lastBatch: BatchResult | null }>(
    "/api/process/defaults",
  );
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

export type LockedCollateralPosition = {
  assetId: string;
  owner: string;
  lockedAt: string;
};

export function getLockedCollateral(owner: string) {
  return apiFetch<{ owner: string; positions: LockedCollateralPosition[] }>(
    `/api/defi/locked/${encodeURIComponent(owner)}`,
  );
}

// ---- x402 provenance provider (DEMO) ---------------------------------------

export type ProvenanceSnapshot = {
  assetId: string;
  category: string;
  seal: string;
  referenceSeal: string | null;
  sealMatch: boolean | null;
  verdict: string;
  attested: boolean;
  mintStatus: string;
  attestationTx: string | null;
  mintTx: string | null;
  carbonDetails: {
    tonnesCO2e: number | null;
    creditType: string | null;
    vintage: string | null;
    methodology: string | null;
    verifier: string | null;
    carbonImpactScore: number | null;
  } | null;
  packageHash: string;
  csprLinks: { package: string; attestation: string | null; mint: string | null };
  mintNote?: string | null;
  readAt: string;
};

export type AgentQueryResult = {
  ok: boolean;
  reason?: string;
  fallback?: boolean;
  txHash?: string;
  facilitatorMode?: string;
  provenance?: ProvenanceSnapshot | null;
  amountCspr?: number;
  payTo?: string;
  totalPaidQueries?: number;
};

/**
 * DEMO: run the full x402 handshake (quote → sign → settle) server-side so the
 * UI can show an external agent paying to read a proof before acting. Mock
 * facilitator — not a real Casper settlement.
 */
export async function simulateAgentQuery(assetId: string, from?: string) {
  return apiFetch<AgentQueryResult>(`/api/x402/simulate/${encodeURIComponent(assetId)}`, {
    method: "POST",
    body: JSON.stringify({ from }),
  });
}

export type MintSummary = {
  mintCount: number;
  packageHash: string;
  packageUrl: string;
  events: Array<{ assetId: string; minter: string; mintTx: string; at: string }>;
  paidX402Queries?: number;
  source?: "hybrid-demo" | string;
  onChain?: {
    source: "live" | "fallback";
    fetchedAt: string | null;
    packageHash: string;
    packageUrl: string;
    proofOfOriginAccepted: number;
    proofOfOriginRejected: number;
    attestedAssetIds: string[];
    mintGateAvailable: boolean;
    mintCount: number | null;
    note: string;
  };
};

export function getMintSummary() {
  return apiFetch<MintSummary>("/api/mint/summary");
}
