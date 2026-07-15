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
import { getContent, type SiteContent } from "../i18n/content";
import { getStoredLocale, persistLocale } from "../lib/locale";

type Toast = { id: number; message: string };

type SiteContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  content: SiteContent;
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
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());
  const [highContrast, setHighContrast] = useState(() =>
    document.documentElement.dataset.contrast === "high",
  );
  const [tamperCompleted, setTamperCompleted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [scrollDepth, setScrollDepth] = useState(0);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
    const meta = getContent(next).meta;
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
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
    const meta = getContent(locale).meta;
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
    if (localStorage.getItem("lastro-contrast") === "high") {
      document.documentElement.dataset.contrast = "high";
      setHighContrast(true);
    }
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey) => translations[locale][key] ?? translations.en[key],
    [locale],
  );

  const siteContent = useMemo(() => getContent(locale), [locale]);

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
      content: siteContent,
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
      siteContent,
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
