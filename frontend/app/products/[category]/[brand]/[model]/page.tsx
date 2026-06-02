"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart, Zap, ChevronLeft, ChevronRight, Package, Clock, Shield,
  Cpu, HardDrive, Battery, Camera, Weight, Maximize, Wifi, Bluetooth,
  Droplet, Hash, Zap as ZapIcon, Ruler, Disc, Eye, Box, Layers, TrendingUp, Star, Monitor
} from "lucide-react";
import { ProductDetailSkeleton } from "@/components/SkeletonLoader";
import { api, type Product } from "@/lib/api";
import { useCart } from "@/store/cart";
import PriceDisplay from "@/components/PriceDisplay";
import { useAuth } from "@/store/auth";
import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";

const categorySpecs: Record<string, Array<{ key: string; label: string; icon: React.ElementType }>> = {
  mobile: [
    { key: "display", label: "Display", icon: Maximize },
    { key: "processor", label: "Processor", icon: Cpu },
    { key: "ram", label: "RAM", icon: Disc },
    { key: "storage", label: "Storage", icon: HardDrive },
    { key: "battery", label: "Battery", icon: Battery },
    { key: "camera", label: "Camera", icon: Camera },
    { key: "charger", label: "Charger", icon: ZapIcon },
    { key: "os", label: "OS", icon: Monitor },
    { key: "weight", label: "Weight", icon: Weight },
    { key: "height", label: "Height", icon: Ruler },
    { key: "connectivity", label: "Connectivity", icon: Wifi },
  ],
  laptop: [
    { key: "processor", label: "Processor", icon: Cpu },
    { key: "ram", label: "RAM", icon: Disc },
    { key: "storage", label: "Storage", icon: HardDrive },
    { key: "display", label: "Display", icon: Maximize },
    { key: "gpu", label: "GPU", icon: ZapIcon },
    { key: "battery", label: "Battery", icon: Battery },
    { key: "os", label: "OS", icon: Monitor },
    { key: "weight", label: "Weight", icon: Weight },
  ],
  monitor: [
    { key: "size", label: "Size", icon: Maximize },
    { key: "resolution", label: "Resolution", icon: Eye },
    { key: "refreshRate", label: "Refresh Rate", icon: ZapIcon },
    { key: "panelType", label: "Panel Type", icon: Layers },
    { key: "responseTime", label: "Response Time", icon: Clock },
    { key: "connectivity", label: "Connectivity", icon: Wifi },
  ],
  keyboard: [
    { key: "switchType", label: "Switch Type", icon: Box },
    { key: "layout", label: "Layout", icon: Hash },
    { key: "connectivity", label: "Connectivity", icon: Bluetooth },
    { key: "backlight", label: "Backlight", icon: Eye },
    { key: "weight", label: "Weight", icon: Weight },
  ],
  mouse: [
    { key: "sensor", label: "Sensor", icon: Cpu },
    { key: "dpi", label: "DPI", icon: Hash },
    { key: "buttons", label: "Buttons", icon: Box },
    { key: "connectivity", label: "Connectivity", icon: Bluetooth },
    { key: "weight", label: "Weight", icon: Weight },
  ],
  headphone: [
    { key: "driver", label: "Driver", icon: Disc },
    { key: "frequency", label: "Frequency", icon: ZapIcon },
    { key: "impedance", label: "Impedance", icon: Hash },
    { key: "connectivity", label: "Connectivity", icon: Bluetooth },
    { key: "battery", label: "Battery", icon: Battery },
    { key: "weight", label: "Weight", icon: Weight },
  ],
  cpu: [
    { key: "cores", label: "Cores", icon: Hash },
    { key: "threads", label: "Threads", icon: Layers },
    { key: "baseClock", label: "Base Clock", icon: ZapIcon },
    { key: "boostClock", label: "Boost Clock", icon: TrendingUp },
    { key: "tdp", label: "TDP", icon: Battery },
  ],
  gpu: [
    { key: "vram", label: "VRAM", icon: Disc },
    { key: "coreClock", label: "Core Clock", icon: ZapIcon },
    { key: "memoryType", label: "Memory Type", icon: HardDrive },
    { key: "tdp", label: "TDP", icon: Battery },
  ],
  ram: [
    { key: "capacity", label: "Capacity", icon: Disc },
    { key: "type", label: "Type", icon: Box },
    { key: "speed", label: "Speed", icon: ZapIcon },
    { key: "rgb", label: "RGB", icon: Eye },
  ],
  storage: [
    { key: "capacity", label: "Capacity", icon: HardDrive },
    { key: "type", label: "Type", icon: Box },
    { key: "formFactor", label: "Form Factor", icon: Ruler },
    { key: "readSpeed", label: "Read Speed", icon: ZapIcon },
  ],
  tablet: [
    { key: "display", label: "Display", icon: Maximize },
    { key: "processor", label: "Processor", icon: Cpu },
    { key: "ram", label: "RAM", icon: Disc },
    { key: "storage", label: "Storage", icon: HardDrive },
    { key: "battery", label: "Battery", icon: Battery },
    { key: "camera", label: "Camera", icon: Camera },
    { key: "os", label: "OS", icon: Monitor },
    { key: "weight", label: "Weight", icon: Weight },
  ],
  smartwatch: [
    { key: "display", label: "Display", icon: Maximize },
    { key: "battery", label: "Battery", icon: Battery },
    { key: "os", label: "OS", icon: Monitor },
    { key: "waterResistance", label: "Water Resistance", icon: Droplet },
    { key: "connectivity", label: "Connectivity", icon: Bluetooth },
    { key: "weight", label: "Weight", icon: Weight },
  ],
};

