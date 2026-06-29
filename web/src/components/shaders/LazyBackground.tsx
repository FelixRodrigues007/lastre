import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import "./shaders.css";

type BackgroundModule = { default: ComponentType<Record<string, unknown>> };

type LazyBackgroundProps = {
  /**
   * Dynamic import of the background component (default export).
   * Pass a module-level constant — e.g. `() => import("./AuroraBackground")` —
   * so the chunk is split out and loaded only when the section nears the viewport.
   */
  load: () => Promise<BackgroundModule>;
  /** Acquire/mount this far outside the viewport; unmount beyond it. */
  rootMargin?: string;
  className?: string;
  /** Props forwarded to the loaded background component (colors, speed, etc.). */
  componentProps?: Record<string, unknown>;
  /** Static stand-in shown under reduced motion or before the chunk resolves. */
  fallback?: ReactNode;
};

/**
 * Viewport-gated, code-split host for a heavy WebGL background (e.g. ReactBits).
 *
 * Mirrors the context-pooling discipline of {@link useWebGLCanvas}: the third-party
 * component owns its own canvas/RAF, so we cap concurrent contexts by mounting it
 * only while near the viewport and unmounting it (full teardown) once it leaves.
 * Under reduced motion the component is never mounted — only the static fallback.
 */
export function LazyBackground({
  load,
  rootMargin = "300px 0px",
  className = "",
  componentProps,
  fallback = null,
}: LazyBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  // Build the lazy component exactly once, independent of `load` prop identity.
  const [Background] = useState(() => lazy(load));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin, threshold: 0 },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={hostRef} className={`lazy-bg ${className}`.trim()} aria-hidden="true">
      {inView ? (
        <Suspense fallback={fallback}>
          <Background {...componentProps} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
