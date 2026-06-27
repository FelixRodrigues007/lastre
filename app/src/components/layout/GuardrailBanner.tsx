import "./guardrail-banner.css";

export function GuardrailBanner() {
  return (
    <aside className="guardrail" aria-label="Demo guardrails">
      <div className="shell guardrail__inner">
        <span className="guardrail__chip">Demo</span>
        <p className="guardrail__text">
          Fictional data only · Seal decides verdict · LLM decides action · Not
          investment or token sale
        </p>
      </div>
    </aside>
  );
}
