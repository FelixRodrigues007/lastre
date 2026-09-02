import type { ReactNode } from "react";
import type { Locale } from "../i18n/translations";

/** A string in both deck languages. */
export type L10n = Record<Locale, string>;

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
  render: (locale: Locale) => ReactNode;
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
  (locale: Locale) =>
  (pt: string, en: string): string =>
    locale === "pt" ? pt : en;
