import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { BtnIcon } from "../components/ui/BtnIcon";
import { FULL_DEMO_ASSET_ID } from "../lib/fullDemo";
import "./agents.css";

const AGENT_SNIPPET = `// Example: an external agent only proceeds if Lastre says "Valid".
const assetId = "${FULL_DEMO_ASSET_ID}";
const url = "https://app-api.lastre.io/api/x402/provenance/" + assetId;

// 1) Ask Lastre for the quote. No X-PAYMENT -> HTTP 402.
const quoteResponse = await fetch(url);
const quote = await quoteResponse.json();
const requirements = quote.accepts[0];

// 2) Sign requirements with your agent wallet/facilitator.
const payment = await signCasperX402Payment({
  nonce: requirements.nonce,
  amount: requirements.maxAmountRequired,
  payTo: requirements.payTo,
  asset: requirements.asset,
});

// 3) Pay to read the proof before acting.
const proofResponse = await fetch(url, {
  headers: { "X-PAYMENT": payment },
});
const { provenance } = await proofResponse.json();

// 4) Let Lastre decide trust inputs; your agent decides its next action.
if (
  provenance.verdict === "Valid" &&
  provenance.sealMatch === true &&
  provenance.carbonDetails?.carbonImpactScore >= 80
) {
  approveNextDemoAction(provenance.csprLinks);
} else {
  escalateForHumanReview(provenance);
}`;

const COMPETITORS = [
  {
    name: "Agent Casper-style agents",
    role: "Executors",
    strength: "Great at acting, routing, and running x402 loops.",
    lastre: "Provenance trust layer — what executors should query before they move.",
  },
  {
    name: "Helios-style agent swarms",
    role: "Swarm coordinators",
    strength: "Great at coordinating many autonomous agents.",
    lastre: "Shared proof checkpoint — verdict, seal match, carbon fields, and Casper links.",
  },
  {
    name: "ProofPay-style flows",
    role: "Milestone escrows",
    strength: "Great at milestone and payment logic.",
    lastre: "Earlier trust primitive — prove the source document and carbon/mineral record first.",
  },
];

export function Agents() {
  const [copied, setCopied] = useState(false);

  async function copySnippet() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(AGENT_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="page agents-page">
      <PageHeader
        kicker="For autonomous agents"
        title="Other agents execute. Lastre lets them verify the source before they move."
        lead="Agents pay via x402 to read a proof payload — verdict, seal match, carbon score, and Casper links — before touching a fictional RWA/carbon workflow."
        actions={
          <Link className="route-cta" to={`/marketplace?demo=full&assetId=${encodeURIComponent(FULL_DEMO_ASSET_ID)}`}>
            <BtnIcon icon="process">Run demo</BtnIcon>
          </Link>
        }
      />

      <section className="agents-hero panel">
        <div>
          <span className="mono-label">Proof before token · proof before agent action</span>
          <h2>Executors move. Lastre verifies before they move.</h2>
          <p className="agents-hero__thesis">
            Lastre is not competing to be the fastest executor. It is the trust layer those executors query first.
          </p>
          <p>
            Lastre turns fictional source documents into deterministic SHA-256 seals, agent-readable verdicts,
            Casper attestation links, and x402-paid proof snapshots. The demo uses a mock facilitator but keeps the
            production seam explicit.
          </p>
        </div>
        <dl className="agents-hero__stats">
          <div><dt>Protocol</dt><dd>x402</dd></div>
          <div><dt>Chain</dt><dd>Casper Testnet</dd></div>
          <div><dt>Scope</dt><dd>Minerals + carbon</dd></div>
        </dl>
      </section>

      <section className="agents-grid">
        <article className="agents-card panel">
          <div className="agents-card__head">
            <div>
              <span className="mono-label">Integration example</span>
              <h3>Quote → X-PAYMENT → proof payload</h3>
            </div>
            <button type="button" className="route-cta route-cta--ghost" onClick={copySnippet}>
              {copied ? "Copied ✓" : "Copy code"}
            </button>
          </div>
          <pre className="agents-code"><code>{AGENT_SNIPPET}</code></pre>
        </article>

        <article className="agents-card panel">
          <span className="mono-label">Payload agents receive</span>
          <h3>What an external agent can decide from</h3>
          <ul className="agents-payload-list">
            <li><strong>verdict</strong><span>Valid / Invalid from deterministic seal verification.</span></li>
            <li><strong>sealMatch</strong><span>Whether the recomputed seal matches the reference proof.</span></li>
            <li><strong>carbonImpactScore</strong><span>Fictional demo score derived from tonnes, vintage, methodology, verifier.</span></li>
            <li><strong>csprLinks</strong><span>Casper package, attestation, and simulated mint links where available.</span></li>
          </ul>
        </article>
      </section>

      <section className="agents-win panel" aria-label="Why Lastre wins">
        <span className="mono-label">Why Lastre wins</span>
        <h2>Lastre is not another executor — it is the trust layer executors query.</h2>
        <div className="agents-compare">
          {COMPETITORS.map((item) => (
            <article key={item.name} className="agents-compare__row">
              <span className="agents-compare__role">{item.role}</span>
              <h3>{item.name}</h3>
              <p><strong>They bring:</strong> {item.strength}</p>
              <p><strong>Lastre adds:</strong> {item.lastre}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
