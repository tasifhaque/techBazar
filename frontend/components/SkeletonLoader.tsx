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
