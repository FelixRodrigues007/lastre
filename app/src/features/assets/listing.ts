import type { DossierObject } from "./api";
import type { BadgeTone } from "./ui";

/** Shared vocabulary for lists of records: tones and orderings. */
export const statusTone = (status: DossierObject["status"]): BadgeTone =>
  status === "ready" ? "good" : status === "archived" ? "neutral" : "info";

export const objectTone = (o: Pick<DossierObject, "status">) =>
  o.status === "ready" ? "success" : o.status === "archived" ? "neutral" : "info";

export const statusOrder: Record<DossierObject["status"], number> = {
  draft: 0,
  ready: 1,
  archived: 2,
};

/** Reads a comma-separated multi-value search param. */
export const listParam = (params: URLSearchParams, key: string) =>
  (params.get(key) ?? "").split(",").filter(Boolean);

/** Parses `sort=column:dir` from the URL. */
export function sortParam(value: string | null) {
  const [id, dir] = (value ?? "").split(":");
  return id && (dir === "asc" || dir === "desc") ? { id, dir } as const : null;
}
