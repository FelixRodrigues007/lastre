const STORAGE_KEY = "lastro-locale";
const COOKIE_NAME = "lastro-locale";

// One-time migration marker. The console is English-first: any browser that
// still carries a locale saved before this fix (e.g. a "pt" left over from
// heavy PT testing) must fall back to the English default exactly once. Bump
// this version string to force another reset in the future if ever needed.
const RESET_MARKER_KEY = "lastro-locale-reset";
const RESET_VERSION = "2026-07-en-default";

export type Locale = "en" | "pt" | "es";

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
    // A persisted preference is best-effort, never a hard requirement.
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

/** Cross-subdomain bridge: lastre.io ↔ app.lastre.io share this cookie. */
function readLocaleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
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

/** Prefer ?lang= / ?locale= from deep links (landing → app). */
export function readLocaleFromUrl(search?: string): Locale | null {
  if (typeof window === "undefined" && search == null) return null;
  try {
    const q = new URLSearchParams(search ?? window.location.search);
    const raw = q.get("lang") ?? q.get("locale");
    if (raw && isLocale(raw)) return raw;
  } catch {
    // ignore
  }
  return null;
}

const CHOSEN_KEY = "lastro-locale-chosen";

export function markLocaleChosen(): void {
  safeSetItem(CHOSEN_KEY, "1");
}

export function hasExplicitLocaleChoice(): boolean {
  // Only an explicit pick (landing ?lang=, shared cookie applied via
  // getStoredLocale, or a toggle click) counts. applyLocale writes the
  // cookie on every boot, so testing the cookie itself hid the language
  // gate and made ES look like it had vanished.
  return safeGetItem(CHOSEN_KEY) === "1";
}

export function getStoredLocale(): Locale {
  // Deep link from landing wins once, then we persist.
  const fromUrl = readLocaleFromUrl();
  if (fromUrl) {
    safeSetItem(STORAGE_KEY, fromUrl);
    writeLocaleCookie(fromUrl);
    markLocaleChosen();
    safeSetItem(RESET_MARKER_KEY, RESET_VERSION);
    return fromUrl;
  }

  // Until this browser acknowledges the current reset version, drop any stored
  // locale so everyone re-enters through the English default. The marker makes
  // this a one-time purge, so a later explicit PT/ES choice still sticks.
  // Cookie from landing (.lastre.io) is allowed through as intentional choice.
  const fromCookie = readLocaleCookie();
  if (fromCookie && isLocale(fromCookie)) {
    if (safeGetItem(RESET_MARKER_KEY) !== RESET_VERSION) {
      safeSetItem(RESET_MARKER_KEY, RESET_VERSION);
    }
    safeSetItem(STORAGE_KEY, fromCookie);
    markLocaleChosen();
    return fromCookie;
  }

  if (safeGetItem(RESET_MARKER_KEY) !== RESET_VERSION) {
    safeRemoveItem(STORAGE_KEY);
    safeSetItem(RESET_MARKER_KEY, RESET_VERSION);
    return "en";
  }
  return normalizeLocale(safeGetItem(STORAGE_KEY));
}

export function applyLocale(locale: Locale): void {
  const normalized = normalizeLocale(locale);
  if (typeof document !== "undefined") {
    document.documentElement.lang =
      normalized === "pt" ? "pt-BR" : normalized === "es" ? "es" : "en";
  }
  safeSetItem(STORAGE_KEY, normalized);
  writeLocaleCookie(normalized);
}

export function initLocale(): Locale {
  const locale = getStoredLocale();
  applyLocale(locale);
  // Clean ?lang= from the URL after applying (keep other params like rail=1).
  if (typeof window !== "undefined" && readLocaleFromUrl()) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("lang");
      url.searchParams.delete("locale");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    } catch {
      // ignore
    }
  }
  return locale;
}
