/* Unit 01 · ESTRATÉGIA of the business dossier, drawn inside its block on the
 * capabilities board.
 *
 * It is a module and not a board of its own on purpose: the dossier is one
 * sheet, and a unit that gets its own file becomes a slide — the reader has to
 * leave the board to see it, and the block it left behind says only "drawn
 * elsewhere". So the drawing takes the coordinates of the block body it is
 * handed and lives there. Every other unit gets a module on this grammar:
 *
 *   export function draw(kit, i, X, Y, W)
 *
 * where `i` is the language (0 pt, 1 en), (X, Y) the top-left of the body the
 * block reserves, and W its width. Height is the module's business — keep it
 * under BODY_H in the capabilities script, which is what the block gives.
 *
 * The content condenses the thesis as a chain — problem, solution, model,
 * market — and below it the position, where the two claims that do not yet
 * hold are drawn in red rather than quietly promoted to fact. */

/* ---- the copy, in both languages -----------------------------------------
 * One entry per box: [pt, en]. Every line traces to the dossier: the chain to
 * the Snapshot Estratégico, the band to Modelo de Negócio e Posicionamento. */
export const COPY = {
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

/* Three columns across the body: the chain rides the first three, the band
 * below reuses the same gutters, so the two halves line up instead of being
 * two drawings that happen to share a block. Heights are fixed, so the arrows
 * run level and the band reads as one row rather than three ragged cards. */
const COLS = 3;
const GAP = 62;
const CHAIN_H = 160;
const LAND_H = 120;
const BAND_H = 170;

export function draw(kit, i, X, Y, W) {
  const { P, box, arrow, label } = kit;
  const c = (k) => COPY[k][i];

  const colw = Math.floor((W - (COLS - 1) * GAP) / COLS);
  const col = (n) => X + n * (colw + GAP);
  const cap = (id, x, y, key, color) => label(id, x, y, c(key), 18, color, colw);

  /* The thesis, left to right: each box answers the one before it. */
  cap("cap-problema", col(0), Y, "capProblema", P.blue);
  cap("cap-solucao", col(1), Y, "capSolucao", P.blue);
  cap("cap-modelo", col(2), Y, "capModelo", P.blue);

  const problema = box("problema", col(0), Y + 32, colw, c("problema"), { height: CHAIN_H });
  const solucao = box("solucao", col(1), Y + 32, colw, c("solucao"), { height: CHAIN_H });
  const modelo = box("modelo", col(2), Y + 32, colw, c("modelo"), { height: CHAIN_H });

  /* Mercado is not a fourth link: it runs the full width, one step down, as
   * the ground the whole chain stands on. Given a column of its own it left a
   * hole the size of two boxes under the first half of the chain, and a block
   * with a hole that size reads as unfinished rather than as composed. */
  cap("cap-mercado", X, Y + 270, "capMercado", P.blue);
  const mercado = box("mercado", X, Y + 302, W, c("mercado"), { height: LAND_H });

  arrow(problema, solucao);
  arrow(solucao, modelo);
  arrow(modelo, mercado, {
    from: "bottom",
    to: "top",
    toAt: (2 * (colw + GAP) + colw / 2) / W,
  });

  /* No arrows here: these three qualify the whole chain, not any one box. */
  label("banda", X, Y + 540, c("banda"), 24, P.ink, W);

  cap("cap-concorrentes", col(0), Y + 610, "capConcorrentes", P.blue);
  cap("cap-diferencial", col(1), Y + 610, "capDiferencial", P.red);
  cap("cap-barreira", col(2), Y + 610, "capBarreira", P.red);

  box("concorrentes", col(0), Y + 642, colw, c("concorrentes"), { height: BAND_H });
  box("diferencial", col(1), Y + 642, colw, c("diferencial"), { height: BAND_H, accent: P.red });
  box("barreira", col(2), Y + 642, colw, c("barreira"), { height: BAND_H, accent: P.red });

  label("legenda", X, Y + 880, c("legenda"), 18, P.flow, W);
}
