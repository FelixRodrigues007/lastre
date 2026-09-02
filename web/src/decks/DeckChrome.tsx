import { SealMark } from "../components/ui/SealMark";
import type { Locale } from "../i18n/translations";

/**
 * The whole header: the mark, the word, and the language switch.
 * Nothing else lives up here — the deck itself carries every other affordance.
 */
export function DeckHeader({
  locale,
  onLocale,
}: {
  locale: Locale;
  onLocale: (next: Locale) => void;
}) {
  return (
    <header className="dk-head">
      <a className="dk-brand" href="/" aria-label="Lastre">
        <SealMark size={19} />
        <span className="dk-brand__word">Lastre</span>
      </a>

      <div className="dk-lang" role="group" aria-label={locale === "pt" ? "Idioma" : "Language"}>
        <button type="button" aria-pressed={locale === "pt"} onClick={() => onLocale("pt")}>
          PT
        </button>
        <button type="button" aria-pressed={locale === "en"} onClick={() => onLocale("en")}>
          EN
        </button>
      </div>
    </header>
  );
}

export function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
