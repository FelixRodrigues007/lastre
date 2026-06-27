const DEFAULT_GATEWAY_URL = "https://lastro.onrender.com";

export const LASTRO_GATEWAY_URL = normalizeGatewayUrl(
  import.meta.env.VITE_GATEWAY_URL || DEFAULT_GATEWAY_URL,
);

export type Verdict = "Valid" | "Invalid" | "Unverified";

export interface ProofResponse {
  packageHash: string;
  accepted: number;
  rejected: number;
  recentAttestations: Array<{
    assetId: string;
    verdict: "Valid" | "Invalid";
    tx: string | null;
    timestamp: string | null;
  }>;
}

export interface CatalogResponse {
  assets: Array<{
    assetId: string;
    name?: string;
    mineral?: string;
    mineralType?: string;
    operator?: string;
    expectedOnChain?: string;
    simulated?: boolean;
  }>;
}

export interface VerdictResponse {
  assetId: string;
  verdict: Verdict;
  seal: string | null;
  referenceSeal: string | null;
  attester: string | null;
  attestationTx: string | null;
  packageHash: string;
  readAt: string;
}

export interface CertificateResponse {
  assetId: string;
  verdict: "Valid";
  seal: string;
  attester: string;
  attestationTx: string;
  type: "ProvenanceCredential";
  transferable: false;
}

export function gatewayUrl(path: string) {
  return `${LASTRO_GATEWAY_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchGatewayJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(gatewayUrl(path), {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = typeof data?.error === "string"
      ? data.error
      : `Gateway request failed with ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

function normalizeGatewayUrl(value: string) {
  return value.replace(/\/+$/, "");
}
