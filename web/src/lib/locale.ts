import type { Locale } from "../i18n/translations";

const STORAGE_KEY = "lastro-locale";
const COOKIE_NAME = "lastro-locale";

// One-time migration marker shared in spirit with the app console: the landing
// is English-first, so any browser still carrying a locale saved before this
// fix (e.g. a "pt" from earlier testing) resets to English exactly once. Bump
// the version to force another reset later if ever needed.
const RESET_MARKER_KEY = "lastro-locale-reset";
const RESET_VERSION = "2026-07-en-default";

const LOCALES: readonly Locale[] = ["en", "pt", "es"];

/** English is the default; exact "pt" / "es" opt into Portuguese / Spanish. */
export function normalizeLocale(value: unknown): Locale {
  if (value === "pt" || value === "es" || value === "en") return value;
  return "en";
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (Safari private mode, disabled cookies).
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  } catch {
    // Ignore — see safeSetItem.
  }
}

function writeLocaleCookie(locale: Locale): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  const base = `${COOKIE_NAME}=${encodeURIComponent(locale)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = base;
  const host = typeof location !== "undefined" ? location.hostname : "";
  if (host === "lastre.io" || host.endsWith(".lastre.io")) {
    document.cookie = `${base}; domain=.lastre.io`;
  }
}

function readLocaleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getStoredLocale(): Locale {
  // Purge any pre-fix locale once so every visitor re-enters through the
  // English default; the marker keeps it one-time so a later explicit PT
  // choice still persists. Cookie from a prior visit on lastre.io is honored.
  if (safeGetItem(RESET_MARKER_KEY) !== RESET_VERSION) {
    safeRemoveItem(STORAGE_KEY);
    safeSetItem(RESET_MARKER_KEY, RESET_VERSION);
    const fromCookie = readLocaleCookie();
    if (fromCookie && isLocale(fromCookie)) {
      safeSetItem(STORAGE_KEY, fromCookie);
      return fromCookie;
    }
    return "en";
  }
  const stored = safeGetItem(STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;
  const fromCookie = readLocaleCookie();
  if (fromCookie && isLocale(fromCookie)) return fromCookie;
  return "en";
}

export function persistLocale(locale: Locale): void {
  const normalized = normalizeLocale(locale);
  safeSetItem(STORAGE_KEY, normalized);
  writeLocaleCookie(normalized);
}

/** Append lang= so app.lastre.io (other origin) inherits landing locale. */
export function withLangParam(url: string, locale: Locale): string {
  try {
    // Absolute URLs
    if (/^https?:\/\//i.test(url)) {
      const u = new URL(url);
      u.searchParams.set("lang", locale);
      return u.toString();
    }
    // Relative (local dev /app)
    const u = new URL(url, "http://local.invalid");
    u.searchParams.set("lang", locale);
    return u.pathname + u.search + u.hash;
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}lang=${locale}`;
  }
}
