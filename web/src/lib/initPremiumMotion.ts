/** Premium scroll polish — blur reveals, section progress, magnetic CTAs. */

type Cleanup = () => void;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Blur + translate reveal for section titles (Awwwards-style entrance). */
function initBlurReveal(): Cleanup | void {
  if (prefersReducedMotion()) return;

  const nodes = document.querySelectorAll<HTMLElement>(
    ".section-title.reveal-scroll, .hero__headline .hero__word",
  );

  nodes.forEach((el) => {
    el.style.setProperty("--blur-from", "12px");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-blur-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );

  document.querySelectorAll<HTMLElement>(".section-title.reveal-scroll").forEach((el) => {
    observer.observe(el);
  });

  return () => observer.disconnect();
}

/** Subtle scale-down on scroll for hero media (Apple product page feel). */
function initHeroScrollScale(): Cleanup | void {
  const hero = document.querySelector<HTMLElement>(".hero__media");
  if (!hero || prefersReducedMotion()) return;

  let frame = 0;

  const sync = () => {
    frame = 0;
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.85)));
    const scale = 1 + progress * 0.04;
    const opacity = 1 - progress * 0.18;
    hero.style.setProperty("--hero-scroll-scale", scale.toFixed(4));
    hero.style.setProperty("--hero-scroll-opacity", opacity.toFixed(3));
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
}

/** Nav link magnetic nudge toward pointer. */
function initNavMagnetic(): Cleanup | void {
  if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;

  const links = Array.from(document.querySelectorAll<HTMLElement>(".site-nav__link"));
  if (!links.length) return;

  const cleanups: Cleanup[] = [];

  links.forEach((link) => {
    const onMove = (e: PointerEvent) => {
      const rect = link.getBoundingClientRect();
      const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      link.style.transform = `translate(${(nx * 3).toFixed(1)}px, ${(ny * 2).toFixed(1)}px)`;
    };
    const reset = () => {
      link.style.transform = "";
    };
    link.addEventListener("pointermove", onMove);
    link.addEventListener("pointerleave", reset);
    cleanups.push(() => {
      link.removeEventListener("pointermove", onMove);
      link.removeEventListener("pointerleave", reset);
      reset();
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

export function initPremiumMotion(): Cleanup {
  const cleanups = [
    initBlurReveal(),
    initHeroScrollScale(),
    initNavMagnetic(),
  ].filter(Boolean) as Cleanup[];

  return () => cleanups.forEach((fn) => fn());
}
