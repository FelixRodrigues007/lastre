import type { CSSProperties } from "react";
import { useId, useState } from "react";
import { useSite } from "../../context/SiteContext";
import { trackEvent } from "../../lib/analytics";
import { truncateHash } from "../../lib/cryptoSeal";
import { GlossaryTerm } from "../content/ContentSections";
import {
  CSPR_VERIFY_URL,
  REFERENCE_MASS,
  REFERENCE_ORIGIN,
  SEALS,
  TAMPERED_MASS,
  TAMPERED_ORIGIN,
} from "./seal-data";
import "./proof.css";
import "../content/content-sections.css";

type TamperField = "none" | "mass" | "origin";

type HistoryRow = { field: string; verdict: string; at: string };

function CrossGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M4 4L10 10M10 4L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const { toast, t } = useSite();
  return (
    <button
      type="button"
      className="btn btn--secondary btn--sm"
      aria-label={label}
      onClick={() => {
        navigator.clipboard.writeText(text);
        toast(t("copied"));
        trackEvent("copy_hash");
      }}
    >
      Copy
    </button>
  );
}

/** Section — The proof: tamper fields and the seal diverges. */
export function Proof() {
  const [field, setField] = useState<TamperField>("none");
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const { markTamperCompleted } = useSite();
  const baseId = useId();

  const tampered = field !== "none";
  const mass = field === "mass" ? TAMPERED_MASS : REFERENCE_MASS;
  const origin = field === "origin" ? TAMPERED_ORIGIN : REFERENCE_ORIGIN;
  const seal =
    field === "mass" ? SEALS.tamperedMass : field === "origin" ? SEALS.tamperedOrigin : SEALS.valid;
  const verdict = tampered ? "Invalid" : "Valid";

  const applyTamper = (next: TamperField) => {
    setField(next);
    if (next !== "none") {
      markTamperCompleted();
      trackEvent("tamper_demo", { field: next });
      setHistory((h) =>
        [
          {
            field: next,
            verdict: "Invalid",
            at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          ...h,
        ].slice(0, 5),
      );
    }
  };

  const timelineStep = tampered ? 3 : 2;

  return (
    <section
      className="evidence section section--bordered"
      id="proof"
      aria-labelledby={`${baseId}-title`}
    >
      <span className="section-number mono-label" aria-hidden="true">
        04
      </span>
      <div className="shell split-grid">
        <div className="evidence__lead">
          <p className="kicker reveal-scroll">The proof</p>
          <p className="section-intro">Interactive tamper test — change one field, watch the seal diverge.</p>

          <h2
            id={`${baseId}-title`}
            className="section-title reveal-scroll"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            Change one gram, and the network rejects it.
          </h2>

          <div
            className="section-lead section-lead--stack reveal-scroll body-max-ch"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            <p>
              Tamper with a single value and the entire seal changes. The chain records{" "}
              <span className="accent-emphasis" style={{ color: "var(--lastro-status-invalid)" }}>
                Invalid
              </span>{" "}
              — permanently, verifiably, by anyone.
            </p>
            <p>
              Most systems hide a failure. Lastro{" "}
              <span className="accent-emphasis accent-emphasis--seal">carves it into the ledger</span> as{" "}
              <GlossaryTerm term="evidence" definition="A permanent on-chain attestation record, Valid or Invalid." />.
            </p>
          </div>
        </div>

        <aside
          className="evidence__panel panel panel--elevated split-grid__aside--sticky reveal-scroll"
          style={{ "--reveal-delay": "180ms" } as CSSProperties}
          aria-label="Tamper demo: changing a field breaks the seal and records Invalid on-chain"
        >
          <header className="panel__head evidence__panel-head">
            <span className="mono-label">Tamper test</span>
            <span
              className={`status-chip${tampered ? " status-chip--invalid" : " status-chip--valid"}`}
              title={tampered ? "Seal hash mismatch — deterministic rejection" : "Submitted seal matches reference"}
            >
              {tampered ? "MISMATCH" : "LIVE"}
            </span>
          </header>

          <div className="proof-timeline" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`proof-timeline__step${
                  i <= timelineStep
                    ? tampered && i === 3
                      ? " proof-timeline__step--invalid"
                      : " proof-timeline__step--done"
                    : ""
                }`}
              />
            ))}
          </div>

          <div className="evidence__reading">
            <div className="evidence__reading-row">
              <span className="evidence__reading-key">originId</span>
              <span
                className={`evidence__reading-val${field === "origin" ? " evidence__reading-val--changed" : ""}`}
                aria-live="polite"
              >
                {origin}
              </span>
            </div>
            <div className="evidence__reading-row">
              <span className="evidence__reading-key">massGrams</span>
              <span
                className={`evidence__reading-val tabular-nums${field === "mass" ? " evidence__reading-val--changed" : ""}`}
                aria-live="polite"
              >
                {mass.toLocaleString("en-US")}
              </span>
            </div>

            <div className="evidence__field-toggle">
              <button
                type="button"
                className={`evidence__field-btn${field === "mass" ? " evidence__field-btn--active" : ""}`}
                aria-pressed={field === "mass"}
                onClick={() => applyTamper(field === "mass" ? "none" : "mass")}
              >
                +1 g
              </button>
              <button
                type="button"
                className={`evidence__field-btn${field === "origin" ? " evidence__field-btn--active" : ""}`}
                aria-pressed={field === "origin"}
                onClick={() => applyTamper(field === "origin" ? "none" : "origin")}
              >
                Swap origin
              </button>
              <button
                type="button"
                className="evidence__field-btn"
                onClick={() => {
                  setField("none");
                  setHistory([]);
                }}
              >
                Restore
              </button>
            </div>
          </div>

          <div className="evidence__seals">
            <p className="evidence__seal-row">
              <span className="evidence__seal-key">Reference</span>
              <span className="evidence__seal-val">{truncateHash(SEALS.valid, 12, 4)}</span>
              <CopyButton text={SEALS.valid} label="Copy reference SHA-256" />
              <span className="evidence__seal-note">anchored on Casper</span>
            </p>
            <p className="evidence__seal-row evidence__seal-row--submit">
              <span className="evidence__seal-key">Submitted</span>
              <span
                className={`evidence__seal-val${tampered ? " evidence__seal-val--changed" : ""}`}
                aria-live="polite"
              >
                {truncateHash(seal, 12, 4)}
              </span>
              <CopyButton text={seal} label="Copy submitted SHA-256" />
              <span className="evidence__seal-note">{tampered ? "seal diverged" : "matches reference"}</span>
            </p>
          </div>

          <div
            className={`evidence__verdict evidence__verdict--${verdict.toLowerCase()}`}
            aria-live="polite"
          >
            <span className="evidence__verdict-node" aria-hidden="true">
              {tampered ? <CrossGlyph /> : <CheckGlyph />}
            </span>
            <span className="evidence__verdict-text">
              {verdict}
              <span className="evidence__verdict-detail">
                {tampered
                  ? "written to Casper · permanent proof"
                  : "match accepted · tokenization permitted"}
              </span>
            </span>
          </div>

          <a
            className="evidence__explorer-link link-grow"
            href={CSPR_VERIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Verify on Casper →
          </a>

          {history.length ? (
            <div className="proof-history" aria-label="Recent tamper history">
              {history.map((row, i) => (
                <div key={`${row.at}-${i}`} className="proof-history__row">
                  <span>{row.field}</span>
                  <span>{row.verdict}</span>
                  <span>{row.at}</span>
                </div>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
