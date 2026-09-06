import { SealMark } from "../components/ui/SealMark";
import { useBoardTheme } from "./BoardTheme";
import type { DeckLocale as Locale } from "./types";

/**
 * The whole header: the mark and the word on the left, and — centred on the
 * sheet's axis — the language switch plus, only while a sheet is showing a
 * drawing, the light/dark switch for that drawing.
 * Nothing else lives up here; the deck carries every other affordance.
 */
export function DeckHeader({
  locale,
  onLocale,
}: {
  locale: Locale;
  onLocale: (next: Locale) => void;
}) {
  const { theme, setTheme, boards } = useBoardTheme();

  return (
    <header className="dk-head">
      <a className="dk-brand" href="/" aria-label="Lastre">
        <SealMark size={19} />
        <span className="dk-brand__word">Lastre</span>
      </a>

      <div className="dk-switches">
        <div className="dk-lang" role="group" aria-label={locale === "pt" ? "Idioma" : "Language"}>
          <button type="button" aria-pressed={locale === "pt"} onClick={() => onLocale("pt")}>
            PT
          </button>
          <button type="button" aria-pressed={locale === "en"} onClick={() => onLocale("en")}>
            EN
          </button>
        </div>

        {boards > 0 && (
          <div
            className="dk-lang dk-lang--theme"
            role="group"
            aria-label={locale === "pt" ? "Tema do desenho" : "Drawing theme"}
          >
            <button
              type="button"
              aria-pressed={theme === "light"}
              onClick={() => setTheme("light")}
            >
              {locale === "pt" ? "Claro" : "Light"}
            </button>
            <button
              type="button"
              aria-pressed={theme === "dark"}
              onClick={() => setTheme("dark")}
            >
              {locale === "pt" ? "Escuro" : "Dark"}
            </button>
          </div>
        )}
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
