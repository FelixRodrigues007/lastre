import { lazy, Suspense } from "react";
import type { Deck, DeckLocale } from "../types";

/* The board is an Excalidraw scene, and Excalidraw is the heaviest thing the
 * site loads. Keep it out of the decks chunk until this sheet is on screen. */
const BoardEmbed = lazy(() =>
  import("../../diagram/BoardEmbed").then((m) => ({ default: m.BoardEmbed })),
);

/* One committed board per language, both written by
 * scripts/build-capabilities-board.mjs from a single bilingual source — a
 * drawing has no runtime string table, so the translation is another file. */
const BOARD: Record<DeckLocale, string> = {
  pt: "lastre-capacidades",
  en: "lastre-capacidades-en",
};

/* ─────────────────────────────────────────────────────────────────────────
 * 03 · Capacidades
 * ───────────────────────────────────────────────────────────────────────── */

export const capacidades: Deck = {
  slug: "capacidades",
  index: "03",
  title: { pt: "Capacidades", en: "Capabilities" },
  summary: {
    pt: "O mapa do que a Lastre é capaz de fazer: da prova de validade à tokenização, e daí a custódia, DeFi, staking e liquidação.",
    en: "The map of what Lastre can do: from proof of validity to tokenisation, and from there to custody, DeFi, staking and settlement.",
  },
  audience: { pt: "Sócios e convidados", en: "Partners and guests" },
  updated: "05.09.2026",
  slides: [
    {
      id: "mapa",
      title: { pt: "O mapa", en: "The map" },
      bleed: true,
      render: (l) => (
        <Suspense fallback={<div className="board-embed" aria-busy="true" />}>
          <BoardEmbed key={l} slug={BOARD[l]} theme="light" />
        </Suspense>
      ),
    },
  ],
};
