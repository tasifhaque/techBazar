"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, Zap } from "lucide-react";
import { type Product, getProductImageUrl } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useQuickBuy } from "@/store/quickBuy";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";
import { useRouter } from "next/navigation";
import PriceDisplay from "@/components/PriceDisplay";
import ProductImage from "@/components/ProductImage";
import { useI18n } from "@/lib/i18n-context";

interface Props {
  products: Product[];
}

export default function HeroCarousel({ products }: Props) {
  const { t, isLoaded } = useI18n();
  const [current, setCurrent] = useState(0);
  const addItem = useCart((s) => s.addItem);
  const setQuickBuyItem = useQuickBuy((s) => s.setItem);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % products.length);
  }, [products.length]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (products.length <= 1) return;
    const t = setInterval(next, 10000);
    return () => clearInterval(t);
  }, [next, products.length]);

  const handleAddToCart = (product: Product) => {
    if (authLoading) return;
    if (!isAuthenticated) {
      addToast(t("auth.guard.add_to_cart"), "info");
      setTimeout(() => router.push("/login"), 800);
      return;
    }
    addItem({
      productId: product._id, title: product.title, price: product.price,
      discountPercentage: product.discountPercentage, image: getProductImageUrl(product),
    });
  };

  const handleBuyNow = (product: Product) => {
    if (authLoading) return;
    if (!isAuthenticated) {
      addToast(t("auth.guard.purchase"), "info");
      setTimeout(() => router.push("/login"), 800);
      return;
    }
    setQuickBuyItem({
      productId: product._id, title: product.title, price: product.price,
      discountPercentage: product.discountPercentage, image: getProductImageUrl(product), quantity: 1,
    });
    router.push("/checkout");
  };

  if (products.length === 0) {
    // If translations haven't loaded yet, show a skeleton to avoid
    // flashing raw translation keys like "hero.no_products"
    if (!isLoaded) {
      return (
        <div className="h-[80vh] min-h-[420px] sm:min-h-[500px] lg:min-h-[600px] bg-[var(--bg-secondary)] animate-pulse" />
      );
    }
    return (
      <div className="h-[80vh] min-h-[420px] sm:min-h-[500px] lg:min-h-[600px] flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border)]">
        <p className="text-lg text-[var(--text-tertiary)] font-serif">{t("hero.no_products")}</p>
      </div>
    );
  }

  const product = products[current];
  const discountedPrice = product.price * (1 - product.discountPercentage / 100);
  const image = getProductImageUrl(product);

  return (
    <div className="relative h-[80vh] min-h-[420px] sm:min-h-[500px] lg:min-h-[600px] max-h-[1000px] overflow-hidden bg-[#050505]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          {/* ─── Full-bleed editorial image ─── */}
          {image ? (
            <div className="absolute inset-0">
              <ProductImage
                src={image}
                alt=""
                fill
                sizes="100vw"
                priority={current === 0}
                loading={current === 0 ? "eager" : "lazy"}
                className="object-cover"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-[#050505]/30" />
              {/* Vignette */}
              <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 200px rgba(0,0,0,0.6)" }} />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
              <span className="text-[8px] text-white/20 uppercase tracking-[0.3em]">No Image</span>
            </div>
          )}

          {/* ─── Editorial content overlay ─── */}
          <div className="relative z-10 w-full h-full flex items-end">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 pb-12 sm:pb-16 md:pb-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="max-w-2xl"
              >
                {/* Issue number / category */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <span className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-mono">
                    {product.category}
                  </span>
                  <span className="w-6 h-px bg-[var(--accent)]/40" />
                  <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-mono">
                    {product.brand}
                  </span>
                </div>

                {/* Magazine-style title */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-[0.9] tracking-tight text-white mb-4">
                  {product.title}
                </h1>

                {/* Thin decorative line */}
                <div className="w-12 sm:w-16 h-[1.5px] bg-gradient-to-r from-[var(--accent)]/60 to-transparent mb-4 sm:mb-5" />

                {/* Description */}
                <p className="text-sm md:text-base text-white/30 max-w-lg leading-relaxed mb-6 sm:mb-8 line-clamp-2 font-light tracking-wide">
                  {product.description}
                </p>

                {/* Price and CTAs */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl md:text-3xl font-serif font-bold text-white">
                      <PriceDisplay amount={discountedPrice} />
                    </span>
                    {product.discountPercentage > 0 && (
                      <span className="text-sm text-white/20 line-through">
                        <PriceDisplay amount={product.price} />
                      </span>
                    )}
                    {product.discountPercentage > 0 && (
                      <span className="px-2.5 py-1 bg-red-500/40 text-white text-[9px] font-semibold uppercase tracking-wider">
                        -{Math.round(product.discountPercentage)}%
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 sm:gap-2.5">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-400 ${
                        !isAuthenticated
                          ? "border border-white/10 text-white/30 hover:border-white/30 hover:text-white/50"
                          : "group border border-white/15 text-white/70 hover:bg-white hover:text-[#0a0a0a]"
                      }`}
                    >
                      <ShoppingCart size={11} className="sm:size-[12px]" />
                      {t("hero.add_to_cart")}
                    </button>
                    <button
                      onClick={() => handleBuyNow(product)}
                      disabled={product.stock === 0}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-400 ${
                        !isAuthenticated
                          ? "bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent-hover)]/20 text-white/30 hover:from-[var(--accent)]/30 hover:to-[var(--accent-hover)]/30 hover:text-white/50"
                          : "group bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-[#0a0a0a] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                      }`}
                    >
                      <Zap size={11} className="sm:size-[12px]" />
                      {t("hero.buy_now")}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Gold shimmer */}
          <motion.div
            key={`shimmer-${current}`}
            initial={{ left: "-40%" }}
            animate={{ left: "140%" }}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-0 w-[50%] h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent z-20 pointer-events-none"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {products.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white/20 hover:text-white/50 transition-all duration-300 z-20">
            <ChevronLeft size={18} className="sm:size-[20px]" />
          </button>
          <button onClick={next} className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white/20 hover:text-white/50 transition-all duration-300 z-20">
            <ChevronRight size={18} className="sm:size-[20px]" />
          </button>
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 z-20">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); }}
                className={`relative overflow-hidden transition-all duration-500 ease-out ${
                  i === current ? "w-10 h-[2px] bg-white/10" : "w-2 h-[2px] bg-white/20 hover:bg-white/40"
                }`}
              >
                {i === current && (
                  <motion.div
                    key={`prog-${current}`}
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5.8, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
