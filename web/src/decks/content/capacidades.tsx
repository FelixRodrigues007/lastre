import { lazy, Suspense } from "react";
import { tx, type Deck } from "../types";

/* The board is an Excalidraw scene, and Excalidraw is the heaviest thing the
 * site loads. Keep it out of the decks chunk until this sheet is on screen. */
const BoardEmbed = lazy(() =>
  import("../../diagram/BoardEmbed").then((m) => ({ default: m.BoardEmbed })),
);

const BOARD = "lastre-capacidades";

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
    /* ── capa ─────────────────────────────────────────────────────────── */
    {
      id: "capa",
      title: { pt: "Capa", en: "Cover" },
      skin: "mint",
      center: true,
      render: (l) => {
        const t = tx(l);
        return (
          <div className="dk-cover dk-cover--quiet">
            <div className="dk-cover__head">
              <p className="dk-eyebrow">
                {t(
                  "Documento de trabalho · 05 setembro 2026",
                  "Working document · 05 September 2026",
                )}
              </p>
              <h1 className="dk-h1">
                {t(
                  "O que a Lastre é capaz de fazer?",
                  "What is Lastre capable of?",
                )}
              </h1>
              <p className="dk-cover__sub">
                {t(
                  "Uma coisa de cada vez, na ordem em que acontecem. A prova vem primeiro — nada a jusante existe sem ela.",
                  "One thing at a time, in the order they happen. Proof comes first — nothing downstream exists without it.",
                )}
              </p>
            </div>
          </div>
        );
      },
    },

    /* ── o mapa ───────────────────────────────────────────────────────── */
    {
      id: "mapa",
      title: { pt: "O mapa", en: "The map" },
      bleed: true,
      render: () => (
        <Suspense fallback={<div className="board-embed" aria-busy="true" />}>
          <BoardEmbed slug={BOARD} theme="light" />
        </Suspense>
      ),
    },
  ],
};
