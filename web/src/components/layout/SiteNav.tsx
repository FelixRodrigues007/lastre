import { useEffect, useRef, useState } from "react";
import { SealMark } from "../ui/SealMark";
import { useSite } from "../../context/SiteContext";
import { trackEvent } from "../../lib/analytics";
import type { Locale } from "../../i18n/translations";
import { APP_URL, APP_URL_IS_EXTERNAL, DOCS_URL } from "../../site-links";
import "./site-nav.css";

function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useSite();

  const select = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    trackEvent("locale_change", { locale: next });
  };

  return (
    <div
      className={className ? `site-nav__locale ${className}` : "site-nav__locale"}
      role="group"
      aria-label="Language"
    >
      {(["pt", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          className="site-nav__locale-btn"
          data-active={locale === code || undefined}
          aria-pressed={locale === code}
          onClick={() => select(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const NAV_HREFS = [
  { href: "#problem", key: "protocol" as const },
  { href: "#how", key: "how" as const },
  { href: "#proof", key: "proof" as const },
  { href: "#demo", key: "demo" as const },
] as const;

const SECONDARY_HREFS = [
  { href: "#faq", key: "faq" as const },
  ...(APP_URL_IS_EXTERNAL
    ? ([{ href: APP_URL, key: "app" as const, external: true }] as const)
    : ([{ href: APP_URL, key: "app" as const }] as const)),
  { href: DOCS_URL, key: "docs" as const, external: true },
] as const;

function NavMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { content } = useSite();
  const { nav } = content;

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
      <button type="button" className="site-nav__overlay" onClick={onClose} aria-label={nav.closeMenu} />
      <div
        className="site-nav__drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={nav.openMenu}
      >
        <div className="site-nav__drawer-head">
          <a className="site-nav__drawer-brand" href="#top" onClick={onClose}>
            <SealMark size={20} />
            <span>Lastre</span>
          </a>
          <button type="button" className="site-nav__drawer-close" onClick={onClose} aria-label={nav.closeMenu}>
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
            {NAV_HREFS.map((link) => (
              <li key={link.href}>
                <a className="site-nav__drawer-link" href={link.href} onClick={onClose}>
                  {nav[link.key]}
                </a>
              </li>
            ))}
          </ul>

          <ul className="site-nav__drawer-secondary">
            {SECONDARY_HREFS.map((link) => (
              <li key={link.href + link.key}>
                <a
                  className="site-nav__drawer-secondary-link"
                  href={link.href}
                  onClick={onClose}
                  {...("external" in link ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {nav[link.key]}
                </a>
              </li>
            ))}
          </ul>

          <LocaleToggle className="site-nav__locale--drawer" />
        </nav>
      </div>
    </>
  );
}

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { content } = useSite();
  const { nav } = content;

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
              {NAV_HREFS.map((link) => (
                <a key={link.href} className="site-nav__link" href={link.href}>
                  {nav[link.key]}
                </a>
              ))}
            </nav>
          </div>

          <div className="site-nav__end">
            <LocaleToggle />
            <a
              className="site-nav__action"
              href={APP_URL}
              {...(APP_URL_IS_EXTERNAL ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {nav.app}
            </a>
            <button
              type="button"
              className="site-nav__menu-btn"
              aria-expanded={menuOpen}
              aria-label={nav.openMenu}
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
