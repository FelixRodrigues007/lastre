import { useState } from "react";
import { MeshGradientShader } from "../shaders/MeshGradientShader";
import { DitherField } from "../visual/DitherField";
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

const FOOTER_HREFS: readonly (readonly { href: string; external?: boolean }[])[] = [
  [
    { href: "#problem" },
    { href: "#solution" },
    { href: "#how" },
    { href: "#proof" },
    { href: "#demo" },
    { href: "#faq" },
  ],
  [
    { href: APP_URL },
    { href: "#use-cases" },
    { href: "#compare" },
    { href: TRUST_URL },
  ],
  [
    { href: DOCS_URL, external: true },
    { href: GITHUB_URL, external: true },
    { href: CASE_STUDY_URL, external: true },
    { href: CSPR_PACKAGE_URL, external: true },
    { href: "#honesty" },
  ],
  [
    { href: LICENSE_URL, external: true },
    { href: "#honesty" },
    { href: "#not" },
  ],
];

type FooterColumn = {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
};

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

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { t, content } = useSite();
  const f = content.footer;

  const columns: FooterColumn[] = f.columns.map((col, colIndex) => ({
    title: col.title,
    links: col.links.map((label, linkIndex) => {
      const meta = FOOTER_HREFS[colIndex]?.[linkIndex];
      return {
        label,
        href: meta?.href ?? "#",
        external: meta?.external,
      };
    }),
  }));

  return (
    <footer className="site-footer" id="footer" data-theme="light">
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
          <MeshGradientShader blend="overlay" opacity={0.28} intensity={0.65} speed={0.4} />
          <DitherField variant="overlay" className="site-footer__scenic-dither" />
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

              <p className="site-footer__tagline">{f.tagline}</p>

              <p className="site-footer__desc body-max-ch">{f.desc}</p>

              <a className="site-footer__cta" href={APP_URL}>
                {t("openApp")}
              </a>

              <WaitlistForm />

              <div className="site-footer__meta">
                <p className="site-footer__copy mono-label">
                  © {year} {f.copy}
                </p>
                <p className="site-footer__note mono-label">{f.note}</p>
              </div>
            </div>

            <nav className="site-footer__nav" aria-label="Footer">
              {columns.map((col) => (
                <FooterColumnBlock key={col.title} col={col} />
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
