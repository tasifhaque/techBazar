"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Zap, Package } from "lucide-react";
import { type Product } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useQuickBuy } from "@/store/quickBuy";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PriceDisplay from "@/components/PriceDisplay";
import { useI18n } from "@/lib/i18n-context";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { t } = useI18n();
  const addItem = useCart((s) => s.addItem);
  const setQuickBuyItem = useQuickBuy((s) => s.setItem);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [bought, setBought] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const discountedPrice = product.price * (1 - (product.discountPercentage || 0) / 100);
  const image = product.images?.[0] || null;

  const handleAuthGuard = (action: "cart" | "buy"): boolean => {
    if (authLoading) return true;
    if (!isAuthenticated) {
      addToast(t(action === "buy" ? "auth.guard.purchase" : "auth.guard.add_to_cart"), "info");
      setTimeout(() => router.push("/login"), 800);
      return true;
    }
    return false;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (handleAuthGuard("cart")) return;
    addItem({
      productId: product._id, title: product.title, price: product.price,
      discountPercentage: product.discountPercentage, image: image || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (handleAuthGuard("buy")) return;
    setQuickBuyItem({
      productId: product._id, title: product.title, price: product.price,
      discountPercentage: product.discountPercentage, image: image || "", quantity: 1,
    });
    setBought(true);
    setTimeout(() => { setBought(false); router.push("/checkout"); }, 300);
  };

  const handleNavigate = () => {
    router.push(`/products/${product.category}/${product.brand}/${product.model}`);
  };

  const spec = product.specifications ? Object.entries(product.specifications)[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="group bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden flex flex-col cursor-pointer hover:border-[var(--accent)]/30 hover:shadow-[0_0_40px_rgba(212,175,55,0.06)] transition-all duration-500"
      onClick={handleNavigate}
    >
      {/* Image - cinematic 16:9 with decorative overlay */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0d0d0d]">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 z-[1] pointer-events-none" />
        {image ? (
          <>
            <img
              src={image}
              alt={product.title}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {/* Subtle gradient at bottom of image */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/40 to-transparent z-[2]" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
            <Package size={32} />
          </div>
        )}

        {/* Discount badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-4 right-4 z-[3]">
            <div className="px-2.5 py-1 bg-[var(--danger)] text-white text-[8px] font-bold uppercase tracking-[0.15em] shadow-lg">
              -{Math.round(product.discountPercentage)}%
            </div>
          </div>
        )}

        {/* Hover gold accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[var(--accent)] group-hover:w-3/4 transition-all duration-500 ease-out z-[3]" />

        {/* Category badge bottom-left */}
        <div className="absolute bottom-4 left-4 z-[3]">
          <span className="text-[8px] text-white/60 uppercase tracking-[0.2em] font-medium drop-shadow-lg">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 md:px-6 md:py-5 flex flex-col flex-1">
        {/* Brand + Model row */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="text-[9px] text-[var(--accent)] font-semibold uppercase tracking-[0.25em]">
            {product.brand}
          </span>
          <span className="w-px h-3 bg-[var(--border)]/40" />
          <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-[0.15em]">
            {product.model}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-[var(--text-primary)] line-clamp-1 text-sm md:text-base mb-1.5 group-hover:text-[var(--accent)] transition-colors duration-300">
          {product.title}
        </h3>

        {/* One key spec */}
        {spec && (
          <p className="text-[10px] text-[var(--text-tertiary)] mb-3 uppercase tracking-[0.1em]">
            {spec[0]}: {spec[1]}
          </p>
        )}

        {/* Divider */}
        <div className="w-8 h-px bg-[var(--accent)]/20 mb-3" />

        {/* Price row */}
        <div className="flex items-baseline gap-2.5 mt-auto mb-4">
          <span className="text-lg md:text-xl font-serif font-bold text-[var(--accent)] tracking-tight">
            <PriceDisplay amount={discountedPrice} />
          </span>
          {product.discountPercentage > 0 && (
            <span className="text-[11px] text-[var(--text-tertiary)] line-through">
              <PriceDisplay amount={product.price} />
            </span>
          )}
          <span className="ml-auto text-[9px] text-[var(--text-tertiary)] font-medium">
            {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
          </span>
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
              !isAuthenticated
                ? "border border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--accent)]/30 hover:text-[var(--accent)]/60"
                : added
                  ? "bg-[var(--success)] text-white"
                  : "border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)]"
            }`}
          >
            <ShoppingCart size={11} />
            {added ? t("product.added") : t("product.add_to_cart")}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
              !isAuthenticated
                ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]/60"
                : "bg-[var(--accent)] text-[var(--bg-primary)] hover:shadow-[0_0_24px_rgba(212,175,55,0.25)]"
            }`}
          >
            <Zap size={11} />
            {bought ? "..." : t("product.buy_now")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
