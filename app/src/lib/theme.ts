const STORAGE_KEY = "lastro-app-theme";
export const THEME_CHANGE_EVENT = "lastre-theme-change";

export type Theme = "dark" | "light";
let previewTheme: Theme | undefined;
function embeddedTheme(): Theme | null {
  if (!import.meta.env.DEV) return null;
  const value = window.frameElement?.getAttribute("data-preview-theme");
  return value === "dark" || value === "light" ? value : null;
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const embedded = embeddedTheme();
  if (embedded) return previewTheme ?? embedded;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  if (embeddedTheme()) previewTheme = theme;
  else localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function initTheme(): Theme {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}
