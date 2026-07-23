"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CONTENT,
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  type SiteStrings,
} from "./content";

const STORAGE_KEY = "avp.locale";

type LocaleCtx = {
  locale: Locale;
  t: SiteStrings;
  setLocale: (next: Locale) => void;
};

const Ctx = createContext<LocaleCtx | null>(null);

const isLocale = (v: unknown): v is Locale =>
  typeof v === "string" && (LOCALES as readonly string[]).includes(v);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Always start on DEFAULT_LOCALE so the client's first render matches the
  // server HTML; the stored/negotiated preference is applied in the effect
  // below, after hydration.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    let preferred: Locale | null = null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) preferred = stored;
    } catch {
      // private mode / blocked storage — fall through to language negotiation
    }
    if (!preferred && navigator.language?.toLowerCase().startsWith("vi")) {
      preferred = "vi";
    }
    if (preferred && preferred !== DEFAULT_LOCALE) setLocaleState(preferred);
  }, []);

  // Keep the document language in sync so screen readers and the browser's
  // own translation prompt read the page correctly.
  useEffect(() => {
    document.documentElement.lang = CONTENT[locale].htmlLang;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // non-fatal: the toggle still works for this session
    }
  }, []);

  const value = useMemo<LocaleCtx>(
    () => ({ locale, t: CONTENT[locale], setLocale }),
    [locale, setLocale]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
