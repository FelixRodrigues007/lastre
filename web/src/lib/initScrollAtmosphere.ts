/** Scroll-synced page atmosphere — crossfades background as sections enter view. */

export type AtmoZone =
  | "hero"
  | "depth"
  | "origin"
  | "light"
  | "proof"
  | "vault"
  | "cream";

type AtmoPreset = {
  base: string;
  washA: string;
  washB: string;
  washPosA: string;
  washPosB: string;
};

export const ATMO_PRESETS: Record<AtmoZone, AtmoPreset> = {
  hero: {
    base: "#070708",
    washA: "rgba(254, 241, 111, 0.09)",
    washB: "rgba(255, 255, 255, 0.03)",
    washPosA: "80% -10%",
    washPosB: "0% 0%",
  },
  depth: {
    base: "#0c0c0e",
    washA: "rgba(255, 255, 255, 0.05)",
    washB: "rgba(195, 74, 44, 0.06)",
    washPosA: "20% 0%",
    washPosB: "100% 80%",
  },
  origin: {
    base: "#111114",
    washA: "rgba(255, 255, 255, 0.04)",
    washB: "rgba(254, 241, 111, 0.05)",
    washPosA: "90% 10%",
    washPosB: "0% 100%",
  },
  light: {
    base: "#efeede",
    washA: "rgba(84, 87, 54, 0.06)",
    washB: "rgba(254, 241, 111, 0.12)",
    washPosA: "10% 20%",
    washPosB: "90% 90%",
  },
  proof: {
    base: "#16161a",
    washA: "rgba(254, 241, 111, 0.06)",
    washB: "rgba(195, 74, 44, 0.09)",
    washPosA: "50% 0%",
    washPosB: "100% 100%",
  },
  vault: {
    base: "#070708",
    washA: "rgba(254, 241, 111, 0.07)",
    washB: "rgba(255, 255, 255, 0.03)",
    washPosA: "70% 0%",
    washPosB: "0% 100%",
  },
  cream: {
    base: "#dadbc2",
    washA: "rgba(84, 87, 54, 0.1)",
    washB: "rgba(254, 241, 111, 0.08)",
    washPosA: "50% 0%",
    washPosB: "100% 50%",
  },
};

/** Section id → atmosphere zone */
export const SECTION_ATMO: Record<string, AtmoZone> = {
  top: "hero",
  partners: "hero",
  problem: "depth",
  quote: "depth",
  solution: "origin",
  how: "light",
  proof: "proof",
  different: "light",
  "use-cases": "light",
  minerals: "cream",
  compare: "light",
  personas: "depth",
  demo: "vault",
  honesty: "vault",
  trust: "light",
  testimonials: "vault",
  faq: "vault",
  cta: "vault",
  footer: "light",
};

type Cleanup = () => void;

export function initScrollAtmosphere(): Cleanup {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyZone("hero");
    return () => {};
  }

  const sections = Object.keys(SECTION_ATMO)
    .map((id) => {
      const el = document.getElementById(id);
      return el ? { id, el, zone: SECTION_ATMO[id] } : null;
    })
    .filter(Boolean) as { id: string; el: HTMLElement; zone: AtmoZone }[];

  if (!sections.length) return () => {};

  let frame = 0;
  let current: AtmoZone = "hero";

  const sync = () => {
    frame = 0;
    const line = window.innerHeight * 0.42;
    let active = sections[0];

    for (const s of sections) {
      const rect = s.el.getBoundingClientRect();
      if (rect.top <= line) active = s;
    }

    if (active.zone !== current) {
      current = active.zone;
      applyZone(current);
    }
  };

  const queue = () => {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  };

  applyZone("hero");
  sync();
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  return () => {
    window.removeEventListener("scroll", queue);
    window.removeEventListener("resize", queue);
    if (frame) cancelAnimationFrame(frame);
  };
}

function applyZone(zone: AtmoZone) {
  const preset = ATMO_PRESETS[zone];
  const root = document.documentElement;

  root.dataset.atmo = zone;
  root.style.setProperty("--atmo-base", preset.base);
  root.style.setProperty("--atmo-wash-a", preset.washA);
  root.style.setProperty("--atmo-wash-b", preset.washB);
  root.style.setProperty("--atmo-wash-pos-a", preset.washPosA);
  root.style.setProperty("--atmo-wash-pos-b", preset.washPosB);

  const isLight = zone === "light" || zone === "cream";
  root.dataset.atmoTone = isLight ? "light" : "dark";
}
