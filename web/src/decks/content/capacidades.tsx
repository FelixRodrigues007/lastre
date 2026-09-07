import { lazy, Suspense } from "react";
import { useAnnounceBoard, useBoardTheme, type BoardTheme } from "../BoardTheme";
import type { Deck, DeckLocale } from "../types";

/* The board is an Excalidraw scene, and Excalidraw is the heaviest thing the
 * site loads. Keep it out of the decks chunk until this sheet is on screen. */
const BoardEmbed = lazy(() =>
  import("../../diagram/BoardEmbed").then((m) => ({ default: m.BoardEmbed })),
);

/* Four committed files per board — two languages, each drawn light and dark —
 * all written by the scripts under web/scripts from one bilingual source. A
 * drawing has no runtime string table and no CSS, so both the translation and
 * the theme are other files.
 *
 * The dark ones are drawn dark rather than filtered: Excalidraw's own dark
 * mode inverts the whole canvas, which lifts border and text to the same
 * near-white and lets neither be softened alone. */
const variants = (stem: string): Record<DeckLocale, Record<BoardTheme, string>> => ({
  pt: { light: stem, dark: `${stem}-dark` },
  en: { light: `${stem}-en`, dark: `${stem}-en-dark` },
});

const BOARDS = {
  capacidades: variants("lastre-capacidades"),
};

/* O quadro é maior do que a folha mostra: embaixo do fluxo ele carrega o banco
 * de trabalho do dossiê — um bloco por unidade, do tamanho de um diagrama, com
 * o desenho da unidade dentro dele. Nenhuma unidade ganha folha própria; o
 * deck é uma folha só. Ela abre no fluxo, e o banco fica abaixo da dobra, para
 * quem rolar o quadro ou abri-lo em /diagram. */
const FIT_EXCLUDE: Partial<Record<keyof typeof BOARDS, string>> = {
  capacidades: "sh-",
};

/* Painted into the canvas bitmap, so it has to equal the sheet exactly. */
const PAPER: Record<BoardTheme, string> = {
  light: "#f7f9f7",
  dark: "#121212",
};

function Board({
  board,
  locale,
}: {
  board: keyof typeof BOARDS;
  locale: DeckLocale;
}) {
  const { theme } = useBoardTheme();
  useAnnounceBoard();

  return (
    <div className="dk-board" data-theme={theme}>
      <Suspense fallback={<div className="board-embed" aria-busy="true" />}>
        <BoardEmbed
          key={`${board}-${locale}-${theme}`}
          slug={BOARDS[board][locale][theme]}
          /* Always light: the darkness is in the file, and Excalidraw's dark
           * theme would filter it a second time. */
          theme="light"
          background={PAPER[theme]}
          fitExclude={FIT_EXCLUDE[board]}
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
    pt: "O mapa do que a Lastre é capaz de fazer: da prova de validade à tokenização, e daí a custódia, DeFi, staking e liquidação. Abaixo do mapa, o banco de trabalho do dossiê — uma unidade por bloco, desenhada dentro dele.",
    en: "The map of what Lastre can do: from proof of validity to tokenisation, and from there to custody, DeFi, staking and settlement. Below the map, the dossier's workbench — one unit per block, drawn inside it.",
  },
  audience: { pt: "Sócios e convidados", en: "Partners and guests" },
  updated: "07.09.2026",
  slides: [
    {
      id: "mapa",
      title: { pt: "O mapa", en: "The map" },
      bleed: true,
      render: (l) => <Board board="capacidades" locale={l} />,
    },
  ],
};
