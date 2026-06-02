import { Hono } from "hono";
import { Product } from "../models";

const router = new Hono();

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
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
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
    });

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
