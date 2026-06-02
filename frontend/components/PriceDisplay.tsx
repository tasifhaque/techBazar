"use client";

import { useCurrency } from "@/store/currency";

interface Props {
  amount: number;
  className?: string;
  strike?: boolean;
}

export default function PriceDisplay({ amount, className = "", strike = false }: Props) {
  const currency = useCurrency((s) => s.currency);
  const format = useCurrency((s) => s.format);
  return (
    <span className={`${strike ? "line-through text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"} ${className}`}>
      {format(amount)}
    </span>
  );
}
