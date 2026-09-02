import type { Deck } from "./types";

type Props = {
  decks: Deck[];
  onOpen: (slug: string) => void;
};

/**
 * The drawer. Each row is a folder; opening one runs the deck.
 */
export function DecksIndex({ decks, onOpen }: Props) {
  return (
    <div className="dk">
      <header className="dk-rail">
        <div className="dk-rail__group">
          <a className="dk-rail__mark" href="/" style={{ color: "inherit", textDecoration: "none" }}>
            Lastre
          </a>
          <span className="dk-rail__sep">/</span>
          <span className="dk-rail__title">Apresentações</span>
        </div>
        <div className="dk-rail__group">
          <span>{String(decks.length).padStart(2, "0")} documentos</span>
        </div>
      </header>

      <div className="dk-stage">
        <div className="dk-slide dk-index">
          <div className="dk-stack">
            <p className="dk-eyebrow">lastre.io / decks</p>
            <h1 className="dk-h1">
              Documentos de trabalho.
              <br />
              Um por assunto.
            </h1>
            <p className="dk-lead">
              Cada pasta abre uma apresentação navegável. Setas para avançar, <span className="dk-em">G</span> para o
              índice, <span className="dk-em">Esc</span> para voltar aqui. Imprimir gera o PDF.
            </p>
          </div>

          <nav className="dk-drawer">
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
                <span className="dk-item__main">
                  <span className="dk-item__title">{deck.title}</span>
                  <span className="dk-body">{deck.summary}</span>
                  <span className="dk-item__meta">
                    <span className="dk-tag">{deck.slides.length} telas</span>
                    <span className="dk-tag">{deck.audience}</span>
                    <span className="dk-mono">{deck.updated}</span>
                  </span>
                </span>
                <span className="dk-item__arrow">→</span>
              </a>
            ))}
          </nav>

          <div className="dk-notes">
            <p className="dk-note">
              <b>Material interno.</b> Estas páginas não são indexadas e não constituem oferta, promessa de retorno ou
              recomendação de investimento. Números de terceiros trazem fonte e data na própria tela.
            </p>
          </div>
        </div>
      </div>

      <footer className="dk-rail dk-rail--foot">
        <span>Lastre · prova antes do valor</span>
        <a href="/" className="dk-btn">
          Voltar ao site
        </a>
      </footer>
    </div>
  );
}
