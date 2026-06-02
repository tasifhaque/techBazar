import { ProductsGridSkeleton } from "@/components/SkeletonLoader";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-[500px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
      <ProductsGridSkeleton count={4} />
    </div>
  );
}
