/* Ver functions/_README.md: mesma porta de web/functions/diagram, montada na raiz
 * do repositório, que é onde o build conectado ao Git procura `functions/`. */
import { guard, type GuardContext } from "../../web/functions-lib/deck-guard";

export const onRequest = (context: GuardContext) => guard(context, "page");
