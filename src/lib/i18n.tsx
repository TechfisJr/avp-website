"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Locale = "en" | "vi";

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (en: string, vi: string) => string;
};

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (en: string) => en,
});

const STORAGE_KEY = "avp-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "en" || stored === "vi") {
      setLocaleState(stored);
    } else {
      const browserLang = navigator.language?.toLowerCase() || "";
      if (browserLang.startsWith("vi")) {
        setLocaleState("vi");
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (en: string, vi: string) => (locale === "vi" ? vi : en),
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}