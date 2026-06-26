import { useRef, type CSSProperties } from "react";
import { Button } from "../ui/Button";
import { HeroFilmstrip, HeroMedia, HeroUi } from "./HeroMedia";
import { useHeroParallax } from "./useHeroParallax";
import "./hero.css";

const SIGNALS = [
  { term: "Offline", detail: "Deterministic seal" },
  { term: "On-chain", detail: "Casper anchor" },
  { term: "Verdict", detail: "Valid / Invalid" },
] as const;

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  useHeroParallax(heroRef, { travel: 180 });

  return (
    <section className="hero" id="top" ref={heroRef}>
      <HeroMedia />

      <div className="hero__stage">
        <div className="shell hero__layout">
          <div className="hero__copy">
            <p
              className="eyebrow reveal"
              style={{ "--reveal-delay": "0ms" } as CSSProperties}
            >
              <span className="eyebrow__dot" aria-hidden="true" />
              Live on Casper Testnet · Proof-of-provenance protocol
            </p>

            <h1
              className="hero__headline reveal"
              style={{ "--reveal-delay": "80ms" } as CSSProperties}
            >
              <span className="accent-underline accent-underline--draw">Proof</span> before token.
            </h1>

            <p
              className="hero__subhead reveal"
              style={{ "--reveal-delay": "160ms" } as CSSProperties}
            >
              Lastro is the trust layer for real-world assets and autonomous agents.
              It verifies physical origin offline and deterministically, then anchors
              the verdict on Casper — before any token or agent acts on the data.
            </p>

            <div
              className="hero__actions reveal"
              style={{ "--reveal-delay": "240ms" } as CSSProperties}
            >
              <Button href="#demo" trailing={<span aria-hidden="true">→</span>}>
                Try the live demo
              </Button>
              <Button href="#demo" variant="ghost">
                Verify on-chain
              </Button>
            </div>

            <dl
              className="hero__signals reveal"
              style={{ "--reveal-delay": "300ms" } as CSSProperties}
            >
              {SIGNALS.map(({ term, detail }) => (
                <div className="hero__signal" key={term}>
                  <dt className="mono-label">{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hero__ui" aria-hidden={false}>
            <HeroUi />
          </div>
        </div>

        <div className="shell hero__foot">
          <HeroFilmstrip />
          <a className="hero__scroll" href="#problem" aria-label="Scroll to the problem">
            <span>Scroll</span>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M7 2V12M7 12L3 8M7 12L11 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
