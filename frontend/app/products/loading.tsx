export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-10">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
        <div className="h-14 w-full max-w-2xl bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-5" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-36 pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse">
              <div className="aspect-[4/3]" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="h-10 flex-1 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-10 flex-1 bg-gray-300 dark:bg-gray-600 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
