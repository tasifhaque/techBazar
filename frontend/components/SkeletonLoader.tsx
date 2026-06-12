"use client";

import { motion } from "framer-motion";

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-[var(--accent)]/10 before:to-transparent before:animate-[shimmer_2s_infinite]`;

export function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
      <div className={`aspect-square bg-[var(--bg-tertiary)] ${shimmer}`} />
      <div className="p-5 md:p-6 space-y-3">
        <div className="h-3 w-1/3 bg-[var(--bg-tertiary)]" />
        <div className="h-4 w-3/4 bg-[var(--bg-tertiary)]" />
        <div className="h-3 w-1/2 bg-[var(--bg-tertiary)]" />
        <div className="flex items-center gap-3">
          <div className="h-5 w-16 bg-[var(--bg-tertiary)]" />
          <div className="h-4 w-12 bg-[var(--bg-tertiary)]" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-10 flex-1 bg-[var(--bg-tertiary)]" />
          <div className="h-10 flex-1 bg-[var(--bg-tertiary)]" />
        </div>
      </div>
    </div>
  );
}

export function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <ProductCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="text-center mb-8">
        <div className="h-9 bg-[var(--bg-tertiary)] w-32 mx-auto mb-2" />
        <div className="h-4 bg-[var(--bg-tertiary)] w-48 mx-auto" />
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 md:p-8 mb-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 bg-[var(--bg-tertiary)] rounded-full mb-3" />
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-[var(--bg-tertiary)]" />
          <div className="h-10 bg-[var(--bg-tertiary)]" />
          <div className="h-10 bg-[var(--bg-tertiary)]" />
        </div>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 md:p-8">
        <div className="h-6 bg-[var(--bg-tertiary)] w-40 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-[var(--bg-tertiary)]" />
          <div className="h-10 bg-[var(--bg-tertiary)]" />
        </div>
      </div>
    </div>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="relative h-[80vh] min-h-[420px] sm:min-h-[500px] lg:min-h-[600px] max-h-[1000px] overflow-hidden bg-[var(--bg-secondary)]">
      {/* Simulated editorial layout skeleton */}
      <div className="absolute inset-0" />
      <div className="relative z-10 w-full h-full flex items-end">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 pb-12 sm:pb-16 md:pb-24">
          <div className="max-w-2xl space-y-4 sm:space-y-5">
            {/* Category / brand line */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-2.5 w-16 bg-white/10 rounded" />
              <div className="w-6 h-px bg-white/10" />
              <div className="h-2.5 w-12 bg-white/10 rounded" />
            </div>
            {/* Title */}
            <div className="space-y-2">
              <div className="h-10 sm:h-14 md:h-16 lg:h-20 w-3/4 bg-white/8 rounded" />
              <div className="h-10 sm:h-14 md:h-16 lg:h-20 w-1/2 bg-white/6 rounded" />
            </div>
            {/* Decorative line */}
            <div className="w-12 sm:w-16 h-[1.5px] bg-white/10" />
            {/* Description */}
            <div className="space-y-2 max-w-lg">
              <div className="h-3.5 w-full bg-white/6 rounded" />
              <div className="h-3.5 w-2/3 bg-white/5 rounded" />
            </div>
            {/* Price and buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2">
              <div className="h-8 w-28 bg-white/10 rounded" />
              <div className="flex gap-2.5">
                <div className="h-10 w-28 bg-white/8 rounded" />
                <div className="h-10 w-24 bg-white/8 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Shimmer sweep */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
          animate={{ x: ['-100%', '400%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
        />
      </div>
      {/* Navigation dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 z-20">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-[2px] rounded ${i === 0 ? 'w-10 bg-white/10' : 'w-2 bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="aspect-square bg-[var(--bg-tertiary)]" />
        <div className="space-y-5">
          <div className="h-3 w-1/4 bg-[var(--bg-tertiary)]" />
          <div className="h-8 w-3/4 bg-[var(--bg-tertiary)]" />
          <div className="h-4 w-full bg-[var(--bg-tertiary)]" />
          <div className="h-4 w-2/3 bg-[var(--bg-tertiary)]" />
          <div className="flex gap-3">
            <div className="h-7 w-20 bg-[var(--bg-tertiary)]" />
            <div className="h-5 w-16 bg-[var(--bg-tertiary)]" />
          </div>
          <div className="flex gap-3 pt-3">
            <div className="h-12 w-40 bg-[var(--bg-tertiary)]" />
            <div className="h-12 w-40 bg-[var(--bg-tertiary)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
