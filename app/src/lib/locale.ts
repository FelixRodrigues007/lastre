const STORAGE_KEY = "lastro-locale";

export type Locale = "en" | "pt";

export function getStoredLocale(): Locale {
  if (typeof localStorage === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "pt" ? "pt" : "en";
}

export function applyLocale(locale: Locale): void {
  document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
  localStorage.setItem(STORAGE_KEY, locale);
}

export function initLocale(): Locale {
  const locale = getStoredLocale();
  applyLocale(locale);
  return locale;
}
