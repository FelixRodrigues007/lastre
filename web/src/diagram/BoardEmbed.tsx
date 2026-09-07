import { useCallback, useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import { loadSeed } from "./board";
import "./board-embed.css";

/* A committed board, read-only, for surfaces that present rather than edit.
 * It deliberately reads the seed and not localStorage: a deck has to show
 * every viewer the same sheet, not whatever the last person drew here. */
export function BoardEmbed({
  slug,
  theme = "light",
  background = "#f7f9f7",
  fitExclude,
}: {
  slug: string;
  theme?: "light" | "dark";
  /** Excalidraw paints this into the canvas bitmap, so CSS cannot undo it.
   *  Match the surface the board sits on — the deck sheet, by default. */
  background?: string;
  /** Id prefix left out of the opening frame. A board can be larger than what
   *  it opens on — a workbench of empty blocks under the drawing, say — and
   *  fitting all of it would show the drawing at a tenth of its size. What is
   *  excluded is still on the board; it is below the fold, not gone. */
  fitExclude?: string;
}) {
  const [data, setData] = useState<ExcalidrawInitialDataState | null | undefined>(
    undefined,
  );
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    let stale = false;
    setData(undefined);
    void loadSeed(slug).then((scene) => {
      if (!stale) setData(scene);
    });
    return () => {
      stale = true;
    };
  }, [slug]);

  /* The stored scroll and zoom were framed around the editor's toolbar. On a
   * sheet with no chrome, fit the drawing to whatever the sheet gives us —
   * initialData.scrollToContent does not survive restore here. */
  useEffect(() => {
    if (!api) return;
    const fit = () => {
      const all = api.getSceneElements();
      const framed = fitExclude
        ? all.filter((el) => !el.id.startsWith(fitExclude))
        : all;
      api.scrollToContent(framed.length ? framed : all, {
        fitToViewport: true,
        viewportZoomFactor: 0.9,
        animate: false,
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    const host = document.querySelector(".board-embed");
    if (host) ro.observe(host);
    return () => ro.disconnect();
  }, [api, data, fitExclude]);

  const capture = useCallback((next: ExcalidrawImperativeAPI) => setApi(next), []);

  if (data === undefined) return <div className="board-embed" aria-busy="true" />;
  if (data === null) return null;

  return (
    <div className="board-embed">
      <Excalidraw
        excalidrawAPI={capture}
        initialData={{
          ...data,
          appState: { ...data.appState, viewBackgroundColor: background },
        }}
        theme={theme}
        viewModeEnabled
        zenModeEnabled
        UIOptions={{ canvasActions: { toggleTheme: false } }}
      />
    </div>
  );
}
