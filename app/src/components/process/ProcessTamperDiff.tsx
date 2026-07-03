import { useLocaleContext } from "../../context/LocaleContext";
import type { FieldDiffRow } from "../../lib/artifactDiff";
import "./process-tamper-diff.css";

type ProcessTamperDiffProps = {
  rows: FieldDiffRow[];
};

export function ProcessTamperDiff({ rows }: ProcessTamperDiffProps) {
  const { t } = useLocaleContext();
  const diverging = rows.filter((row) => row.diverges);

  if (!diverging.length) return null;

  return (
    <div className="process-tamper-diff" aria-label={t("process.tamperDiff.aria")}>
      <p className="process-tamper-diff__kicker mono-label">{t("process.tamperDiff.title")}</p>
      <ul className="process-tamper-diff__list">
        {diverging.map((row) => (
          <li key={row.key} className="process-tamper-diff__row">
            <span className="process-tamper-diff__field">{row.label}</span>
            <span className="process-tamper-diff__values">
              <span className="process-tamper-diff__ref">{row.reference}</span>
              <span className="process-tamper-diff__arrow" aria-hidden="true">
                →
              </span>
              <span className="process-tamper-diff__cur">{row.current}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="process-tamper-diff__note">{t("process.tamperDiff.note")}</p>
    </div>
  );
}
