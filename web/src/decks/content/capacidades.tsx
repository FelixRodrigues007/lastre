import { lazy, Suspense } from "react";
import { useAnnounceBoard, useBoardTheme } from "../BoardTheme";
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

/* The paper the drawing sits on, painted into the canvas bitmap — CSS cannot
 * undo it. Both values are light because Excalidraw's dark theme works by
 * inverting the whole canvas: hand it a dark colour and it comes back bright.
 * So the dark sheet asks for white and lets the inversion darken it. */
const PAPER = { light: "#f7f9f7", dark: "#ffffff" };

function CapabilitiesBoard({ locale }: { locale: DeckLocale }) {
  const { theme } = useBoardTheme();
  useAnnounceBoard();

  return (
    <div className="dk-board" data-theme={theme}>
      <Suspense fallback={<div className="board-embed" aria-busy="true" />}>
        <BoardEmbed
          key={`${locale}-${theme}`}
          slug={BOARD[locale]}
          theme={theme}
          background={PAPER[theme]}
        />
      </Suspense>
    </div>
  );
}

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
      render: (l) => <CapabilitiesBoard locale={l} />,
    },
  ],
};
