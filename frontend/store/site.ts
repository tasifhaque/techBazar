import { create } from "zustand";
import { api } from "@/lib/api";

const DEFAULT_SITE_NAME = "LUXE";

interface SiteState {
  siteName: string;
  loaded: boolean;
  fetch: () => Promise<void>;
  updateSiteName: (name: string) => Promise<void>;
}

export const useSite = create<SiteState>((set) => ({
  siteName: DEFAULT_SITE_NAME,
  loaded: false,
  fetch: async () => {
    try {
      const data = await api.settings.get();
      set({ siteName: data.siteName, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  updateSiteName: async (name: string) => {
    await api.settings.update({ siteName: name });
    set({ siteName: name });
  },
}));
