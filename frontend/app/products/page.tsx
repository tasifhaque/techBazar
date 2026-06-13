import ProductsContent from "./products-content";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/** How often (in seconds) the product list is re-fetched on the server. */
const REVALIDATE_SECONDS = 120;

// ISR (Incremental Static Regeneration): the page is pre-rendered at build time
// and served from the Vercel CDN edge — no serverless cold starts for visitors.
// The fetch inside ProductsFetcher also caches in the Data Cache with the same
// TTL. Revalidation happens in the background: stale is served, fresh is fetched.
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
 * background revalidation). The result is cached in Next.js's Data Cache for
 * `REVALIDATE_SECONDS`, so subsequent renders during that window skip the
 * fetch entirely and serve the cached HTML. The client component receives
 * `initialProducts` for instant rendering; filter/search updates still fetch
 * fresh data from the backend API on the client side.
 */
async function ProductsFetcher() {
  let initialProducts: any[] = [];
  let initialPagination = null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/products?limit=40`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (res.ok) {
      const data = await res.json();
      initialProducts = (data.products || []).map((p: any) => {
        // Resolve firstImage upfront: data URLs → proxy URL, external URLs → use directly
        // This avoids a 307 redirect through the image proxy for external images and
        // keeps the SSR HTML lean (no multi-KB base64 strings for data URLs).
        const { firstImage, ...rest } = p;
        const resolvedImage =
          firstImage && !firstImage.startsWith("data:")
            ? firstImage
            : `/api/products/image/${p._id}/0`;
        return { ...rest, firstImage: resolvedImage };
      });
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
