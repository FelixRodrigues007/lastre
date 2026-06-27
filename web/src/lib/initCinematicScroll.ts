/** Scroll-scrubbed progress for Problem and Solution pinned sections. */
type Cleanup = () => void;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sectionProgress(el: HTMLElement): number {
  const total = el.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  const scrolled = -el.getBoundingClientRect().top;
  return Math.min(1, Math.max(0, scrolled / total));
}

function initProblemCinematic(): Cleanup | void {
  const block = document.querySelector<HTMLElement>(".problem__cinematic");
  if (!block) return;

  if (prefersReducedMotion()) {
    block.style.setProperty("--problem-progress", "0");
    return;
  }

  let frame = 0;

  const sync = () => {
    frame = 0;
    const progress = sectionProgress(block);
    block.style.setProperty("--problem-progress", progress.toFixed(4));
    block.style.setProperty(
      "--problem-globe-scale",
      (0.88 + progress * 0.16).toFixed(4),
    );
    block.style.setProperty(
      "--problem-head-opacity",
      (1 - Math.max(0, progress - 0.55) * 2.2).toFixed(4),
    );
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
    block.style.removeProperty("--problem-progress");
    block.style.removeProperty("--problem-globe-scale");
    block.style.removeProperty("--problem-head-opacity");
  };
}

function initSolutionCinematic(): Cleanup | void {
  const showcase = document.querySelector<HTMLElement>(".sol__showcase-wrap");
  if (!showcase) return;

  if (prefersReducedMotion()) {
    showcase.style.setProperty("--sol-progress", "0");
    return;
  }

  let frame = 0;

  const sync = () => {
    frame = 0;
    const rect = showcase.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const enter = Math.min(1, Math.max(0, (viewport * 0.72 - rect.top) / (viewport * 0.55)));
    const progress = enter * enter * (3 - 2 * enter);

    showcase.style.setProperty("--sol-progress", progress.toFixed(4));
    showcase.style.setProperty(
      "--sol-window-y",
      `${((1 - progress) * 48).toFixed(2)}px`,
    );
    showcase.style.setProperty(
      "--sol-window-scale",
      (0.92 + progress * 0.08).toFixed(4),
    );
    showcase.style.setProperty(
      "--sol-scenery-scale",
      (1.08 - progress * 0.08).toFixed(4),
    );
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
    showcase.style.removeProperty("--sol-progress");
    showcase.style.removeProperty("--sol-window-y");
    showcase.style.removeProperty("--sol-window-scale");
    showcase.style.removeProperty("--sol-scenery-scale");
  };
}

export function initCinematicScroll(): Cleanup {
  const cleanups = [
    initProblemCinematic(),
    initSolutionCinematic(),
  ].filter(Boolean) as Cleanup[];

  return () => cleanups.forEach((fn) => fn());
}
