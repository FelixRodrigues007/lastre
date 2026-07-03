import { Link } from "react-router-dom";
import { useLocaleContext } from "../../context/LocaleContext";
import { useOnboarding } from "../../context/OnboardingContext";
import { CHECKLIST_STEPS } from "../../lib/onboarding";
import { Icon } from "../ui/Icon";
import "./onboarding-checklist.css";

type OnboardingChecklistProps = {
  inSidebar?: boolean;
  asFloating?: boolean;
};

function ProgressRing({
  done,
  total,
  label,
}: {
  done: number;
  total: number;
  label: string;
}) {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? done / total : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="sidebar-guide__ring-wrap" aria-label={label}>
      <svg className="sidebar-guide__ring" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="sidebar-guide__ring-track" cx="12" cy="12" r={radius} />
        <circle
          className="sidebar-guide__ring-fill"
          cx="12"
          cy="12"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="sidebar-guide__ring-label" aria-hidden="true">
        {done}/{total}
      </span>
    </div>
  );
}

function SidebarGuide() {
  const { t } = useLocaleContext();
  const { checklist } = useOnboarding();
  const doneCount = CHECKLIST_STEPS.filter(({ step }) => checklist[step]).length;

  return (
    <section className="sidebar-guide" aria-label={t("onboarding.checklist.aria")}>
      <header className="sidebar-guide__head">
        <h2 className="sidebar-guide__title">{t("onboarding.checklist.title")}</h2>
        <ProgressRing
          done={doneCount}
          total={CHECKLIST_STEPS.length}
          label={t("onboarding.checklist.progress", {
            done: doneCount,
            total: CHECKLIST_STEPS.length,
          })}
        />
      </header>
      <ol className="sidebar-guide__list">
        {CHECKLIST_STEPS.map(({ step, to, labelKey }) => {
          const done = checklist[step];
          const rowClass = ["sidebar-guide__row", done ? "sidebar-guide__row--done" : ""]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={step} className="sidebar-guide__item">
              <Link className={rowClass} to={to}>
                <span className="sidebar-guide__mark" aria-hidden="true">
                  {done ? <Icon name="check" size={10} /> : null}
                </span>
                <span className="sidebar-guide__label">{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function FloatingGuide() {
  const { t } = useLocaleContext();
  const { checklist } = useOnboarding();
  const doneCount = CHECKLIST_STEPS.filter(({ step }) => checklist[step]).length;

  return (
    <aside className="guide-checklist" aria-label={t("onboarding.checklist.aria")}>
      <header className="guide-checklist__head">
        <h2 className="guide-checklist__title">{t("onboarding.checklist.title")}</h2>
        <span className="guide-checklist__meta">
          {t("onboarding.checklist.progress", {
            done: doneCount,
            total: CHECKLIST_STEPS.length,
          })}
        </span>
      </header>
      <ul className="guide-checklist__list">
        {CHECKLIST_STEPS.map(({ step, to, labelKey }) => {
          const done = checklist[step];
          const label = t(labelKey);

          return (
            <li
              key={step}
              className={`guide-checklist__item${done ? " guide-checklist__item--done" : ""}`}
            >
              <Link className="guide-checklist__row" to={to}>
                <span className="guide-checklist__box" aria-hidden="true">
                  {done ? <Icon name="check" size={10} /> : null}
                </span>
                <span className="guide-checklist__label">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export function OnboardingChecklist({
  inSidebar = false,
  asFloating = false,
}: OnboardingChecklistProps) {
  if (asFloating) {
    return <FloatingGuide />;
  }

  if (inSidebar) {
    return <SidebarGuide />;
  }

  return <FloatingGuide />;
}
