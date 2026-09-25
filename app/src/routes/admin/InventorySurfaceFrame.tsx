import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useTheme } from "../../hooks/useTheme";
import {
  surfaceFrameUrl,
  scenarioLabels,
  type SurfaceScenario,
} from "./surface-scenarios";
import type { SurfaceId } from "./inventory-surface-previews";

export function InventorySurfaceFrame({
  id,
  name,
  scenario,
  mobile,
  revision,
  onDirty,
  onRestart,
}: {
  id: SurfaceId;
  name: string;
  scenario: SurfaceScenario;
  mobile: boolean;
  revision: string;
  onDirty: (dirty: boolean) => void;
  onRestart: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const restart = useRef<HTMLButtonElement>(null);
  const instance = useId() + revision + id + scenario;
  const src = surfaceFrameUrl(id, scenario, instance);
  const { theme } = useTheme();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [closed, setClosed] = useState(false);
  const [width, setWidth] = useState(720);
  const dirtyCallback = useRef(onDirty);
  dirtyCallback.current = onDirty;
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setStatus("loading");
    setClosed(false);
    dirtyCallback.current(false);
    const timeout = window.setTimeout(
      () => setStatus((s) => (s === "loading" ? "error" : s)),
      15000,
    );
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.channel !== "lastre-surface-lab" ||
        event.data.instance !== instance
      )
        return;
      if (event.data.type === "ready") {
        setStatus("ready");
        clearTimeout(timeout);
      }
      if (event.data.type === "dirty")
        dirtyCallback.current(event.data.detail === true);
      if (event.data.type === "closed") {
        setClosed(true);
        restart.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("message", receive);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("message", receive);
      dirtyCallback.current(false);
    };
  }, [src, instance]);
  useEffect(() => {
    if (status === "ready")
      frame.current?.contentWindow?.postMessage(
        { channel: "lastre-surface-lab", type: "theme", detail: theme },
        window.location.origin,
      );
  }, [theme, status]);
  const viewport = mobile ? 390 : 720;
  const scale = Math.min(1, width / viewport);
  return (
    <section
      className="iv-live-example"
      aria-label={`${name} — ${scenarioLabels[scenario]}`}
    >
      <header>
        <span>
          <i aria-hidden="true" />
          {scenarioLabels[scenario]}
        </span>
        <button
          type="button"
          className="iv-text-button"
          ref={restart}
          onClick={onRestart}
        >
          Reiniciar exemplo
        </button>
      </header>
      <div
        ref={container}
        className="iv-live-viewport"
        style={
          {
            "--preview-height": `${800 * scale}px`,
            "--preview-scale": scale,
            "--preview-width": `${viewport}px`,
          } as CSSProperties
        }
      >
        <iframe
          key={src}
          ref={frame}
          src={src}
          title={`${name} — ${scenarioLabels[scenario]}`}
          data-preview-theme={theme}
          className="iv-live-frame"
          onError={() => setStatus("error")}
        />
        {status !== "ready" && (
          <div className="iv-frame-status" role="status">
            {status === "loading" ? (
              <>
                <div className="iv-frame-skeleton" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <p>Carregando componente…</p>
              </>
            ) : (
              <>
                <h3>A prévia não respondeu</h3>
                <p>
                  Confira se o Admin local está disponível e tente novamente.
                </p>
                <button type="button" className="iv-button" onClick={onRestart}>
                  Tentar novamente
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <footer>
        <span>
          {closed
            ? "Componente fechado. Reinicie para abrir novamente."
            : "Componente real · cenário demonstrativo"}
        </span>
        <span>{viewport} × 800</span>
      </footer>
    </section>
  );
}
