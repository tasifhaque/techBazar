"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Crown, Search, Star, ArrowUp, ArrowDown, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/store/auth";
import { api, getProductImageUrl, type Product } from "@/lib/api";
import { useToast } from "@/store/toast";

export default function FeaturedPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const addToast = useToast((s) => s.addToast);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const d = await api.products.list({ limit: "200" });
      setProducts(d.products);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") fetchAll();
  }, [isAuthenticated, user]);

  const toggleFeatured = async (product: Product) => {
    setSaving(product._id);
    const newVal = !product.featured;
    try {
      const maxOrder = products
        .filter((p) => p.featured && p._id !== product._id)
        .reduce((max, p) => Math.max(max, p.featuredOrder || 0), 0);
      await api.admin.updateProduct(product._id, {
        featured: newVal,
        featuredOrder: newVal ? maxOrder + 1 : 0,
      });
      addToast(`${product.title} ${newVal ? "featured" : "unfeatured"}`, "success");
      fetchAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Toggle failed";
      addToast(msg, "error");
    } finally {
      setSaving(null);
    }
  };

  const moveOrder = async (product: Product, direction: "up" | "down") => {
    const featured = products
      .filter((p) => p.featured)
      .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));

    const idx = featured.findIndex((p) => p._id === product._id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= featured.length) return;

    try {
      await api.admin.updateProduct(featured[idx]._id, { featuredOrder: featured[swapIdx].featuredOrder || 0 });
      await api.admin.updateProduct(featured[swapIdx]._id, { featuredOrder: featured[idx].featuredOrder || 0 });
      addToast("Order updated", "success");
      fetchAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Reorder failed";
      addToast(msg, "error");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const featuredProducts = [...filtered]
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));

  const nonFeatured = filtered.filter((p) => !p.featured);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }
  if (!user || user.role !== "admin") return null;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[var(--accent)] mb-1">
              <Crown size={18} fill="var(--accent)" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Curated Selection</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)]">
              Featured Products
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Choose which products appear on the home page carousel and featured grid. Order them by priority.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/20">
            <Star size={14} className="text-[var(--accent)]" fill="var(--accent)" />
            <span className="text-xs font-medium text-[var(--accent)]">
              {featuredProducts.length} featured
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, brand or category..."
            className="w-full pl-10 pr-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all duration-300"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Featured Section */}
            {featuredProducts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-[var(--accent)]" />
                  Currently Featured ({featuredProducts.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {featuredProducts.map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative bg-[var(--bg-card)] rounded-2xl border-2 border-[var(--accent)]/30 overflow-hidden shadow-lg shadow-[var(--accent)]/5"
                    >
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--accent)] text-[#0a0a0a] text-[10px] font-bold uppercase tracking-wider rounded-md">
                          <Star size={10} fill="#0a0a0a" />
                          #{i + 1}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 z-10 flex gap-1">
                        <button
                          onClick={() => moveOrder(product, "up")}
                          disabled={i === 0}
                          className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="Move up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => moveOrder(product, "down")}
                          disabled={i === featuredProducts.length - 1}
                          className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="Move down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <div className="aspect-square overflow-hidden">
                        {product.imageCount && product.imageCount > 0 ? (
                          <img
                            src={getProductImageUrl(product)}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)]">
                            <Package size={24} className="text-[var(--text-tertiary)]" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Featured Section */}
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[var(--text-tertiary)]" />
                All Products ({nonFeatured.length})
              </h2>
              {nonFeatured.length === 0 ? (
                <div className="text-center py-12 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
                  <Package size={40} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    {search ? "No products match your search." : "All products are featured!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {nonFeatured.map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="group relative bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-[var(--accent)]/30 transition-all duration-300"
                    >
                      <div className="aspect-square overflow-hidden">
                        {product.imageCount && product.imageCount > 0 ? (
                          <img
                            src={getProductImageUrl(product)}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)]">
                            <Package size={24} className="text-[var(--text-tertiary)]" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider truncate">
                          {product.brand}
                        </p>
                        <p className="text-xs font-medium text-[var(--text-primary)] truncate mt-0.5">
                          {product.title}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)] truncate capitalize mt-0.5">
                          {product.category}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleFeatured(product)}
                        disabled={saving === product._id}
                        className="w-full py-2 flex items-center justify-center gap-1.5 border-t border-[var(--border)] text-[var(--text-secondary)] text-xs font-medium hover:bg-[var(--accent-light)] hover:text-[var(--accent)] transition-all duration-300 disabled:opacity-50"
                      >
                        {saving === product._id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Crown size={12} />
                        )}
                        Feature on Home
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
