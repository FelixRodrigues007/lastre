import { CSPR_PACKAGE_URL } from "../../site-links";
import { useSite } from "../../context/SiteContext";
import { trackEvent } from "../../lib/analytics";
import { Button } from "../ui/Button";
import { HeroMedia, HeroUi } from "./HeroMedia";
import "./hero.css";

export function Hero() {
  const { t, content } = useSite();

  const headlineWords = t("heroHeadline").trim().split(" ");
  const headlineAccent = headlineWords.pop() ?? "";
  const headlineLead = headlineWords.join(" ");

  return (
    <section className="hero" id="top">
      <HeroMedia />

      <div className="hero__stage">
        <div className="shell hero__layout">
          <div className="hero__copy">
            <p className="hero__eyebrow">{content.hero.eyebrow}</p>

            <h1 className="hero__headline">
              {headlineLead}{" "}
              <span className="hero__accent">{headlineAccent}</span>
            </h1>

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
          </div>

          <div className="hero__ui">
            <HeroUi />
          </div>
        </div>
      </div>
    </section>
  );
}
