import { Hono } from "hono";
import { Product } from "../models";

const router = new Hono();

// ─── Routes ─────────────────────────────────────────────────────────────────

router.get("/", async (c) => {
  try {
    const { category, brand, search, sort, featured, page: pageStr = "1", limit: limitStr = "12" } = c.req.query();

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
        // Exclude heavy images field before sort to stay under 32MB memory limit
        { $project: { images: 0, __v: 0 } },
        { $sort: sortOption },
        { $skip: skip },
        { $limit: limit },
      ]),
      Product.countDocuments(filter),
    ]);

    return c.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get products error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── Image Proxy ──────────────────────────────────────────────────────────────
// Serves individual product images. Accepts base64 data URLs from MongoDB,
// external URLs (picsum.photos), and /uploads/ paths.
// This keeps the products list API response small (no multi-MB data URLs).
router.get("/image/:productId/:index", async (c) => {
  try {
    const { productId, index } = c.req.param();
    const idx = parseInt(index);
    const product = await Product.findById(productId).select("images").lean();
    if (!product || !product.images || !product.images[idx]) {
      return c.json({ error: "Image not found" }, 404);
    }

    const url = product.images[idx];

    // Data URL — decode and serve binary
    if (url.startsWith("data:")) {
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

    // External URL (picsum.photos etc.) — redirect
    if (url.startsWith("http")) {
      return c.redirect(url, 302);
    }

    // /uploads/ path — serve from disk
    if (url.startsWith("/uploads/")) {
      const filename = url.replace("/uploads/", "");
      const filePath = `./uploads/${filename}`;
      const file = Bun.file(filePath);
      const exists = await file.exists();
      if (!exists) return c.json({ error: "File not found" }, 404);
      return new Response(file, {
        headers: { "Cache-Control": "public, max-age=604800, immutable" },
      });
    }

    // Unknown URL format — try redirect anyway
    return c.redirect(url, 302);
  } catch (err) {
    console.error("Image proxy error:", err);
    return c.json({ error: "Image not found" }, 404);
  }
});

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
