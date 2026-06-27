import { useId, useState } from "react";
import { useSite } from "../../context/SiteContext";
import { sha256Hex } from "../../lib/cryptoSeal";
import { MEDIA } from "../../site-media";
import "./content-sections.css";
import "../ui/media-card.css";

const FAQ_ITEMS = [
  {
    q: "Who decides Valid or Invalid?",
    a: "The deterministic SHA-256 seal — never an LLM. The agent only decides pay, skip, or escalate.",
  },
  {
    q: "Is this a token sale or investment?",
    a: "No. Lastro is a proof layer. The public demo uses fictional assets only.",
  },
  {
    q: "Testnet vs mainnet?",
    a: "The live contract is on Casper Testnet. Mainnet deployment will be announced via protocol updates only.",
  },
  {
    q: "What is an attestation?",
    a: "A permanent on-chain record of whether a submitted reading matches the anchored reference seal.",
  },
  {
    q: "Why record Invalid on-chain?",
    a: "Rejections are evidence. Hiding failure breaks auditability for compliance and evaluators.",
  },
  {
    q: "Can I verify without trusting Lastro?",
    a: "Yes. Open the Casper explorer, read verdicts, and run make demo from the repository.",
  },
  {
    q: "What data does the demo use?",
    a: "Simulated mineral lots with fictional origin IDs and masses — no real assets or PII.",
  },
  {
    q: "How do agents interact?",
    a: "Agents submit readings; the seal compares hashes. The LLM never overrides the verdict.",
  },
] as const;

