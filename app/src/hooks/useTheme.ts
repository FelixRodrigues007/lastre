import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  applyTheme,
  getStoredTheme,
  THEME_CHANGE_EVENT,
  type Theme,
} from "../lib/theme";

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** All menus and pages observe one preference instead of keeping competing state. */
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getStoredTheme,
    () => "dark" as Theme,
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  const setTheme = useCallback((next: Theme) => applyTheme(next), []);
  const toggleTheme = useCallback(
    () => applyTheme(getStoredTheme() === "dark" ? "light" : "dark"),
    [],
  );
  return { theme, setTheme, toggleTheme };
}
