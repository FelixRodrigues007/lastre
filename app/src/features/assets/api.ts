import type {
  DossierObject,
  Evidence,
  InformationRequest,
  Session,
  Share,
  Snapshot,
  Workspace,
} from "../../../server/assets/types";
export type * from "../../../server/assets/types";
export class ProductError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function request<T>(path: string, data?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/assets${path}`, {
      method: data === undefined ? "GET" : "POST",
      credentials: "same-origin",
      headers:
        data === undefined
          ? {}
          : {
              "Content-Type": "application/json",
              "X-Lastre-Request": "assets",
            },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  } catch {
    throw new ProductError(
      0,
      "OFFLINE",
      "Não foi possível conectar. Confira sua conexão e tente novamente. Seus campos foram preservados.",
    );
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ProductError(
      response.status,
      "UNAVAILABLE",
      "O serviço está indisponível. Tente novamente em instantes.",
    );
  }
  if (!response.ok) {
    const error = payload as { code?: string; message?: string };
    throw new ProductError(
      response.status,
      error.code ?? "UNAVAILABLE",
      error.message ?? "Não foi possível concluir a operação.",
    );
  }
  return payload as T;
}
export const api = {
  workspace: () => request<Workspace>("/workspace"),
  auth: (mode: "login" | "register" | "demo", data: unknown) =>
    request<Session>(`/${mode}`, data),
  logout: () => request("/logout", {}),
  saveObject: (id: string | undefined, data: unknown) =>
    request<DossierObject>(id ? `/objects/${id}` : "/objects", data),
  status: (id: string, revision: number, status: DossierObject["status"]) =>
    request(`/objects/${id}/status`, { revision, status }),
  upload: (id: string, data: unknown) =>
    request<Evidence>(`/objects/${id}/evidence`, data),
  removeEvidence: (id: string, evidenceId: string, revision: number) =>
    request(`/objects/${id}/evidence/${evidenceId}/remove`, { revision }),
  updateRequest: (id: string, data: unknown) =>
    request<InformationRequest>(`/requests/${id}`, data),
  share: (id: string, data: unknown) =>
    request<{ share: Share; version: Snapshot }>(`/objects/${id}/shares`, data),
  revoke: (id: string) => request(`/shares/${id}/revoke`, {}),
  received: (id: string) =>
    request<{ share: Share; version: Snapshot; sender: string }>(
      `/received/${id}`,
    ),
};
export async function downloadEvidence(
  id: string,
  name: string,
  shareId?: string,
) {
  const response = await fetch(
    `/api/assets/evidence/${id}${shareId ? `?share=${encodeURIComponent(shareId)}` : ""}`,
    { credentials: "same-origin" },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Documento indisponível.");
  }
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
