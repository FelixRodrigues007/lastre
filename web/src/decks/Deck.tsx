import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Deck } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  deck: Deck;
  onExit: () => void;
};

/**
 * Deck viewer. One slide per screen, keyboard-first.
 * ← → / space navigate · G opens the contents · Esc returns to the drawer.
 */
export function DeckViewer({ deck, onExit }: Props) {
  const total = deck.slides.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);

  const initial = (() => {
    const hash = window.location.hash.replace(/^#s\//, "");
    const found = deck.slides.findIndex((s) => s.id === hash);
    return found >= 0 ? found : 0;
  })();

  const [i, setI] = useState(initial);
  const [toc, setToc] = useState(false);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setI(clamped);
      setToc(false);
      const slide = deck.slides[clamped];
      if (slide) {
        window.history.replaceState(null, "", `/decks/${deck.slug}#s/${slide.id}`);
      }
    },
    [deck.slides, deck.slug, total],
  );

  /* Auto-fit: every slide is scaled down until it fits the stage, so a deck
   * never scrolls and never clips — on a laptop or on a meeting-room beamer. */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const inner = fitRef.current;
    if (!stage || !inner) return;

    const fit = () => {
      inner.style.transform = "none";
      const styles = getComputedStyle(stage);
      const availableH =
        stage.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
      const availableW =
        stage.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
      const h = inner.scrollHeight;
      const w = inner.scrollWidth;
      if (h <= 0 || w <= 0) return;
      const k = Math.min(1, availableH / h, availableW / w);
      inner.style.transform = k < 0.995 ? `scale(${k.toFixed(4)})` : "none";
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          go(i + 1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          go(i - 1);
          break;
        case "Home":
          e.preventDefault();
          go(0);
          break;
        case "End":
          e.preventDefault();
          go(total - 1);
          break;
        case "g":
        case "G":
          e.preventDefault();
          setToc((v) => !v);
          break;
        case "Escape":
          e.preventDefault();
          if (toc) setToc(false);
          else onExit();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, i, onExit, toc, total]);

  const slide = deck.slides[i];
  if (!slide) return null;

  return (
    <div className="dk">
      <header className="dk-rail">
        <div className="dk-rail__group">
          <button type="button" className="dk-btn dk-btn--ghost dk-rail__mark" onClick={onExit}>
            Lastre
          </button>
          <span className="dk-rail__sep">/</span>
          <span className="dk-rail__title">{deck.title}</span>
        </div>
        <div className="dk-rail__group">
          <span className="dk-rail__title">{slide.title}</span>
          <button type="button" className="dk-btn" onClick={() => setToc((v) => !v)} aria-expanded={toc}>
            Índice
          </button>
          <span aria-live="polite">
            {pad(i + 1)} <span className="dk-rail__sep">/</span> {pad(total)}
          </span>
        </div>
      </header>

      <div className="dk-stage dk-stage--fit" ref={stageRef}>
        {i > 0 && (
          <button
            type="button"
            className="dk-zone dk-zone--prev"
            onClick={() => go(i - 1)}
            aria-label="Tela anterior"
            tabIndex={-1}
          />
        )}
        {i < total - 1 && (
          <button
            type="button"
            className="dk-zone dk-zone--next"
            onClick={() => go(i + 1)}
            aria-label="Próxima tela"
            tabIndex={-1}
          />
        )}

        <article className="dk-canvas" key={slide.id}>
          <div className="dk-canvas__inner" ref={fitRef}>
            {slide.body}
          </div>
        </article>

        {toc && (
          <div className="dk-overlay" role="dialog" aria-label="Índice da apresentação">
            <p className="dk-mono" style={{ marginBottom: "1.5rem" }}>
              {deck.title} — {total} telas
            </p>
            <nav className="dk-toc">
              {deck.slides.map((s, n) => (
                <button
                  type="button"
                  key={s.id}
                  className="dk-toc__row"
                  aria-current={n === i}
                  onClick={() => go(n)}
                >
                  <span className="dk-toc__n">{pad(n + 1)}</span>
                  <span className="dk-toc__t">{s.title}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      <footer className="dk-rail dk-rail--foot">
        <button type="button" className="dk-btn" onClick={() => go(i - 1)} disabled={i === 0}>
          ←
        </button>
        <div className="dk-ticks">
          {deck.slides.map((s, n) => (
            <button
              type="button"
              key={s.id}
              className="dk-tick"
              aria-current={n === i}
              aria-label={`Tela ${n + 1}: ${s.title}`}
              onClick={() => go(n)}
            />
          ))}
        </div>
        <button type="button" className="dk-btn" onClick={() => go(i + 1)} disabled={i === total - 1}>
          →
        </button>
      </footer>
    </div>
  );
}
