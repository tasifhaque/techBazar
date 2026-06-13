import ProductsContent from "./products-content";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/** How often (in seconds) the product list is re-fetched on the server. */
const REVALIDATE_SECONDS = 120;

// ISR (Incremental Static Regeneration): the page is pre-rendered at build time
// and served from the Vercel CDN edge — no serverless cold starts for visitors.
// Revalidation happens in the background: stale is served, fresh is fetched.
// Note: the inner fetch uses cache: 'no-store' because the backend response
// contains base64 data URLs (~10MB total) which exceed Next.js's 2MB Data
// Cache limit. The backend has its own in-memory cache (30s TTL) for speed.
export const revalidate = REVALIDATE_SECONDS;

/**
 * ProductsPage — pre-rendered via ISR. On Vercel the full HTML is served from
 * the CDN edge (millisecond response, no cold start). Background revalidation
 * keeps data fresh. Search/filter queries still work client-side via the inner
 * `ProductsContent` component which reads `useSearchParams()` inside its own
 * Suspense boundary.
 */
export default function ProductsPage() {
  return <ProductsFetcher />;
}

/**
 * This async server component fetches products during pre-render (build or
 * background revalidation). The fetch uses `cache: 'no-store'` because the
 * backend response is ~10MB (base64 data URLs in firstImage) and exceeds
 * Next.js's 2MB Data Cache limit. Speed comes from the backend in-memory
 * cache (30s TTL) and the page-level ISR HTML cache (120s revalidate).
 */
async function ProductsFetcher() {
  let initialProducts: any[] = [];
  let initialPagination = null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/products?limit=40`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      initialProducts = (data.products || []).map((p: any) => ({
        ...p,
        // Use proxy URL for images — the backend no longer sends firstImage
        // (it was stripped from the response to keep it under 100KB instead of
        // 10MB of base64 data URLs). The image proxy is pre-warmed with decoded
        // binary from the backend's in-memory cache.
        firstImage: `/api/products/image/${p._id}/0`,
      }));
      initialPagination = data.pagination || null;
    }
  } catch (e) {
    console.error("Failed to pre-fetch products:", e);
  }

  return (
    <ProductsContent
      initialProducts={initialProducts}
      initialPagination={initialPagination}
    />
  );
}
