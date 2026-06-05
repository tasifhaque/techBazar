"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Percent, Truck } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export default function PromoSection() {
  const { t } = useI18n();
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);

  const handleCopy = (code: string, setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {/* Summer Sale Card */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="group relative overflow-hidden bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border)] p-6 sm:p-8 md:p-10 hover:border-[var(--accent)]/30 hover:shadow-[0_0_32px_rgba(212,175,55,0.08)] transition-all duration-500 hover:-translate-y-1"
      >
        {/* Animated gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/70 to-transparent opacity-80" />

        {/* Subtle shine overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10">
          {/* Icon container with gold border */}
          <div className="w-12 sm:w-14 h-12 sm:h-14 border border-[var(--accent)]/30 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[var(--accent)]/5 group-hover:border-[var(--accent)]/50 transition-all duration-500 group-hover:shadow-[0_0_16px_rgba(212,175,55,0.1)]">
            <Percent size={20} className="sm:size-[24px] text-[var(--accent)] transition-transform duration-500 group-hover:scale-110" />
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] mb-3 tracking-wide">
            {t("home.promo.summer.title")}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4 sm:mb-6 leading-relaxed max-w-xs">
            {t("home.promo.summer.desc")}
          </p>

          {/* Coupon code with COPY action */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="font-mono text-[10px] sm:text-xs text-[var(--accent)] tracking-widest border border-dashed border-[var(--accent)]/40 px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--accent)]/5">
              {t("home.promo.summer.code")}
            </span>
            <button
              onClick={() => handleCopy(t("home.promo.summer.code"), setCopied1)}
              className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-all duration-300 hover:scale-105"
            >
              {copied1 ? (
                <span className="text-[var(--success)]">✓ COPIED</span>
              ) : (
                "COPY"
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Free Shipping Card */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="group relative overflow-hidden bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border)] p-6 sm:p-8 md:p-10 hover:border-[var(--accent)]/30 hover:shadow-[0_0_32px_rgba(212,175,55,0.08)] transition-all duration-500 hover:-translate-y-1"
      >
        {/* Animated gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/70 to-transparent opacity-80" />

        {/* Subtle shine overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10">
          {/* Icon container with gold border */}
          <div className="w-12 sm:w-14 h-12 sm:h-14 border border-[var(--accent)]/30 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[var(--accent)]/5 group-hover:border-[var(--accent)]/50 transition-all duration-500 group-hover:shadow-[0_0_16px_rgba(212,175,55,0.1)]">
            <Truck size={20} className="sm:size-[24px] text-[var(--accent)] transition-transform duration-500 group-hover:scale-110" />
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] mb-3 tracking-wide">
            {t("home.promo.shipping.title")}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4 sm:mb-6 leading-relaxed max-w-xs">
            {t("home.promo.shipping.desc")}
          </p>

          {/* Shipping tag with COPY action */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="font-mono text-[10px] sm:text-xs text-[var(--accent)] tracking-widest border border-dashed border-[var(--accent)]/40 px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--accent)]/5">
              {t("home.promo.shipping.tag")}
            </span>
            <button
              onClick={() => handleCopy(t("home.promo.shipping.tag"), setCopied2)}
              className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-all duration-300 hover:scale-105"
            >
              {copied2 ? (
                <span className="text-[var(--success)]">✓ COPIED</span>
              ) : (
                "COPY"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
