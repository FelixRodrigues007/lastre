import { shortHash } from "../../lib/format";
import "./seal-compare.css";

type SealCompareProps = {
  computed: string;
  reference: string;
  matches: boolean | null;
  tamperFields?: string[];
};

function diffPrefix(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if (a[i] !== b[i]) return i;
  }
  return len;
}

export function SealCompare({
  computed,
  reference,
  matches,
  tamperFields = [],
}: SealCompareProps) {
  const divergeAt = matches === false ? diffPrefix(computed, reference) : -1;
  const previewLen = 20;

  function renderHash(hash: string, role: "computed" | "reference") {
    const slice = hash.slice(0, previewLen);
    return (
      <code className={`seal-compare__hash seal-compare__hash--${role}`} title={hash}>
        {slice.split("").map((char, index) => (
          <span
            key={`${role}-${index}`}
            className={
              divergeAt >= 0 && index >= divergeAt
                ? "seal-compare__char seal-compare__char--diff"
                : "seal-compare__char"
            }
          >
            {char}
          </span>
        ))}
        {hash.length > previewLen ? (
          <span className="seal-compare__ellipsis">…{shortHash(hash, 4, 4).slice(-5)}</span>
        ) : null}
      </code>
    );
  }

  return (
    <section
      className={`seal-compare panel${matches === false ? " seal-compare--mismatch" : matches ? " seal-compare--match" : ""}`}
      aria-label="Seal comparison"
    >
      <header className="seal-compare__head">
        <div>
          <p className="mono-label">Seal comparison</p>
          <p className="seal-compare__lead">SHA-256 over artifact fields — seal decides verdict</p>
        </div>
        {matches === true ? (
          <span className="seal-compare__status seal-compare__status--match">Match</span>
        ) : matches === false ? (
          <span className="seal-compare__status seal-compare__status--mismatch">Mismatch</span>
        ) : (
          <span className="seal-compare__status seal-compare__status--pending">No reference</span>
        )}
      </header>

      <div className="seal-compare__columns">
        <div className="seal-compare__col">
          <p className="seal-compare__label">Computed</p>
          {renderHash(computed, "computed")}
          <p className="seal-compare__hint">From current artifact fields</p>
        </div>

        <div className="seal-compare__divider" aria-hidden="true">
          {matches === false ? "≠" : matches ? "=" : "?"}
        </div>

        <div className="seal-compare__col">
          <p className="seal-compare__label">Reference</p>
          {renderHash(reference, "reference")}
          <p className="seal-compare__hint">Registered at capture / registry</p>
        </div>
      </div>

      {matches === false ? (
        <div className="seal-compare__callout">
          <p>
            Hashes diverge{divergeAt >= 0 ? ` at character ${divergeAt + 1}` : ""}. Invalid is
            permanent proof of tamper — not a system error.
          </p>
          {tamperFields.length > 0 ? (
            <p className="seal-compare__fields">
              Suspect fields:{" "}
              {tamperFields.map((field) => (
                <code key={field}>{field}</code>
              ))}
            </p>
          ) : null}
        </div>
      ) : matches === true ? (
        <p className="seal-compare__ok">Computed seal matches the registered reference.</p>
      ) : null}
    </section>
  );
}
