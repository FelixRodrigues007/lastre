import { useCallback, useEffect, useState } from "react";
import { normalizeLocale } from "../lib/locale";
import type { DeckLocale as Locale } from "./types";
import { decks } from "./registry";
import { DecksIndex } from "./DecksIndex";
import { DeckViewer } from "./Deck";
import { DeckHeader } from "./DeckChrome";
import { BoardThemeProvider } from "./BoardTheme";
import "./decks.css";

const readSlug = () => {
  const m = window.location.pathname.match(/^\/decks\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]!) : null;
};

/* The decks keep their own language key: the landing is English-first, but a
 * deck opens in the language of the room it is presented in. */
const LOCALE_KEY = "lastre-deck-locale";

/* normalizeLocale answers for the whole site, which speaks Spanish too. These
 * documents do not, so a Spanish reader gets the English sheet rather than a
 * deck half in a language it was never written in. */
const toDeckLocale = (value: unknown): Locale =>
  normalizeLocale(value) === "pt" ? "pt" : "en";

const readLocale = (): Locale => {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    return stored ? toDeckLocale(stored) : "pt";
  } catch {
    return "pt";
  }
};

/** Path router for /decks and /decks/:slug. No dependency, no build change. */
export function DecksApp() {
  return (
    <BoardThemeProvider>
      <DecksSurface />
    </BoardThemeProvider>
  );
}

function DecksSurface() {
  const [slug, setSlug] = useState<string | null>(readSlug);
  const [locale, setLocaleState] = useState<Locale>(readLocale);

  useEffect(() => {
    const onPop = () => setSlug(readSlug());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_KEY, next);
    } catch {
      // Storage can be unavailable — the toggle still works for this session.
    }
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
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
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
    document.title = deck
      ? `${deck.title[locale]} — Lastre`
      : locale === "pt"
        ? "Apresentações — Lastre"
        : "Decks — Lastre";
  }, [deck, locale]);

  return (
    <div className="dk">
      <DeckHeader locale={locale} onLocale={setLocale} />

      {slug && !deck ? (
        <div className="dk-stage">
          <section className="dk-sheet">
            <div className="dk-canvas__inner dk-canvas__inner--center">
              <div className="dk-top">
                <p className="dk-eyebrow">404</p>
                <h1 className="dk-h1">
                  {locale === "pt" ? "Esta pasta não existe." : "This folder does not exist."}
                </h1>
                <p className="dk-p">
                  <button
                    type="button"
                    className="dk-tag"
                    style={{ cursor: "pointer" }}
                    onClick={exit}
                  >
                    {locale === "pt" ? "Ver todas" : "See all"}
                  </button>
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : deck ? (
        <DeckViewer deck={deck} locale={locale} onExit={exit} />
      ) : (
        <DecksIndex decks={decks} locale={locale} onOpen={open} />
      )}
    </div>
  );
}
