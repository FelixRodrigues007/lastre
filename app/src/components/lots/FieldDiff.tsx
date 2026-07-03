import type { FieldDiffRow } from "../../lib/artifactDiff";
import "./field-diff.css";

type FieldDiffProps = {
  rows: FieldDiffRow[];
  matches: boolean | null;
};

export function FieldDiff({ rows, matches }: FieldDiffProps) {
  const hasDivergence = rows.some((row) => row.diverges);
  const allMatch = matches === true || (!hasDivergence && matches !== false);

  return (
    <section className="field-diff panel" aria-label="Field comparison">
      <header className="field-diff__head">
        <div>
          <p className="mono-label">Field comparison</p>
          <p className="field-diff__lead">
            Values that feed the SHA-256 seal — reference vs current artifact
          </p>
        </div>
        {allMatch ? (
          <span className="field-diff__stamp field-diff__stamp--match" aria-label="All fields match">
            <span className="field-diff__stamp-icon" aria-hidden="true">✓</span>
            All fields match
          </span>
        ) : hasDivergence ? (
          <span className="field-diff__stamp field-diff__stamp--mismatch" aria-label="Fields diverge">
            <span className="field-diff__stamp-icon" aria-hidden="true">✗</span>
            Divergence found
          </span>
        ) : null}
      </header>

      <div className="field-diff__table-wrap">
        <table className="field-diff__table">
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Reference</th>
              <th scope="col">Current</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={row.diverges ? "field-diff__row--diverge" : undefined}
              >
                <th scope="row">{row.label}</th>
                <td className="field-diff__mono">{row.reference}</td>
                <td className="field-diff__mono">{row.current}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allMatch ? (
        <p className="field-diff__footer field-diff__footer--match">
          Nothing was altered — reference and current values are identical.
        </p>
      ) : hasDivergence ? (
        <p className="field-diff__footer field-diff__footer--mismatch">
          Highlighted rows changed after registration. Invalid is permanent proof of tamper — not a
          system error.
        </p>
      ) : null}
    </section>
  );
}
