import { useEffect, useRef, useState } from "react";
import { CubeField3D } from "../visual/CubeField3D";
import "./preloader.css";

/** Hold the meter near-complete until fonts resolve — never fake 100%. */
const MIN_MS = 1200;
/** Hard ceiling so a stalled fonts.ready never traps the curtain. */
const FALLBACK_MS = 4000;
const HOLD = 0.9;

/**
 * Full-screen brand pre-loader: the Lastre seal rendered as the live 3D glyph
 * field (the same CubeField3D used in the FAQ) beside the wordmark, with a
 * loading meter + percentage. Exits on document.fonts.ready + a minimum beat.
 * Mounted once at the top of <App/>; unmounts itself after the exit transition.
 */
export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const finishingRef = useRef(false);

  useEffect(() => {
    // The inline anti-flash cover has done its job; the loader now owns paint.
    document.getElementById("preboot")?.remove();

    let raf = 0;
    let value = 0;

    const tick = () => {
      // Derive target from the shared ref each frame so a stale closure (React
      // StrictMode double-mount in dev) can never pin it at the hold value.
      const finishing = finishingRef.current;
      const target = finishing ? 1 : HOLD;
      value += (target - value) * (finishing ? 0.16 : 0.05);
      if (finishing && value > 0.999) value = 1;
      setProgress(value);
      if (finishing && value === 1) {
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      finishingRef.current = true;
    };

    const minTimer = new Promise<void>((resolve) => setTimeout(resolve, MIN_MS));
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    void Promise.all([minTimer, fontsReady]).then(finish);
    const fallback = window.setTimeout(finish, FALLBACK_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`preloader${done ? " is-done" : ""}`}
      role="status"
      aria-label="Loading Lastre"
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget) setGone(true);
      }}
    >
      <div className="preloader__stage" aria-hidden="true">
        <div className="preloader__seal">
          <CubeField3D />
        </div>
        <div className="preloader__col">
          <span className="preloader__wordmark">Lastre</span>
          <div className="preloader__bar">
            <div className="preloader__meter">
              <div
                className="preloader__fill"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
            <div className="preloader__readout">
              <span className="preloader__label">Proof before token</span>
              <span className="preloader__pct">
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
