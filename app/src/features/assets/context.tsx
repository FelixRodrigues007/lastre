import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { api, ProductError, type Workspace } from "./api";
type Context = {
  data: Workspace | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  clear: () => void;
};
const AssetsContext = createContext<Context | null>(null);
export function AssetsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const sequence = useRef(0);
  const reload = useCallback(async () => {
    const current = ++sequence.current;
    try {
      const result = await api.workspace();
      if (current === sequence.current) {
        setData(result);
        setError(null);
      }
    } catch (cause) {
      const e =
        cause instanceof Error
          ? cause
          : new Error("Não foi possível carregar a organização.");
      if (current === sequence.current) {
        setError(e);
        if (e instanceof ProductError && e.status === 401) setData(null);
      }
      throw e;
    } finally {
      if (current === sequence.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload().catch(() => {});
  }, [reload]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void reload().catch(() => {});
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [reload]);
  return (
    <AssetsContext.Provider
      value={{
        data,
        loading,
        error,
        reload,
        clear: () => {
          sequence.current++;
          setData(null);
          setError(null);
        },
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
}
export function useAssets() {
  const value = useContext(AssetsContext);
  if (!value) throw new Error("AssetsProvider missing");
  return value;
}
export function useWorkspace() {
  const context = useAssets();
  if (!context.data) throw new Error("Workspace not loaded");
  return { ...context, data: context.data };
}
