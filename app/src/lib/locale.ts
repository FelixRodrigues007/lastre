const STORAGE_KEY = "lastro-locale";

// One-time migration marker. The console is English-first: any browser that
// still carries a locale saved before this fix (e.g. a "pt" left over from
// heavy PT testing) must fall back to the English default exactly once. Bump
// this version string to force another reset in the future if ever needed.
const RESET_MARKER_KEY = "lastro-locale-reset";
const RESET_VERSION = "2026-07-en-default";

export type Locale = "en" | "pt";

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

export function getStoredLocale(): Locale {
  // Until this browser acknowledges the current reset version, drop any stored
  // locale so everyone re-enters through the English default. The marker makes
  // this a one-time purge, so a later explicit PT choice still sticks.
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
    document.documentElement.lang = normalized === "pt" ? "pt-BR" : "en";
  }
  safeSetItem(STORAGE_KEY, normalized);
}

export function initLocale(): Locale {
  const locale = getStoredLocale();
  applyLocale(locale);
  return locale;
}
