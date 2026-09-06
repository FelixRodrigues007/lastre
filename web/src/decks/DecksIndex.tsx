import type { ReactNode } from "react";
import { SealMark } from "../components/ui/SealMark";
import type { DeckLocale as Locale } from "./types";
import type { Deck } from "./types";

type Props = {
  decks: Deck[];
  locale: Locale;
  onOpen: (slug: string) => void;
};

/* One glyph per folder. Keyed by slug so a new deck falls back to the sheet
 * icon instead of shipping a blank card. */
const icons: Record<string, ReactNode> = {
  lastre: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l9 4.5-9 4.5-9-4.5L12 3Z M3 12l9 4.5 9-4.5 M3 16.5L12 21l9-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  ),
  publicos: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M16.2 5.4a3.1 3.1 0 0 1 0 5.2M17.5 14.6a5.5 5.5 0 0 1 3 4.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  capacidades: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="5.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="18.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.2 12h9.6M7.4 10.9 16.9 6.6M7.4 13.1l9.5 4.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const fallbackIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 6.5A1.5 1.5 0 0 1 5.5 5h3.6l1.8 2h7.6A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-11Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

/** The drawer. The mark, one line of instruction, and a folder per document. */
export function DecksIndex({ decks, locale, onOpen }: Props) {
  const pt = locale === "pt";

  return (
    <div className="dk-stage">
      <section className="dk-sheet dk-drawer-sheet">
        <div className="dk-index">
          <div className="dk-index__top">
            <span className="dk-index__mark">
              <SealMark size={52} label="Lastre" />
            </span>
            <h1 className="dk-index__word">Lastre</h1>
            <p className="dk-p dk-p--lead dk-index__line">
              {pt
                ? "Documentos de trabalho. Uma pasta por assunto."
                : "Working documents. One folder per subject."}
            </p>
            <p className="dk-eyebrow dk-index__keys">
              {pt
                ? "setas andam · g abre o índice · esc volta aqui · imprimir gera o pdf"
                : "arrows move · g opens contents · esc comes back · print makes the pdf"}
            </p>
          </div>

          <nav className="dk-folders">
            {decks.map((deck) => (
              <a
                key={deck.slug}
                className="dk-folder"
                href={`/decks/${deck.slug}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  onOpen(deck.slug);
                }}
              >
                <span className="dk-folder__icon">{icons[deck.slug] ?? fallbackIcon}</span>
                <span className="dk-folder__t">{deck.title[locale]}</span>
                <span className="dk-p dk-folder__s">{deck.summary[locale]}</span>
                <span className="dk-folder__meta">
                  {deck.slides.length}{" "}
                  {deck.slides.length === 1
                    ? pt
                      ? "tela"
                      : "screen"
                    : pt
                      ? "telas"
                      : "screens"}{" "}
                  · {deck.updated}
                </span>
              </a>
            ))}
          </nav>

          <p className="dk-p dk-p--fine dk-index__fine">
            {pt
              ? "Material interno. Não indexado, e não constitui oferta, promessa de retorno ou recomendação de investimento. Números de terceiros trazem fonte e data na própria tela."
              : "Internal material. Not indexed, and not an offer, a promise of return, or investment advice. Third-party figures carry their source and date on the screen where they appear."}
          </p>
        </div>
      </section>
    </div>
  );
}
