import type { Locale } from "@/store/locale";

export type TranslationMap = Record<string, string>;

export interface TranslationsResponse {
  locale: Locale;
  translations: TranslationMap;
}

const API_BASE = "/api";
let cachedTranslations: TranslationMap | null = null;
let cachedLocale: Locale | null = null;

export async function fetchTranslations(locale: Locale): Promise<TranslationMap> {
  // Return cache if we already have this locale loaded
  if (cachedLocale === locale && cachedTranslations) {
    return cachedTranslations;
  }

  try {
    const res = await fetch(`${API_BASE}/translations/${locale}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`Failed to fetch translations for ${locale}, falling back to empty map`);
      return {};
    }

    const data: TranslationsResponse = await res.json();
    cachedLocale = data.locale;
    cachedTranslations = data.translations;
    return data.translations;
  } catch (err) {
    console.error("Translation fetch error:", err);
    return {};
  }
}

export function clearTranslationCache() {
  cachedTranslations = null;
  cachedLocale = null;
}
