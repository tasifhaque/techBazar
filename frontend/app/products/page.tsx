import ProductsContent from "./products-content";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/** How often (in seconds) the product list is re-fetched on the server. */
const REVALIDATE_SECONDS = 120;

// The page is dynamic because it reads search params and fresh product data.
// The inner async fetch uses `next: { revalidate: 120 }` for its own cache policy.
export const dynamic = "force-dynamic";

/**
 * ProductsPage — implements streaming SSR via the automatic Suspense boundary
 * created by `loading.tsx` at this segment level.
 *
 * Because `ProductsPage` itself is synchronous, Next.js can immediately emit
 * the page shell (header, footer, skeleton via `loading.tsx`) while the async
 * `ProductsFetcher` runs on the server.  Once the fetch completes, the product
 * grid is streamed to the client.
 */
export default function ProductsPage() {
  return <ProductsFetcher />;
}

/**
 * This async server component performs the actual fetch.  Next.js catches its
 * suspended state with the `loading.tsx` Suspense boundary, so the user sees a
 * skeleton immediately instead of blocking on the ~850ms backend call.
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
        // Strip firstImage to avoid embedding multi-KB base64 data URLs in the HTML.
        // The client uses proxy URLs (/api/products/image/:id/:idx) instead.
        const { firstImage: _, ...rest } = p;
        return rest;
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
