/* Onde o Vite publica o bundle dos decks — ver chunkFileNames em vite.config.ts.
 * Sem esta porta, a página estaria trancada e o conteúdo, a um GET de distância. */
import { guard, type GuardContext } from "../../functions-lib/deck-guard";

export const onRequest = (context: GuardContext) => guard(context, "asset");
