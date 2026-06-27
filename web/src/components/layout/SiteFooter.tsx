import { useState } from "react";
import { SealMark } from "../ui/SealMark";
import {
  APP_URL,
  CASE_STUDY_URL,
  CSPR_PACKAGE_URL,
  DOCS_URL,
  GITHUB_URL,
  LICENSE_URL,
  TRUST_URL,
} from "../../site-links";
import { WaitlistForm } from "../content/ContentSections";
import { useSite } from "../../context/SiteContext";
import "./site-footer.css";
import "../content/content-sections.css";

type FooterColumn = {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
};

const COLUMNS: readonly FooterColumn[] = [
  {
    title: "Protocol",
    links: [
      { label: "The trust gap", href: "#problem" },
      { label: "Origin proof", href: "#solution" },
      { label: "How it works", href: "#how" },
      { label: "Tamper demo", href: "#proof" },
      { label: "Live demo", href: "#demo" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "App console", href: APP_URL },
      { label: "Use cases", href: "#use-cases" },
      { label: "Comparison", href: "#compare" },
      { label: "Trust center", href: TRUST_URL },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: DOCS_URL, external: true },
      { label: "GitHub", href: GITHUB_URL, external: true },
      { label: "Case study", href: CASE_STUDY_URL, external: true },
      { label: "Casper Testnet", href: CSPR_PACKAGE_URL, external: true },
      { label: "Honesty policy", href: "#honesty" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "License", href: LICENSE_URL, external: true },
      { label: "Demo disclaimer", href: "#honesty" },
      { label: "What we are not", href: "#not" },
    ],
  },
];

function FooterColumnBlock({ col }: { col: FooterColumn }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="site-footer__col" data-open={open ? "true" : "false"}>
      <button
        type="button"
        className="footer-accordion__trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {col.title}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <p className="site-footer__col-title mono-label">{col.title}</p>
      <ul className="site-footer__links">
        {col.links.map((link) => (
          <li key={link.label}>
            <a
              className="site-footer__link link-grow"
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Site footer — light reveal band with link grid and mine exploration scenic. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const { t } = useSite();

  return (
    <footer className="site-footer" id="footer" data-theme="light">
      <nav className="shell site-footer__breadcrumb mono-label" aria-label="Breadcrumb">
        <a href="#top">Home</a>
        <span aria-hidden="true"> / </span>
        <a href="#proof">Proof demo</a>
        <span aria-hidden="true"> / </span>
        <span>Footer</span>
      </nav>

      <div className="site-footer__stage">
        <div className="site-footer__scenic" aria-hidden="true" data-scroll-shift="0.08">
          <img
            className="site-footer__scenic-img"
            src="/media/footer-mine-exploration.png"
            alt=""
            width={2048}
            height={878}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="shell site-footer__body reveal-scroll">
          <div className="site-footer__grid">
            <div className="site-footer__brand-col">
              <a className="site-footer__brand" href="#top" aria-label="Lastre — home">
                <span className="site-footer__brand-mark" aria-hidden="true">
                  <SealMark size={22} />
                </span>
                <span className="site-footer__wordmark">Lastre.</span>
              </a>

              <p className="site-footer__tagline">Proof before token.</p>

              <p className="site-footer__desc body-max-ch">
                A provenance trust layer for mineral assets. Simulated demo only — no
                investment, no token sale, no financial rights.
              </p>

              <a className="site-footer__cta" href={APP_URL}>
                {t("openApp")}
              </a>

              <WaitlistForm />

              <div className="site-footer__meta">
                <p className="site-footer__copy mono-label">
                  © {year} Lastre contributors. All rights reserved.
                </p>
                <p className="site-footer__note mono-label">
                  RWA provenance trust layer · Demo uses fictional data
                </p>
              </div>
            </div>

            <nav className="site-footer__nav" aria-label="Footer">
              {COLUMNS.map((col) => (
                <FooterColumnBlock key={col.title} col={col} />
              ))}
            </nav>
          </div>
        </div>

        <p className="site-footer__scenic-wordmark" aria-hidden="true">
          Lastre
        </p>
      </div>
    </footer>
  );
}
