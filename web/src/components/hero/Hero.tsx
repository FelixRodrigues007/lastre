import { APP_URL, CSPR_PACKAGE_URL } from "../../site-links";
import { useSite } from "../../context/SiteContext";
import { useCountUp } from "../../hooks/useCountUp";
import { useOnChainStats } from "../../hooks/useOnChainStats";
import { trackEvent } from "../../lib/analytics";
import { Button } from "../ui/Button";
import { HeroMedia, HeroUi } from "./HeroMedia";
import "./hero.css";

export function Hero() {
  const { t } = useSite();
  const stats = useOnChainStats();
  const accepted = useCountUp(stats.accepted);
  const rejected = useCountUp(stats.rejected);

  return (
    <section className="hero" id="top">
      <HeroMedia />

      <div className="hero__stage">
        <div className="shell hero__layout">
          <div className="hero__copy">
            <p className="hero__eyebrow mono-label">Casper Testnet</p>

            <h1 className="hero__headline">{t("heroHeadline")}</h1>

            <p className="hero__subhead">{t("heroSubShort")}</p>

            <div className="hero__actions btn-row">
              <Button
                href="#proof"
                onClick={() => trackEvent("cta_click", { target: "hero-demo" })}
              >
                {t("runDemo")}
              </Button>
              <Button
                href={CSPR_PACKAGE_URL}
                variant="secondary"
                external
                onClick={() => trackEvent("cta_click", { target: "hero-chain" })}
              >
                {t("viewOnChain")}
              </Button>
            </div>

            <p className="hero__meta tabular-nums" aria-live="polite">
              <span>
                <span className="hero__meta-val">{accepted}</span> {t("accepted")}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <span className="hero__meta-val">{rejected}</span> {t("rejected")}
              </span>
              <span aria-hidden="true">·</span>
              <Button href={APP_URL} variant="tertiary" className="hero__meta-link">
                {t("openApp")}
              </Button>
            </p>
          </div>

          <div className="hero__ui">
            <HeroUi />
          </div>
        </div>

        <div className="shell hero__foot">
          <a className="hero__scroll" href="#problem" aria-label="Scroll to learn more">
            Explore
            <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
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
