import { lazy, Suspense } from "react";
import { useAnnounceBoard, useBoardTheme, type BoardTheme } from "../BoardTheme";
import type { Deck, DeckLocale } from "../types";

/* The board is an Excalidraw scene, and Excalidraw is the heaviest thing the
 * site loads. Keep it out of the decks chunk until this sheet is on screen. */
const BoardEmbed = lazy(() =>
  import("../../diagram/BoardEmbed").then((m) => ({ default: m.BoardEmbed })),
);

/* Four committed boards — two languages, each drawn light and dark — all
 * written by scripts/build-capabilities-board.mjs from one source. A drawing
 * has no runtime string table and no CSS, so both the translation and the
 * theme are other files.
 *
 * The dark ones are drawn dark rather than filtered: Excalidraw's own dark
 * mode inverts the whole canvas, which lifts border and text to the same
 * near-white and lets neither be softened alone. */
const BOARD: Record<DeckLocale, Record<BoardTheme, string>> = {
  pt: { light: "lastre-capacidades", dark: "lastre-capacidades-dark" },
  en: { light: "lastre-capacidades-en", dark: "lastre-capacidades-en-dark" },
};

/* Painted into the canvas bitmap, so it has to equal the sheet exactly. */
const PAPER: Record<BoardTheme, string> = {
  light: "#f7f9f7",
  dark: "#121212",
};

function CapabilitiesBoard({ locale }: { locale: DeckLocale }) {
  const { theme } = useBoardTheme();
  useAnnounceBoard();

  return (
    <div className="dk-board" data-theme={theme}>
      <Suspense fallback={<div className="board-embed" aria-busy="true" />}>
        <BoardEmbed
          key={`${locale}-${theme}`}
          slug={BOARD[locale][theme]}
          /* Always light: the darkness is in the file, and Excalidraw's dark
           * theme would filter it a second time. */
          theme="light"
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
