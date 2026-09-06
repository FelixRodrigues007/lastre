import type { ReactNode } from "react";

/* The site speaks three languages; these documents are written in two, and the
 * deck header is a two-button toggle. Widening this to the site Locale would
 * demand a Spanish string for every line of every sheet — so the decks name
 * their own contract and DecksApp clamps the site locale down to it. */
export type DeckLocale = "pt" | "en";

/** A string in both deck languages. */
export type L10n = Record<DeckLocale, string>;

/** Sheet skins, mirroring the four grounds of the system. */
export type Skin = "light" | "dark" | "mint" | "wave";

export type Slide = {
  /** Stable id — becomes the deep link (#s/<id>). */
  id: string;
  /** Short label for the contents overlay and the footer rail. */
  title: L10n;
  skin?: Skin;
  /** Centre the content instead of pinning it top and bottom. */
  center?: boolean;
  /** A figura é o fundo da folha: sem faixas, sem padding, sem rodapé. */
  bleed?: boolean;
  /** Etapas de build além do estado inicial (etapa 0). */
  steps?: number;
  render: (locale: DeckLocale, step: number) => ReactNode;
};

export type Deck = {
  /** URL segment under /decks. */
  slug: string;
  index: string;
  title: L10n;
  summary: L10n;
  audience: L10n;
  updated: string;
  slides: Slide[];
};

/** `const t = tx(locale)` then `t("português", "english")`. */
export const tx =
  (locale: DeckLocale) =>
  (pt: string, en: string): string =>
    locale === "pt" ? pt : en;
