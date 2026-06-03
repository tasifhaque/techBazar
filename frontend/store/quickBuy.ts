import { create } from "zustand";
import type { CartItem } from "./cart";

interface QuickBuyState {
  item: CartItem | null;
  setItem: (item: CartItem) => void;
  clearItem: () => void;
}

export const useQuickBuy = create<QuickBuyState>()((set) => ({
  item: null,
  setItem: (item) => set({ item }),
  clearItem: () => set({ item: null }),
}));
