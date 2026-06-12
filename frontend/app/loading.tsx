export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero skeleton */}
      <div className="h-[80vh] min-h-[420px] sm:min-h-[500px] lg:min-h-[600px] bg-[var(--bg-secondary)] animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 space-y-16 md:space-y-28">
        {/* Promo section skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="h-52 bg-[var(--bg-secondary)] rounded-2xl animate-pulse" />
          <div className="h-52 bg-[var(--bg-secondary)] rounded-2xl animate-pulse" />
        </div>

        {/* About section skeleton */}
        <div className="text-center space-y-4 mb-10">
          <div className="h-4 w-24 bg-[var(--bg-secondary)] rounded animate-pulse mx-auto" />
          <div className="h-8 w-64 bg-[var(--bg-secondary)] rounded animate-pulse mx-auto" />
          <div className="h-4 w-96 bg-[var(--bg-secondary)] rounded animate-pulse mx-auto max-w-full" />
        </div>

        {/* Featured products grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-secondary)] rounded-2xl animate-pulse aspect-[4/3]" />
          ))}
        </div>
      </div>
    </div>
  );
}
