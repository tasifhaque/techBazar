"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useLocale, type Locale } from "@/store/locale";
import { fetchTranslations, clearTranslationCache } from "./i18n";
import type { TranslationMap } from "./i18n";
import enTranslations from "../translations/en.json";

interface I18nContextValue {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: Locale;
  switchLocale: (locale: Locale) => Promise<void>;
  translations: TranslationMap;
  isLoaded: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useLocale();
  const [translations, setTranslations] = useState<TranslationMap>(enTranslations);
  const [isLoaded, setIsLoaded] = useState(true);
  const mountedRef = useRef(true);

  // Load translations from backend when locale changes (non-English)
  useEffect(() => {
    if (locale === "en") return;
    mountedRef.current = true;
    setIsLoaded(false);

    async function load() {
      try {
        const data = await fetchTranslations(locale);
        if (mountedRef.current) {
          setTranslations(data);
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("[I18nProvider] Unexpected error loading translations:", err);
        if (mountedRef.current) {
          setIsLoaded(true);
        }
      }
    }

    load();

    return () => {
      mountedRef.current = false;
    };
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = translations[key];
      if (value === undefined) {
        value = key;
      }
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, String(v));
        });
      }
      return value;
    },
    [isLoaded, translations]
  );

  const switchLocale = useCallback(
    async (newLocale: Locale) => {
      if (newLocale === locale) return;
      clearTranslationCache();
      setLocale(newLocale);
    },
    [locale, setLocale]
  );

  return (
    <I18nContext.Provider value={{ t, locale, switchLocale, translations, isLoaded }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback for when used outside provider — mostly for auth pages
    return {
      t: (key: string) => key,
      locale: "en",
      switchLocale: async () => {},
      translations: {},
      isLoaded: false,
    };
  }
  return ctx;
}
