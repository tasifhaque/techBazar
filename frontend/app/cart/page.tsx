"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, ArrowLeft, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import PriceDisplay from "@/components/PriceDisplay";
import { useI18n } from "@/lib/i18n-context";

export default function CartPage() {
  const { t } = useI18n();
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const total = useCart((s) => s.total);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = "Cart";
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
          <div className="w-16 h-16 border border-[var(--accent)]/30 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={28} className="text-[var(--accent)]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] mb-2">{t("cart.empty_title")}</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">{t("cart.empty_desc")}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--accent)] text-[var(--accent)] text-xs font-medium tracking-wider hover:bg-[var(--accent)] hover:text-white transition-all duration-300"
          >
            <ArrowLeft size={15} />
            {t("cart.continue_shopping")}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-wide mb-10">
            {t("cart.title")} <span className="text-[var(--text-tertiary)] font-sans text-lg">({items.length})</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const discountedPrice = item.price * (1 - item.discountPercentage / 100);
                return (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-4 md:p-5 bg-[var(--bg-card)] border border-[var(--border)]"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-20 h-20 md:w-24 md:h-24 object-cover bg-[var(--bg-tertiary)]" />
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] text-xs">No img</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-[var(--text-primary)] text-sm md:text-base truncate">{item.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        <PriceDisplay amount={discountedPrice} /> {t("cart.each")}
                      </p>
                      {/* Quantity */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-[var(--text-primary)]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm md:text-base font-serif font-bold text-[var(--accent)]">
                        <PriceDisplay amount={discountedPrice * item.quantity} />
                      </p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="mt-2 text-[10px] text-[var(--text-tertiary)] hover:text-[var(--danger)] uppercase tracking-wider transition-colors"
                      >
                        {t("cart.remove")}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 md:p-8 sticky top-24">
                <h3 className="text-sm font-serif font-bold text-[var(--text-primary)] tracking-wide mb-6 uppercase">
                  {t("cart.order_summary")}
                </h3>
                <div className="space-y-3 mb-6 pb-6 border-b border-[var(--border)]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{t("cart.subtotal")}</span>
                    <span className="text-[var(--text-primary)] font-medium"><PriceDisplay amount={total()} /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{t("cart.shipping")}</span>
                    <span className="text-[var(--success)] font-medium">{t("cart.free")}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-sm font-serif font-bold text-[var(--text-primary)]">{t("cart.total")}</span>
                  <span className="text-xl font-serif font-bold text-[var(--accent)]">
                    <PriceDisplay amount={total()} />
                  </span>
                </div>
                  <button
                    onClick={() => router.push("/checkout")}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--accent)] text-white text-xs font-medium tracking-wider hover:bg-[var(--accent-hover)] transition-all duration-300"
                >
                  <Zap size={15} />
                  {t("cart.proceed_to_checkout")}
                </button>
                <Link
                  href="/products"
                  className="block text-center mt-3 text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] uppercase tracking-wider transition-colors"
                >
                  {t("cart.continue_shopping")}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
