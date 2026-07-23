import type { Locale } from "../i18n/translations";

const STORAGE_KEY = "lastro-locale";

// One-time migration marker shared in spirit with the app console: the landing
// is English-first, so any browser still carrying a locale saved before this
// fix (e.g. a "pt" from earlier testing) resets to English exactly once. Bump
// the version to force another reset later if ever needed.
const RESET_MARKER_KEY = "lastro-locale-reset";
const RESET_VERSION = "2026-07-en-default";

/** English is the default; only an exact "pt" opts into Portuguese. */
export function normalizeLocale(value: unknown): Locale {
  return value === "pt" ? "pt" : "en";
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

export function getStoredLocale(): Locale {
  // Purge any pre-fix locale once so every visitor re-enters through the
  // English default; the marker keeps it one-time so a later explicit PT
  // choice still persists.
  if (safeGetItem(RESET_MARKER_KEY) !== RESET_VERSION) {
    safeRemoveItem(STORAGE_KEY);
    safeSetItem(RESET_MARKER_KEY, RESET_VERSION);
    return "en";
  }
  return normalizeLocale(safeGetItem(STORAGE_KEY));
}

export function persistLocale(locale: Locale): void {
  safeSetItem(STORAGE_KEY, normalizeLocale(locale));
}
