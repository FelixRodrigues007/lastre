import { useEffect, type RefObject } from "react";

type ParallaxOptions = {
  /** Max vertical travel in px across the hero scroll range */
  travel?: number;
};

/** Scroll + pointer parallax for stacked depth layers inside the hero scene. */
export function useHeroParallax(
  rootRef: RefObject<HTMLElement | null>,
  { travel = 140 }: ParallaxOptions = {},
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax-depth]"));

    if (!layers.length || reduced) {
      layers.forEach((layer) => {
        layer.style.transform = "";
      });
      return;
    }

    const pointer = { x: 0, y: 0 };
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const range = viewport + rect.height;
      const progress = Math.min(1, Math.max(0, (viewport - rect.top) / range));
      const centered = progress * 2 - 1;

      layers.forEach((layer) => {
        const depth = Number(layer.dataset.parallaxDepth ?? "0.5");
        const y = centered * travel * depth;
        const x = pointer.x * depth * 18;
        const scale = 1 + depth * 0.06;

        layer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      });
    };

    const queue = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      pointer.x = Math.max(-1, Math.min(1, nx));
      pointer.y = Math.max(-1, Math.min(1, ny));
      queue();
    };

    const onPointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
      queue();
    };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [travel]);
}
