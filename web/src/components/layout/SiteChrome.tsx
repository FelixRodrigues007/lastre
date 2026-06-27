import { useEffect, type ReactNode } from "react";
import { Button } from "../ui/Button";
import { useSite } from "../../context/SiteContext";
import "./site-chrome.css";

export function SkipLink() {
  const { t } = useSite();
  return (
    <a className="skip-link" href="#proof">
      {t("skipToDemo")}
    </a>
  );
}

export function ScrollProgress() {
  const { scrollDepth, t } = useSite();

  return (
    <div
      className="scroll-progress"
      role="progressbar"
      aria-label={t("scrollProgress")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(scrollDepth * 100)}
    >
      <svg className="scroll-progress__ring" viewBox="0 0 36 36" aria-hidden="true">
        <circle className="scroll-progress__track" cx="18" cy="18" r="15.5" />
        <circle
          className="scroll-progress__fill"
          cx="18"
          cy="18"
          r="15.5"
          style={{ strokeDashoffset: `${100 - scrollDepth * 100}` }}
        />
      </svg>
      <span className="scroll-progress__pct mono-label">{Math.round(scrollDepth * 100)}</span>
    </div>
  );
}

export function ProofRail() {
  const { t, scrollDepth, content } = useSite();

  return (
    <nav
      className="proof-rail"
      aria-label={t("proofRail")}
      data-visible={scrollDepth > 0.08 ? "true" : "false"}
    >
      <ol className="proof-rail__list">
        {content.chrome.proofRail.map((step, i) => (
          <li key={step.href} className="proof-rail__item">
            {i > 0 ? <span className="proof-rail__sep" aria-hidden="true">→</span> : null}
            <a className="proof-rail__link link-grow" href={step.href}>
              {step.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionToc() {
  const { content } = useSite();
  const c = content.chrome;

  return (
    <nav className="section-toc" aria-label={c.tocAria}>
      <p className="section-toc__title mono-label">{c.tocTitle}</p>
      <ol className="section-toc__list">
        {c.toc.map((item) => (
          <li key={item.id}>
            <a className="section-toc__link link-grow" href={`#${item.id}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ToastStack() {
  const { toasts, dismissToast } = useSite();
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span>{t.message}</span>
          <button type="button" className="toast__dismiss" onClick={() => dismissToast(t.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function StickyMobileCta() {
  const { scrollDepth, t } = useSite();
  if (scrollDepth < 0.3) return null;

  return (
    <div className="sticky-mobile-cta">
      <Button href="#proof" className="sticky-mobile-cta__btn">
        {t("tryTamperDemo")}
      </Button>
    </div>
  );
}

export function PageEntrance({ children }: { children: ReactNode }) {
  return <div className="page-entrance">{children}</div>;
}

export function ScrollDepthTracker() {
  const { setScrollDepth } = useSite();

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScrollDepth(max > 0 ? Math.min(1, window.scrollY / max) : 0);
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
  }, [setScrollDepth]);

  return null;
}
