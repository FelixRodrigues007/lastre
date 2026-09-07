/* /decks e tudo abaixo dele. */
import { guard, type GuardContext } from "../../functions-lib/deck-guard";

export const onRequest = (context: GuardContext) => guard(context, "page");
