import { useId, useState } from "react";
import type { CSSProperties } from "react";
import { CASPER_TESTNET_EVIDENCE, CSPR_PACKAGE_URL, GITHUB_URL } from "../../site-links";
import { useSite } from "../../context/SiteContext";
import { Button } from "../ui/Button";
import { LiveGatewayPanel } from "../gateway/LiveGatewayPanel";
import { DitherField } from "../visual/DitherField";
import { BoundaryVisual } from "./BoundaryVisual";
import "./demonstration.css";
import "../content/content-sections.css";
import "../visual/visual.css";

function shortHash(hash: string) {
  const clean = hash.startsWith("hash-") ? hash.slice(5) : hash;
  return `${clean.slice(0, 10)}…${clean.slice(-8)}`;
}

function TestnetEvidenceBoard() {
  const { content } = useSite();
  const c = content.demonstration;

  return (
    <aside className="testnet-proof panel panel--elevated" aria-label={c.evidenceAria}>
      <header className="panel__head testnet-proof__head">
        <span className="mono-label">{c.evidenceKicker}</span>
        <span className="status-chip status-chip--valid">{c.evidenceLive}</span>
      </header>

      <p className="testnet-proof__lead">{c.evidenceLead}</p>

      <div className="testnet-proof__grid">
        {CASPER_TESTNET_EVIDENCE.map((item) => (
          <a
            className={`testnet-proof__row testnet-proof__row--${item.kind}`}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            key={item.hash}
          >
            <span className="testnet-proof__label">{item.label}</span>
            <code className="testnet-proof__hash">{shortHash(item.hash)}</code>
            <strong className="testnet-proof__verdict">{item.verdict}</strong>
          </a>
        ))}
      </div>

      <p className="testnet-proof__note">{c.evidenceNote}</p>
    </aside>
  );
}

export function Demonstration() {
  const baseId = useId();
  const { t, content } = useSite();
  const c = content.demonstration;
  const [showEvidence, setShowEvidence] = useState(false);

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
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowEvidence((v) => !v)}>
                {showEvidence ? c.hideExplorer : c.showExplorer}
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
                {showEvidence ? <TestnetEvidenceBoard /> : <LiveGatewayPanel />}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