export function Faq() {
  const { t } = useSite();
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq section section--bordered" id="faq" aria-labelledby={`${baseId}-title`}>
      <div className="shell faq__layout">
        <h2 id={`${baseId}-title`} className="section-title">
          {t("faq")}
        </h2>
        <div className="faq__list">
          {FAQ_ITEMS.map((item, i) => {
            const expanded = open === i;
            return (
              <div key={item.q} className="faq__item">
                <h3>
                  <button
                    type="button"
                    className="faq__trigger"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? null : i)}
                  >
                    {item.q}
                  </button>
                </h3>
                {expanded ? <p className="faq__answer">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const USE_CASES = [
  {
    key: "minerals",
    label: "Minerals",
    title: "Legal supply chain",
    body: "Trace licensed origin from mine to export with anchored seals at each handoff.",
    image: MEDIA.footerMine,
  },
  {
    key: "agents",
    label: "Agents",
    title: "Agent guardrails",
    body: "Autonomous agents act only after origin is verified — never on raw API claims.",
    image: MEDIA.layerSubject,
  },
  {
    key: "compliance",
    label: "Compliance",
    title: "Audit trail",
    body: "Permanent Valid and Invalid records for regulators and internal reviewers.",
    image: MEDIA.depthBack,
  },
] as const;

export function UseCases() {
  const { t } = useSite();
  const [tab, setTab] = useState<(typeof USE_CASES)[number]["key"]>("minerals");
  const active = USE_CASES.find((u) => u.key === tab)!;

  return (
    <section className="use-cases section" id="use-cases" aria-labelledby="use-cases-title">
      <div className="shell">
        <h2 id="use-cases-title" className="section-title">
          {t("useCases")}
        </h2>
        <div className="use-cases__tabs" role="tablist">
          {USE_CASES.map((u) => (
            <button
              key={u.key}
              type="button"
              role="tab"
              aria-selected={tab === u.key}
              className={`use-cases__tab${tab === u.key ? " use-cases__tab--active" : ""}`}
              onClick={() => setTab(u.key)}
            >
              {u.label}
            </button>
          ))}
        </div>
        <div
          className="use-cases__panel panel panel--elevated use-cases__panel--media"
          role="tabpanel"
        >
          <div className="use-cases__panel-media" aria-hidden="true">
            <img key={active.key} src={active.image} alt="" loading="lazy" />
          </div>
          <div className="use-cases__panel-copy">
            <h3 className="use-cases__title">{active.title}</h3>
            <p className="use-cases__body">{active.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const ROWS = [
  { label: "Verdict source", lastro: "Deterministic seal", oracle: "External attestor", api: "Provider claim" },
  { label: "Offline proof", lastro: "Yes", oracle: "Partial", api: "No" },
  { label: "Invalid on-chain", lastro: "Permanent", oracle: "Rare", api: "Hidden" },
  { label: "LLM decides truth", lastro: "Never", oracle: "Sometimes", api: "Often" },
] as const;

export function ComparisonTable() {
  const { t } = useSite();
  return (
    <section className="compare section section--band" id="compare" data-theme="light">
      <div className="shell">
        <div className="compare__layout">
          <div className="compare__intro">
            <h2 className="section-title">{t("compare")}</h2>
            <p className="compare__lede">
              Lastro proves origin before any agent acts. Oracles and API attestations assume the
              source is already trustworthy.
            </p>
          </div>
          <div className="compare__wrap panel panel--elevated">
            <table className="compare__table">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">Lastro</th>
                  <th scope="col">Oracle</th>
                  <th scope="col">API attestation</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.lastro}</td>
                    <td>{row.oracle}</td>
                    <td>{row.api}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ChangelogWidget() {
  const { t } = useSite();
  const entries = [
    { date: "2026-06", text: "Proof panel tamper demo + Casper Testnet counts in hero." },
    { date: "2026-05", text: "Deterministic seal separation documented in README." },
    { date: "2026-04", text: "ProofOfOrigin contract deployed to testnet." },
  ];
  return (
    <aside className="changelog panel panel--light" aria-label={t("changelog")}>
      <h3 className="changelog__title mono-label">{t("changelog")}</h3>
      <ol className="changelog__list">
        {entries.map((e) => (
          <li key={e.date}>
            <span className="changelog__date mono-label">{e.date}</span>
            <span>{e.text}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export function WhatWeAreNot() {
  const { t } = useSite();
  const [open, setOpen] = useState(false);
  const items = [
    "Not an investment product or token sale",
    "Not a yield or ownership instrument",
    "Not a replacement for legal due diligence",
    "Not a wallet or payment product",
  ];
  return (
    <section className="not section" id="not" aria-labelledby="not-title">
      <div className="shell">
        <h2 id="not-title" className="section-title section-title--narrow">
          {t("whatWeAreNot")}
        </h2>
        <button type="button" className="not__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Expand"} guardrails
        </button>
        {open ? (
          <ul className="not__list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function GlossaryTerm({ term, definition }: { term: string; definition: string }) {
  return (
    <abbr className="glossary" title={definition}>
      {term}
    </abbr>
  );
}

export function WaitlistForm() {
  const { t, toast } = useSite();
  return (
    <form
      className="waitlist"
      onSubmit={(e) => {
        e.preventDefault();
        toast(t("protocolUpdates"));
      }}
    >
      <label className="waitlist__label mono-label" htmlFor="waitlist-email">
        {t("notifyMainnet")}
      </label>
      <div className="waitlist__row">
        <input
          id="waitlist-email"
          className="waitlist__input"
          type="email"
          placeholder={t("emailPlaceholder")}
          required
        />
        <button type="submit" className="btn btn--primary">
          {t("subscribe")}
        </button>
      </div>
      <p className="waitlist__note">{t("protocolUpdates")}</p>
    </form>
  );
}

export function TerminalSnippet() {
  return (
    <div className="terminal panel panel--elevated" id="terminal">
      <div className="terminal__head mono-label">Terminal</div>
      <pre className="terminal__code">
        <code>$ make demo{"\n"}→ Processing fictional lot…{"\n"}→ Verdict: Valid | Invalid on Casper</code>
      </pre>
      <button
        type="button"
        className="btn btn--secondary btn--sm"
        onClick={() => {
          navigator.clipboard.writeText("make demo");
        }}
      >
        Copy command
      </button>
    </div>
  );
}

export function SandboxSeal() {
  const [input, setInput] = useState('{"massGrams":125000}');
  const [hash, setHash] = useState("");

  return (
    <div className="sandbox panel panel--light">
      <p className="mono-label">Sandbox — seal any JSON locally</p>
      <textarea
        className="sandbox__input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        aria-label="JSON reading"
      />
      <button
        type="button"
        className="btn btn--secondary"
        onClick={async () => {
          setHash(await sha256Hex(input));
        }}
      >
        Compute SHA-256
      </button>
      {hash ? (
        <p className="sandbox__hash mono-label">
          {hash.slice(0, 16)}…{hash.slice(-8)}
        </p>
      ) : null}
    </div>
  );
}

export function PostDemoBanner() {
  const { tamperCompleted, t } = useSite();
  if (!tamperCompleted) return null;
  return (
    <div className="post-demo shell">
      <p>{t("postDemo")}</p>
      <a className="post-demo__link" href="/app">
        {t("openApp")}
      </a>
    </div>
  );
}

export function SectionIntro({ children }: { children: string }) {
  return <p className="section-intro mono-label">{children}</p>;
}
