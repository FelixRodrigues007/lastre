/** Scroll-driven reveal — opacity/transform only, one observer for the page. */
let revealObserver: IntersectionObserver | null = null;

const REVEAL_SELECTOR = [
  ".reveal-scroll:not(.is-visible)",
  ".reveal-stagger:not(.is-visible)",
].join(", ");

function revealNode(el: Element) {
  el.classList.add("is-visible");
  el.querySelectorAll<HTMLElement>(".reveal-stagger").forEach((group) => {
    group.classList.add("is-visible");
  });
  revealObserver?.unobserve(el);
}

/** Reveal nodes in view or already scrolled past — avoids empty reserved blocks. */
function sweepReveals() {
  document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    const inView = rect.top < vh * 0.94 && rect.bottom > 0;
    const scrolledPast = rect.bottom <= 0;

    if (inView || scrolledPast) revealNode(el);
  });
}

function getRevealObserver() {
  if (revealObserver) return revealObserver;

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealNode(entry.target);
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -4% 0px" },
  );

  return revealObserver;
}

export function initScrollReveal(): (() => void) | void {
  const nodes = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);

  if (!nodes.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = getRevealObserver();
  nodes.forEach((el) => observer.observe(el));

  let frame = 0;
  const queueSweep = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      sweepReveals();
    });
  };

  requestAnimationFrame(() => {
    sweepReveals();
    requestAnimationFrame(sweepReveals);
  });

  window.addEventListener("scroll", queueSweep, { passive: true });
  window.addEventListener("resize", queueSweep);
  window.addEventListener("hashchange", queueSweep);

  return () => {
    window.removeEventListener("scroll", queueSweep);
    window.removeEventListener("resize", queueSweep);
    window.removeEventListener("hashchange", queueSweep);
    if (frame) cancelAnimationFrame(frame);
  };
}
