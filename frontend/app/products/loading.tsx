import { ProductsGridSkeleton } from "@/components/SkeletonLoader";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-8 w-48 bg-[var(--bg-tertiary)] mb-8 rounded" />
      <ProductsGridSkeleton count={8} />
    </div>
  );
}
