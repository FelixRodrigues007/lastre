import { useId, useState } from "react";
import type { CSSProperties } from "react";
import { CSPR_EXPLORER_EMBED, CSPR_PACKAGE_URL, GITHUB_URL } from "../../site-links";
import { useSite } from "../../context/SiteContext";
import { Button } from "../ui/Button";
import { LiveGatewayPanel } from "../gateway/LiveGatewayPanel";
import { DitherField } from "../visual/DitherField";
import { BoundaryVisual } from "./BoundaryVisual";
import "./demonstration.css";
import "../content/content-sections.css";
import "../visual/visual.css";

export function Demonstration() {
  const baseId = useId();
  const { t, content } = useSite();
  const c = content.demonstration;
  const [showEmbed, setShowEmbed] = useState(false);

  return (
    <div className="demonstration section--band" data-theme="light">

      <section
        className="demonstration__row demonstration__row--flip"
        id="honesty"
        aria-labelledby={`${baseId}-honesty-title`}
      >
        <div className="shell split-grid demonstration__grid">
          <div className="demonstration__copy">
            <p className="kicker reveal-scroll">{c.honestyKicker}</p>

            <h2
              id={`${baseId}-honesty-title`}
              className="section-title reveal-scroll"
              style={{ "--reveal-delay": "60ms" } as CSSProperties}
            >
              {c.honestyTitle}
            </h2>

            <div
              className="section-lead section-lead--rule section-lead--stack reveal-scroll body-max-ch"
              style={{ "--reveal-delay": "120ms" } as CSSProperties}
            >
              <p>{c.honestyIntro}</p>
              <p>{c.honestyLead}</p>
            </div>
          </div>

          <div
            className="demonstration__visual bleed-left reveal-scroll"
            style={{ "--reveal-delay": "180ms" } as CSSProperties}
          >
            <div className="dither-panel">
              <DitherField variant="seal" />
              <div className="dither-panel__content">
                <BoundaryVisual />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="demonstration__row"
        id="demo"
        aria-labelledby={`${baseId}-live-title`}
      >
        <div className="shell split-grid demonstration__grid">
          <div className="demonstration__copy">
            <p className="kicker reveal-scroll">{c.liveKicker}</p>

            <h2
              id={`${baseId}-live-title`}
              className="section-title reveal-scroll"
              style={{ "--reveal-delay": "60ms" } as CSSProperties}
            >
              {c.liveTitle}
            </h2>

            <p
              className="section-lead section-lead--rule reveal-scroll body-max-ch"
              style={{ "--reveal-delay": "120ms" } as CSSProperties}
            >
              {c.liveLead}
            </p>

            <div
              className="demonstration__actions btn-row reveal-scroll"
              style={{ "--reveal-delay": "180ms" } as CSSProperties}
            >
              <Button href="#proof">{t("tryTamperDemo")}</Button>
              <Button href={CSPR_PACKAGE_URL} variant="secondary" external>
                {c.viewExplorer}
              </Button>
              <Button href={GITHUB_URL} variant="tertiary" external>
                {c.readCode}
              </Button>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowEmbed((v) => !v)}>
                {showEmbed ? c.hideExplorer : c.showExplorer}
              </button>
            </div>
          </div>

          <div
            className="demonstration__visual bleed-right reveal-scroll"
            style={{ "--reveal-delay": "240ms" } as CSSProperties}
          >
            <div className="dither-panel">
              <DitherField variant="valid" />
              <div className="dither-panel__content">
                {showEmbed ? (
                  <>
                    <iframe
                      className="expl__embed"
                      src={CSPR_EXPLORER_EMBED}
                      title={c.embedTitle}
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      loading="lazy"
                    />
                    <p className="expl__embed-fallback">
                      {c.embedFallback}{" "}
                      <a href={CSPR_PACKAGE_URL} target="_blank" rel="noopener noreferrer">
                        {c.embedFallbackLink}
                      </a>
                      .
                    </p>
                  </>
                ) : (
                  <LiveGatewayPanel />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
