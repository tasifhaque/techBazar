import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "bn";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "locale-preference" }
  )
);
