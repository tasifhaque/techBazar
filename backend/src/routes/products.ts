import { readFile } from "fs/promises";
import { Hono } from "hono";
import { Product } from "../models";

const router = new Hono();

// ─── In-memory cache for products list response ──────────────────────────────
// Holds the full JSON response so repeated SSR fetches are instant instead of
// waiting ~1s for MongoDB Atlas free tier queries.
const productListCache = new Map<string, { data: unknown; timestamp: number }>();
const PRODUCT_LIST_CACHE_TTL = 30_000; // 30 seconds

function getCachedProductList(key: string): unknown | null {
  const entry = productListCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > PRODUCT_LIST_CACHE_TTL) {
    productListCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedProductList(key: string, data: unknown): void {
  productListCache.set(key, { data, timestamp: Date.now() });
}

// ─── In-memory cache for image proxy lookups ─────────────────────────────────
// Key: `${productId}:${index}`, Value: URL string + optionally decoded binary
// For data URLs, the decoded binary is cached alongside the URL so repeated
// requests don't re-decode base64 (saves ~1-2ms per image × 40 images = saving).
// Also avoids repeated MongoDB queries for the same image across product renders.
const imageCache = new Map<string, { url: string; binary?: Buffer; mime?: string; timestamp: number }>();
const IMAGE_CACHE_TTL = 300_000; // 5 minutes

function getCachedImageUrl(key: string): { url: string; binary?: Buffer; mime?: string } | null {
  const entry = imageCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > IMAGE_CACHE_TTL) {
    imageCache.delete(key);
    return null;
  }
  return { url: entry.url, binary: entry.binary, mime: entry.mime };
}

function setCachedImageUrl(key: string, url: string, binary?: Buffer, mime?: string): void {
  imageCache.set(key, { url, binary, mime, timestamp: Date.now() });
}

// ─── Routes ─────────────────────────────────────────────────────────────────

