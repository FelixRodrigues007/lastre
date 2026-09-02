import { useCallback, useEffect, useState } from "react";
import { decks } from "./registry";
import { DecksIndex } from "./DecksIndex";
import { DeckViewer } from "./Deck";
import "./decks.css";

const readSlug = () => {
  const m = window.location.pathname.match(/^\/decks\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]!) : null;
};

/** Path router for /decks and /decks/:slug. No dependency, no build change. */
export function DecksApp() {
  const [slug, setSlug] = useState<string | null>(readSlug);

  useEffect(() => {
    const onPop = () => setSlug(readSlug());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const open = useCallback((next: string) => {
    window.history.pushState(null, "", `/decks/${next}`);
    setSlug(next);
  }, []);

  const exit = useCallback(() => {
    window.history.pushState(null, "", "/decks");
    setSlug(null);
  }, []);

  const deck = slug ? decks.find((d) => d.slug === slug) : undefined;

  useEffect(() => {
    document.title = deck ? `${deck.title} — Lastre` : "Apresentações — Lastre";
  }, [deck]);

  if (slug && !deck) {
    return (
      <div className="dk">
        <div className="dk-stage">
          <div className="dk-slide">
            <p className="dk-eyebrow dk-eyebrow--muted">404</p>
            <h1 className="dk-h1">Esta pasta não existe.</h1>
            <p>
              <button type="button" className="dk-btn" onClick={exit}>
                Ver todas as apresentações
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return deck ? (
    <DeckViewer deck={deck} onExit={exit} />
  ) : (
    <DecksIndex decks={decks} onOpen={open} />
  );
}
