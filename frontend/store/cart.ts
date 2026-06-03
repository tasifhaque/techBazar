import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  discountPercentage: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  total: () => number;
}

const STORAGE_KEY = "cart-contents";

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const state = get();
        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
          const items = state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: Math.min(i.quantity + 1, 99) }
              : i
          );
          set({ items });
        } else {
          const items = [...state.items, { ...item, quantity: 1 }];
          set({ items });
        }
      },
      removeItem: (productId) => {
        const items = get().items.filter((i) => i.productId !== productId);
        set({ items });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          const items = get().items.filter((i) => i.productId !== productId);
          set({ items });
          return;
        }
        const items = get().items.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(quantity, 99) } : i
        );
        set({ items });
      },
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      total: () =>
        get().items.reduce((sum, i) => {
          const discounted = i.price * (1 - i.discountPercentage / 100);
          return sum + discounted * i.quantity;
        }, 0),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