router.get("/", async (c) => {
  try {
    const { category, brand, search, sort, featured, page: pageStr = "1", limit: limitStr = "12" } = c.req.query();

    // ── Check in-memory cache (only for the default list query) ────────────
    const cacheKey = `${category || ""}|${brand || ""}|${search || ""}|${sort || ""}|${featured || ""}|${pageStr}|${limitStr}`;
    const cached = getCachedProductList(cacheKey);
    if (cached) return c.json(cached);

    const page = Math.max(1, parseInt(pageStr) || 1);
    const limit = Math.max(1, parseInt(limitStr) || 12);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category.toLowerCase();
    if (brand) filter.brand = brand.toLowerCase();
    if (featured === "true") filter.featured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (featured === "true") sortOption = { featuredOrder: 1, createdAt: -1 };
    else if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "discount") sortOption = { discountPercentage: -1 };

    const [products, total] = await Promise.all([
      Product.aggregate([
        { $match: filter },
        // Compute imageCount while images still available
        { $addFields: { imageCount: { $cond: { if: { $isArray: "$images" }, then: { $size: "$images" }, else: 0 } } } },
        // Include only the first image URL (lightweight string) to eliminate
        // the image proxy N+1 waterfall on the products list page.
        // The full images array is excluded to keep the pipeline lean.
        { $addFields: { firstImage: { $cond: { if: { $isArray: "$images" }, then: { $arrayElemAt: ["$images", 0] }, else: null } } } },
        { $project: { images: 0, __v: 0 } },
        { $sort: sortOption },
        { $skip: skip },
        { $limit: limit },
      ]),
      Product.countDocuments(filter),
    ]);

    // ── Pre-warm image cache ──────────────────────────────────────────────
    // Each product's firstImage is already known from the aggregate query.
    // Storing it in the image cache avoids 40 individual MongoDB lookups when
    // the browser loads product grid images. For data URLs we also decode and
    // cache the binary so the proxy serves them instantly without base64 work.
    // After caching, we delete firstImage from the response to keep it lean
    // (~100KB instead of 10MB with base64 data URLs).
    for (const p of products) {
      const url = p.firstImage;
      if (url) {
        if (typeof url === "string" && url.startsWith("data:")) {
          const [header, base64] = url.split(",");
          const mime = header.split(":")[1].split(";")[0];
          const binary = Buffer.from(base64, "base64");
          setCachedImageUrl(`${p._id}:0`, url, binary, mime);
        } else {
          setCachedImageUrl(`${p._id}:0`, url);
        }
      }
      // Remove firstImage from response — saves ~10MB of network transfer.
      // The client uses proxy URLs (/api/products/image/:id/0) instead.
      delete p.firstImage;
    }

    const result = {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
    setCachedProductList(cacheKey, result);
    return c.json(result);
  } catch (err) {
    console.error("Get products error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── Image Proxy ──────────────────────────────────────────────────────────────
// Serves individual product images. Accepts base64 data URLs from MongoDB,
// external URLs (picsum.photos), and /uploads/ paths.
// This keeps the products list API response small (no multi-MB data URLs).
// Includes an in-memory cache to avoid repeated MongoDB lookups.
router.get("/image/:productId/:index", async (c) => {
  try {
    const { productId, index } = c.req.param();
    const idx = parseInt(index);
    const cacheKey = `${productId}:${idx}`;

    // 1. Check in-memory cache first (avoids MongoDB query)
    const cachedUrl = getCachedImageUrl(cacheKey);
    if (cachedUrl) {
      return await serveImageUrl(cachedUrl);
    }

    // 2. Miss — query MongoDB
    const product = await Product.findById(productId).select("images").lean();
    if (!product || !product.images || !product.images[idx]) {
      return c.json({ error: "Image not found" }, 404);
    }

    const url = product.images[idx];

    // 3. Cache the resolved URL for future requests (also pre-decode data URLs)
    if (typeof url === "string" && url.startsWith("data:")) {
      const [header, base64] = url.split(",");
      const mime = header.split(":")[1].split(";")[0];
      const binary = Buffer.from(base64, "base64");
      setCachedImageUrl(cacheKey, url, binary, mime);
      return await serveImageUrl({ url, binary, mime });
    }
    setCachedImageUrl(cacheKey, url);

    // 4. Serve the image with proper caching headers
    return await serveImageUrl(url);
  } catch (err) {
    console.error("Image proxy error:", err);
    return c.json({ error: "Image not found" }, 404);
  }
});

// Helper: serve an image URL with proper caching headers
// Accepts either a URL string or a cached entry with pre-decoded binary.
async function serveImageUrl(urlOrEntry: string | { url: string; binary?: Buffer; mime?: string }): Promise<Response> {
  const url = typeof urlOrEntry === "string" ? urlOrEntry : urlOrEntry.url;
  const cachedBinary = typeof urlOrEntry === "object" ? urlOrEntry.binary : undefined;
  const cachedMime = typeof urlOrEntry === "object" ? urlOrEntry.mime : undefined;

  // Data URL — decode and serve binary (or use pre-cached binary)
  if (url.startsWith("data:")) {
    if (cachedBinary && cachedMime) {
      return new Response(cachedBinary, {
        headers: {
          "Content-Type": cachedMime,
          "Cache-Control": "public, max-age=604800, immutable",
          "Content-Length": cachedBinary.length.toString(),
        },
      });
    }
    const [header, base64] = url.split(",");
    const mime = header.split(":")[1].split(";")[0];
    const binary = Buffer.from(base64, "base64");
    return new Response(binary, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Length": binary.length.toString(),
      },
    });
  }

  // External URL (picsum.photos etc.) — redirect with caching headers
  if (url.startsWith("http")) {
    // Using 307 to preserve the method; adding Cache-Control so the redirect
    // itself can be cached by the browser for subsequent visits.
    return new Response(null, {
      status: 307,
      headers: {
        "Location": url,
        "Cache-Control": "public, max-age=86400",  // cache redirect for 1 day
      },
    });
  }

  // /uploads/ path — serve from disk
  if (url.startsWith("/uploads/")) {
    const filename = url.replace("/uploads/", "");
    const filePath = `./uploads/${filename}`;
    try {
      const file = await readFile(filePath);
      return new Response(file, {
        headers: { "Cache-Control": "public, max-age=604800, immutable" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Unknown — redirect anyway with caching
  return new Response(null, {
    status: 307,
    headers: {
      "Location": url,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

router.get("/categories", async (c) => {
  try {
    const categories = await Product.distinct("category");
    return c.json({ categories });
  } catch (err) {
    console.error("Get categories error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.get("/brands", async (c) => {
  try {
    const { category } = c.req.query();
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category.toLowerCase();
    const brands = await Product.distinct("brand", filter);
    return c.json({ brands });
  } catch (err) {
    console.error("Get brands error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.get("/:category/:brand/:model", async (c) => {
  try {
    const { category, brand, model } = c.req.param();
    const product = await Product.findOne({
      category: category.toLowerCase(),
      brand: brand.toLowerCase(),
      model: model.toLowerCase(),
    }).lean();

    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ product });
  } catch (err) {
    console.error("Get product error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default router;
