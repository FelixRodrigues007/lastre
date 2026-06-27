/** Scroll-driven motion — reveal on enter + nav sync. */
import { initScrollReveal } from "./initScrollReveal";

type Cleanup = () => void;

/** Compact nav + active section link while scrolling. */
function initNavScrollState(): Cleanup {
  const nav = document.querySelector<HTMLElement>(".site-nav");
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".site-nav__link[href^='#']"),
  );

  const sections = links
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const el = id ? document.getElementById(id) : null;
      return el ? { link, el } : null;
    })
    .filter(Boolean) as { link: HTMLAnchorElement; el: HTMLElement }[];

  let frame = 0;

  const sync = () => {
    frame = 0;
    const scrolled = window.scrollY > 48;
    nav?.classList.toggle("site-nav--scrolled", scrolled);

    if (!sections.length) return;

    if (window.scrollY < 120) {
      sections.forEach(({ link }) => link.classList.remove("site-nav__link--active"));
      return;
    }

    const navLine = nav?.offsetHeight ?? 64;
    let activeId = sections[0]?.el.id;

    for (const { el } of sections) {
      if (el.getBoundingClientRect().top <= navLine + 80) activeId = el.id;
    }

    sections.forEach(({ link, el }) => {
      link.classList.toggle("site-nav__link--active", el.id === activeId);
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
    nav?.classList.remove("site-nav--scrolled");
    links.forEach((link) => link.classList.remove("site-nav__link--active"));
  };
}

export function initScrollEffects(): Cleanup {
  const cleanups = [initScrollReveal(), initNavScrollState()].filter(Boolean) as Cleanup[];

  return () => cleanups.forEach((fn) => fn());
}
