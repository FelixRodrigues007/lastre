import { useId, useState } from "react";
import { useSite } from "../../context/SiteContext";
import { sha256Hex } from "../../lib/cryptoSeal";
import { DEMO_TERMINAL_CMD } from "../../site-links";
import { MEDIA } from "../../site-media";
import { ShaderImage } from "../visual/ShaderImage";
import { CubeField3D } from "../visual/CubeField3D";
import "./content-sections.css";
import "../visual/visual.css";

export function Faq() {
  const { t, content } = useSite();
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq section section--bordered" id="faq" aria-labelledby={`${baseId}-title`}>
      <span className="faq__mark" aria-hidden="true">
        <CubeField3D />
      </span>
      <div className="shell faq__layout">
        <div className="faq__intro">
          <h2 id={`${baseId}-title`} className="section-title">
            {t("faq")}
          </h2>
        </div>
        <div className="faq__list">
          {content.faq.items.map((item, i) => {
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

export function UseCases() {
  const { t, content } = useSite();
  const tabs = content.useCases.tabs;
  type TabKey = (typeof tabs)[number]["key"];
  const [tab, setTab] = useState<TabKey>(tabs[0]?.key ?? "minerals");
  const active = tabs.find((u) => u.key === tab) ?? tabs[0]!;

  const images = {
    minerals: MEDIA.footerMine,
    agents: MEDIA.layerSubject,
    compliance: MEDIA.depthBack,
  } as const;

  const shaders = {
    minerals: "mesh" as const,
    agents: "liquid" as const,
    compliance: "glow" as const,
  };

  return (
    <section className="use-cases section" id="use-cases" aria-labelledby="use-cases-title">
      <div className="shell">
        <h2 id="use-cases-title" className="section-title reveal-scroll">
          {t("useCases")}
        </h2>
        <div className="use-cases__tabs reveal-scroll" role="tablist">
          {tabs.map((u) => (
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
          className="use-cases__panel panel panel--elevated use-cases__panel--media reveal-scroll"
          role="tabpanel"
        >
          <div className="use-cases__panel-media" aria-hidden="true">
            <ShaderImage
              key={active.key}
              src={images[active.key]}
              shader={shaders[active.key]}
              drift
            />
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

export function ComparisonTable() {
  const { t, content } = useSite();
  const c = content.compare;

  return (
    <section className="compare section section--band" id="compare">
      <div className="shell">
        <div className="compare__layout">
          <div className="compare__intro">
            <h2 className="section-title">{t("compare")}</h2>
            <p className="compare__lede">{c.lede}</p>
          </div>
          <div
            className="compare__wrap"
            role="region"
            aria-label={t("compare")}
            tabIndex={0}
          >
            <table className="compare__table">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">{c.columns.lastro}</th>
                  <th scope="col">{c.columns.oracle}</th>
                  <th scope="col">{c.columns.api}</th>
                </tr>
              </thead>
              <tbody>
                {c.rows.map((row) => (
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
  const { t, content } = useSite();

  return (
    <aside className="changelog panel panel--light" aria-label={t("changelog")}>
      <h3 className="changelog__title mono-label">{t("changelog")}</h3>
      <ol className="changelog__list">
        {content.changelog.entries.map((e) => (
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
  const { t, content } = useSite();
  const c = content.whatWeAreNot;
  const [open, setOpen] = useState(false);

  return (
    <section className="not section" id="not" aria-labelledby="not-title">
      <div className="shell">
        <h2 id="not-title" className="section-title section-title--narrow">
          {t("whatWeAreNot")}
        </h2>
        <button type="button" className="not__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? c.hide : c.expand}
        </button>
        {open ? (
          <ul className="not__list">
            {c.items.map((item) => (
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
  const { content } = useSite();
  const c = content.terminal;

  return (
    <div className="terminal panel panel--elevated" id="terminal">
      <div className="terminal__head mono-label">{c.label}</div>
      <pre className="terminal__code">
        <code>
          $ {DEMO_TERMINAL_CMD}
          {"\n"}
          {c.output}
        </code>
      </pre>
      <button
        type="button"
        className="btn btn--secondary btn--sm"
        onClick={() => {
          navigator.clipboard.writeText(DEMO_TERMINAL_CMD);
        }}
      >
        {c.copy}
      </button>
    </div>
  );
}

export function SandboxSeal() {
  const { content } = useSite();
  const c = content.sandbox;
  const [input, setInput] = useState('{"massGrams":125000}');
  const [hash, setHash] = useState("");

  return (
    <div className="sandbox panel panel--light">
      <p className="mono-label">{c.label}</p>
      <textarea
        className="sandbox__input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        aria-label={c.jsonLabel}
      />
      <button
        type="button"
        className="btn btn--secondary"
        onClick={async () => {
          setHash(await sha256Hex(input));
        }}
      >
        {c.compute}
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