export default function ProductDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const { category, brand, model } = params as { category: string; brand: string; model: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setLoading(true);
    api.products.get(category, brand, model)
      .then((d) => {
        setProduct(d.product);
        document.title = d.product.title;
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [category, brand, model]);

  const handleAddToCart = () => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    const img = product?.images?.[0] || "";
    addItem({
      productId: product!._id, title: product!.title, price: product!.price,
      discountPercentage: product!.discountPercentage, image: img,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    const img = product?.images?.[0] || "";
    addItem({
      productId: product!._id, title: product!.title, price: product!.price,
      discountPercentage: product!.discountPercentage, image: img,
    });
    router.push("/checkout");
  };

  if (loading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border border-[var(--border)] flex items-center justify-center mx-auto mb-4">?</div>
        <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-2">{t("product.not_found_title")}</h2>
        <p className="text-[var(--text-tertiary)] text-sm">{t("product.not_found_desc")}</p>
      </div>
    );
  }

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);
  const images = product.images.length > 0 ? product.images : [];
  const specDefs = categorySpecs[product.category] || [];
  const availableSpecs = specDefs.filter((s) => product.specifications?.[s.key]);
  const allSpecs = Object.entries(product.specifications || {});

  const highlights = [
    { icon: Package, text: t("product.highlights.shipping") },
    { icon: Clock, text: t("product.highlights.delivery") },
    { icon: Shield, text: t("product.highlights.warranty") },
    { icon: Star, text: t("product.highlights.returns") },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] text-[var(--text-tertiary)] mb-8 uppercase tracking-wider">
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">{t("nav.home")}</Link>
          <span className="text-[var(--accent)]">/</span>
          <Link href="/products" className="hover:text-[var(--accent)] transition-colors">{t("nav.products")}</Link>
          <span className="text-[var(--accent)]">/</span>
          <Link href={`/products?category=${category}`} className="hover:text-[var(--accent)] transition-colors capitalize">{category}</Link>
          <span className="text-[var(--accent)]">/</span>
          <span className="text-[var(--text-secondary)]">{brand}</span>
          <span className="text-[var(--accent)]">/</span>
          <span className="text-[var(--text-secondary)]">{model}</span>
        </nav>

        {/* Main product area */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-[var(--bg-tertiary)] overflow-hidden border border-[var(--border)]">
              {images[imageIndex] ? (
                <motion.img
                  key={imageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={images[imageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-xs">No image</div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImageIndex((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImageIndex((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {product.discountPercentage > 0 && (
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-[var(--danger)] text-white text-[10px] font-medium uppercase tracking-wider">
                  -{Math.round(product.discountPercentage)}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border transition-all ${
                      i === imageIndex ? "border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-3 text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.15em] mb-3">
                <span className="text-[var(--accent)] font-medium">{product.brand}</span>
                <span className="w-px h-3 bg-[var(--border)]" />
                <span className="capitalize">{product.category}</span>
                <span className="w-px h-3 bg-[var(--border)]" />
                <span>{product.model}</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-wide leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl md:text-4xl font-serif font-bold text-[var(--accent)]">
                <PriceDisplay amount={discountedPrice} />
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-base text-[var(--text-tertiary)] line-through"><PriceDisplay amount={product.price} /></span>
              )}
            </div>

            {/* Stock & badges */}
            <div className="flex flex-wrap gap-3">
              <span className={`flex items-center gap-2 text-[11px] px-3 py-1.5 border ${product.stock > 0 ? "border-[var(--success)]/30 text-[var(--success)]" : "border-[var(--danger)]/30 text-[var(--danger)]"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`} />
                {product.stock > 0 ? t("product.in_stock", { stock: product.stock }) : t("product.out_of_stock")}
              </span>
              <span className="flex items-center gap-2 text-[11px] px-3 py-1.5 border border-[var(--border)] text-[var(--text-secondary)]">
                <Clock size={12} /> {t("product.express_delivery")}
              </span>
              <span className="flex items-center gap-2 text-[11px] px-3 py-1.5 border border-[var(--border)] text-[var(--text-secondary)]">
                <Shield size={12} /> {t("product.year_warranty")}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)] pt-6">
              {product.description}
            </p>

            {/* Add to Cart / Buy Now */}
            <div className="flex gap-4 pt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!isAuthenticated || product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                  !isAuthenticated
                    ? "border border-[var(--border)] text-[var(--text-tertiary)] cursor-not-allowed opacity-40"
                    : added
                      ? "bg-[var(--success)] text-white"
                      : "border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                }`}
              >
                <ShoppingCart size={16} />
                {!isAuthenticated ? `[${t("auth.login.title")}]` : added ? t("product.added_to_cart") : t("product.add_to_cart")}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={!isAuthenticated || product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                  !isAuthenticated
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed opacity-40"
                    : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                }`}
              >
                <Zap size={16} />
                {!isAuthenticated ? `[${t("auth.login.title")}]` : t("product.buy_now")}
              </motion.button>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3">
              {highlights.map((h, idx) => {
                const Icon = h.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 px-4 py-3 border border-[var(--border)]">
                    <Icon size={14} className="text-[var(--accent)] flex-shrink-0" />
                    <span className="text-[11px] text-[var(--text-secondary)]">{h.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Specifications */}
        {(availableSpecs.length > 0 || allSpecs.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-12 md:mt-16 pt-10 border-t border-[var(--border)]"
          >
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-wide mb-6">
              {t("product.specifications")}
            </h2>
            <div className="border border-[var(--border)] divide-y divide-[var(--border)] max-w-2xl">
              {[
                ...availableSpecs.map((s) => ({ key: s.key, label: s.label, icon: s.icon, value: product.specifications[s.key] || "" })),
                ...(availableSpecs.length > 0
                  ? allSpecs
                      .filter(([k]) => !specDefs.some((s) => s.key === k))
                      .map(([k, v]) => ({ key: k, label: k.replace(/([A-Z])/g, " $1").trim(), icon: Box, value: v }))
                  : allSpecs.map(([k, v]) => ({ key: k, label: k.replace(/([A-Z])/g, " $1").trim(), icon: Box, value: v }))
                ),
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon size={13} className="text-[var(--accent)]" />
                      <span className="text-xs text-[var(--text-secondary)] capitalize">{item.label}</span>
                    </div>
                    <span className="text-xs font-medium text-[var(--text-primary)]">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Bottom */}
        <div className="mt-8 flex items-center justify-between py-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
            <Shield size={12} className="text-[var(--accent)]" />
            <span>{t("product.authentic_guarantee")}</span>
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)]">
            SKU: <span className="font-mono text-[var(--text-secondary)]">#{product._id.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
