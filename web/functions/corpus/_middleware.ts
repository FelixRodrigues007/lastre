/* O corpus é o mesmo material interno dos decks, servido como HTML estático em
 * vez de bundle. Sem esta porta, a gaveta estaria trancada e o documento
 * inteiro a um GET de distância. */
import { guard, type GuardContext } from "../../functions-lib/deck-guard";

export const onRequest = (context: GuardContext) => guard(context, "page");
