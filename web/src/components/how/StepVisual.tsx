type StepKey = "seal" | "anchor" | "attest" | "verdict";

type StepVisualProps = {
  step: StepKey;
};

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

function ArrowDown() {
  return (
    <span className="viz__flow" aria-hidden="true">
      <svg width="14" height="20" viewBox="0 0 14 20">
        <path
          d="M7 1V15M7 15L2.5 10.5M7 15L11.5 10.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Each step renders a compact diagram in the proof-panel idiom: mono labels,
 *  hash chips, status nodes. Decorative — the copy carries the meaning, so the
 *  whole figure is hidden from assistive tech. */
export function StepVisual({ step }: StepVisualProps) {
  return (
    <figure className="viz" aria-hidden="true">
      {step === "seal" && (
        <>
          <span className="viz__card">
            <span className="viz__card-label">Field reading</span>
            <span className="viz__card-detail">sensor · document · API</span>
          </span>
          <ArrowDown />
          <span className="viz__hash">
            <span className="viz__hash-key">sha256</span>
            <span className="viz__hash-val">9f2a4c1b…e41c</span>
          </span>
          <span className="viz__foot mono-label">
            Offline · no network · no server
          </span>
        </>
      )}

      {step === "anchor" && (
        <>
          <span className="viz__row">
            <span className="viz__chip">
              <span className="viz__node" />
              <span className="viz__chip-text">Seal</span>
            </span>
            <span className="viz__link" aria-hidden="true" />
            <span className="viz__chip viz__chip--block">
              <span className="viz__node viz__node--anchor" />
              <span className="viz__chip-text">Casper</span>
            </span>
          </span>
          <span className="viz__meta mono-label">ProofOfOrigin · #2 481 902</span>
          <span className="viz__foot mono-label">Reference registered on-chain</span>
        </>
      )}

      {step === "attest" && (
        <>
          <span className="viz__card viz__card--agent">
            <span className="viz__card-label">Autonomous agent + LLM</span>
            <span className="viz__card-detail">submits a reading</span>
          </span>
          <ArrowDown />
          <span className="viz__gate">
            <span className="viz__node viz__node--valid" />
            <span className="viz__gate-text">The seal decides the verdict</span>
          </span>
          <span className="viz__split">
            <span className="viz__split-cell">
              <span className="viz__split-key">Agent</span>
              decides what to do next
            </span>
            <span className="viz__split-cell viz__split-cell--seal">
              <span className="viz__split-key">Seal</span>
              decides the truth
            </span>
          </span>
        </>
      )}

      {step === "verdict" && (
        <>
          <span className="viz__verdict viz__verdict--valid">
            <span className="viz__verdict-node">
              <CheckGlyph />
            </span>
            <span className="viz__verdict-body">
              <span className="viz__verdict-label">Valid</span>
              <span className="viz__verdict-detail">match accepted</span>
            </span>
          </span>

          <span className="viz__verdict viz__verdict--invalid">
            <span className="viz__verdict-node">
              <CrossGlyph />
            </span>
            <span className="viz__verdict-body">
              <span className="viz__verdict-label">Invalid</span>
              <span className="viz__verdict-detail">mismatch rejected</span>
            </span>
          </span>

          <span className="viz__foot mono-label">
            Both written to Casper · permanent
          </span>
        </>
      )}
    </figure>
  );
}
