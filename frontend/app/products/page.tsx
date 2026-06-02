"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X, ChevronDown, Package } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { ProductsGridSkeleton } from "@/components/SkeletonLoader";
import { api, type Product } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

const getCategories = (t: (key: string) => string) => [
  { value: "mobile", label: t("products.category.mobile") },
  { value: "laptop", label: t("products.category.laptop") },
  { value: "monitor", label: t("products.category.monitor") },
  { value: "keyboard", label: t("products.category.keyboard") },
  { value: "mouse", label: t("products.category.mouse") },
  { value: "headphone", label: t("products.category.headphone") },
  { value: "cpu", label: t("products.category.cpu") },
  { value: "gpu", label: t("products.category.gpu") },
  { value: "ram", label: t("products.category.ram") },
  { value: "storage", label: t("products.category.storage") },
  { value: "tablet", label: t("products.category.tablet") },
  { value: "smartwatch", label: t("products.category.smartwatch") },
];

function ProductsContent() {
  const { t } = useI18n();
  const sp = useSearchParams();
  const categories = getCategories(t);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(sp.get("category") || "");
  const [activeBrand, setActiveBrand] = useState(sp.get("brand") || "");
  const [searchQuery, setSearchQuery] = useState(sp.get("search") || "");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params: Record<string, string> = { limit: "100" };
    if (activeCategory) params.category = activeCategory;
    if (activeBrand) params.brand = activeBrand;
    if (searchQuery) params.search = searchQuery;
    api.products
      .list(params)
      .then((d) => { if (!cancelled) setProducts(d.products); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeCategory, activeBrand, searchQuery]);

  useEffect(() => {
    document.title = activeCategory
      ? categories.find((c) => c.value === activeCategory)?.label || "Products"
      : "Products";
  }, [activeCategory, categories]);

  const clearAll = () => { setActiveCategory(""); setActiveBrand(""); setSearchQuery(""); };
  const hasFilters = activeCategory || activeBrand || searchQuery;

  const grouped = categories
    .map((c) => ({ ...c, items: products.filter((p) => p.category === c.value) }))
    .filter((c) => c.items.length > 0);

  const activeCategoryLabel = activeCategory
    ? categories.find((c) => c.value === activeCategory)?.label || activeCategory
    : null;

  // Compute unique brands per category from loaded products
  const brandsMap: Record<string, string[]> = {};
  for (const p of products) {
    if (!brandsMap[p.category]) brandsMap[p.category] = [];
    if (!brandsMap[p.category].includes(p.brand)) brandsMap[p.category].push(p.brand);
  }

  // Group by brand when viewing a specific category
  const groupedByBrand = activeCategory
    ? (brandsMap[activeCategory] || [])
        .map((b) => ({
          brand: b,
          items: products.filter((p) => p.brand === b),
        }))
        .filter((g) => g.items.length > 0)
    : [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.03)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.02)_0%,transparent_50%)] pointer-events-none" />

        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-[var(--accent)]/50" />
              <span className="text-[9px] text-[var(--accent)] font-medium uppercase tracking-[0.35em]">
                {t("products.collection")}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--accent-light)] flex items-center justify-center shrink-0">
                <Package size={26} className="text-[var(--accent)]" />
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-[var(--text-primary)] tracking-tight leading-[0.95]">
                {activeCategoryLabel || (searchQuery ? `"${searchQuery}"` : t("products.title"))}
              </h1>
            </div>

            <p className="text-sm text-[var(--text-tertiary)] max-w-xl leading-relaxed mb-8">
              {loading
                ? t("products.searching")
                : searchQuery
                  ? `${products.length} result${products.length !== 1 ? "s" : ""} for "${searchQuery}"`
                  : `A curated selection of ${products.length} premium technology products`
              }
            </p>

            {/* Search bar — luxury edition */}
            <div className="relative max-w-lg">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)]/10 via-[var(--accent)]/5 to-transparent rounded-full blur-md opacity-0 focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-[var(--bg-card)]/5 border border-[var(--border)]/40 rounded-full overflow-hidden backdrop-blur-2xl focus-within:border-[var(--accent)]/40 focus-within:shadow-[0_0_40px_rgba(212,175,55,0.08)] focus-within:bg-[var(--bg-card)]/10 transition-all duration-500">
                <div className="ml-5 text-[var(--text-tertiary)] flex-shrink-0 transition-colors duration-300 peer-focus-within:text-[var(--accent)]">
                  <Search size={13} />
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("products.search_placeholder")}
                  className="flex-1 bg-transparent px-4 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50 focus:outline-none tracking-wide"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mr-2 p-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
                {searchQuery && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full h-[1px] bg-gradient-to-r from-[var(--accent)]/30 via-[var(--accent)]/10 to-transparent" />
      </div>

      {/* ─── Category Filter Bar ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-[3px] h-3 bg-[var(--accent)]/60" />
          <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-[0.3em] font-medium">Categories</span>
        </div>
        <div className="flex md:flex-wrap gap-2 overflow-x-auto md:overflow-visible pb-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => { setActiveCategory(""); setActiveBrand(""); }}
            className={`flex-shrink-0 px-5 py-2.5 text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-300 ${
              !activeCategory && !activeBrand
                ? "bg-[var(--accent)] text-[#0a0a0a] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                : "border border-[var(--border)]/60 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
            }`}
          >
            {t("products.filter_all")}
          </motion.button>
          {categories.map((c) => {
            const brands = brandsMap[c.value] || [];
            return (
              <div
                key={c.value}
                className="relative"
                onMouseEnter={() => setHoveredCategory(c.value)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setActiveCategory(activeCategory === c.value ? "" : c.value);
                    setActiveBrand("");
                  }}
                  className={`flex items-center gap-1.5 flex-shrink-0 px-5 py-2.5 text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-300 ${
                    activeCategory === c.value && !activeBrand
                      ? "bg-[var(--accent)] text-[#0a0a0a] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                      : activeBrand && products.some((p) => p.category === c.value)
                        ? "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/40"
                        : "border border-[var(--border)]/60 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
                  }`}
                >
                  {c.label}
                  {brands.length > 0 && <ChevronDown size={9} className="opacity-40" />}
                </motion.button>
                {hoveredCategory === c.value && brands.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 min-w-[180px] bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl backdrop-blur-xl z-[999] py-1.5 max-h-[300px] overflow-y-auto"
                  >
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => { setActiveCategory(c.value); setActiveBrand(b); }}
                        className={`block w-full text-left px-4 py-2 text-[11px] capitalize tracking-wide transition-colors duration-200 ${
                          activeBrand === b && activeCategory === c.value
                            ? "text-[var(--accent)] bg-[var(--accent)]/10"
                            : "text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full h-[1px] bg-[var(--border)]/30" />
      </div>

      {/* ─── Active Filter Chips ─── */}
      {hasFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-2">
          {activeCategory && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] border border-[var(--accent)]/30 text-[var(--accent)] px-3 py-1 font-medium flex items-center gap-1.5"
            >
              <div className="w-2 h-2 rotate-45 border border-[var(--accent)]/60 flex-shrink-0" />
              {activeCategoryLabel}
              <button onClick={() => { setActiveCategory(""); setActiveBrand(""); }} className="hover:opacity-70 ml-0.5"><X size={9} /></button>
            </motion.span>
          )}
          {activeBrand && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] border border-[var(--accent)]/30 text-[var(--accent)] px-3 py-1 font-medium flex items-center gap-1.5"
            >
              <div className="w-2 h-2 rotate-45 border border-[var(--accent)]/60 flex-shrink-0" />
              {activeBrand}
              <button onClick={() => setActiveBrand("")} className="hover:opacity-70 ml-0.5"><X size={9} /></button>
            </motion.span>
          )}
          {searchQuery && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] border border-[var(--accent)]/30 text-[var(--accent)] px-3 py-1 font-medium flex items-center gap-1.5"
            >
              <Search size={7} />
              &ldquo;{searchQuery}&rdquo;
              <button onClick={() => setSearchQuery("")} className="hover:opacity-70 ml-0.5"><X size={9} /></button>
            </motion.span>
          )}
          <button
            onClick={clearAll}
            className="relative text-[9px] text-[var(--text-tertiary)] hover:text-[var(--accent)] ml-auto uppercase tracking-[0.15em] font-medium transition-colors duration-300 group"
          >
            {t("products.clear_all")}
            <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[var(--accent)] group-hover:w-full transition-all duration-300" />
          </button>
        </div>
      )}

      {/* ─── Products ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-36">
        {loading ? (
          <div className="pt-10">
            <ProductsGridSkeleton count={6} />
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-28"
          >
            <div className="w-20 h-20 mx-auto mb-6 border border-[var(--accent)]/30 flex items-center justify-center bg-[var(--bg-card)]/40 backdrop-blur-sm">
              <Search size={28} className="text-[var(--accent)]/60" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-2">{t("products.no_results_title")}</h3>
            <p className="text-sm text-[var(--text-tertiary)] mb-8 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? t("products.no_results_desc_search", { query: searchQuery })
                : t("products.no_results_desc_category")
              }
            </p>
            {hasFilters && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={clearAll}
                className="px-8 py-3 bg-[var(--accent)] text-[#0a0a0a] text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)]"
              >
                {t("products.browse_all")}
              </motion.button>
            )}
          </motion.div>
        ) : hasFilters ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-10">
            {activeCategory && groupedByBrand.length > 1 ? (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                className="space-y-24"
              >
                {groupedByBrand.map((g) => {
                  const sorted = [...g.items].sort((a, b) => b.price - a.price);
                  return (
                    <motion.section
                      key={g.brand}
                      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="mb-8 flex items-center gap-5">
                        <div className="flex-1">
                          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] tracking-wide capitalize">
                            {g.brand}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[9px] text-[var(--text-tertiary)] font-medium tracking-[0.25em] uppercase">{g.items.length} items</span>
                        </div>
                      </div>
                      <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10"
                      >
                        {sorted.map((p, i) => (
                          <motion.div
                            key={p._id}
                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                          >
                            <ProductCard product={p} index={i} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.section>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10"
              >
                {[...products].sort((a, b) => b.price - a.price).map((p, i) => (
                  <motion.div
                    key={p._id}
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <ProductCard product={p} index={i} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* ─── Editorial Category Sections ─── */
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            className="space-y-32 pt-10"
          >
            {grouped.map((g) => {
              const sorted = [...g.items].sort((a, b) => b.price - a.price);
              return (
                <motion.section
                  key={g.value}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-5xl md:text-7xl font-serif font-bold text-[var(--accent)]/8 leading-none select-none">
                        {g.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--accent)]/40 via-[var(--accent)]/10 to-transparent" />
                      <span className="text-[9px] text-[var(--text-tertiary)] font-medium tracking-[0.3em] uppercase">{g.items.length} products</span>
                    </div>
                  </div>
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10"
                  >
                    {sorted.map((p, i) => (
                      <motion.div
                        key={p._id}
                        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                      >
                        <ProductCard product={p} index={i} />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="pt-6">
            <ProductsGridSkeleton count={6} />
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
