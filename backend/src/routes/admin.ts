import { readFile } from "fs/promises";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Product, User, Order } from "../models";
import { createProductSchema } from "../validators/product";
import { authMiddleware, type Variables } from "../middleware/auth";

const router = new Hono<{ Variables: Variables }>();

function requireAdmin(c: any) {
  const { role } = c.get("user");
  if (role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }
  return null;
}

router.use("*", authMiddleware);

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildPagination(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Recent Activity ────────────────────────────────────────────────────────

router.get("/activity", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const [recentOrders, recentUsers, recentProducts] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email"),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email createdAt"),
      Product.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title category brand createdAt"),
    ]);

    return c.json({ recentOrders, recentUsers, recentProducts });
  } catch (err) {
    console.error("Admin activity error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── Existing Routes ────────────────────────────────────────────────────────

router.get("/stats", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const [totalProducts, totalUsers, lowStock, categories, products] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5, $gt: 0 } }),
      Product.distinct("category"),
      Product.find({}).sort({ stock: 1 }).limit(10).select("title stock price category brand"),
    ]);

    return c.json({
      totalProducts,
      totalUsers,
      lowStock,
      categories: categories.length,
      lowStockProducts: products,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.get("/categories", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const categories = await Product.distinct("category");
    const brands = await Product.distinct("brand");
    return c.json({ categories, brands });
  } catch (err) {
    console.error("Admin categories error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── File Upload ────────────────────────────────────────────────────────────
// Images are stored as base64 data URLs directly in MongoDB.
// No filesystem writes.

router.post("/upload", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const body = await c.req.parseBody();
    const file = body["image"] as File | undefined;

    if (!file) {
      return c.json({ error: "No image file provided" }, 400);
    }

    if (typeof file === "string") {
      return c.json({ error: "Expected a file, got text field" }, 400);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Only JPG, PNG, and WebP images are allowed" }, 400);
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: "File size must be under 10MB" }, 400);
    }

    // Convert file to base64 data URL and store in MongoDB
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return c.json({ url: dataUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// ─── Image Migration ────────────────────────────────────────────────────────
// Batch-migrates old filesystem-based image URLs (/uploads/*, http://localhost:4000/uploads/*)
// to base64 data URLs stored directly in MongoDB documents.

router.post("/migrate-images", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    // Find all products that still reference old-style filesystem URLs
    const products = await Product.find({
      $or: [
        { images: { $regex: "^/uploads/" } },
        { images: { $regex: "/uploads/" } },
      ],
    });

    let migrated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const product of products) {
      let changed = false;
      const newImages: string[] = [];

      for (const url of product.images) {
        // Already a data URL — keep as-is
        if (url.startsWith("data:")) {
          newImages.push(url);
          continue;
        }

        // Extract filename from old URL patterns
        let filename = "";
        if (url.startsWith("/uploads/")) {
          filename = url.replace("/uploads/", "");
        } else if (url.includes("/uploads/")) {
          const parts = url.split("/uploads/");
          filename = parts[parts.length - 1];
        }

        if (!filename) {
          newImages.push(url);
          continue;
        }

        // Try to read the file from disk and convert to data URL
        const filePath = `./uploads/${filename}`;
        try {
          const buffer = await readFile(filePath);
          const ext = (filename.split(".").pop() || "jpg").toLowerCase();
          const mimeTypes: Record<string, string> = {
            jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
            webp: "image/webp", gif: "image/gif",
          };
          const mime = mimeTypes[ext] || "image/jpeg";
          const base64 = buffer.toString("base64");
          newImages.push(`data:${mime};base64,${base64}`);
          changed = true;
        } catch (err: any) {
          if (err?.code === "ENOENT") {
            console.warn(`Migration: file not found on disk: ${filePath}`);
            newImages.push(url);
            failed++;
          } else {
            console.error(`Migration: error reading ${filePath}:`, err);
            newImages.push(url);
            failed++;
            errors.push(`${product._id}: ${url} — ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }

      if (changed) {
        product.images = newImages;
        await product.save();
        migrated++;
      }
    }

    return c.json({
      message: `Migration complete. ${migrated} products updated, ${failed} images failed.`,
      totalScanned: products.length,
      migrated,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Migration error:", err);
    return c.json({ error: "Migration failed" }, 500);
  }
});

router.post("/products", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const body = await c.req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.errors[0].message, details: parsed.error.errors }, 400);
    }

    const existing = await Product.findOne({
      title: parsed.data.title,
      category: parsed.data.category.toLowerCase(),
      brand: parsed.data.brand.toLowerCase(),
      model: parsed.data.model.toLowerCase(),
    });

    if (existing) {
      existing.stock += parsed.data.stock || 0;
      await existing.save();
      return c.json({ product: existing, message: "Stock increased for existing product" }, 200);
    }

    const product = await Product.create(parsed.data);
    return c.json({ product }, 201);
  } catch (err) {
    console.error("Create product error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── Zod Schemas (Admin-specific) ───────────────────────────────────────────

const updateAdminProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
});

const changeAdminPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters").max(100),
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const updateProductSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  price: z.number().positive().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  category: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative().optional(),
  featured: z.boolean().optional(),
  featuredOrder: z.number().int().optional(),
  specifications: z.record(z.string()).optional(),
});

// ─── User Management ────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * List all users with search & pagination.
 * Query: ?search=&page=&limit=
 */
router.get("/users", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(c.req.query("limit") || "20")));
    const search = (c.req.query("search") || "").trim();

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const userIds = users.map((u) => u._id);
    const orderCounts = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]);
    const orderCountMap = Object.fromEntries(orderCounts.map((o) => [o._id.toString(), o.count]));

    return c.json({
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        gender: u.gender,
        avatarUrl: u.avatarUrl,
        loginCount: u.loginCount || 0,
        orderCount: orderCountMap[u._id.toString()] || 0,
        createdAt: u.createdAt,
      })),
      pagination: buildPagination(page, limit, total),
    });
  } catch (err) {
    console.error("Admin list users error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/admin/users/:id
 * Get a single user's details.
 */
router.get("/users/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const user = await User.findById(c.req.param("id")).select("-password");
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalItems: { $sum: { $sum: "$items.quantity" } },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalItems: 0, totalSpent: 0 };

    return c.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        emailVerified: user.emailVerified,
        loginCount: user.loginCount || 0,
        createdAt: user.createdAt,
        orders: {
          totalOrders: stats.totalOrders,
          totalItems: stats.totalItems,
          totalSpent: stats.totalSpent,
        },
      },
    });
  } catch (err) {
    console.error("Admin get user error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/admin/users/:userId/orders
 * Get all orders for a specific user.
 */
router.get("/users/:userId/orders", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const { userId } = c.req.param();
    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return c.json({ orders });
  } catch (err) {
    console.error("Admin get user orders error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user and their comments. Cannot delete yourself.
 */
router.delete("/users/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const { userId } = c.get("user");
    const targetId = c.req.param("id");

    if (targetId === userId) {
      return c.json({ error: "Cannot delete yourself. Use the account deletion endpoint instead." }, 400);
    }

    const user = await User.findById(targetId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    await User.findByIdAndDelete(targetId);

    return c.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── Product Management ─────────────────────────────────────────────────────

/**
 * PUT /api/admin/products/:id
 * Update product details (partial update).
 * If category/brand/model change, enforce unique compound index.
 */
router.put("/products/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.errors[0].message, details: parsed.error.errors }, 400);
    }

    const product = await Product.findById(id);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    // Determine effective values after update
    const effectiveCategory = (parsed.data.category ?? product.category).toLowerCase();
    const effectiveBrand = (parsed.data.brand ?? product.brand).toLowerCase();
    const effectiveModel = (parsed.data.model ?? product.model).toLowerCase();

    // Check compound uniqueness only if one of the key fields is actually changing
    const keyChanged =
      (parsed.data.category !== undefined && parsed.data.category.toLowerCase() !== product.category) ||
      (parsed.data.brand !== undefined && parsed.data.brand.toLowerCase() !== product.brand) ||
      (parsed.data.model !== undefined && parsed.data.model.toLowerCase() !== product.model);

    if (keyChanged) {
      const existing = await Product.findOne({
        category: effectiveCategory,
        brand: effectiveBrand,
        model: effectiveModel,
        _id: { $ne: id },
      });

      if (existing) {
        return c.json({ error: "Product with this category/brand/model already exists" }, 409);
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        if (key === "category" || key === "brand" || key === "model") {
          updateData[key] = (value as string).toLowerCase();
        } else {
          updateData[key] = value;
        }
      }
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    return c.json({ product: updated });
  } catch (err) {
    console.error("Admin update product error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * DELETE /api/admin/products/:id
 * Delete a product by ID.
 */
router.delete("/products/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const { id } = c.req.param();
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Admin delete product error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── Admin Profile Management ───────────────────────────────────────────────

/**
 * PUT /api/admin/profile
 * Update admin's own name and/or email. Validates email uniqueness.
 */
router.put("/profile", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const { userId } = c.get("user");
    const body = await c.req.json();
    const parsed = updateAdminProfileSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.errors[0].message }, 400);
    }

    // Check email uniqueness if email is being changed
    if (parsed.data.email) {
      const normalizedEmail = parsed.data.email.toLowerCase().trim();
      const emailUser = await User.findOne({ email: normalizedEmail });
      if (emailUser && emailUser._id.toString() !== userId) {
        return c.json({ error: "Email already in use by another user" }, 409);
      }
    }

    const update: Record<string, string> = {};
    if (parsed.data.name) update.name = parsed.data.name;
    if (parsed.data.email) update.email = parsed.data.email.toLowerCase().trim();

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Admin update profile error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * PUT /api/admin/password
 * Change admin's own password. Requires current password verification.
 */
router.put("/password", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const { userId } = c.get("user");
    const body = await c.req.json();
    const parsed = changeAdminPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.errors[0].message }, 400);
    }

    const { currentPassword, newPassword } = parsed.data;
    const user = await User.findById(userId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return c.json({ error: "Current password is incorrect" }, 400);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return c.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Admin change password error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * DELETE /api/admin/account
 * Delete admin's own account. Requires password confirmation in body.
 */
router.delete("/account", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const { userId } = c.get("user");
    const body = await c.req.json();
    const parsed = deleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.errors[0].message }, 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const isMatch = await bcrypt.compare(parsed.data.password, user.password);
    if (!isMatch) {
      return c.json({ error: "Password is incorrect" }, 400);
    }

    await User.findByIdAndDelete(userId);

    // Clear auth cookie
    c.header(
      "Set-Cookie",
      "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
    );

    return c.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Admin delete account error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default router;
