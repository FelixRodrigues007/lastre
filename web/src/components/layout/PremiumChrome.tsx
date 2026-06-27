import { useEffect, useState } from "react";
import "./premium-chrome.css";

/** Subtle film grain + optional custom cursor — desktop only. */
export function PremiumChrome() {
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("premium");
    const t = window.setTimeout(() => setLoaderDone(true), 900);
    return () => {
      clearTimeout(t);
      document.documentElement.classList.remove("premium");
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = document.querySelector<HTMLElement>(".premium-cursor__dot");
    const ring = document.querySelector<HTMLElement>(".premium-cursor__ring");
    if (!dot || !ring) return;

    let x = 0;
    let y = 0;
    let rx = 0;
    let ry = 0;
    let frame = 0;

    const tick = () => {
      frame = 0;
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    };

    const queue = () => {
      if (frame) return;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      queue();
    };

    const onDown = () => document.documentElement.dataset.cursor = "down";
    const onUp = () => delete document.documentElement.dataset.cursor;

    const hoverables = "a, button, .btn, input, textarea, [role='button']";
    const onOver = (e: Event) => {
      if ((e.target as Element).closest(hoverables)) {
        document.documentElement.dataset.cursor = "hover";
      }
    };
    const onOut = (e: Event) => {
      if ((e.target as Element).closest(hoverables)) {
        delete document.documentElement.dataset.cursor;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (frame) cancelAnimationFrame(frame);
      delete document.documentElement.dataset.cursor;
    };
  }, []);

  return (
    <>
      <div className={`page-loader${loaderDone ? " page-loader--done" : ""}`} aria-hidden="true">
        <div className="page-loader__mark">
          <span className="page-loader__ring" />
        </div>
      </div>
      <div className="premium-grain" aria-hidden="true" />
      <div className="premium-vignette" aria-hidden="true" />
      <div className="premium-cursor" aria-hidden="true">
        <span className="premium-cursor__dot" />
        <span className="premium-cursor__ring" />
      </div>
    </>
  );
}
