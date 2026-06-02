import { Hono } from "hono";
import { z } from "zod";
import { Setting } from "../models";
import { authMiddleware, type Variables } from "../middleware/auth";

const router = new Hono<{ Variables: Variables }>();

function requireAdmin(c: any) {
  const { role } = c.get("user");
  if (role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }
  return null;
}

// Public - get site settings
router.get("/", async (c) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({ siteName: "LUXE" });
    }
    return c.json({ siteName: settings.siteName });
  } catch (err) {
    console.error("Get settings error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin - update site settings
router.put("/", authMiddleware, async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  const schema = z.object({
    siteName: z.string().min(1).max(50),
  });

  try {
    const body = await c.req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.errors[0].message }, 400);
    }

    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({ siteName: parsed.data.siteName });
    } else {
      settings.siteName = parsed.data.siteName;
      await settings.save();
    }

    return c.json({ siteName: settings.siteName });
  } catch (err) {
    console.error("Update settings error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default router;
