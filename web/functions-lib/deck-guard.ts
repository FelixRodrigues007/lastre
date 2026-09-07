/* O guarda em si. Duas portas usam este mesmo corpo: a página /decks e a pasta
 * onde o bundle dos decks é publicado. Sem cookie válido, nenhuma das duas
 * responde — nem o HTML, nem o JavaScript que carrega o conteúdo. */

import {
  issueToken,
  passwordMatches,
  readCookie,
  setCookie,
  tokenIsValid,
} from "./deck-auth";
import { gatePage } from "./deck-gate";

export interface DeckEnv {
  DECKS_PASSWORD?: string;
}

export interface GuardContext {
  request: Request;
  env: DeckEnv;
  next: () => Promise<Response>;
}

/** "page" mostra o formulário; "asset" só nega — ninguém lê HTML num .js. */
export type Door = "page" | "asset";

const HTML_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

const DENY_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

const readPassword = async (request: Request): Promise<string> => {
  try {
    const form = await request.formData();
    const value = form.get("password");
    return typeof value === "string" ? value : "";
  } catch {
    // Corpo que não é formulário: trata como senha vazia, não como erro 500.
    return "";
  }
};

export const guard = async (
  { request, env, next }: GuardContext,
  door: Door,
): Promise<Response> => {
  const password = env.DECKS_PASSWORD;

  /* Sem senha no ambiente o portão fecha em vez de abrir. Um deploy mal
   * configurado não pode ser a forma de publicar os documentos por acidente. */
  if (!password) {
    return door === "page"
      ? new Response(gatePage("unset"), { status: 503, headers: HTML_HEADERS })
      : new Response("Decks gate not configured.", {
          status: 503,
          headers: DENY_HEADERS,
        });
  }

  if (door === "page" && request.method === "POST") {
    if (await passwordMatches(await readPassword(request), password)) {
      const url = new URL(request.url);
      return new Response(null, {
        status: 303,
        headers: {
          Location: `${url.pathname}${url.search}`,
          "Set-Cookie": setCookie(await issueToken(password)),
          "Cache-Control": "no-store",
        },
      });
    }
    return new Response(gatePage("wrong"), { status: 401, headers: HTML_HEADERS });
  }

  if (await tokenIsValid(readCookie(request), password)) return next();

  return door === "page"
    ? new Response(gatePage("ask"), { status: 401, headers: HTML_HEADERS })
    : new Response("Unauthorized.", { status: 401, headers: DENY_HEADERS });
};
