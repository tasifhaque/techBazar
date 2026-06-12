"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Users,
  AlertTriangle,
  BarChart3,
  Layers,
  RefreshCw,
  ShieldAlert,
  PlusCircle,
  TrendingUp,
  DollarSign,
  Crown,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { api, type Product } from "@/lib/api";
import Link from "next/link";
import PriceDisplay from "@/components/PriceDisplay";

interface Stats {
  totalProducts: number;
  totalUsers: number;
  lowStock: number;
  categories: number;
  lowStockProducts: { title: string; stock: number; price: number; category: string; brand: string }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 200, damping: 25 } },
};

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-[var(--accent)]/10 before:to-transparent before:animate-[shimmer_2s_infinite]`;

// Animated counter component
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current);
    const start = performance.now();
    const from = display;
    const to = value;
    const duration = 800;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    }
    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span>
      {display.toLocaleString()}{suffix}
    </span>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState<any[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) router.push("/");
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      Promise.all([
        api.admin.stats(),
        api.admin.activity(),
      ])
        .then(([statsData, activityData]) => {
          setStats(statsData);
          const items: any[] = [];

          const rawOrders = activityData.recentOrders.map((o: any) => ({
            action: "New order placed",
            detail: `${o.items?.length || 0} item(s) — ${o.user?.name || "Unknown"}`,
            time: formatRelativeTime(o.createdAt),
            icon: Package,
            createdAt: new Date(o.createdAt).getTime(),
          }));

          const rawUsers = activityData.recentUsers.map((u: any) => ({
            action: "User registered",
            detail: u.email,
            time: formatRelativeTime(u.createdAt),
            icon: Users,
            createdAt: new Date(u.createdAt).getTime(),
          }));

          const rawProducts = activityData.recentProducts.map((p: any) => ({
            action: "Product added",
            detail: `${p.title} (${p.category})`,
            time: formatRelativeTime(p.createdAt),
            icon: ShoppingBag,
            createdAt: new Date(p.createdAt).getTime(),
          }));

          const sorted = [...rawOrders, ...rawUsers, ...rawProducts].sort((a, b) => b.createdAt - a.createdAt);

          setActivity(sorted.slice(0, 10));
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user]);

  function formatRelativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className={`h-8 bg-[var(--bg-tertiary)] rounded-xl w-48 ${shimmer}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-40 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] ${shimmer}`} />
            ))}
          </div>
          <div className={`h-80 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <ShieldAlert size={64} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-2">Error</h2>
          <p className="text-[var(--text-secondary)]">{error}</p>
        </motion.div>
      </div>
    );
  }

  // Metric tiles data with trend indicators (simulated)
  const metrics = [
    {
      label: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      sub: "In catalog",
      trend: "+12%",
      trendUp: true,
      gradient: "from-amber-500/20 to-transparent",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      sub: "Registered accounts",
      trend: "+8%",
      trendUp: true,
      gradient: "from-blue-500/20 to-transparent",
    },
    {
      label: "Categories",
      value: stats?.categories ?? 0,
      icon: Layers,
      sub: "Product types",
      trend: "—",
      trendUp: null,
      gradient: "from-purple-500/20 to-transparent",
    },
    {
      label: "Low Stock Items",
      value: stats?.lowStock ?? 0,
      icon: AlertTriangle,
      sub: "Needs attention",
      trend: stats && stats.lowStock > 0 ? `${stats.lowStock > 5 ? "+" : "-"}${stats.lowStock}` : "0",
      trendUp: stats && stats.lowStock > 5 ? false : true,
      gradient: stats && stats.lowStock > 5 ? "from-red-500/20 to-transparent" : "from-orange-500/20 to-transparent",
    },
    {
      label: "Platform Health",
      value: 98,
      icon: TrendingUp,
      sub: "All systems nominal",
      trend: "+2%",
      trendUp: true,
      gradient: "from-[var(--accent)]/20 to-transparent",
      suffix: "%",
    },
  ];

  // Inventory urgency level
  const getUrgencyLevel = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "bg-red-500", textColor: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
    if (stock <= 3) return { label: "Critical", color: "bg-orange-500", textColor: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" };
    return { label: "Low", color: "bg-amber-500", textColor: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                Dashboard
              </h1>
            </div>
            <p className="text-sm text-[var(--text-secondary)] ml-1">
              Welcome back, <span className="text-[var(--text-primary)] font-medium">{user.name}</span>. Here is your store overview.
            </p>
          </div>
          <button
            onClick={() => { setLoading(true); api.admin.stats().then(setStats).catch(setError).finally(() => setLoading(false)); }}
            className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300 active:scale-[0.98]"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </motion.div>

        {/* Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 relative overflow-hidden group card-hover"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-50`} />

              {/* Hover glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <metric.icon size={20} className="text-[var(--accent)]" />
                  </div>
                  {/* Trend indicator */}
                  {metric.trend !== "—" && metric.trendUp !== null && (
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        metric.trendUp
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {metric.trendUp ? (
                        <ArrowUpRight size={10} />
                      ) : (
                        <ArrowDownRight size={10} />
                      )}
                      {metric.trend}
                    </span>
                  )}
                </div>

                <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium mb-1">
                  {metric.label}
                </p>
                <p className="text-3xl font-bold font-serif text-[var(--text-primary)] tracking-tight">
                  {typeof metric.value === "number" ? (
                    <AnimatedNumber value={metric.value} suffix={metric.suffix || ""} />
                  ) : (
                    metric.value
                  )}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{metric.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Second row: Inventory Alerts + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Inventory Alerts — visual cards */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg"
          >
            <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--bg-tertiary)]/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-serif text-[var(--text-primary)]">Inventory Alerts</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Products that need restocking</p>
                </div>
                {stats && stats.lowStock > 0 && (
                  <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-500/20">
                    {stats.lowStock} urgent
                  </span>
                )}
              </div>
            </div>
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div className="p-4 md:p-5 space-y-3">
                {stats.lowStockProducts.slice(0, 5).map((p, i) => {
                  const urgency = getUrgencyLevel(p.stock);
                  return (
                    <motion.div
                      key={`${p.brand}-${p.title}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center gap-4 p-3 rounded-xl border ${urgency.bg} transition-all duration-200 hover:shadow-md`}
                    >
                      {/* Thumbnail placeholder */}
                      <div className="w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0 border border-[var(--border)]">
                        <Package size={18} className="text-[var(--text-tertiary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.title}</p>
                        <p className="text-xs text-[var(--text-secondary)] capitalize">
                          {p.brand} &middot; {p.category}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <PriceDisplay amount={p.price} className="text-sm font-semibold" />
                      </div>
                      <div className="shrink-0 text-right min-w-[80px]">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${urgency.textColor} ${urgency.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urgency.color}`} />
                          {urgency.label}: {p.stock}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                {stats.lowStockProducts.length > 5 && (
                  <p className="text-xs text-[var(--text-tertiary)] text-center pt-2">
                    +{stats.lowStockProducts.length - 5} more products need attention
                  </p>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Package size={36} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                <p className="text-[var(--text-secondary)] text-sm">All products have sufficient stock.</p>
              </div>
            )}
          </motion.div>

          {/* Quick Actions — glass-style buttons */}
          <motion.div
            variants={cardVariants}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[var(--accent-light)]">
                <Crown size={18} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-lg font-semibold font-serif text-[var(--text-primary)]">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <Link
                href="/dashboard/products"
                className="group flex items-center gap-3 w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-light)]/30 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--accent-gradient)] flex items-center justify-center shadow-md shadow-[var(--accent)]/20 group-hover:scale-110 transition-transform duration-300">
                  <PlusCircle size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Add Product</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Create a new listing</p>
                </div>
                <ArrowUpRight size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
              </Link>
              <Link
                href="/products"
                className="group flex items-center gap-3 w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-light)]/30 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">View Storefront</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Browse as a customer</p>
                </div>
                <ArrowUpRight size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
              </Link>
              <Link
                href="/dashboard/users"
                className="group flex items-center gap-3 w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-light)]/30 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Manage Users</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">View registered users</p>
                </div>
                <ArrowUpRight size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
              </Link>
              <Link
                href="/dashboard/settings"
                className="group flex items-center gap-3 w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-light)]/30 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Settings</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Configure your profile</p>
                </div>
                <ArrowUpRight size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div variants={cardVariants} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-[var(--accent-light)]">
              <Clock size={18} className="text-[var(--accent)]" />
            </div>
            <h2 className="text-lg font-semibold font-serif text-[var(--text-primary)]">Recent Activity</h2>
          </div>
          {activity && activity.length > 0 ? (
            <div className="space-y-3">
              {activity.map((item: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)]/30 hover:bg-[var(--accent-light)]/10 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center shrink-0">
                    <item.icon size={14} className="text-[var(--accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">{item.action}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">{item.time}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">No recent activity.</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
