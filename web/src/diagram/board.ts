import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

export const STORE_PREFIX = "lastre-diagram:";

export const parseScene = (raw: string): ExcalidrawInitialDataState => {
  const { elements, appState, files } = JSON.parse(raw);
  // appState carries a Map of collaborators that does not survive JSON.
  return { elements, appState: { ...appState, collaborators: [] }, files };
};

/* Committed boards live in public/diagrams. That is what makes one shareable:
 * localStorage never leaves the machine, so anything another person should see
 * has to be in the repo. */
export const loadSeed = async (
  slug: string,
): Promise<ExcalidrawInitialDataState | null> => {
  try {
    const res = await fetch(`/diagrams/${encodeURIComponent(slug)}.excalidraw`, {
      cache: "no-cache",
    });
    // A missing board is the normal case, and both servers answer it with the
    // SPA fallback: a 200 full of HTML. Content type is the reliable tell —
    // .excalidraw is not a type either dev or Vercel labels as JSON.
    if (!res.ok || res.headers.get("content-type")?.includes("html")) {
      return null;
    }
    return parseScene(await res.text());
  } catch {
    return null;
  }
};

/** The editable surface opens from this browser first, then the committed seed. */
export const loadBoard = async (
  slug: string,
): Promise<ExcalidrawInitialDataState | null> => {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + slug);
    if (raw) return parseScene(raw);
  } catch {
    // Storage blocked (private window): fall through to the seed.
  }
  return loadSeed(slug);
};
