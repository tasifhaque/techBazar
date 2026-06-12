import type { Locale } from "@/store/locale";

export type TranslationMap = Record<string, string>;

export interface TranslationsResponse {
  locale: Locale;
  translations: TranslationMap;
}

const API_BASE = "/api";
let cachedTranslations: TranslationMap | null = null;
let cachedLocale: Locale | null = null;

/**
 * Fetch translations for a given locale.
 * Uses an in-memory cache so repeated calls are instant.
 * Always returns a map (possibly empty) — never throws.
 */
export async function fetchTranslations(locale: Locale): Promise<TranslationMap> {
  // Return cache if we already have this locale loaded
  if (cachedLocale === locale && cachedTranslations) {
    return cachedTranslations;
  }

  try {
    const res = await fetch(`${API_BASE}/translations/${locale}`, {
      cache: "no-store",
      // Add a reasonable timeout so the page doesn't hang forever
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.warn(`[i18n] Translations fetch failed: ${res.status} ${res.statusText} for locale "${locale}"`);
      // Still mark as loaded so the UI renders (with raw keys as fallback)
      return {};
    }

    const data: TranslationsResponse = await res.json();

    if (!data || !data.translations || typeof data.translations !== "object") {
      console.warn(`[i18n] Unexpected translation response shape for locale "${locale}":`, data);
      return {};
    }

    cachedLocale = data.locale;
    cachedTranslations = data.translations;
    return data.translations;
  } catch (err) {
    // AbortError means timeout — not critical, just log it
    if (err instanceof DOMException && err.name === "AbortError") {
      console.warn(`[i18n] Translation fetch timed out for locale "${locale}"`);
    } else {
      console.error(`[i18n] Translation fetch error for locale "${locale}":`, err);
    }
    return {};
  }
}

export function clearTranslationCache() {
  cachedTranslations = null;
  cachedLocale = null;
}
