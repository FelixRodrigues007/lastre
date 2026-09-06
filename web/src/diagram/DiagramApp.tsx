import { useCallback, useEffect, useRef, useState } from "react";
import { Excalidraw, serializeAsJSON } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import type { AppState } from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";
import { STORE_PREFIX, loadBoard } from "./board";
import "./diagram.css";

/* Internal drawing surface. Same shape as /decks: path-based, no router, never
 * indexed. Each slug is an independent board persisted in this browser only —
 * nothing leaves the machine, so it is safe for pre-publication architecture. */

const DEFAULT_SLUG = "scratch";

const readSlug = () => {
  const m = window.location.pathname.match(/^\/diagram\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]!) : DEFAULT_SLUG;
};

/* Excalidraw fires onChange on a loop even while the canvas sits idle, so the
 * event alone is not a dirty signal — debouncing on it never settles. Element
 * `version` counters plus the viewport are what actually distinguish two
 * scenes; identical signature means there is nothing to write. */
const signature = (
  elements: readonly OrderedExcalidrawElement[],
  appState: AppState,
) => {
  let versions = 0;
  for (const el of elements) versions += el.version;
  return [
    elements.length,
    versions,
    Math.round(appState.scrollX),
    Math.round(appState.scrollY),
    appState.zoom.value,
  ].join(":");
};

type SaveState = "idle" | "saving" | "saved" | "failed";

export function DiagramApp() {
  const [slug, setSlug] = useState(readSlug);
  const [initialData, setInitialData] = useState<
    ExcalidrawInitialDataState | null | undefined
  >(undefined);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const timerRef = useRef<number | null>(null);
  const savedSigRef = useRef<string | null>(null);

  // Back/forward between boards without a reload.
  useEffect(() => {
    const onPop = () => setSlug(readSlug());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Remount the canvas per slug so each board starts from its own stored scene.
  useEffect(() => {
    let stale = false;
    setInitialData(undefined);
    setSaveState("idle");
    savedSigRef.current = null;
    document.title = `Diagram — ${slug}`;
    void loadBoard(slug).then((data) => {
      if (!stale) setInitialData(data);
    });
    return () => {
      stale = true;
    };
  }, [slug]);

  const persist = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    const elements = api.getSceneElements();
    const appState = api.getAppState();
    try {
      localStorage.setItem(
        STORE_PREFIX + slug,
        serializeAsJSON(elements, appState, api.getFiles(), "local"),
      );
      savedSigRef.current = signature(elements, appState);
      setSaveState("saved");
    } catch {
      // Quota exceeded is the realistic failure: say so instead of losing work silently.
      setSaveState("failed");
    }
  }, [slug]);

  const onChange = useCallback(
    (elements: readonly OrderedExcalidrawElement[], appState: AppState) => {
      const sig = signature(elements, appState);
      if (sig === savedSigRef.current) return;
      // First real change on a fresh board: adopt the signature so the initial
      // scene does not read as dirty forever.
      if (savedSigRef.current === null) {
        savedSigRef.current = sig;
        setSaveState("saved");
        return;
      }
      savedSigRef.current = sig;
      setSaveState("saving");
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        persist();
      }, 600);
    },
    [persist],
  );

  // A close mid-debounce would drop the last edits.
  useEffect(() => {
    const flush = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        persist();
      }
    };
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [persist]);

  const captureApi = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
  }, []);

  const rename = () => {
    const next = window.prompt("Board name", slug)?.trim();
    if (!next || next === slug) return;
    window.history.pushState({}, "", `/diagram/${encodeURIComponent(next)}`);
    setSlug(next);
  };

  if (initialData === undefined) return null;

  return (
    <div className="diagram-surface">
      <div className="diagram-bar">
        <button type="button" className="diagram-name" onClick={rename}>
          {slug}
        </button>
        <span className="diagram-state" data-state={saveState}>
          {saveState === "failed" ? "not saved" : saveState}
        </span>
      </div>
      <Excalidraw
        key={slug}
        excalidrawAPI={captureApi}
        initialData={initialData}
        onChange={onChange}
        theme="dark"
        name={slug}
      />
    </div>
  );
}
