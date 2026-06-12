import { Hono } from "hono";
import { Order, Product } from "../models";
import { authMiddleware, type Variables } from "../middleware/auth";
import { z } from "zod";

const router = new Hono<{ Variables: Variables }>();

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, "At least one item is required"),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    phone: z.string().min(1),
  }),
  paymentMethod: z.string().min(1),
});

router.post("/", authMiddleware, async (c) => {
  try {
    const { userId } = c.get("user");
    const body = await c.req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues[0].message }, 400);
    }

    const { items, shippingAddress, paymentMethod } = parsed.data;

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const host = c.req.header("host") || "localhost:4000";
    const proto = c.req.header("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.title}`);
      const rawImage = product.images?.[0] || "";
      // Data URLs are self-contained; legacy /uploads/ paths need origin prefix
      const image = rawImage.startsWith("data:")
        ? rawImage
        : rawImage.startsWith("/")
          ? `${origin}${rawImage}`
          : rawImage;
      return {
        productId: product._id,
        title: product.title,
        price: product.price,
        discountPercentage: product.discountPercentage,
        quantity: item.quantity,
        image,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => {
      const discounted = item.price * (1 - item.discountPercentage / 100);
      return sum + discounted * item.quantity;
    }, 0);

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      shippingAddress,
      paymentMethod,
      paymentStatus: "completed",
      orderStatus: "processing",
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    return c.json({ order }, 201);
  } catch (err) {
    console.error("Create order error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return c.json({ error: message }, 400);
  }
});

function resolveOrderImageUrl(url: string, origin: string): string {
  if (!url) return url;
  if (url.startsWith("/")) {
    return `${origin}${url}`;
  }
  return url;
}

function resolveOrderItemImages(order: any, origin: string): void {
  if (order.items && Array.isArray(order.items)) {
    for (const item of order.items) {
      if (item.image) {
        item.image = resolveOrderImageUrl(item.image, origin);
      }
    }
  }
}

function resolveOrders(c: any, orders: any[]): void {
  const host = c.req.header("host") || "localhost:4000";
  const proto = c.req.header("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;
  orders.forEach((order) => resolveOrderItemImages(order, origin));
}

router.get("/", authMiddleware, async (c) => {
  try {
    const { userId } = c.get("user");
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    resolveOrders(c, orders);
    return c.json({ orders });
  } catch (err) {
    console.error("Get orders error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.get("/:id", authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const { userId, role } = c.get("user");
    const order = await Order.findById(id).populate("user", "name email");
    if (!order) return c.json({ error: "Order not found" }, 404);
    if (role !== "admin" && order.user.toString() !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    resolveOrders(c, [order]);
    return c.json({ order });
  } catch (err) {
    console.error("Get order error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default router;
