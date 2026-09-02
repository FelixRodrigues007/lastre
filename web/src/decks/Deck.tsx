import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { DitherField } from "../components/visual/DitherField";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { Locale } from "../i18n/translations";
import { Chevron } from "./DeckChrome";
import type { Deck } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

const LEAVE_MS = 170;
const SWIPE_PX = 60;
const WHEEL_THRESHOLD = 140;
const WHEEL_REARM_MS = 260;
const NAV_HIDE_MS = 2600;
const NO_SWIPE = "button, a, input, [data-no-swipe]";

type Props = {
  deck: Deck;
  locale: Locale;
  onExit: () => void;
};

/** Alvo bloqueado por overflow rolável — o wheel não deve roubar o scroll. */
function isInScrollable(target: EventTarget | null, boundary: Element | null): boolean {
  let el = target instanceof Element ? target : null;
  while (el && el !== boundary) {
    const { overflowY, overflowX } = getComputedStyle(el);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 1
    ) {
      return true;
    }
    if (
      (overflowX === "auto" || overflowX === "scroll") &&
      el.scrollWidth > el.clientWidth + 1
    ) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

function isSwipeBlocked(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(NO_SWIPE);
}

/**
 * The deck viewer. One sheet per screen, keyboard first.
 * ← → / space walk the deck · G opens the contents · Esc returns to the drawer.
 */
export function DeckViewer({ deck, locale, onExit }: Props) {
  const total = deck.slides.length;
  const reducedMotion = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<number | null>(null);
  const pendingStepRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const wheelArmedRef = useRef(true);
  const wheelRearmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fittingRef = useRef(false);
  const pointerRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tocRowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [i, setI] = useState(() => {
    const hash = window.location.hash.replace(/^#s\//, "");
    const found = deck.slides.findIndex((s) => s.id === hash);
    return found >= 0 ? found : 0;
  });
  const [step, setStep] = useState(0);
  const [toc, setToc] = useState(false);
  const [tocSel, setTocSel] = useState(0);
  const [dir, setDir] = useState(1);
  const [phase, setPhase] = useState<"idle" | "out">("idle");
  const [navVisible, setNavVisible] = useState(true);
  const [printing, setPrinting] = useState(false);

  const slide = deck.slides[i];
  const maxStep = slide?.steps ?? 0;
  const isPrinting =
    printing ||
    (typeof document !== "undefined" && document.documentElement.hasAttribute("data-dk-print"));
  const renderStep = isPrinting ? maxStep : step;

  const bumpNav = useCallback(() => {
    setNavVisible(true);
    if (reducedMotion) return;
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => setNavVisible(false), NAV_HIDE_MS);
  }, [reducedMotion]);

  /* Commit real da troca — só depois da saída ou quando motion está reduzido. */
  const commitSlide = useCallback(
    (clamped: number, nextStep = 0) => {
      setI(clamped);
      setStep(nextStep);
      setPhase("idle");
      setToc(false);
      const s = deck.slides[clamped];
      if (s) window.history.replaceState(null, "", `/decks/${deck.slug}#s/${s.id}`);
    },
    [deck.slides, deck.slug],
  );

  /* Navegação direta: TOC, Home, End, cliques na nav — sempre zera etapa. */
  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));

      if (clamped === i) {
        setStep(0);
        return;
      }

      setDir(clamped > i ? 1 : -1);

      if (reducedMotion) {
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
        pendingRef.current = null;
        commitSlide(clamped, 0);
        return;
      }

      /* Já saindo: só troca o destino, o timer continua. */
      if (phase === "out") {
        pendingRef.current = clamped;
        pendingStepRef.current = 0;
        return;
      }

      pendingRef.current = clamped;
      pendingStepRef.current = 0;
      setPhase("out");

      leaveTimerRef.current = setTimeout(() => {
        leaveTimerRef.current = null;
        const target = pendingRef.current;
        const targetStep = pendingStepRef.current;
        pendingRef.current = null;
        if (target !== null) commitSlide(target, targetStep);
      }, LEAVE_MS);
    },
    [commitSlide, i, phase, reducedMotion, total],
  );

  /* Troca com etapa preservada — só ao voltar slide com builds no meio. */
  const goWithStep = useCallback(
    (next: number, nextStep: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      if (clamped === i) {
        setStep(nextStep);
        return;
      }

      setDir(clamped > i ? 1 : -1);

      if (reducedMotion) {
        commitSlide(clamped, nextStep);
        return;
      }

      if (phase === "out") {
        pendingRef.current = clamped;
        pendingStepRef.current = nextStep;
        return;
      }

      pendingRef.current = clamped;
      pendingStepRef.current = nextStep;
      setPhase("out");

      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = setTimeout(() => {
        leaveTimerRef.current = null;
        const target = pendingRef.current;
        const targetStep = pendingStepRef.current;
        pendingRef.current = null;
        if (target !== null) commitSlide(target, targetStep);
      }, LEAVE_MS);
    },
    [commitSlide, i, phase, reducedMotion, total],
  );

  const advance = useCallback(() => {
    if (!slide) return;
    const maxStep = slide.steps ?? 0;
    if (step < maxStep) {
      setStep((s) => s + 1);
      return;
    }
    if (i < total - 1) go(i + 1);
  }, [go, i, slide, step, total]);

  const retreat = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
      return;
    }
    if (i > 0) {
      const prev = deck.slides[i - 1];
      const prevMax = prev?.steps ?? 0;
      goWithStep(i - 1, prevMax);
    }
  }, [deck.slides, goWithStep, i, step]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isInScrollable(e.target, sheetRef.current)) return;
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (delta === 0) return;
      e.preventDefault();

      if (wheelRearmTimerRef.current) clearTimeout(wheelRearmTimerRef.current);
      wheelRearmTimerRef.current = setTimeout(() => {
        wheelRearmTimerRef.current = null;
        wheelArmedRef.current = true;
      }, WHEEL_REARM_MS);

      if (!wheelArmedRef.current) {
        wheelDeltaRef.current = 0;
        return;
      }

      wheelDeltaRef.current += delta;
      if (Math.abs(wheelDeltaRef.current) < WHEEL_THRESHOLD) return;

      const dirSign = wheelDeltaRef.current > 0 ? 1 : -1;
      wheelDeltaRef.current = 0;
      wheelArmedRef.current = false;
      if (dirSign > 0) advance();
      else retreat();
    },
    [advance, retreat],
  );

  useEffect(() => {
    if (toc) setTocSel(i);
  }, [toc, i]);

  useEffect(() => {
    tocRowRefs.current[tocSel]?.scrollIntoView({ block: "nearest" });
  }, [tocSel]);

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace(/^#s\//, "");
      if (!hash) return;
      const found = deck.slides.findIndex((s) => s.id === hash);
      if (found >= 0 && found !== i) go(found);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [deck.slides, go, i]);

  useEffect(() => {
    bumpNav();
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      if (wheelRearmTimerRef.current) clearTimeout(wheelRearmTimerRef.current);
    };
  }, [bumpNav]);

  useEffect(() => {
    const onBefore = () => {
      document.documentElement.setAttribute("data-dk-print", "");
      flushSync(() => setPrinting(true));
    };
    const onAfter = () => {
      document.documentElement.removeAttribute("data-dk-print");
      setPrinting(false);
    };
    window.addEventListener("beforeprint", onBefore);
    window.addEventListener("afterprint", onAfter);
    return () => {
      window.removeEventListener("beforeprint", onBefore);
      window.removeEventListener("afterprint", onAfter);
      document.documentElement.removeAttribute("data-dk-print");
    };
  }, []);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    sheet.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      sheet.removeEventListener("wheel", handleWheel);
      if (wheelRearmTimerRef.current) clearTimeout(wheelRearmTimerRef.current);
    };
  }, [handleWheel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      bumpNav();

      if (toc) {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setTocSel((n) => Math.min(total - 1, n + 1));
            break;
          case "ArrowUp":
            e.preventDefault();
            setTocSel((n) => Math.max(0, n - 1));
            break;
          case "Enter":
            e.preventDefault();
            go(tocSel);
            break;
          case "Escape":
            e.preventDefault();
            setToc(false);
            break;
          default:
            break;
        }
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          advance();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          retreat();
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
          onExit();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, bumpNav, go, onExit, retreat, toc, tocSel, total]);

  /* Auto-fit. Every sheet is scaled down until its content fits, so a deck
   * never scrolls and never clips — laptop or meeting-room beamer. */
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    const inner = fitRef.current;
    if (!sheet || !inner || phase === "out") return;

    const fit = () => {
      if (fittingRef.current) return;
      fittingRef.current = true;
      inner.style.transform = "none";
      inner.classList.add("is-measuring");
      const box = inner.clientHeight;
      const wide = inner.scrollWidth;
      let content = inner.scrollHeight;
      const anim = inner.querySelector(".dk-canvas__anim");
      if (anim) {
        for (const kid of anim.children) {
          const el = kid as HTMLElement;
          content = Math.max(content, el.offsetTop + el.offsetHeight);
        }
      }
      inner.classList.remove("is-measuring");
      if (box <= 0 || content <= 0) {
        fittingRef.current = false;
        return;
      }
      const k = Math.min(1, box / content, inner.clientWidth / Math.max(wide, 1));
      inner.style.transform = k < 0.995 ? `scale(${k.toFixed(4)})` : "none";
      fittingRef.current = false;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(sheet);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [i, locale, phase, step]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0 || isSwipeBlocked(e.target)) return;
      if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
      pointerRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
      bumpNav();
    },
    [bumpNav],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const p = pointerRef.current;
      if (!p || p.id !== e.pointerId) return;
      bumpNav();
    },
    [bumpNav],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const p = pointerRef.current;
      if (!p || p.id !== e.pointerId) return;
      pointerRef.current = null;
      if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) && !isSwipeBlocked(e.target)) {
        if (dx < 0) advance();
        else retreat();
      }
    },
    [advance, retreat],
  );

  if (!slide) return null;

  const skin = slide.skin ?? "light";
  const progress = ((i + 1) / total) * 100;
  const navHidden = !reducedMotion && !navVisible;

  return (
    <div className="dk-stage" onPointerMove={bumpNav}>
      <section
        ref={sheetRef}
        className={`dk-sheet${skin === "light" ? "" : ` dk-sheet--${skin}`}${slide.bleed ? " dk-sheet--bleed" : ""}`}
        aria-roledescription={locale === "pt" ? "apresentação" : "presentation"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {skin === "wave" && (
          <>
            <DitherField className="dk-sheet__wave" />
            <DitherField variant="valid" className="dk-sheet__wave dk-sheet__wave--b" />
          </>
        )}

        <div
          className={`dk-canvas__inner${slide.center ? " dk-canvas__inner--center" : ""}${slide.bleed ? " dk-canvas__inner--bleed" : ""}${phase === "out" ? " is-out" : ""}`}
          ref={fitRef}
          key={`${slide.id}-${locale}`}
          data-at={step}
        >
          <div className="dk-canvas__anim" style={{ ["--dk-dx" as string]: `${dir * 30}px` }}>
            {slide.render(locale, renderStep)}
          </div>
        </div>

        {!slide.bleed && (
          <div className="dk-foot">
            <span className="dk-foot__l">{deck.title[locale]}</span>
            <span className="dk-foot__c">Lastre</span>
            <span className="dk-foot__r">
              {deck.updated} — {pad(i + 1)}/{pad(total)}
            </span>
          </div>
        )}

        <div className="dk-progress" aria-hidden="true">
          <div className="dk-progress__fill" style={{ width: `${progress}%` }} />
        </div>

        {toc && (
          <div className="dk-overlay" role="dialog" aria-label={locale === "pt" ? "Índice" : "Contents"}>
            <p className="dk-eyebrow dk-overlay__head" style={{ marginBottom: "1.6rem" }}>
              {deck.title[locale]} — {total} {locale === "pt" ? "telas" : "screens"}
            </p>
            <nav className="dk-toc dk-overlay__panel">
              {deck.slides.map((s, n) => (
                <button
                  type="button"
                  key={s.id}
                  ref={(el) => {
                    tocRowRefs.current[n] = el;
                  }}
                  className={`dk-toc__row${n === tocSel ? " is-selected" : ""}`}
                  style={{ ["--dk-i" as string]: n }}
                  aria-current={n === i ? true : undefined}
                  onClick={() => go(n)}
                  onMouseEnter={() => setTocSel(n)}
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
        className={`dk-nav dk-nav--prev${navHidden ? " dk-nav--hidden" : ""}`}
        onClick={() => go(i - 1)}
        disabled={i === 0}
        aria-label={locale === "pt" ? "Tela anterior" : "Previous screen"}
      >
        <Chevron dir="prev" />
      </button>
      <button
        type="button"
        className={`dk-nav dk-nav--next${navHidden ? " dk-nav--hidden" : ""}`}
        onClick={() => (i === total - 1 ? onExit() : go(i + 1))}
        aria-label={locale === "pt" ? "Próxima tela" : "Next screen"}
      >
        <Chevron dir="next" />
      </button>
    </div>
  );
}
