import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type BoardTheme = "light" | "dark";

/* Not every sheet can be turned dark — a sheet of figures is drawn for paper
 * and stays there — so the header cannot decide on its own whether to offer
 * the switch. The surface on screen says so: the drawer and any sheet carrying
 * a drawing announce themselves while mounted, and the count is what makes the
 * control appear. */
type Ctx = {
  theme: BoardTheme;
  setTheme: (next: BoardTheme) => void;
  themed: number;
  register: () => () => void;
};

const BoardThemeContext = createContext<Ctx | null>(null);

const KEY = "lastre-board-theme";

const read = (): BoardTheme => {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export function BoardThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<BoardTheme>(read);
  const [themed, setThemed] = useState(0);

  const setTheme = useCallback((next: BoardTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage can be unavailable; the choice just does not outlive the tab.
    }
  }, []);

  const register = useCallback(() => {
    setThemed((n) => n + 1);
    return () => setThemed((n) => n - 1);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, themed, register }),
    [theme, setTheme, themed, register],
  );

  return (
    <BoardThemeContext.Provider value={value}>
      {children}
    </BoardThemeContext.Provider>
  );
}

export function useBoardTheme(): Ctx {
  const ctx = useContext(BoardThemeContext);
  if (!ctx) throw new Error("useBoardTheme outside BoardThemeProvider");
  return ctx;
}

/** Announce a theme-following surface for as long as it is on screen. */
export function useAnnounceThemed() {
  const { register } = useBoardTheme();
  useEffect(() => register(), [register]);
}
