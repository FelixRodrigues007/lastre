/* Generates the four committed versions of the "strategy" board that
 * /decks/capacidades embeds — two languages, each drawn light and dark.
 *
 *   npm run board:estrategia
 *
 * It condenses unit 01 · ESTRATÉGIA of the business dossier onto one sheet:
 * the thesis as a chain — problem, solution, model, market — and below it the
 * position, where the two claims that do not yet hold are drawn in red rather
 * than quietly promoted to fact. The rest of the dossier (market, product…)
 * gets its own sheet on this same grammar, so keep the shape.
 *
 * Deliberately NOT part of the build: the boards are committed and /diagram
 * can edit them by hand. Run it when the wording changes, read the diff,
 * commit it. */

import { sheet, emit } from "./board-kit.mjs";

/* ---- the sheet, in both languages ----------------------------------------
 * One entry per box: [pt, en]. The layout is shared, so the two files differ
 * only in the strings. Every line traces to the dossier: the chain to the
 * Snapshot Estratégico, the band to Modelo de Negócio e Posicionamento. */
const COPY = {
  title: [
    "② A ESTRATÉGIA — A TESE EM UMA FOLHA",
    "② THE STRATEGY — THE THESIS ON ONE SHEET",
  ],

  capProblema: ["PROBLEMA", "PROBLEM"],
  problema: [
    "O LOTE NÃO TEM ORIGEM AUDITÁVEL: A RESPOSTA A “DE ONDE VEIO?” É UM PDF SOLTO",
    "THE LOT HAS NO AUDITABLE ORIGIN: THE ANSWER TO “WHERE IS IT FROM?” IS A LOOSE PDF",
  ],
  capSolucao: ["SOLUÇÃO", "SOLUTION"],
  solucao: [
    "SELAR O PACOTE DO LOTE COM DUAS CHAVES E DEVOLVER UM VEREDITO PERMANENTE",
    "SEAL THE LOT’S DOCUMENT PACK WITH TWO KEYS AND RETURN A PERMANENT VERDICT",
  ],
  capModelo: ["MODELO", "BUSINESS MODEL"],
  modelo: [
    "SERVIÇO COM NOTA FISCAL EM REAIS: ENTRADA, MENSALIDADE POR SITE E TAXA POR LOTE",
    "A SERVICE INVOICED IN REAIS: ONBOARDING, A MONTHLY FEE PER SITE, A FEE PER LOT",
  ],
  capMercado: ["MERCADO", "MARKET"],
  mercado: [
    "UM SITE, UM MINERAL, UM PAGADOR — O OPERADOR DO LOTE, NO BRASIL",
    "ONE SITE, ONE MINERAL, ONE PAYER — THE LOT OPERATOR, IN BRAZIL",
  ],

  banda: [
    "A POSIÇÃO — E O QUE AINDA NÃO SE SUSTENTA",
    "THE POSITION — AND WHAT DOES NOT YET HOLD",
  ],
  capConcorrentes: ["CONCORRENTES", "ALTERNATIVES"],
  concorrentes: [
    "CIRCULOR E MINESPIDER PROVAM O DADO DECLARADO PELO FORNECEDOR. A ALTERNATIVA DOMINANTE É NÃO FAZER NADA.",
    "CIRCULOR AND MINESPIDER PROVE WHAT THE SUPPLIER DECLARED. THE DOMINANT ALTERNATIVE IS DOING NOTHING.",
  ],
  capDiferencial: ["DIFERENCIAL · HIPÓTESE", "DIFFERENTIATOR · HYPOTHESIS"],
  diferencial: [
    "PROVAMOS QUE A LEITURA ACONTECEU, NÃO O QUE O FORNECEDOR DECLAROU. AINDA NÃO TESTADO COM CLIENTE.",
    "WE PROVE THE READING HAPPENED, NOT WHAT THE SUPPLIER DECLARED. NOT YET TESTED WITH A CUSTOMER.",
  ],
  capBarreira: ["BARREIRA · HIPÓTESE", "MOAT · HYPOTHESIS"],
  barreira: [
    "O HISTÓRICO DE LEITURAS CORROBORADAS, QUE NÃO SE COMPRA DEPOIS. NENHUMA LEITURA REAL REGISTRADA.",
    "THE RECORD OF CORROBORATED READINGS, WHICH CANNOT BE BOUGHT LATER. NO REAL READING LOGGED YET.",
  ],

  /* The drawing marks only the exceptions, so the legend names the exception
   * and not the rule — a blue border was never drawn. */
  legenda: [
    "VERMELHO = HIPÓTESE A TESTAR   ·   O RESTO É FATO COM FONTE NO DOSSIÊ",
    "RED = HYPOTHESIS TO TEST   ·   THE REST IS FACT WITH A SOURCE IN THE DOSSIER",
  ],
};

/* Fixed heights, so the arrows across the chain run level and the band reads
 * as one row rather than four ragged cards. */
const CHAIN_H = 170;
const BAND_H = 150;

emit("lastre-estrategia", (i, palette) => {
  const { P, elements, box, arrow, label } = sheet(palette);
  const c = (k) => COPY[k][i];

  label("title", 120, 140, c("title"), 28, P.blue);

  /* The thesis, left to right: each box answers the one before it. */
  const cap = (id, x, y, key, color) => label(id, x, y, c(key), 16, color, 460);

  cap("cap-problema", 120, 350, "capProblema", P.blue);
  cap("cap-solucao", 520, 350, "capSolucao", P.blue);
  cap("cap-modelo", 920, 350, "capModelo", P.blue);

  const problema = box("problema", 120, 380, 340, c("problema"), { height: CHAIN_H });
  const solucao = box("solucao", 520, 380, 340, c("solucao"), { height: CHAIN_H });
  const modelo = box("modelo", 920, 380, 340, c("modelo"), { height: CHAIN_H });

  /* Mercado keeps the column the chain would have given it, one step down:
   * it is where the chain lands, not another link in it. */
  cap("cap-mercado", 1320, 570, "capMercado", P.blue);
  const mercado = box("mercado", 1320, 600, 340, c("mercado"), { height: CHAIN_H });

  arrow(problema, solucao);
  arrow(solucao, modelo);
  arrow(modelo, mercado);

  /* No arrows here: these three qualify the whole chain, not any one box. */
  label("banda", 120, 860, c("banda"), 22, P.ink);

  cap("cap-concorrentes", 120, 915, "capConcorrentes", P.blue);
  cap("cap-diferencial", 660, 915, "capDiferencial", P.red);
  cap("cap-barreira", 1200, 915, "capBarreira", P.red);

  box("concorrentes", 120, 945, 500, c("concorrentes"), { height: BAND_H });
  box("diferencial", 660, 945, 500, c("diferencial"), { height: BAND_H, accent: P.red });
  box("barreira", 1200, 945, 500, c("barreira"), { height: BAND_H, accent: P.red });

  label("legenda", 120, 1140, c("legenda"), 16, P.flow);

  return elements;
});
