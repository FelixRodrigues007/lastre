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
// Judge demo: mock facilitator (synthetic_receipt). Production: inject Casper Facilitator.
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
const { provenance, chainEvidence, settlementKind } = await proofResponse.json();

// 4) Lastre decides trust inputs (seal). Your agent decides the next action only.
// chainEvidence may include live-RPC-verified Casper txs (install / Invalid / Valid).
if (
  provenance.verdict === "Valid" &&
  provenance.sealMatch === true &&
  provenance.carbonDetails?.carbonImpactScore >= 80
) {
  approveNextDemoAction({ provenance, chainEvidence, settlementKind });
} else {
  escalateForHumanReview({ provenance, chainEvidence });
}`;

const TRUST_STACK = [
  {
    role: "Field sealer",
    duty: "Offline SHA-256 over the canonical artifact — no LLM, no network.",
  },
  {
    role: "Chain attester",
    duty: "ProofOfOrigin on Casper Testnet — Valid and Invalid both permanent.",
  },
  {
    role: "Paying agent",
    duty: "HTTP 402 → X-PAYMENT → read proof before mint, finance, or transfer.",
  },
  {
    role: "Human escalation",
    duty: "Handles escalate actions only — never overwrites seal verdicts.",
  },
];

const STACK_POSITION = [
  {
    name: "Payment rails (AgentGate / CasCet)",
    they: "Monetize and compose API calls.",
    lastre: "Verify origin before a paid call is worth making.",
  },
  {
    name: "Market oracles (Claros-style)",
    they: "Publish real-world data feeds.",
    lastre: "Gate physical/carbon asset origin with permanent Invalid proof.",
  },
  {
    name: "Credit desks (Faktura-style)",
    they: "Underwrite invoices and cashflow.",
    lastre: "Prove the underlying RWA source before capital moves.",
  },
  {
    name: "Agent courts (Vouch-style)",
    they: "Score and slash agents.",
    lastre: "Judge the asset seal — not the agent persona.",
  },
];

const COMPETE_MATRIX = [
  {
    axis: "Origin seal",
    lastre: "W — deterministic field seal before token/payment",
    claros: "L — market/oracle network first",
    agentGate: "W — rails monetize calls; Lastre verifies source",
    casCet: "W — tool cascade still needs truth gate",
  },
  {
    axis: "Invalid-as-proof",
    lastre: "W — Invalid is a permanent Casper attestation",
    claros: "W — unique rejection evidence vs oracle feeds",
    agentGate: "W — not just payment success/failure",
    casCet: "W — kill-switch aborts downstream hops",
  },
  {
    axis: "CSPR settle",
    lastre: "W — prod casper_deploy tx + mock simulate for judges",
    claros: "Tie — economics present, different layer",
    agentGate: "Tie/L — AgentGate is purer gateway DX",
    casCet: "W — payment + proof in same origin flow",
  },
  {
    axis: "Dual-key",
    lastre: "W — sealer ≠ attester; output/dual-key-run.json",
    claros: "Tie — larger network, Lastre has role separation",
    agentGate: "W — separate field proof from payer",
    casCet: "W — provenance operators are explicit",
  },
  {
    axis: "2-hop composition",
    lastre: "W — tool_receipt → lastre_receipt + chainRoot anchor",
    claros: "Tie/L — Claros has broader network density",
    agentGate: "W — composition is not just charging an API",
    casCet: "Tie — CasCet may go deeper; Lastre gates truth",
  },
  {
    axis: "Oracle network",
    lastre: "L — intentionally not a broad oracle marketplace",
    claros: "W — Claros optimizes the agent/oracle network",
    agentGate: "Tie — both can sit under/over other agents",
    casCet: "Tie — depends on tool ecosystem",
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
        lead="Agents pay via x402 to read a proof payload — verdict, seal match, carbon score, Casper links, and live-RPC chain evidence — before touching a fictional RWA/carbon workflow."
        actions={
          <>
            <Link className="route-cta" to={`/marketplace?demo=full&assetId=${encodeURIComponent(FULL_DEMO_ASSET_ID)}`}>
              <BtnIcon icon="process">Run Valid demo</BtnIcon>
            </Link>
            <Link className="route-cta route-cta--ghost" to="/marketplace/MINA-VALEDOURO-LOTE-001">
              <BtnIcon icon="audit">Open Invalid sample lot</BtnIcon>
            </Link>
          </>
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
            Deterministic SHA-256 seals decide <strong>Valid</strong> or <strong>Invalid</strong>. The agent only chooses
            operational action: pay, skip, or escalate (never seal truth). Separation of duties: field sealer ≠ chain attester.
            Judge demo uses a <strong>mock facilitator</strong> (no CSPR moved)
            but attaches <strong>live-RPC-verified</strong> ProofOfOrigin transactions as chain evidence when the public
            Casper node responds.
          </p>
        </div>
        <dl className="agents-hero__stats">
          <div><dt>Protocol</dt><dd>x402</dd></div>
          <div><dt>Chain</dt><dd>Casper Testnet</dd></div>
          <div><dt>Scope</dt><dd>Minerals + carbon</dd></div>
          <div><dt>Evidence API</dt><dd className="mono-label">/api/evidence</dd></div>
        </dl>
      </section>

      <section className="agents-grid">
        <article className="agents-card panel">
          <div className="agents-card__head">
            <div>
              <span className="mono-label">Integration example</span>
              <h3>Quote → X-PAYMENT → proof + chainEvidence</h3>
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
            <li><strong>carbonImpactScore</strong><span>Fictional demo score from tonnes, vintage, methodology, verifier.</span></li>
            <li><strong>csprLinks</strong><span>Package + Valid/Invalid sample explorer links always present.</span></li>
            <li><strong>chainEvidence</strong><span>Public-RPC checks of install / Invalid / Valid txs when available.</span></li>
            <li><strong>settlementKind</strong><span>synthetic_receipt in judge demo — never claims real CSPR moved.</span></li>
          </ul>
        </article>
      </section>

      <section className="agents-win panel" aria-label="Multi-party trust stack">
        <span className="mono-label">Multi-party protocol (not a single black box)</span>
        <h2>Four roles. One seal. No LLM on the verdict.</h2>
        <p className="agents-hero__thesis">
          <strong>Two keys, one seal rule:</strong> field sealer ≠ chain attester account-hash.
          See <code className="mono-label">GET /api/evidence → operators[]</code> and{" "}
          <code className="mono-label">dualKey.distinct</code>. Composition:{" "}
          <code className="mono-label">tool_receipt → lastre_receipt</code> (Invalid aborts hop).
        </p>
        <div className="agents-compare">
          {TRUST_STACK.map((item) => (
            <article key={item.role} className="agents-compare__row">
              <span className="agents-compare__role">{item.role}</span>
              <p>{item.duty}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="agents-win panel" aria-label="Stack position">
        <span className="mono-label">Stack position</span>
        <h2>Lastre sits under rails, oracles, desks, and courts.</h2>
        <div className="agents-compare">
          {STACK_POSITION.map((item) => (
            <article key={item.name} className="agents-compare__row">
              <h3>{item.name}</h3>
              <p><strong>They:</strong> {item.they}</p>
              <p><strong>Lastre:</strong> {item.lastre}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="agents-win panel" aria-label="Compete matrix">
        <span className="mono-label">Compete honestly</span>
        <h2>Claros optimizes the agent network. Lastre is the truth gate under it.</h2>
        <p className="agents-hero__thesis">
          This is not a claim of official DoraHacks rank. It is the judge-facing rubric: origin seal,
          Invalid-as-proof, real CSPR settlement, dual-key operation, and 2-hop composition.
          Lastre still loses the broad oracle-network axis to Claros-style systems by design.
        </p>
        <div className="agents-compare agents-compare--matrix">
          {COMPETE_MATRIX.map((row) => (
            <article key={row.axis} className="agents-compare__row">
              <h3>{row.axis}</h3>
              <p><strong>Lastre:</strong> {row.lastre}</p>
              <p><strong>Claros:</strong> {row.claros}</p>
              <p><strong>AgentGate:</strong> {row.agentGate}</p>
              <p><strong>CasCet:</strong> {row.casCet}</p>
            </article>
          ))}
        </div>
        <ul className="agents-payload-list">
          <li><strong>Evidence</strong><span><a href="https://app-api.lastre.io/api/evidence" target="_blank" rel="noreferrer">GET /api/evidence</a> — operators, dualKey, composition, MintGate economics.</span></li>
          <li><strong>Payment</strong><span><a href="https://testnet.cspr.live/transaction/27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c" target="_blank" rel="noreferrer">real CSPR settle tx</a> — UI simulate remains mock.</span></li>
          <li><strong>Anchor</strong><span><a href="https://testnet.cspr.live/transaction/915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a" target="_blank" rel="noreferrer">composition chainRoot anchor</a> — Casper Deploy hash confirmed by get-deploy.</span></li>
        </ul>
      </section>

      <section className="agents-card panel">
        <span className="mono-label">Invalid is proof</span>
        <h3>Both outcomes are permanent on Casper Testnet</h3>
        <p>
          Happy-path demos only show Valid. Lastre also anchors <strong>Invalid</strong> — permanent tamper evidence.
        </p>
        <ul className="agents-payload-list">
          <li>
            <strong>Invalid sample</strong>
            <span>
              <a href="https://testnet.cspr.live/transaction/5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd" target="_blank" rel="noreferrer">
                cspr.live · tampered LOTE-001
              </a>
            </span>
          </li>
          <li>
            <strong>Valid sample</strong>
            <span>
              <a href="https://testnet.cspr.live/transaction/43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4" target="_blank" rel="noreferrer">
                cspr.live · agent attest LOTE-002
              </a>
            </span>
          </li>
          <li>
            <strong>Evidence API</strong>
            <span>
              <a href="https://app-api.lastre.io/api/evidence" target="_blank" rel="noreferrer">
                GET /api/evidence
              </a>
              {" "}— trust stack + RPC verification bundle
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
