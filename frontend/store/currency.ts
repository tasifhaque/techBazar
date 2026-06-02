import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "JPY" | "MYR" | "BDT";

export const currencies: Record<CurrencyCode, { symbol: string; label: string; rate: number }> = {
  USD: { symbol: "$", label: "USD", rate: 1 },
  EUR: { symbol: "€", label: "EUR", rate: 0.92 },
  GBP: { symbol: "£", label: "GBP", rate: 0.79 },
  INR: { symbol: "₹", label: "INR", rate: 83.0 },
  JPY: { symbol: "¥", label: "JPY", rate: 150.0 },
  MYR: { symbol: "RM", label: "MYR", rate: 4.4 },
  BDT: { symbol: "৳", label: "BDT", rate: 120.0 },
};

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  format: (amount: number) => string;
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: "USD",
      setCurrency: (code) => set({ currency: code }),
      format: (amount) => {
        const c = currencies[get().currency];
        const converted = amount * c.rate;
        return `${c.symbol}${converted.toFixed(2)}`;
      },
    }),
    { name: "currency-preference" }
  )
);
