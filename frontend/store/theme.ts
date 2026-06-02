import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDark: boolean;
  hydrated: boolean;
  toggle: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      hydrated: false,
      toggle: () =>
        set((state) => {
          const newDark = !state.isDark;
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newDark);
          }
          return { isDark: newDark };
        }),
    }),
    {
      name: "theme-preference",
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            useTheme.setState({ hydrated: true, isDark: state.isDark });
          }
        };
      },
    }
  )
);
