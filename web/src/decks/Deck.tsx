import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DitherField } from "../components/visual/DitherField";
import type { Locale } from "../i18n/translations";
import { Chevron } from "./DeckChrome";
import type { Deck } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  deck: Deck;
  locale: Locale;
  onExit: () => void;
};

/**
 * The deck viewer. One sheet per screen, keyboard first.
 * ← → / space walk the deck · G opens the contents · Esc returns to the drawer.
 */
export function DeckViewer({ deck, locale, onExit }: Props) {
  const total = deck.slides.length;
  const sheetRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);

  const [i, setI] = useState(() => {
    const hash = window.location.hash.replace(/^#s\//, "");
    const found = deck.slides.findIndex((s) => s.id === hash);
    return found >= 0 ? found : 0;
  });
  const [toc, setToc] = useState(false);
  /* Which way the deck is travelling — content enters from that side. */
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setDir((prev) => (clamped === i ? prev : clamped > i ? 1 : -1));
      setI(clamped);
      setToc(false);
      const slide = deck.slides[clamped];
      if (slide) window.history.replaceState(null, "", `/decks/${deck.slug}#s/${slide.id}`);
    },
    [deck.slides, deck.slug, i, total],
  );

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

  /* Auto-fit. Every sheet is scaled down until its content fits, so a deck
   * never scrolls and never clips — laptop or meeting-room beamer. */
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    const inner = fitRef.current;
    if (!sheet || !inner) return;

    const fit = () => {
      inner.style.transform = "none";
      const prevAlign = inner.style.alignContent;
      inner.style.alignContent = "start";
      const box = inner.clientHeight;
      const content = inner.scrollHeight;
      const wide = inner.scrollWidth;
      inner.style.alignContent = prevAlign;
      if (box <= 0 || content <= 0) return;
      const k = Math.min(1, box / content, inner.clientWidth / Math.max(wide, 1));
      inner.style.transform = k < 0.995 ? `scale(${k.toFixed(4)})` : "none";
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(sheet);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [i, locale]);

  const slide = deck.slides[i];
  if (!slide) return null;

  const skin = slide.skin ?? "light";

  return (
    <div className="dk-stage">
      <section
        ref={sheetRef}
        className={`dk-sheet${skin === "light" ? "" : ` dk-sheet--${skin}`}`}
        aria-roledescription={locale === "pt" ? "apresentação" : "presentation"}
      >
        {skin === "wave" && (
          <>
            <DitherField className="dk-sheet__wave" />
            <DitherField variant="valid" className="dk-sheet__wave dk-sheet__wave--b" />
          </>
        )}

        <div
          className={`dk-canvas__inner${slide.center ? " dk-canvas__inner--center" : ""}`}
          ref={fitRef}
          key={`${slide.id}-${locale}`}
          style={{ ["--dk-dx" as string]: `${dir * 30}px` }}
        >
          {slide.render(locale)}
        </div>

        <div className="dk-foot">
          <span className="dk-foot__l">{deck.title[locale]}</span>
          <span className="dk-foot__c">Lastre</span>
          <span className="dk-foot__r">
            {deck.updated} — {pad(i + 1)}/{pad(total)}
          </span>
        </div>

        {toc && (
          <div className="dk-overlay" role="dialog" aria-label={locale === "pt" ? "Índice" : "Contents"}>
            <p className="dk-eyebrow" style={{ marginBottom: "1.6rem" }}>
              {deck.title[locale]} — {total} {locale === "pt" ? "telas" : "screens"}
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
                  <span>{s.title[locale]}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </section>

      <button
        type="button"
        className="dk-nav dk-nav--prev"
        onClick={() => go(i - 1)}
        disabled={i === 0}
        aria-label={locale === "pt" ? "Tela anterior" : "Previous screen"}
      >
        <Chevron dir="prev" />
      </button>
      <button
        type="button"
        className="dk-nav dk-nav--next"
        onClick={() => (i === total - 1 ? onExit() : go(i + 1))}
        aria-label={locale === "pt" ? "Próxima tela" : "Next screen"}
      >
        <Chevron dir="next" />
      </button>
    </div>
  );
}
