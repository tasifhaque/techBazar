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

const updateSchema = z.object({
  siteName: z.string().min(1).max(50).optional(),
  helpEmail: z.string().email().optional().or(z.literal("")),
  helpPhone: z.string().optional(),
  helpLocation: z.string().optional(),
  helpHours: z.string().optional(),
  helpFaq: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      })
    )
    .optional(),
});

// Public - get site settings (including help config)
router.get("/", async (c) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({ siteName: "LUXE" });
    }
    return c.json({
      siteName: settings.siteName,
      helpEmail: settings.helpEmail,
      helpPhone: settings.helpPhone,
      helpLocation: settings.helpLocation,
      helpHours: settings.helpHours,
      helpFaq: settings.helpFaq,
    });
  } catch (err) {
    console.error("Get settings error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin - update site settings (including help config)
router.put("/", authMiddleware, async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const body = await c.req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues[0].message }, 400);
    }

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    const data = parsed.data;

    if (data.siteName !== undefined) {
      settings.siteName = data.siteName;
    }
    if (data.helpEmail !== undefined) {
      settings.helpEmail = data.helpEmail;
    }
    if (data.helpPhone !== undefined) {
      settings.helpPhone = data.helpPhone;
    }
    if (data.helpLocation !== undefined) {
      settings.helpLocation = data.helpLocation;
    }
    if (data.helpHours !== undefined) {
      settings.helpHours = data.helpHours;
    }
    if (data.helpFaq !== undefined) {
      settings.helpFaq = data.helpFaq;
    }

    await settings.save();

    return c.json({
      siteName: settings.siteName,
      helpEmail: settings.helpEmail,
      helpPhone: settings.helpPhone,
      helpLocation: settings.helpLocation,
      helpHours: settings.helpHours,
      helpFaq: settings.helpFaq,
    });
  } catch (err) {
    console.error("Update settings error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default router;
