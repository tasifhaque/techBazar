"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  CreditCard,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api, type User, type Order } from "@/lib/api";
import { BACKEND_URL } from "@/lib/api";

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-[var(--accent)]/10 before:to-transparent before:animate-[shimmer_2s_infinite]`;

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  processing: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  shipped: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  delivered: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
};

export default function UserOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      api.admin.getUser(userId),
      api.admin.getUserOrders(userId),
    ])
      .then(([userRes, ordersRes]) => {
        setUser(userRes.user);
        setOrders(ordersRes.orders);
      })
      .catch((err) => {
        console.error("Failed to load user orders:", err);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-[var(--text-secondary)]">
        User not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back link */}
        <button
          onClick={() => router.push("/dashboard/users")}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Users
        </button>

        {/* User info header */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-[var(--accent)]/30 shrink-0">
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)]">{user.name}</h1>
              <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-tertiary)]">
                <span className="capitalize">{user.gender}</span>
                <span>&middot;</span>
                <span>Joined {formatDate(user.createdAt || "")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Package size={20} className="text-[var(--accent)]" />
          Orders ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-12 text-center">
            <ShoppingCart size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
            <h3 className="text-lg font-semibold font-serif text-[var(--text-primary)] mb-2">No orders yet</h3>
            <p className="text-sm text-[var(--text-secondary)]">This user has not placed any orders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg"
              >
                {/* Order header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-[var(--bg-tertiary)]/30 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-xs text-[var(--text-tertiary)]">
                      #{order._id.slice(-8)}
                    </span>
                    <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Calendar size={12} />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.orderStatus] || statusColors.pending}`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-sm flex items-center gap-1 text-[var(--text-secondary)]">
                      <CreditCard size={12} />
                      {order.paymentMethod}
                    </span>
                    <span className="text-lg font-bold font-serif text-[var(--text-primary)]">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Order items */}
                <div className="p-5">
                  <div className="space-y-3">
                    {order.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--bg-tertiary)] shrink-0 border border-[var(--border)]">
                          <img
                            src={item.image ? (item.image.startsWith("http") ? item.image : `${BACKEND_URL}${item.image}`) : "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.title}</p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {formatCurrency(item.price)} &times; {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)] shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
