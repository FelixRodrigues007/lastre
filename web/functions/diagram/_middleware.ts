/* A prancheta interna lê os mesmos arquivos de /diagrams. Com o dado trancado e
 * a página aberta, ela abriria só para mostrar um canvas quebrado. */
import { guard, type GuardContext } from "../../functions-lib/deck-guard";

export const onRequest = (context: GuardContext) => guard(context, "page");
