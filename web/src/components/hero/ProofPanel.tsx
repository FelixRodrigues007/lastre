import { useEffect, useState } from "react";
import { useSite } from "../../context/SiteContext";
import { SEALS } from "../proof/seal-data";
import { truncateHash } from "../../lib/cryptoSeal";
import "./proof-panel.css";

export function ProofPanel() {
  const [phase, setPhase] = useState<"processing" | "live">("processing");
  const { content } = useSite();
  const c = content.hero.proofPanel;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("live");
      return;
    }
    const id = window.setTimeout(() => setPhase("live"), 900);
    return () => clearTimeout(id);
  }, []);

  return (
    <figure className="proof" aria-label={c.ariaLabel}>
      <header className="proof__head panel__head">
        <span className="mono-label">{c.label}</span>
        <span className={`status-chip${phase === "live" ? " status-chip--valid" : ""}`}>
          {phase === "live" ? content.proof.valid : "…"}
        </span>
      </header>

      <p className="proof__hash">
        <span className="proof__hash-val">{truncateHash(SEALS.valid, 10, 4)}</span>
      </p>

      <ol className="proof__pipe">
        {c.steps.map((label) => (
          <li className="proof__step" key={label}>
            <span className="proof__node" aria-hidden="true" />
            <span className="proof__step-label">{label}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
