import { useLocaleContext } from "../../context/LocaleContext";
import "./entry-visual.css";

const ENTRY_HERO_SRC = "/media/entry-hero.jpg";

export function EntryVisual() {
  const { t } = useLocaleContext();

  return (
    <aside className="entry-visual" aria-hidden="true">
      <img className="entry-visual__img" src={ENTRY_HERO_SRC} alt="" decoding="async" />
      <div className="entry-visual__shade" />
      <div className="entry-visual__content">
        <p className="entry-visual__eyebrow">{t("onboarding.visual.eyebrow")}</p>
        <p className="entry-visual__quote">{t("onboarding.visual.quote")}</p>
      </div>
    </aside>
  );
}
