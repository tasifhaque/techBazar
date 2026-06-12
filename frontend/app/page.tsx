"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Zap, ShoppingBag, TrendingUp, ChevronRight, Package } from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { api, type Product } from "@/lib/api";
import { useSite } from "@/store/site";
import Link from "next/link";

// Lazy-load below-the-fold components for faster initial paint
const AboutSection = dynamic(() => import("@/components/AboutSection"), {
  ssr: false,
});
const PromoSection = dynamic(() => import("@/components/PromoSection"), {
  ssr: false,
});

export default function HomePage() {
  const { siteName } = useSite();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.products.list({ limit: "15", featured: "true" }),
      api.products.list({ limit: "8", sort: "createdAt" }),
    ])
      .then(([featuredRes, latestRes]) => {
        setFeatured(featuredRes.products);
        setLatest(latestRes.products.filter((p) => !p.featured));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const heroProducts = useMemo(() => featured.slice(0, 5), [featured]);
  const gridProducts = useMemo(() => featured.slice(5, 13), [featured]);
  const latestProducts = useMemo(() => latest.slice(0, 8), [latest]);

  return (
    <div>
      <HeroCarousel products={heroProducts} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 space-y-16 md:space-y-28">

        {/* ─── Promo Banners – below the fold ─── */}
        <PromoSection />

        {/* ─── About ─── */}
        <AboutSection />

        {/* ─── Loading Skeletons for Products ─── */}
        {loading && (
          <section>
            <div className="text-center mb-10 md:mb-12">
              <div className="h-5 w-24 bg-[var(--bg-secondary)] rounded mx-auto mb-4 animate-pulse" />
              <div className="h-8 w-64 bg-[var(--bg-secondary)] rounded mx-auto mb-2 animate-pulse" />
              <div className="h-4 w-48 bg-[var(--bg-secondary)] rounded mx-auto animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-[var(--bg-secondary)] rounded animate-pulse" />
              ))}
            </div>
          </section>
        )}

        {/* ─── Curated Collection — Featured Products ─── */}
        {!loading && featured.length > 5 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-10 md:mb-12"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
                <Package size={22} className="text-[var(--accent)]" />
              </div>
              <span className="text-[10px] text-[var(--accent)] font-medium uppercase tracking-[0.2em]">
                Curated Selection
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[var(--text-primary)] mt-3 mb-3 tracking-wide">
                Featured Products
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
                <div className="w-1.5 h-1.5 rotate-45 border border-[var(--accent)]/60" />
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-4 max-w-md mx-auto leading-relaxed">
                Precision-engineered technology, handpicked for those who demand the extraordinary.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {gridProducts.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mt-10"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-6 py-3 border border-[var(--accent)] text-[var(--accent)] text-xs font-medium tracking-wider uppercase hover:bg-[var(--accent)] hover:text-[#0a0a0a] transition-all duration-300 group"
              >
                <span>View All Products</span>
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </section>
        )}

        {/* ─── Latest Arrivals — Mixed Products ─── */}
        {!loading && latest.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-[0.2em] flex items-center gap-1.5">
                  Fresh Drops
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] mt-2 tracking-wide">
                  Latest Arrivals
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-1 text-xs text-[var(--accent)] font-medium tracking-wider uppercase hover:underline underline-offset-4 transition-all"
              >
                View All
                <ChevronRight size={12} />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {latestProducts.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mt-8 sm:hidden"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-1 px-5 py-2.5 border border-[var(--border)] text-[var(--text-secondary)] text-xs font-medium tracking-wider uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-300"
              >
                View All Products
                <ChevronRight size={12} />
              </Link>
            </motion.div>
          </section>
        )}

        {/* ─── Premium CTA Banner — champagne shimmer ─── */}
        <section className="relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/8 to-transparent pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]/40 backdrop-blur-sm text-center py-12 md:py-20 px-4 sm:px-6"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />

            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[var(--accent)]/20 pointer-events-none"
                style={{
                  left: `${10 + i * 16}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -12, 0],
                  opacity: [0.15, 0.4, 0.15],
                }}
                transition={{
                  duration: 3 + i * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              />
            ))}

            <motion.div
              className="absolute w-1/4 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent pointer-events-none"
              initial={{ top: "-5%", left: "25%" }}
              animate={{
                top: ["-5%", "105%"],
                left: ["25%", "45%"],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 3,
              }}
            />
            <motion.div
              className="absolute w-1/5 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent pointer-events-none"
              initial={{ top: "-5%", left: "65%" }}
              animate={{
                top: ["-5%", "105%"],
                left: ["65%", "35%"],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 4,
              }}
            />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 mb-5 sm:mb-6 border border-[var(--accent)]/30">
                <Zap size={24} className="sm:size-[28px] text-[var(--accent)]" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[var(--text-primary)] mb-4 tracking-wide">
                The Future of Tech Awaits
              </h2>
              <p className="text-sm md:text-base text-[var(--text-secondary)] mb-8 max-w-lg mx-auto leading-relaxed">
                Join thousands of discerning customers who trust {siteName} for the finest curated technology.
                Experience the difference precision makes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-[var(--accent)]/30 via-[var(--accent)]/60 to-[var(--accent)]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]" />
                  <Link
                    href="/products"
                    className="relative inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--accent)] text-[#0a0a0a] text-sm font-medium tracking-wide hover:bg-[var(--accent-hover)] transition-all duration-300 shadow-[0_0_24px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] rounded-full overflow-hidden hover:scale-[1.02]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <ShoppingBag size={16} className="transition-transform group-hover:scale-110 relative z-10" />
                    <span className="relative z-10">Explore Collection</span>
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-[var(--accent)]/30 via-[var(--accent)]/60 to-[var(--accent)]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]" />
                  <Link
                    href="/products"
                    className="relative inline-flex items-center gap-2 px-8 py-3.5 border border-[var(--accent)] text-[var(--accent)] text-sm font-medium tracking-wide hover:bg-[var(--accent)] hover:text-[#0a0a0a] transition-all duration-300 hover:shadow-[0_0_28px_rgba(212,175,55,0.25)] rounded-full overflow-hidden hover:scale-[1.02]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <TrendingUp size={16} className="transition-transform group-hover:scale-110 relative z-10" />
                    <span className="relative z-10">View Best Sellers</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
