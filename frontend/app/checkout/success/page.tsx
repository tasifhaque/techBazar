"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowLeft } from "lucide-react";
import { api, type Order } from "@/lib/api";
import Link from "next/link";
import PriceDisplay from "@/components/PriceDisplay";
import { Suspense } from "react";

function SuccessContent() {
  const sp = useSearchParams();
  const orderId = sp.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      api.orders.get(orderId).then((d) => setOrder(d.order)).catch(() => {}).finally(() => setLoading(false));
    } else setLoading(false);
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 bg-[var(--accent-light)] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-[var(--accent)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Order Placed!</h1>
        <p className="text-[var(--text-secondary)] mb-6">Thank you for your purchase. Your order has been confirmed.</p>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4 mx-auto" />
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2 mx-auto" />
          </div>
        ) : order ? (
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-[var(--accent)]" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">Order #{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mb-1">Total Paid: <span className="font-semibold text-[var(--text-primary)]"><PriceDisplay amount={order.totalAmount} /></span></p>
            <p className="text-sm text-[var(--text-tertiary)] mb-1">Shipping to: {order.shippingAddress.fullName}</p>
            <p className="text-sm text-[var(--text-tertiary)]">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--accent-light)] text-[var(--accent)] text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
                {order.orderStatus}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 mb-6">
            <p className="text-sm text-[var(--text-tertiary)]">Your order has been placed successfully.</p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 btn-gradient rounded-xl font-semibold shadow-lg active:scale-[0.98]">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
