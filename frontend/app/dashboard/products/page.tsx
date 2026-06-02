"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowLeft,
  Check,
  Edit3,
  Trash2,
  Package,
  Search,
  X,
  AlertTriangle,
  Image as ImageIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Crown,
  GripVertical,
  Layers,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { api, type Product } from "@/lib/api";
import { useToast } from "@/store/toast";
import PriceDisplay from "@/components/PriceDisplay";

type Mode = "list" | "add" | "edit";

interface ProductForm {
  title: string;
  description: string;
  price: string;
  discountPercentage: string;
  category: string;
  brand: string;
  model: string;
  stock: string;
  images: string;
  specifications: string;
}

const emptyForm: ProductForm = {
  title: "",
  description: "",
  price: "",
  discountPercentage: "0",
  category: "",
  brand: "",
  model: "",
  stock: "10",
  images: "",
  specifications: "",
};

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-[var(--accent)]/10 before:to-transparent before:animate-[shimmer_2s_infinite]`;

// Stock progress bar component
function StockIndicator({ stock }: { stock: number }) {
  const getColor = () => {
    if (stock <= 0) return "bg-red-500";
    if (stock < 10) return "bg-orange-500";
    if (stock < 50) return "bg-amber-500";
    return "bg-emerald-500";
  };
  const getWidth = () => {
    if (stock <= 0) return "w-0";
    if (stock < 10) return "w-1/4";
    if (stock < 50) return "w-2/4";
    if (stock < 100) return "w-3/4";
    return "w-full";
  };
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
        <div
          className={`h-full rounded-full ${getColor()} ${getWidth()} transition-all duration-500`}
        />
      </div>
      <span className={`text-xs font-medium ${
        stock <= 0 ? "text-red-500" : stock < 10 ? "text-orange-500" : "text-[var(--text-secondary)]"
      }`}>
        {stock}
      </span>
    </div>
  );
}

export default function ProductsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Products list state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Form state
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [specEntries, setSpecEntries] = useState<{ key: string; value: string }[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { addToast } = useToast();

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Restock-by-title state
  const [showRestock, setShowRestock] = useState(false);
  const [restockTitle, setRestockTitle] = useState("");
  const [restockQty, setRestockQty] = useState("");
  const [restocking, setRestocking] = useState(false);

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageList = form.images
    ? form.images.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];

  const getImageUrl = (url: string) => {
    if (url.startsWith("/uploads/")) {
      return "http://localhost:4000" + url;
    }
    return url;
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setUploadError("Only JPG, PNG, and WebP images are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be under 10MB");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      const fullUrl = "http://localhost:4000" + data.url;
      const current = form.images
        ? form.images.split("\n").map((s) => s.trim()).filter(Boolean)
        : [];
      current.push(fullUrl);
      updateForm("images", current.join("\n"));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const current = form.images
      ? form.images.split("\n").map((s) => s.trim()).filter(Boolean)
      : [];
    current.splice(index, 1);
    updateForm("images", current.join("\n"));
  };

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) router.push("/");
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch categories/brands once
  useEffect(() => {
    api.admin.categories().then((data) => {
      setCategories(data.categories);
      setBrands(data.brands);
    }).catch(() => {});
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const params: Record<string, string> = { limit: "50", page: String(page) };
      if (search) params.search = search;
      const res = await api.products.list(params);
      setProducts(res.products);
      setTotalPages(res.pagination.totalPages);
    } catch {
      setError("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (mode === "list") fetchProducts();
  }, [fetchProducts, mode]);

  // Form change handler
  const updateForm = (field: keyof ProductForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Start editing a product
  const startEdit = (product: Product) => {
    setEditingId(product._id);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      discountPercentage: String(product.discountPercentage || 0),
      category: product.category,
      brand: product.brand,
      model: product.model,
      stock: String(product.stock),
      images: product.images?.join("\n") || "",
      specifications: "",
    });
    setSpecEntries(
      product.specifications
        ? Object.entries(product.specifications).map(([k, v]) => ({ key: k, value: v }))
        : []
    );
    setMode("edit");
    setError("");
    setSuccess("");
  };

  // Start adding a new product
  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSpecEntries([]);
    setMode("add");
    setError("");
    setSuccess("");
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price) || 0,
        discountPercentage: parseFloat(form.discountPercentage) || 0,
        category: form.category,
        brand: form.brand,
        model: form.model,
        stock: parseInt(form.stock) || 0,
        images: form.images
          ? form.images.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        specifications: Object.fromEntries(
          specEntries
            .filter((e) => e.key.trim() !== "")
            .map((e) => [e.key.trim(), e.value.trim()])
        ),
      };

      if (mode === "edit" && editingId) {
        await api.admin.updateProduct(editingId, data);
        addToast(`${data.title} updated successfully!`, "success");
        setSuccess("Product updated successfully!");
        setMode("list");
      } else {
        await api.admin.createProduct(data);
        addToast(`${data.title} created successfully!`, "success");
        setSuccess("Product created successfully!");
        setForm(emptyForm);
        setMode("list");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteProduct(deleteTarget._id);
      addToast(`${deleteTarget.title} deleted`, "success");
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      addToast(msg, "error");
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const toggleFeatured = async (product: Product) => {
    const newVal = !product.featured;
    try {
      await api.admin.updateProduct(product._id, { featured: newVal });
      addToast(`${product.title} ${newVal ? "featured" : "unfeatured"}`, "success");
      fetchProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Toggle failed";
      addToast(msg, "error");
    }
  };

  const handleRestockByTitle = async () => {
    if (!restockTitle.trim() || !restockQty || parseInt(restockQty) <= 0) {
      addToast("Enter a valid product title and quantity", "error");
      return;
    }
    setRestocking(true);
    try {
      // 1. Search for product by title
      const searchResult = await api.products.list({ search: restockTitle.trim(), limit: "5" });
      const product = searchResult.products[0];
      if (!product) {
        addToast(`No product found matching "${restockTitle.trim()}"`, "error");
        setRestocking(false);
        return;
      }
      // 2. Update stock using existing PUT route
      const qty = parseInt(restockQty);
      await api.admin.updateProduct(product._id, { stock: product.stock + qty });
      addToast(`"${product.title}" restocked (+${qty})`, "success");
      setRestockTitle("");
      setRestockQty("");
      setShowRestock(false);
      fetchProducts();
    } catch (err) {
      console.error("Restock error:", err);
      const msg = err instanceof Error ? err.message : "Re-stock failed";
      addToast(msg, "error");
    } finally {
      setRestocking(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }
  if (!user || user.role !== "admin") return null;

  // ─── List Mode ─────────────────────────────────────────────
  if (mode === "list") {
    return (
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Crown size={20} className="text-[var(--accent)]" />
                <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] tracking-tight">Products</h1>
              </div>
              <p className="text-sm text-[var(--text-secondary)] ml-1">Manage your product catalog</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchProducts}
                className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={startAdd}
                className="flex items-center gap-2 px-5 py-2.5 btn-gradient rounded-xl text-sm font-medium shadow-lg shadow-[var(--accent)]/20 active:scale-[0.98]"
              >
                <Plus size={16} />
                Add Product
              </button>
              <button
                onClick={() => setShowRestock(true)}
                className="flex items-center gap-2 px-5 py-2.5 border border-[var(--accent)] text-[var(--accent)] rounded-xl text-sm font-medium hover:bg-[var(--accent)] hover:text-[#0a0a0a] transition-all duration-300 active:scale-[0.98]"
              >
                <Package size={16} />
                Restock by Title
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all duration-300"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2"
              >
                <AlertTriangle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Table */}
          {productsLoading ? (
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg">
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`h-16 bg-[var(--bg-tertiary)] rounded-xl ${shimmer}`} />
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-12 text-center shadow-lg"
            >
              <Package size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
              <h3 className="text-lg font-semibold font-serif text-[var(--text-primary)] mb-2">No products found</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {search ? "Try a different search term." : "Your catalog is empty. Add your first product."}
              </p>
              {!search && (
                <button onClick={startAdd} className="px-6 py-2.5 btn-gradient rounded-xl text-sm font-medium shadow-lg shadow-[var(--accent)]/20">
                  <Plus size={16} className="inline mr-1.5" />
                  Add Product
                </button>
              )}
            </motion.div>
          ) : (
            <>
              <div className="hidden md:block bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]/50">
                        <th className="text-left py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider">Product</th>
                        <th className="text-left py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                        <th className="text-left py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider hidden lg:table-cell">Brand</th>
                        <th className="text-center py-4 px-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider hidden lg:table-cell w-16">Featured</th>
                        <th className="text-right py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider">Price</th>
                        <th className="text-right py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider hidden sm:table-cell">Stock</th>
                        <th className="text-right py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, i) => (
                        <motion.tr
                          key={product._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-[var(--border)]/50 hover:bg-[var(--accent-light)]/20 transition-colors duration-200 group"
                        >
                          <td className="py-4 px-5">
                            <Link
                              href={`/products/${product.category}/${product.brand}/${product.model}`}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] overflow-hidden shrink-0 ring-1 ring-[var(--border)] shadow-sm">
                                {product.images?.[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon size={16} className="text-[var(--text-tertiary)]" />
                                  </div>
                                )}
                              </div>
                              <span className="font-medium text-[var(--text-primary)] truncate max-w-[200px] group-hover:text-[var(--accent)] transition-colors duration-200">
                                {product.title}
                              </span>
                            </Link>
                          </td>
                          <td className="py-4 px-5 text-[var(--text-secondary)] capitalize hidden md:table-cell">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[var(--bg-tertiary)] border border-[var(--border)]">
                              <Layers size={10} className="text-[var(--text-tertiary)]" />
                              {product.category}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-[var(--text-secondary)] capitalize hidden lg:table-cell">{product.brand}</td>
                          <td className="py-4 px-5 text-center hidden lg:table-cell">
                            <button
                              onClick={() => toggleFeatured(product)}
                              className={`p-1.5 rounded-lg transition-all duration-300 ${
                                product.featured
                                  ? "text-[var(--accent)] bg-[var(--accent-light)]"
                                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                              }`}
                              title={product.featured ? "Unfeature" : "Feature on home page"}
                            >
                              <Crown size={15} fill={product.featured ? "var(--accent)" : "none"} />
                            </button>
                          </td>
                          <td className="py-4 px-5 text-right">
                            {product.discountPercentage > 0 ? (
                              <div className="flex flex-col items-end">
                                <PriceDisplay amount={product.price} className="font-semibold text-[var(--accent)]" />
                                <span className="text-[10px] text-[var(--text-tertiary)] line-through">
                                  ${(product.price * (1 + product.discountPercentage / 100)).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <PriceDisplay amount={product.price} className="font-semibold" />
                            )}
                          </td>
                          <td className="py-4 px-5 text-right hidden sm:table-cell">
                            <StockIndicator stock={product.stock} />
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEdit(product)}
                                className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all duration-300"
                                title="Edit product"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(product)}
                                className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                                title="Delete product"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile product cards */}
              <div className="md:hidden space-y-3">
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/products/${product.category}/${product.brand}/${product.model}`}
                        className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer group"
                      >
                        {/* Product image */}
                        <div className="w-16 h-16 rounded-xl bg-[var(--bg-tertiary)] overflow-hidden shrink-0 ring-1 ring-[var(--border)] shadow-sm">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={18} className="text-[var(--text-tertiary)]" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--text-primary)] text-sm truncate leading-snug group-hover:text-[var(--accent)] transition-colors duration-200">
                            {product.title}
                          </p>

                          {/* Category badge + Brand */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-secondary)]">
                              <Layers size={8} className="text-[var(--text-tertiary)]" />
                              {product.category}
                            </span>
                            <span className="text-[11px] text-[var(--text-tertiary)]">{product.brand}</span>
                          </div>

                          {/* Price with discount */}
                          <div className="flex items-baseline gap-2 mt-2">
                            {product.discountPercentage > 0 ? (
                              <>
                                <PriceDisplay amount={product.price} className="font-semibold text-sm text-[var(--accent)]" />
                                <span className="text-[10px] text-[var(--text-tertiary)] line-through">
                                  ${(product.price * (1 + product.discountPercentage / 100)).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <PriceDisplay amount={product.price} className="font-semibold text-sm text-[var(--text-primary)]" />
                            )}
                          </div>

                          {/* Stock indicator */}
                          <div className="mt-1.5">
                            <StockIndicator stock={product.stock} />
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => toggleFeatured(product)}
                          className={`p-1.5 rounded-lg transition-all duration-300 ${
                            product.featured
                              ? "text-[var(--accent)] bg-[var(--accent-light)]"
                              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                          }`}
                          title={product.featured ? "Unfeature" : "Feature on home page"}
                        >
                          <Crown size={13} fill={product.featured ? "var(--accent)" : "none"} />
                        </button>
                        <button
                          onClick={() => startEdit(product)}
                          className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all duration-300"
                          title="Edit product"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                          title="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
                              page === pageNum
                                ? "bg-[var(--accent)] text-white shadow-sm"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteTarget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => !deleting && setDeleteTarget(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle size={20} className="text-[var(--danger)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-serif text-[var(--text-primary)]">Delete Product</h3>
                    <p className="text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="ml-auto p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    disabled={deleting}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Product preview */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] mb-4">
                  <div className="w-10 h-10 rounded-lg overflow-hidden ring-1 ring-[var(--border)] shrink-0">
                    {deleteTarget.images?.[0] ? (
                      <img src={deleteTarget.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)]">
                        <ImageIcon size={14} className="text-[var(--text-tertiary)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{deleteTarget.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{deleteTarget.brand} &middot; {deleteTarget.category}</p>
                  </div>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  Are you sure you want to delete this product permanently?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--danger)] text-white hover:bg-red-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Restock by Title Modal ─── */}
        <AnimatePresence>
          {showRestock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => !restocking && setShowRestock(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-[var(--accent-light)]">
                    <Package size={20} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-serif text-[var(--text-primary)]">Restock by Title</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Add stock to an existing product.</p>
                  </div>
                  <button onClick={() => setShowRestock(false)} className="ml-auto p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]" disabled={restocking}>
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Product Title</label>
                    <input
                      type="text"
                      value={restockTitle}
                      onChange={(e) => setRestockTitle(e.target.value)}
                      placeholder="e.g. iPhone 16 Pro Max"
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Quantity to Add</label>
                    <input
                      type="number"
                      min="1"
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowRestock(false)} disabled={restocking} className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300 disabled:opacity-50">
                      Cancel
                    </button>
                    <button
                      onClick={handleRestockByTitle}
                      disabled={restocking || !restockTitle.trim() || !restockQty}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)] text-[#0a0a0a] hover:bg-[var(--accent-hover)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {restocking ? (
                        <><Loader2 size={16} className="animate-spin" /> Restocking...</>
                      ) : (
                        <><Package size={16} /> Restock</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── Add / Edit Mode ──────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back button */}
        <button
          onClick={() => { setMode("list"); setEditingId(null); setError(""); setSuccess(""); setSpecEntries([]); }}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        {/* Mode indicator */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => { setMode("list"); setEditingId(null); setError(""); setSuccess(""); setSpecEntries([]); }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]"
          >
            <Package size={14} className="inline mr-1.5" />
            Products
          </button>
          <span className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-light)] text-[var(--accent)]">
            {mode === "edit" ? "Edit Product" : "Add Product"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 md:p-8 space-y-6 shadow-lg">
          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2"
              >
                <AlertTriangle size={14} />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-[var(--accent-light)] text-[var(--accent)] text-sm rounded-xl flex items-center gap-2"
              >
                <Check size={14} />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form sections with gold separators */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[var(--accent)]" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                  placeholder="iPhone 16 Pro Max"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 resize-none"
                  placeholder="Product description..."
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />

          <div>
            <h3 className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[var(--accent)]" />
              Pricing &amp; Inventory
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Price ($) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                  placeholder="999.99"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Discount (%)</label>
                <input
                  type="number"
                  value={form.discountPercentage}
                  onChange={(e) => updateForm("discountPercentage", e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Stock *</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => updateForm("stock", e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />

          <div>
            <h3 className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[var(--accent)]" />
              Categorization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] transition-all duration-300"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                  <option value="__new__" className="text-[var(--accent)]">+ New Category</option>
                </select>
                {form.category === "__new__" && (
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value.toLowerCase().replace("__new__", ""))}
                    placeholder="Enter new category"
                    className="mt-2 w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                    autoFocus
                  />
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Brand *</label>
                <select
                  value={form.brand}
                  onChange={(e) => updateForm("brand", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] transition-all duration-300"
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
                  ))}
                  <option value="__new__" className="text-[var(--accent)]">+ New Brand</option>
                </select>
                {form.brand === "__new__" && (
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => updateForm("brand", e.target.value.toLowerCase().replace("__new__", ""))}
                    placeholder="Enter new brand"
                    className="mt-2 w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                    autoFocus
                  />
                )}
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Model *</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => updateForm("model", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                  placeholder="iphone-16-pro-max"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />

          <div>
            <h3 className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[var(--accent)]" />
              Media &amp; Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Images */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Product Images</label>

                {/* Image gallery */}
                {imageList.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imageList.map((url, i) => (
                      <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-tertiary)] shadow-sm">
                        <img
                          src={getImageUrl(url)}
                          alt={`Product ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                    dragOver
                      ? "border-[var(--accent)] bg-[var(--accent-light)]"
                      : "border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-tertiary)]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                      <span className="text-sm text-[var(--text-secondary)]">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon size={24} className="text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        Drop an image here or click to upload
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        JPG, PNG, WebP &middot; max 10MB
                      </span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                    <AlertTriangle size={12} />
                    {uploadError}
                  </p>
                )}
              </div>

              {/* Specifications */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Specifications</label>
                <div className="space-y-2">
                  {specEntries.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={entry.key}
                        onChange={(e) => {
                          const next = [...specEntries];
                          next[i] = { ...next[i], key: e.target.value };
                          setSpecEntries(next);
                        }}
                        placeholder="Key"
                        className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-xs font-mono transition-all duration-300"
                      />
                      <span className="text-[var(--text-tertiary)] text-xs">:</span>
                      <input
                        type="text"
                        value={entry.value}
                        onChange={(e) => {
                          const next = [...specEntries];
                          next[i] = { ...next[i], value: e.target.value };
                          setSpecEntries(next);
                        }}
                        placeholder="Value"
                        className="flex-[2] px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-xs font-mono transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setSpecEntries((prev) => prev.filter((_, j) => j !== i))}
                        className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSpecEntries((prev) => [...prev, { key: "", value: "" }])}
                    className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors px-3 py-2"
                  >
                    <Plus size={12} />
                    Add Specification
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setMode("list"); setEditingId(null); setError(""); setSuccess(""); setSpecEntries([]); }}
              className="flex-1 px-4 py-3 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 btn-gradient py-3 rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.99] shadow-lg shadow-[var(--accent)]/20"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {mode === "edit" ? <Edit3 size={16} /> : <Plus size={16} />}
                  {mode === "edit" ? "Update Product" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
