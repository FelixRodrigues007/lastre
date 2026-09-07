import { SealMark } from "../components/ui/SealMark";
import { useBoardTheme } from "./BoardTheme";
import type { DeckLocale as Locale } from "./types";

/** A pasta aberta, para a trilha do cabeçalho saber o caminho de volta. */
export type Crumb = { label: string; onBack: () => void };

/**
 * The whole header: the mark and the word on the left — followed, while a
 * folder is open, by the trail back to the drawer — and, centred on the
 * sheet's axis, the language switch plus, only while the surface on screen
 * can take it, the light/dark switch.
 * Nothing else lives up here; the deck carries every other affordance.
 */
export function DeckHeader({
  locale,
  onLocale,
  crumb,
}: {
  locale: Locale;
  onLocale: (next: Locale) => void;
  crumb?: Crumb;
}) {
  const { theme, setTheme, themed } = useBoardTheme();

  return (
    <header className="dk-head">
      <div className="dk-head__l">
        <a className="dk-brand" href="/" aria-label="Lastre">
          <SealMark size={19} />
          <span className="dk-brand__word">Lastre</span>
        </a>

        {crumb && (
          <nav className="dk-crumb" aria-label={locale === "pt" ? "Trilha" : "Breadcrumb"}>
            <span className="dk-crumb__sep" aria-hidden="true">
              /
            </span>
            {/* Volta à gaveta sem recarregar — o mesmo caminho do Esc. */}
            <button type="button" className="dk-crumb__up" onClick={crumb.onBack}>
              Decks
            </button>
            <span className="dk-crumb__sep" aria-hidden="true">
              /
            </span>
            <span className="dk-crumb__here" aria-current="page">
              {crumb.label}
            </span>
          </nav>
        )}
      </div>

      <div className="dk-switches">
        <div className="dk-lang" role="group" aria-label={locale === "pt" ? "Idioma" : "Language"}>
          <button type="button" aria-pressed={locale === "pt"} onClick={() => onLocale("pt")}>
            PT
          </button>
          <button type="button" aria-pressed={locale === "en"} onClick={() => onLocale("en")}>
            EN
          </button>
        </div>

        {themed > 0 && (
          <div
            className="dk-lang dk-lang--theme"
            role="group"
            aria-label={locale === "pt" ? "Tema" : "Theme"}
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
