import type { CSSProperties } from "react";
import { useId, useState } from "react";
import "./proof.css";

const REFERENCE_MASS = 125_000;
const TAMPERED_MASS = REFERENCE_MASS + 1;

const SEALS = {
  valid: "472c927a8129dfba4eea2aea00d683d127f8d6387db6fe9d2f779741e4b500f2",
  tampered: "78ef7bbd2f872749bdc5fa9bc7f2232906e2ca59820f5534b555d43df3fad89d",
} as const;

function CrossGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M4 4L10 10M10 4L4 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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

function truncateSeal(seal: string) {
  return `${seal.slice(0, 8)}…${seal.slice(-4)}`;
}

/** Section — The proof: tamper one field and the seal diverges. The panel
 *  lets visitors flip mass by one gram and watch the verdict flip to Invalid. */
export function Proof() {
  const [tampered, setTampered] = useState(false);
  const baseId = useId();
  const mass = tampered ? TAMPERED_MASS : REFERENCE_MASS;
  const seal = tampered ? SEALS.tampered : SEALS.valid;
  const verdict = tampered ? "Invalid" : "Valid";

  return (
    <section className="evidence section section--bordered" id="proof" aria-labelledby={`${baseId}-title`}>
      <div className="shell split-grid">
        <div className="evidence__lead">
          <p className="kicker reveal-scroll">The proof</p>

          <h2 id={`${baseId}-title`} className="section-title reveal-scroll" style={{ "--reveal-delay": "60ms" } as CSSProperties}>
            Change one gram, and the network rejects it.
          </h2>

          <div className="section-lead section-lead--stack reveal-scroll" style={{ "--reveal-delay": "120ms" } as CSSProperties}>
            <p>
              Tamper with a single value and the entire seal changes. The chain
              records{" "}
              <span className="accent-emphasis" style={{ color: "var(--lastro-status-invalid)" }}>Invalid</span> — permanently,
              verifiably, by anyone.
            </p>
            <p>
              Most systems hide a failure. Lastre{" "}
              <span className="accent-emphasis accent-emphasis--seal">carves it into the ledger</span>{" "}
              as evidence.
            </p>
          </div>
        </div>

        <aside
          className="evidence__panel panel panel--elevated split-grid__aside--sticky reveal-scroll"
          style={{ "--reveal-delay": "180ms" } as CSSProperties}
          aria-label="Tamper demo: changing mass by one gram breaks the seal and records Invalid on-chain"
        >
          <header className="panel__head evidence__panel-head">
            <span className="mono-label">Tamper test</span>
            <span className={`status-chip${tampered ? " status-chip--invalid" : " status-chip--valid"}`}>
              {tampered ? "MISMATCH" : "LIVE"}
            </span>
          </header>

          <div className="evidence__reading">
            <div className="evidence__reading-row">
              <span className="evidence__reading-key">massGrams</span>
              <span
                className={`evidence__reading-val${tampered ? " evidence__reading-val--changed" : ""}`}
                aria-live="polite"
              >
                {mass.toLocaleString("en-US")}
              </span>
            </div>
            <button
              type="button"
              className="evidence__toggle"
              aria-pressed={tampered}
              onClick={() => setTampered((v) => !v)}
            >
              {tampered ? "Restore original" : "+1 g — tamper"}
            </button>
          </div>

          <div className="evidence__seals">
            <p className="evidence__seal-row">
              <span className="evidence__seal-key">Reference</span>
              <span className="evidence__seal-val">{truncateSeal(SEALS.valid)}</span>
              <span className="evidence__seal-note">anchored on Casper</span>
            </p>
            <p className="evidence__seal-row evidence__seal-row--submit">
              <span className="evidence__seal-key">Submitted</span>
              <span
                className={`evidence__seal-val${tampered ? " evidence__seal-val--changed" : ""}`}
                aria-live="polite"
              >
                {truncateSeal(seal)}
              </span>
              <span className="evidence__seal-note">
                {tampered ? "seal diverged" : "matches reference"}
              </span>
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
        </aside>
      </div>
    </section>
  );
}
