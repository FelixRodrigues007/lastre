/* Os arquivos .excalidraw são o conteúdo do deck de capacidades, servidos como
 * estático. Trancar a página e deixar estes abertos seria proteção de fachada. */
import { guard, type GuardContext } from "../../functions-lib/deck-guard";

export const onRequest = (context: GuardContext) => guard(context, "asset");
