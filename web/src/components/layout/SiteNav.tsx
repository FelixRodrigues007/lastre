import { useEffect, useState } from "react";
import { SealMark } from "../ui/SealMark";
import "./site-nav.css";

const LINKS = [
  { label: "Protocol", href: "#problem" },
  { label: "How it works", href: "#how" },
  { label: "Verify", href: "#proof" },
];

type NavTone = "hero" | "dark" | "light";

/** DOM order — must match App.tsx section sequence for correct tone sync. */
const NAV_ZONES: { id: string; tone: NavTone; theme?: "light" }[] = [
  { id: "top", tone: "hero" },
  { id: "problem", tone: "dark" },
  { id: "solution", tone: "dark" },
  { id: "different", tone: "light", theme: "light" },
  { id: "how", tone: "light", theme: "light" },
  { id: "proof", tone: "dark" },
  { id: "minerals", tone: "light", theme: "light" },
  { id: "honesty", tone: "dark" },
  { id: "demo", tone: "dark" },
  { id: "cta", tone: "dark" },
  { id: "footer", tone: "light", theme: "light" },
];

function resolveNavZone() {
  const navLine = document.querySelector<HTMLElement>(".site-nav")?.offsetHeight ?? 64;
  let active = NAV_ZONES[0];

  for (const zone of NAV_ZONES) {
    const el = document.getElementById(zone.id);
    if (el && el.getBoundingClientRect().top <= navLine) active = zone;
  }

  return active;
}

export function SiteNav() {
  const [tone, setTone] = useState<NavTone>("hero");
  const [theme, setTheme] = useState<"light" | undefined>(undefined);

  useEffect(() => {
    let frame = 0;

    const sync = () => {
      frame = 0;
      const zone = resolveNavZone();
      setTone(zone.tone);
      setTheme(zone.theme);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={`site-nav site-nav--${tone}`}
      data-theme={theme}
    >
      <div className="shell site-nav__inner">
        <nav className="site-nav__start" aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.href} className="site-nav__link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a className="site-nav__brand" href="#top" aria-label="Lastro — home">
          <SealMark size={28} />
          <span className="site-nav__wordmark">Lastro</span>
        </a>

        <div className="site-nav__end">
          <a className="site-nav__cta" href="#proof">
            Verify proof
          </a>
        </div>
      </div>
    </header>
  );
}
