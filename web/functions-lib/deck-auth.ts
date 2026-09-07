/* Portão dos decks — os documentos internos não são públicos.
 *
 * A senha vive só na variável de ambiente DECKS_PASSWORD do Cloudflare Pages;
 * nada dela entra no bundle. O cookie que a troca é um HMAC assinado com a
 * própria senha: trocar a senha invalida toda sessão aberta, de graça.
 */

const COOKIE = "lastre_decks";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

const enc = new TextEncoder();

const b64url = (bytes: ArrayBuffer): string => {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const hmac = async (secret: string, message: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
};

/* Comparação sem vazar tempo: o tamanho é fixo (HMAC em base64url), então um
 * XOR acumulado percorre a string inteira em qualquer caso. */
const equals = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

/** Confere a senha digitada contra a do ambiente, sem comparar texto cru. */
export const passwordMatches = async (
  input: string,
  password: string,
): Promise<boolean> =>
  equals(await hmac(password, input), await hmac(password, password));

/** Token de sessão: validade em claro + assinatura da validade. */
export const issueToken = async (password: string): Promise<string> => {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return `${exp}.${await hmac(password, exp)}`;
};

export const tokenIsValid = async (
  token: string | null,
  password: string,
): Promise<boolean> => {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const deadline = Number(exp);
  if (!Number.isFinite(deadline) || deadline < Date.now()) return false;
  return equals(sig, await hmac(password, exp));
};

export const readCookie = (request: Request): string | null => {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) return rest.join("=") || null;
  }
  return null;
};

export const setCookie = (token: string): string =>
  `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;

export const clearCookie = (): string =>
  `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
