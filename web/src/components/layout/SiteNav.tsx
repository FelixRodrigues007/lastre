import { useEffect, useRef, useState } from "react";
import { SealMark } from "../ui/SealMark";
import { useSite } from "../../context/SiteContext";
import { APP_URL, DOCS_URL } from "../../site-links";
import "./site-nav.css";

const NAV_LINKS = [
  { label: "Protocol", href: "#problem" },
  { label: "How", href: "#how" },
  { label: "Proof", href: "#proof" },
  { label: "Demo", href: "#demo" },
] as const;

const SECONDARY_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "FAQ", href: "#faq" },
  { label: "App", href: APP_URL },
  { label: "Docs", href: DOCS_URL, external: true },
];

function NavMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, t } = useSite();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button type="button" className="site-nav__overlay" onClick={onClose} aria-label="Close menu" />
      <div
        className="site-nav__drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="site-nav__drawer-head">
          <a className="site-nav__drawer-brand" href="#top" onClick={onClose}>
            <SealMark size={20} />
            <span>Lastre</span>
          </a>
          <button type="button" className="site-nav__drawer-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav aria-label="Site">
          <ul className="site-nav__drawer-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a className="site-nav__drawer-link" href={link.href} onClick={onClose}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <ul className="site-nav__drawer-secondary">
            {SECONDARY_LINKS.map((link) => (
              <li key={link.href + link.label}>
                <a
                  className="site-nav__drawer-secondary-link"
                  href={link.href}
                  onClick={onClose}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="site-nav__drawer-locale"
            onClick={() => setLocale(locale === "en" ? "pt" : "en")}
          >
            {t("locale")}
          </button>
        </nav>
      </div>
    </>
  );
}

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="site-nav">
        <div className="shell site-nav__inner">
          <div className="site-nav__start">
            <a className="site-nav__brand" href="#top" aria-label="Lastre — home">
              <SealMark size={20} />
              <span className="site-nav__wordmark">Lastre</span>
            </a>

            <nav className="site-nav__links" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <a key={link.href} className="site-nav__link" href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="site-nav__end">
            <a className="site-nav__action" href={APP_URL}>
              App
            </a>
            <button
              type="button"
              className="site-nav__menu-btn"
              aria-expanded={menuOpen}
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <NavMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
