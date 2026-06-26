/** Scroll-driven reveal — opacity/transform only, one observer for the page. */
let revealObserver: IntersectionObserver | null = null;

function getRevealObserver() {
  if (revealObserver) return revealObserver;

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver?.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
  );

  return revealObserver;
}

export function initScrollReveal() {
  const nodes = document.querySelectorAll<HTMLElement>(".reveal-scroll:not(.is-visible)");

  if (!nodes.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = getRevealObserver();
  nodes.forEach((el) => observer.observe(el));
}
