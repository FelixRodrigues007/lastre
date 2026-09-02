import type { Locale } from "../i18n/translations";
import type { Deck } from "./types";

type Props = {
  decks: Deck[];
  locale: Locale;
  onOpen: (slug: string) => void;
};

/** The drawer. One row per document; opening one runs the deck. */
export function DecksIndex({ decks, locale, onOpen }: Props) {
  const pt = locale === "pt";

  return (
    <div className="dk-stage">
      <section className="dk-sheet dk-drawer-sheet">
        <div className="dk-index">
          <div className="dk-top">
            <p className="dk-eyebrow">lastre.io / decks</p>
            <h1 className="dk-h1">
              {pt ? "Documentos de trabalho." : "Working documents."}
              <br />
              {pt ? "Um por assunto." : "One per subject."}
            </h1>
            <p className="dk-p dk-p--lead">
              {pt
                ? "Cada pasta abre uma apresentação navegável. Setas para andar, G para o índice, Esc para voltar aqui. Imprimir gera o PDF."
                : "Each folder opens a navigable deck. Arrows to move, G for contents, Esc to come back here. Print makes the PDF."}
            </p>
          </div>

          <nav className="dk-list">
            {decks.map((deck) => (
              <a
                key={deck.slug}
                className="dk-item"
                href={`/decks/${deck.slug}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  onOpen(deck.slug);
                }}
              >
                <span className="dk-item__n">{deck.index}</span>
                <span className="dk-item__m">
                  <span className="dk-item__t">{deck.title[locale]}</span>
                  <span className="dk-p">{deck.summary[locale]}</span>
                  <span className="dk-item__meta">
                    <span className="dk-tag">
                      {deck.slides.length} {pt ? "telas" : "screens"}
                    </span>
                    <span className="dk-tag">{deck.audience[locale]}</span>
                    <span className="dk-eyebrow">{deck.updated}</span>
                  </span>
                </span>
                <span className="dk-item__a">→</span>
              </a>
            ))}
          </nav>

          <p className="dk-p dk-p--fine">
            {pt
              ? "Material interno. Não indexado, e não constitui oferta, promessa de retorno ou recomendação de investimento. Números de terceiros trazem fonte e data na própria tela."
              : "Internal material. Not indexed, and not an offer, a promise of return, or investment advice. Third-party figures carry their source and date on the screen where they appear."}
          </p>
        </div>
      </section>
    </div>
  );
}
