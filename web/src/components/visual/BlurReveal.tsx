import { useEffect, useMemo, useRef } from "react";
import "./visual.css";

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function clamp01(t: number) {
  return Math.min(1, Math.max(0, t));
}

/** 0 → 1 as the element travels through the viewport (scrubs both directions). */
function viewportProgress(rect: DOMRect, vh: number) {
  const travel = vh + rect.height;
  if (travel <= 0) return 1;
  return clamp01((vh - rect.top) / travel);
}

/** Per-glyph progress from its position in the viewport reveal band. */
function viewportReveal(rect: DOMRect, vh: number, start = 0.78, end = 0.34) {
  const y = rect.top + rect.height * 0.5;
  const bandStart = vh * start;
  const bandEnd = vh * end;
  const span = bandStart - bandEnd;
  if (span <= 0) return 1;
  return smoothstep(clamp01((bandStart - y) / span));
}

type BlurRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Max blur in px at start */
  blur?: number;
};

/** Blur-to-sharp reveal on scroll — inspired by 21st.dev blur-reveal. */
export function BlurReveal({ children, className = "", blur = 16 }: BlurRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.style.setProperty("--blur-reveal", "0px");
      el.style.setProperty("--blur-reveal-opacity", "1");
      return;
    }

    let frame = 0;

    const sync = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const eased = smoothstep(viewportProgress(rect, vh));
      el.style.setProperty("--blur-reveal", `${((1 - eased) * blur).toFixed(2)}px`);
      el.style.setProperty("--blur-reveal-opacity", eased.toFixed(3));
      el.style.setProperty("--blur-reveal-y", `${((1 - eased) * 28).toFixed(1)}px`);
    };

    const queue = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);

    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [blur]);

  return (
    <div ref={ref} className={`blur-reveal ${className}`.trim()}>
      {children}
    </div>
  );
}

type BlurRevealTextProps = {
  children: string;
  className?: string;
  /** Max blur in px at start */
  blur?: number;
  /** Viewport band start (0–1 of vh) where reveal begins */
  revealStart?: number;
  /** Viewport band end (0–1 of vh) where reveal completes */
  revealEnd?: number;
};

/** Word-by-word blur reveal scrubbed by each word's position in the viewport. */
export function BlurRevealText({
  children,
  className = "",
  blur = 14,
  revealStart = 0.78,
  revealEnd = 0.34,
}: BlurRevealTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = useMemo(
    () => children.split(/\s+/).filter(Boolean),
    [children],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-blur-word]"));

    if (reduced) {
      spans.forEach((span) => {
        span.style.setProperty("--blur-word", "0px");
        span.style.setProperty("--blur-word-opacity", "1");
        span.style.setProperty("--blur-word-y", "0px");
      });
      return;
    }

    let frame = 0;

    const sync = () => {
      frame = 0;
      const vh = window.innerHeight || 1;

      spans.forEach((span) => {
        const wordRect = span.getBoundingClientRect();
        const local = viewportReveal(wordRect, vh, revealStart, revealEnd);
        span.style.setProperty("--blur-word", `${((1 - local) * blur).toFixed(2)}px`);
        span.style.setProperty("--blur-word-opacity", local.toFixed(3));
        span.style.setProperty("--blur-word-y", `${((1 - local) * 18).toFixed(1)}px`);
      });
    };

    const queue = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);

    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [blur, revealStart, revealEnd, words.length]);

  return (
    <p ref={ref} className={`blur-reveal-text ${className}`.trim()}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} data-blur-word className="blur-reveal-text__word">
          {word}
          {i < words.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </p>
  );
}
