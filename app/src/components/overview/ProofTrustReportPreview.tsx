import { SealMark } from "../ui/SealMark";
import { Icon } from "../ui/Icon";
import { useLocaleContext } from "../../context/LocaleContext";
import "./proof-trust-report-preview.css";

type ProofTrustReportPreviewProps = {
  tokenizableCount: number;
  banner?: boolean;
};

export function ProofTrustReportPreview({ tokenizableCount, banner = false }: ProofTrustReportPreviewProps) {
  const { t } = useLocaleContext();

  const checks = [
    t("overview.next.report.check.seal"),
    t("overview.next.report.check.agent"),
    t("overview.next.report.check.chain"),
    t("overview.next.report.check.token"),
  ];

  const visibleChecks = banner ? checks.slice(0, 2) : checks;
  const rootClass = banner
    ? "proof-report-preview proof-report-preview--banner"
    : "proof-report-preview";

  if (banner) {
    return (
      <div className={rootClass} aria-hidden="true">
        <div className="proof-report-preview__stack">
          <div className="proof-report-preview__sheet proof-report-preview__sheet--back" />
          <div className="proof-report-preview__sheet proof-report-preview__sheet--mid" />
          <article className="proof-report-preview__card">
            <header className="proof-report-preview__head proof-report-preview__head--banner">
              <div className="proof-report-preview__brand">
                <SealMark size={18} />
                <div className="proof-report-preview__brand-copy">
                  <p className="proof-report-preview__brand-name">{t("brand.name")}</p>
                  <p className="proof-report-preview__title">{t("overview.next.report.title")}</p>
                </div>
              </div>
            </header>

            <span className="proof-report-preview__badge proof-report-preview__badge--banner">
              {tokenizableCount} {t("badge.tokenizable")}
            </span>

            <ul className="proof-report-preview__checks proof-report-preview__checks--banner">
              {visibleChecks.map((label) => (
                <li key={label} className="proof-report-preview__check">
                  <span className="proof-report-preview__check-mark">
                    <Icon name="check" size={10} />
                  </span>
                  <span className="proof-report-preview__check-label">{label}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass} aria-hidden="true">
      <div className="proof-report-preview__ghost" />
      <article className="proof-report-preview__card">
        <header className="proof-report-preview__head">
          <div className="proof-report-preview__brand">
            <SealMark size={22} />
            <div>
              <p className="proof-report-preview__brand-name">{t("brand.name")}</p>
              <p className="proof-report-preview__title">{t("overview.next.report.title")}</p>
            </div>
          </div>
          <span className="proof-report-preview__badge">
            {tokenizableCount} {t("badge.tokenizable")}
          </span>
        </header>

        <p className="proof-report-preview__subtitle">{t("overview.next.report.subtitle")}</p>

        <ul className="proof-report-preview__checks">
          {visibleChecks.map((label) => (
            <li key={label} className="proof-report-preview__check">
              <span className="proof-report-preview__check-mark">
                <Icon name="check" size={11} />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <footer className="proof-report-preview__foot">
            <span className="proof-report-preview__doc-pill">
              <Icon name="shield" size={12} />
              {t("overview.next.report.doc.seal")}
            </span>
            <span className="proof-report-preview__doc-pill">
              <Icon name="chain" size={12} />
              {t("overview.next.report.doc.chain")}
            </span>
        </footer>
      </article>
    </div>
  );
}
