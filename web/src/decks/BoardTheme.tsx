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

/* Only sheets that carry a drawing can be turned dark, so the header cannot
 * decide on its own whether to offer the switch — the board on screen says so.
 * Boards register while mounted; the count is what makes the control appear. */
type Ctx = {
  theme: BoardTheme;
  setTheme: (next: BoardTheme) => void;
  boards: number;
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
  const [boards, setBoards] = useState(0);

  const setTheme = useCallback((next: BoardTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage can be unavailable; the choice just does not outlive the tab.
    }
  }, []);

  const register = useCallback(() => {
    setBoards((n) => n + 1);
    return () => setBoards((n) => n - 1);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, boards, register }),
    [theme, setTheme, boards, register],
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

/** Announce a board for as long as it is on screen. */
export function useAnnounceBoard() {
  const { register } = useBoardTheme();
  useEffect(() => register(), [register]);
}
