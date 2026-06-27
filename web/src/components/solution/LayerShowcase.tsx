/** Cinematic proof-feed mock — floating product UI over a scenic backdrop. */
export function LayerShowcase() {
  return (
    <div className="sol-showcase" aria-hidden="true">
      <div className="sol-showcase__scenery" />

      <div className="sol-showcase__window">
        <header className="sol-showcase__toolbar">
          <span className="sol-showcase__brand">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                d="M9 2.5L14.5 5.5V12.5L9 15.5L3.5 12.5V5.5L9 2.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="9" r="2.2" fill="currentColor" />
            </svg>
            <span className="sol-showcase__channel">#proof-layer</span>
          </span>
          <span className="sol-showcase__toolbar-meta">
            <span>4</span>
            <span className="sol-showcase__toolbar-divider" />
            <span className="sol-showcase__toolbar-search">Search</span>
          </span>
        </header>

        <div className="sol-showcase__body">
          <div className="sol-showcase__feed">
            <article className="sol-showcase__msg sol-showcase__msg--agent">
              <span className="sol-showcase__avatar sol-showcase__avatar--agent" />
              <div className="sol-showcase__msg-body">
                <header className="sol-showcase__msg-head">
                  <span className="sol-showcase__author">Lastre</span>
                  <span className="sol-showcase__agent-tag">AGENT</span>
                </header>
                <div className="sol-showcase__skeleton" aria-hidden="true">
                  <span /><span /><span style={{ width: "72%" }} />
                </div>
                <footer className="sol-showcase__reactions">
                  <span>👍</span>
                  <span>1</span>
                </footer>
              </div>
            </article>

            <div className="sol-showcase__divider">
              <span>Today</span>
            </div>

            <article className="sol-showcase__msg">
              <span className="sol-showcase__avatar sol-showcase__avatar--user" />
              <div className="sol-showcase__msg-body">
                <header className="sol-showcase__msg-head">
                  <span className="sol-showcase__author">Mara Okonkwo</span>
                  <time>10:12 pm</time>
                </header>
                <p>
                  Hey <span className="sol-showcase__mention">@Lastre</span> what
                  asset classes cleared origin proof this week?
                </p>
                <footer className="sol-showcase__thread-hint">
                  <span className="sol-showcase__thread-avatars" />
                  5 replies · Today at 10:12 pm
                </footer>
              </div>
            </article>
          </div>

          <aside className="sol-showcase__thread">
            <header className="sol-showcase__thread-head">Thread</header>

            <article className="sol-showcase__msg sol-showcase__msg--compact">
              <span className="sol-showcase__avatar sol-showcase__avatar--user" />
              <div className="sol-showcase__msg-body">
                <header className="sol-showcase__msg-head">
                  <span className="sol-showcase__author">Mara Okonkwo</span>
                </header>
                <p>
                  Hey <span className="sol-showcase__mention">@Lastre</span> what
                  asset classes cleared origin proof this week?
                </p>
              </div>
            </article>

            <article className="sol-showcase__msg sol-showcase__msg--compact sol-showcase__msg--agent">
              <span className="sol-showcase__avatar sol-showcase__avatar--agent" />
              <div className="sol-showcase__msg-body">
                <header className="sol-showcase__msg-head">
                  <span className="sol-showcase__author">Lastre</span>
                  <span className="sol-showcase__agent-tag">AGENT</span>
                </header>
                <p>
                  Across 128 sealed readings, origin proof cleared for these
                  classes:
                </p>
                <ul className="sol-showcase__list">
                  <li>Carbon credits — sensor attestation (34%)</li>
                  <li>Real estate deeds — document hash (28%)</li>
                  <li>Energy certificates — API response (19%)</li>
                </ul>
                <p className="sol-showcase__followup">
                  Commodity batch CM-0077 was rejected — seal mismatch at anchor.
                  Want the on-chain receipt?
                </p>
              </div>
            </article>

            <article className="sol-showcase__msg sol-showcase__msg--compact">
              <span className="sol-showcase__avatar sol-showcase__avatar--user" />
              <div className="sol-showcase__msg-body">
                <header className="sol-showcase__msg-head">
                  <span className="sol-showcase__author">Mara Okonkwo</span>
                </header>
                <p>Sure — what triggered the rejection?</p>
              </div>
            </article>

            <article className="sol-showcase__msg sol-showcase__msg--compact sol-showcase__msg--agent">
              <span className="sol-showcase__avatar sol-showcase__avatar--agent" />
              <div className="sol-showcase__msg-body">
                <header className="sol-showcase__msg-head">
                  <span className="sol-showcase__author">Lastre</span>
                  <span className="sol-showcase__agent-tag">AGENT</span>
                </header>
                <p>
                  Field reading drifted 0.4g from sealed mass. Casper returned{" "}
                  <span className="sol-showcase__invalid">Invalid</span> — no
                  tokenization permitted.
                </p>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
}
