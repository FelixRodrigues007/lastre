import { SealMark } from "../ui/SealMark";
import { CSPR_PACKAGE_URL, GITHUB_URL, LICENSE_URL } from "../../site-links";
import "./site-footer.css";

type FooterColumn = {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
};

const COLUMNS: readonly FooterColumn[] = [
  {
    title: "Protocol",
    links: [
      { label: "The trust gap", href: "#problem" },
      { label: "How it works", href: "#how" },
      { label: "The proof", href: "#proof" },
      { label: "Live demo", href: "#demo" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: GITHUB_URL, external: true },
      { label: "Casper Testnet", href: CSPR_PACKAGE_URL, external: true },
      { label: "Honesty policy", href: "#honesty" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "License", href: LICENSE_URL, external: true },
      { label: "Demo disclaimer", href: "#honesty" },
    ],
  },
];

/** Site footer — light reveal band with link grid and mine exploration scenic. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="footer" data-theme="light">
      <div className="site-footer__stage">
        <div className="site-footer__scenic" aria-hidden="true">
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

        <div className="shell site-footer__body">
          <div className="site-footer__grid">
            <div className="site-footer__brand-col">
              <a className="site-footer__brand" href="#top" aria-label="Lastro — home">
                <span className="site-footer__brand-mark" aria-hidden="true">
                  <SealMark size={22} />
                </span>
                <span className="site-footer__wordmark">Lastro.</span>
              </a>

              <p className="site-footer__tagline">Proof before token.</p>

              <p className="site-footer__desc">
                A provenance trust layer for mineral assets. Simulated demo only — no
                investment, no token sale, no financial rights.
              </p>

              <a className="site-footer__cta" href="#proof">
                Verify proof
              </a>

              <div className="site-footer__meta">
                <p className="site-footer__copy mono-label">
                  © {year} Lastro contributors. All rights reserved.
                </p>
                <p className="site-footer__note mono-label">
                  RWA provenance trust layer · Demo uses fictional data
                </p>
              </div>
            </div>

            <nav className="site-footer__nav" aria-label="Footer">
              {COLUMNS.map((col) => (
                <div key={col.title} className="site-footer__col">
                  <p className="site-footer__col-title mono-label">{col.title}</p>
                  <ul className="site-footer__links">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          className="site-footer__link"
                          href={link.href}
                          {...(link.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>

        <p className="site-footer__scenic-wordmark" aria-hidden="true">
          Lastro
        </p>
      </div>
    </footer>
  );
}
