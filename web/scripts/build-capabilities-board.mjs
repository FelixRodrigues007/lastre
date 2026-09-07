/* Generates the four committed versions of the "capabilities" board that
 * /decks/capacidades embeds — two languages, each drawn light and dark — from
 * the one bilingual source below.
 *
 *   npm run board:capacidades
 *
 * Deliberately NOT part of the build. The boards it writes are committed, and
 * /diagram can edit them by hand; running this on every build would silently
 * throw those edits away. Run it when the wording changes, look at the diff,
 * commit it. */

import { sheet, emit } from "./board-kit.mjs";

/* ---- the sheet, in both languages ----------------------------------------
 * One entry per box: [pt, en]. The layout is shared, so the two files differ
 * only in the strings — which is what makes the diff readable when the wording
 * changes. */
const COPY = {
  title: [
    "① O QUE A LASTRE É CAPAZ DE FAZER?",
    "① WHAT IS LASTRE CAPABLE OF?",
  ],
  prova: ["FAZER A PROVA DE VALIDADE", "PROVE VALIDITY"],
  valido: ["É VÁLIDO?", "IS IT VALID?"],
  semgar: ["SEM GARANTIA ✗", "NO GUARANTEE ✗"],
  token: ["TOKENIZAÇÃO", "TOKENISATION"],
  compra: [
    "PERMISSÃO DE COMPRA DE TOKENS (SENDO INTERMEDIÁRIA) POR INVESTIDORES EXTERNOS",
    "TOKEN PURCHASE BY EXTERNAL INVESTORS, WITH LASTRE AS INTERMEDIARY",
  ],
  supply: [
    "ACOMPANHAMENTO DE TODO O SUPPLY CHAIN DO COMMODITY, DESDE A COMPRA/VENDA DE ATIVOS TOKENIZADOS",
    "TRACKING THE WHOLE SUPPLY CHAIN OF THE COMMODITY, FROM THE PURCHASE/SALE OF TOKENISED ASSETS",
  ],
  entrep: [
    "SERVIR DE ENTREPOSTO DE ANÁLISES E SEGURANÇA — PERMITIR PRÉ-LIQUIDEZ CONSTANTE DE COMPRA/VENDA DE COMMODITY, MINÉRIOS ETC",
    "ACT AS A WAREHOUSE OF ANALYSIS AND SECURITY — ALLOW CONSTANT PRE-LIQUIDITY ON THE PURCHASE/SALE OF COMMODITY, MINERALS ETC",
  ],
  escrow: ["SEGURANÇA ESCROW E PROTOCOLO PCQ", "ESCROW SECURITY AND PCQ PROTOCOL"],
  defi: [
    "POSSIBILITAR DEFI DOS ATIVOS TOKENIZADOS VÁLIDOS",
    "ENABLE DEFI ON VALID TOKENISED ASSETS",
  ],
  staking: [
    "PERMITIR STAKING DOS ATIVOS TOKENIZADOS",
    "ALLOW STAKING OF TOKENISED ASSETS",
  ],
  fim: ["FINALIZAR OPERAÇÃO DE VENDA/COMPRA", "SETTLE THE BUY/SELL OPERATION"],
};

emit("lastre-capacidades", (i, palette) => {
  const { P, elements, box, arrow, label } = sheet(palette);
  const c = (k) => COPY[k][i];

  label("title", 120, 140, c("title"), 28, P.blue);

  const prova = box("prova", 120, 390, 250, c("prova"));
  const valido = box("valido", 460, 390, 200, c("valido"), { accent: P.blue });
  const semGar = box("semgar", 450, 620, 230, c("semgar"), { accent: P.red });
  const token = box("token", 780, 390, 220, c("token"));

  const compra = box("compra", 1080, 70, 340, c("compra"));
  const supply = box("supply", 1080, 360, 340, c("supply"));
  const entrep = box("entrep", 1080, 650, 340, c("entrep"));

  const escrow = box("escrow", 1530, 380, 280, c("escrow"), { accent: P.blue });

  const defi = box("defi", 1920, 120, 300, c("defi"));
  const staking = box("staking", 1920, 380, 300, c("staking"));
  const fim = box("fim", 1920, 630, 300, c("fim"));

  arrow(prova, valido);
  arrow(valido, token);
  arrow(valido, semGar, { from: "bottom", to: "top", accent: P.red });
  arrow(token, compra, { from: "top", to: "left" });
  arrow(token, supply);
  arrow(token, entrep, { from: "bottom", to: "left" });
  arrow(supply, escrow);
  arrow(entrep, escrow, { from: "right", to: "bottom" });
  arrow(escrow, defi, { from: "top", to: "left" });
  arrow(escrow, staking);
  arrow(escrow, fim, { from: "bottom", to: "left" });
  arrow(compra, defi);

  return elements;
});
