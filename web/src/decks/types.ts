import type { ReactNode } from "react";

export type Slide = {
  /** Stable id, used for the deep link hash (#s/<id>). */
  id: string;
  /** Short label shown in the table of contents and the top rail. */
  title: string;
  body: ReactNode;
};

export type Deck = {
  /** URL segment under /decks. */
  slug: string;
  /** Two-digit ordinal shown in the drawer. */
  index: string;
  title: string;
  /** One line, editorial. Shown in the drawer and on the deck cover rail. */
  summary: string;
  audience: string;
  updated: string;
  slides: Slide[];
};
