"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown } from "lucide-react";
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

interface Props {
  initialProducts?: Product[];
  initialPagination?: { total: number; page: number; limit: number; totalPages: number } | null;
}

/** Inner component that calls useSearchParams — wrapped in inner Suspense to prevent
 *  the entire page from showing loading.tsx while search params resolve on the client. */
function ProductsContentInner({ initialProducts = [], initialPagination: _initialPagination = null }: Props) {
  const { t } = useI18n();
  const sp = useSearchParams();
  const categories = getCategories(t);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [activeCategory, setActiveCategory] = useState(sp.get("category") || "");
  const [activeBrand, setActiveBrand] = useState(sp.get("brand") || "");
  const [searchQuery, setSearchQuery] = useState(sp.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(sp.get("search") || "");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const initialLoadHandled = useRef(initialProducts.length > 0);
  // Track if the component has finished its first render cycle (survives Strict Mode double-mount)
  const hydrated = useRef(false);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 350);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (searchQuery === "" && debouncedSearch !== "") {
      setDebouncedSearch("");
    }
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    const params: Record<string, string> = { limit: "40" };
    if (activeCategory) params.category = activeCategory;
    if (activeBrand) params.brand = activeBrand;
    if (debouncedSearch) params.search = debouncedSearch;

    // ─── Skip fetch on first hydration ────────────────────────────────────
    // initialLoadHandled starts as `true` when SSR gave us products.
    // On the very first effect run we bail out. Subsequent runs (filter changes,
    // search, or Strict Mode double-mount) proceed to fetch.
    if (initialLoadHandled.current && !activeCategory && !activeBrand && !debouncedSearch) {
      initialLoadHandled.current = false;
      hydrated.current = true;
      return;
    }

    setLoading(true);
    api.products
      .list(params)
      .then((d) => { if (!cancelled) setProducts(d.products); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeCategory, activeBrand, debouncedSearch]);

  useEffect(() => {
    document.title = activeCategory
      ? categories.find((c) => c.value === activeCategory)?.label || "Products"
      : "Products";
  }, [activeCategory, categories]);

  const clearAll = useCallback(() => {
    setActiveCategory("");
    setActiveBrand("");
    setSearchQuery("");
    setDebouncedSearch("");
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
  }, []);

  const hasFilters = activeCategory || activeBrand || debouncedSearch;

  const grouped = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, items: products.filter((p) => p.category === c.value) }))
        .filter((c) => c.items.length > 0),
    [categories, products]
  );

  const activeCategoryLabel = activeCategory
    ? categories.find((c) => c.value === activeCategory)?.label || activeCategory
    : null;

  const brandsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const p of products) {
      if (!map[p.category]) map[p.category] = [];
      if (!map[p.category].includes(p.brand)) map[p.category].push(p.brand);
    }
    return map;
  }, [products]);

  const groupedByBrand = useMemo(
    () =>
      activeCategory
        ? (brandsMap[activeCategory] || [])
            .map((b) => ({
              brand: b,
              items: products.filter((p) => p.brand === b),
            }))
            .filter((g) => g.items.length > 0)
        : [],
    [activeCategory, brandsMap, products]
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden">
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
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-[var(--text-primary)] tracking-tight leading-[0.95]">
                {activeCategoryLabel || (searchQuery ? `"${searchQuery}"` : t("products.title"))}
              </h1>
            </div>

              <p className="text-sm text-[var(--text-tertiary)] max-w-xl leading-relaxed mb-8">
                {loading
                  ? t("products.searching")
                  : debouncedSearch
                    ? `${products.length} result${products.length !== 1 ? "s" : ""} for "${debouncedSearch}"`
                    : `A curated selection of ${products.length} premium technology products`
                }
              </p>

            <div className="relative max-w-2xl">
              <div className="absolute -bottom-5 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent)]/8 to-[var(--accent)]/5 rounded-full blur-xl pointer-events-none"
                animate={{ opacity: isFocused ? 1 : 0, scale: isFocused ? 1 : 0.92 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              />

              <motion.div
                className="absolute -inset-5 bg-gradient-to-r from-[var(--accent)]/6 via-transparent to-[var(--accent)]/4 rounded-full blur-3xl pointer-events-none"
                animate={{ opacity: isFocused ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />

              <motion.div
                className="relative flex items-center bg-[var(--bg-card)]/8 backdrop-blur-2xl rounded-full overflow-hidden transition-shadow duration-700"
                animate={{
                  borderColor: isFocused
                    ? 'rgba(212,175,55,0.35)'
                    : 'rgba(255,255,255,0.05)',
                  boxShadow: isFocused
                    ? '0 0 60px rgba(212,175,55,0.08), inset 0 1px 0 rgba(212,175,55,0.08)'
                    : '0 8px 32px rgba(0,0,0,0.12)',
                }}
                style={{ borderWidth: 1, borderStyle: 'solid' }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  animate={{ opacity: isFocused ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.05) 40%, transparent 60%)',
                    padding: 1,
                    WebkitMask:
                      'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                />

                <div
                  className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[var(--accent)]/20 rounded-tl-full pointer-events-none transition-opacity duration-500"
                  style={{ opacity: isFocused ? 0.7 : 0.15 }}
                />
                <div
                  className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[var(--accent)]/20 rounded-tr-full pointer-events-none transition-opacity duration-500"
                  style={{ opacity: isFocused ? 0.7 : 0.15 }}
                />
                <div
                  className="absolute bottom-0 left-0 w-4 h-4 border-t border-l border-[var(--accent)]/20 rounded-bl-full pointer-events-none transition-opacity duration-500"
                  style={{ opacity: isFocused ? 0.7 : 0.15 }}
                />
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 border-t border-r border-[var(--accent)]/20 rounded-br-full pointer-events-none transition-opacity duration-500"
                  style={{ opacity: isFocused ? 0.7 : 0.15 }}
                />

                <motion.div
                  className="ml-6 flex-shrink-0 relative z-10"
                  animate={{
                    scale: isFocused ? 1.15 : 1,
                    color: isFocused
                      ? 'var(--accent)'
                      : 'var(--text-tertiary)',
                  }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <motion.div
                    animate={
                      isFocused
                        ? {
                            rotate: [0, -12, 12, -6, 6, 0],
                            transition: { duration: 0.6, ease: 'easeInOut' },
                          }
                        : { rotate: 0 }
                    }
                  >
                    <Search size={16} />
                  </motion.div>
                  <motion.div
                    className="absolute -inset-3 rounded-full"
                    animate={{
                      scale: isFocused ? 1 : 0.7,
                      opacity: isFocused ? 1 : 0,
                      backgroundColor: isFocused
                        ? 'rgba(212,175,55,0.12)'
                        : 'rgba(212,175,55,0)',
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>

                <input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={t("products.search_placeholder")}
                  className="flex-1 bg-transparent px-5 py-[18px] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/40 focus:outline-none tracking-[0.02em] font-light relative z-10"
                />

                <AnimatePresence mode="wait">
                  {searchQuery && (
                    <motion.button
                      key="clear-btn"
                      initial={{ opacity: 0, scale: 0.7, x: 10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.7, x: 10 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      onClick={clearSearch}
                      className="mr-3 p-1.5 rounded-full bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] transition-colors duration-300 relative z-10 group"
                    >
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      >
                        <X size={11} />
                      </motion.div>
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {searchQuery && (
                    <motion.div
                      key="shimmer-line"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent origin-center"
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence>
                {!searchQuery && !isFocused && (
                  <motion.div
                    key="shimmer-sweep"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.025] to-transparent"
                      animate={{ x: ['-100%', '300%'] }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear',
                        repeatDelay: 4,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
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
        <div className="flex flex-wrap gap-2 pb-1">
          <button
            onClick={() => { setActiveCategory(""); setActiveBrand(""); }}
            className={`flex-shrink-0 px-5 py-2.5 text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-300 ${
              !activeCategory && !activeBrand
                ? "bg-[var(--accent)] text-[#0a0a0a] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5"
            }`}
          >
            {t("products.filter_all")}
          </button>
          {categories.map((c) => {
            const brands = brandsMap[c.value] || [];
            return (
              <div
                key={c.value}
                className="relative"
                onMouseEnter={() => setHoveredCategory(c.value)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button
                  onClick={() => {
                    setActiveCategory(activeCategory === c.value ? "" : c.value);
                    setActiveBrand("");
                  }}
                  className={`flex items-center gap-1.5 flex-shrink-0 px-5 py-2.5 text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-300 ${
                    activeCategory === c.value && !activeBrand
                      ? "bg-[var(--accent)] text-[#0a0a0a] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                      : activeBrand && products.some((p) => p.category === c.value)
                        ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                        : "text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5"
                  }`}
                >
                  {c.label}
                  {brands.length > 0 && <ChevronDown size={9} className="opacity-40" />}
                </button>
                {hoveredCategory === c.value && brands.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 min-w-[180px] max-w-[calc(100vw-2rem)] sm:max-w-none bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl backdrop-blur-xl z-[999] py-1.5 max-h-[300px] overflow-y-auto"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center gap-2">
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
          <div className="text-center py-28"
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
          </div>
        ) : hasFilters ? (
          <div className="pt-10">
            {activeCategory && groupedByBrand.length > 1 ? (
              <div className="space-y-24">
                {groupedByBrand.map((g) => {
                  const sorted = [...g.items].sort((a, b) => b.price - a.price);
                  return (
                    <section key={g.brand}>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {sorted.map((p, i) => (
                          <div key={p._id}>
                            <ProductCard product={p} priority={i < 6} />
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {[...products].sort((a, b) => b.price - a.price).map((p, i) => (
                  <div key={p._id}>
                    <ProductCard product={p} priority={i < 6} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-32 pt-10">
            {grouped.map((g) => {
              const sorted = [...g.items].sort((a, b) => b.price - a.price);
              return (
                <section key={g.value}>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {sorted.map((p, i) => (
                      <div key={p._id}>
                        <ProductCard product={p} priority={i < 2} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ProductsContent — outer wrapper that isolates `useSearchParams()` in its own
 * Suspense boundary. This prevents Next.js from suspending the entire page shell
 * while search params resolve on the client, eliminating a flash of the loading
 * skeleton after the HTML has already arrived.
 */
export default function ProductsContent(props: Props) {
  return (
    <Suspense fallback={null}>
      <ProductsContentInner {...props} />
    </Suspense>
  );
}
