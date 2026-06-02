import { ProductsGridSkeleton } from "@/components/SkeletonLoader";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse mb-6" />
      <ProductsGridSkeleton count={8} />
    </div>
  );
}
