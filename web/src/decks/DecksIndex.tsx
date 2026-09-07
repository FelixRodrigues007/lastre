import type { ReactNode } from "react";
import { SealMark } from "../components/ui/SealMark";
import { useAnnounceThemed, useBoardTheme } from "./BoardTheme";
import type { DeckLocale as Locale } from "./types";
import type { Deck } from "./types";
import { corpusAll, corpusHref, corpusParts, corpusUpdated } from "./corpus";

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
  whiteboard: (
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

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="14" height="14">
    <path
      d="M5 12h13M13 6.5 18.5 12 13 17.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * The drawer. A masthead, then a group per kind of document — the decks as
 * folders to open, the corpus as the contents of the one document it is.
 * The sheet follows the header's light/dark switch, so the drawer can be read
 * in the same light as the drawings it leads to.
 */
export function DecksIndex({ decks, locale, onOpen }: Props) {
  const pt = locale === "pt";
  const { theme } = useBoardTheme();
  useAnnounceThemed();

  return (
    <div className="dk-stage">
      <section className={`dk-sheet dk-drawer-sheet${theme === "dark" ? " dk-sheet--dark" : ""}`}>
        <div className="dk-index">
          <header className="dk-index__top">
            <span className="dk-index__mark">
              <SealMark size={44} label="Lastre" />
            </span>
            <h1 className="dk-index__word">Lastre</h1>
            <p className="dk-index__line">
              {pt
                ? "As apresentações, o quadro e o corpus de pesquisa, num lugar só."
                : "The decks, the whiteboard and the research corpus, in one place."}
            </p>
          </header>

          <section className="dk-group">
            <div className="dk-group__head">
              <h2 className="dk-group__h">{pt ? "Slides & Apresentações" : "Slides & Presentations"}</h2>
              <span className="dk-group__rule" aria-hidden="true" />
              <span className="dk-group__aside">
                {decks.length} {pt ? "documentos" : "documents"}
              </span>
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
                  <span className="dk-folder__s">{deck.summary[locale]}</span>
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
                    <span className="dk-folder__go">
                      <Arrow />
                    </span>
                  </span>
                </a>
              ))}
            </nav>
          </section>

          {/* O corpus é um documento só, servido inteiro em /corpus. A gaveta
           * não repete cartões: lista as partes como o sumário que elas são,
           * para a parte se abrir direto sem passar pelo índice do documento. */}
          <section className="dk-group">
            <div className="dk-group__head">
              <h2 className="dk-group__h">Research Corpus</h2>
              <span className="dk-group__rule" aria-hidden="true" />
              <a className="dk-group__link" href={corpusAll}>
                {pt ? "Ler inteiro" : "Read it whole"}
                <Arrow />
              </a>
            </div>
            <p className="dk-group__lead">
              {pt ? (
                <>
                  <b>A prova antes do valor.</b> Cinco partes, escritas como um documento só ·{" "}
                  {corpusUpdated}
                </>
              ) : (
                <>
                  <b>Proof before value.</b> Five parts, written as a single document ·{" "}
                  {corpusUpdated}
                </>
              )}
            </p>
            <ol className="dk-parts">
              {corpusParts.map((part) => (
                <li key={part.numeral}>
                  <a className="dk-part" href={corpusHref(part, locale)}>
                    <span className="dk-part__n">{part.numeral}</span>
                    <span className="dk-part__t">{part.title[locale]}</span>
                    <span className="dk-part__s">{part.summary[locale]}</span>
                    <span className="dk-part__langs">{part.langs.join(" · ")}</span>
                    <span className="dk-part__go">
                      <Arrow />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </section>

          <footer className="dk-index__foot">
            <p className="dk-index__fine">
              {pt
                ? "Material interno. Não indexado, e não constitui oferta, promessa de retorno ou recomendação de investimento. Números de terceiros trazem fonte e data na própria tela."
                : "Internal material. Not indexed, and not an offer, a promise of return, or investment advice. Third-party figures carry their source and date on the screen where they appear."}
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}
