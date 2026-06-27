import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translations, type Locale, type TranslationKey } from "../i18n/translations";

type Toast = { id: number; message: string };

type SiteContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  highContrast: boolean;
  toggleHighContrast: () => void;
  tamperCompleted: boolean;
  markTamperCompleted: () => void;
  toast: (message: string) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  scrollDepth: number;
  setScrollDepth: (n: number) => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("lastro-locale");
    return saved === "pt" ? "pt" : "en";
  });
  const [highContrast, setHighContrast] = useState(() =>
    document.documentElement.dataset.contrast === "high",
  );
  const [tamperCompleted, setTamperCompleted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [scrollDepth, setScrollDepth] = useState(0);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("lastro-locale", next);
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((v) => {
      const next = !v;
      if (next) document.documentElement.dataset.contrast = "high";
      else delete document.documentElement.dataset.contrast;
      localStorage.setItem("lastro-contrast", next ? "high" : "default");
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
    if (localStorage.getItem("lastro-contrast") === "high") {
      document.documentElement.dataset.contrast = "high";
      setHighContrast(true);
    }
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey) => translations[locale][key] ?? translations.en[key],
    [locale],
  );

  const toast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markTamperCompleted = useCallback(() => setTamperCompleted(true), []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      highContrast,
      toggleHighContrast,
      tamperCompleted,
      markTamperCompleted,
      toast,
      toasts,
      dismissToast,
      scrollDepth,
      setScrollDepth,
    }),
    [
      locale,
      setLocale,
      t,
      highContrast,
      toggleHighContrast,
      tamperCompleted,
      markTamperCompleted,
      toast,
      toasts,
      dismissToast,
      scrollDepth,
    ],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
